const { query, withTransaction } = require("../../lib/db");
const { HttpError, assert } = require("../../lib/http");

const allowedStatuses = ["new", "verified", "in_progress", "resolved"];
const allowedSorts = ["latest", "upvotes"];

function getDefaultImageForCategory(categorySlug) {
  const defaults = {
    pothole: "/images/report-pothole.svg",
    streetlight: "/images/report-streetlight.svg",
    puddle: "/images/report-puddle.svg",
    flood: "/images/report-flood.svg",
    other: "/images/report-road.svg",
  };

  return defaults[categorySlug] || defaults.other;
}

function deriveDistrict(address) {
  if (!address) {
    return "Wilayah belum diketahui";
  }

  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.at(-1) || address;
}

function generateReferenceCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RPT-${year}-${month}${day}-${suffix}`;
}

function mapReportRow(row) {
  return {
    id: row.reference_code,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name || "Anonim",
    categorySlug: row.category_slug,
    title: row.title,
    description: row.description,
    address: row.address || "",
    district: row.district || deriveDistrict(row.address),
    coordinates: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
    },
    status: row.status,
    isVerified: row.is_verified,
    upvoteCount: Number(row.upvote_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    images: Array.isArray(row.images)
      ? row.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          storageKey: image.storageKey,
          alt: image.alt,
        }))
      : [],
    statusLogs: Array.isArray(row.status_logs)
      ? row.status_logs.map((log) => ({
          id: log.id,
          previousStatus: log.previousStatus || undefined,
          nextStatus: log.nextStatus,
          note: log.note,
          updatedBy: log.updatedBy,
          createdAt: log.createdAt,
        }))
      : [],
    hasUpvoted: Boolean(row.has_upvoted),
  };
}

function buildReportQuery(filters = {}) {
  const values = [filters.viewerId || null];
  const conditions = [];

  if (filters.referenceCode) {
    values.push(filters.referenceCode);
    conditions.push(`r.reference_code = $${values.length}`);
  }

  if (filters.reporterId) {
    values.push(filters.reporterId);
    conditions.push(`r.reporter_id = $${values.length}`);
  }

  if (filters.category) {
    const categories = Array.isArray(filters.category)
      ? filters.category
      : String(filters.category)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    if (categories.length > 0) {
      values.push(categories);
      conditions.push(`c.slug = ANY($${values.length})`);
    }
  }

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : String(filters.status)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    if (statuses.length > 0) {
      values.push(statuses);
      conditions.push(`r.status = ANY($${values.length})`);
    }
  }

  if (filters.district) {
    values.push(`%${filters.district}%`);
    conditions.push(`r.district ILIKE $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(
      `(r.reference_code ILIKE $${values.length} OR r.title ILIKE $${values.length} OR COALESCE(r.address, '') ILIKE $${values.length})`,
    );
  }

  if (filters.dateRange === "7d") {
    conditions.push(`r.created_at >= NOW() - INTERVAL '7 days'`);
  } else if (filters.dateRange === "30d") {
    conditions.push(`r.created_at >= NOW() - INTERVAL '30 days'`);
  }

  const sort = allowedSorts.includes(filters.sort) ? filters.sort : "latest";
  const orderBy =
    sort === "upvotes"
      ? "r.upvote_count DESC, r.created_at DESC"
      : "r.created_at DESC";

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return {
    orderBy,
    values,
    whereClause,
  };
}

async function listReports(filters = {}) {
  const { values, whereClause, orderBy } = buildReportQuery(filters);
  const result = await query(
    `
      SELECT
        r.id AS internal_id,
        r.reference_code,
        r.reporter_id,
        COALESCE(u.full_name, 'Anonim') AS reporter_name,
        c.slug AS category_slug,
        r.title,
        r.description,
        r.latitude,
        r.longitude,
        r.address,
        r.district,
        r.status,
        r.is_verified,
        r.upvote_count,
        r.created_at,
        r.updated_at
      FROM reports r
      INNER JOIN report_categories c ON c.id = r.category_id
      LEFT JOIN users u ON u.id = r.reporter_id
      ${whereClause}
      ORDER BY ${orderBy}
    `,
    values,
  );

  if (result.rows.length === 0) {
    return [];
  }

  const reportIds = result.rows.map((row) => row.internal_id);
  const imagesMap = new Map();
  const logsMap = new Map();
  const upvotedIds = new Set();

  const imagesResult = await query(
    `
      SELECT
        id::text AS id,
        report_id,
        image_url,
        storage_key,
        COALESCE(alt_text, 'Foto laporan kondisi jalan') AS alt_text
      FROM report_images
      WHERE report_id = ANY($1)
      ORDER BY created_at
    `,
    [reportIds],
  );

  for (const image of imagesResult.rows) {
    const current = imagesMap.get(image.report_id) || [];
    current.push({
      id: image.id,
      imageUrl: image.image_url,
      storageKey: image.storage_key,
      alt: image.alt_text,
    });
    imagesMap.set(image.report_id, current);
  }

  const logsResult = await query(
    `
      SELECT
        rsl.id::text AS id,
        rsl.report_id,
        rsl.previous_status,
        rsl.next_status,
        COALESCE(rsl.note, '') AS note,
        COALESCE(u.full_name, 'System') AS updated_by_name,
        rsl.created_at
      FROM report_status_logs rsl
      LEFT JOIN users u ON u.id = rsl.updated_by
      WHERE rsl.report_id = ANY($1)
      ORDER BY rsl.created_at
    `,
    [reportIds],
  );

  for (const log of logsResult.rows) {
    const current = logsMap.get(log.report_id) || [];
    current.push({
      id: log.id,
      previousStatus: log.previous_status,
      nextStatus: log.next_status,
      note: log.note,
      updatedBy: log.updated_by_name,
      createdAt: log.created_at,
    });
    logsMap.set(log.report_id, current);
  }

  if (filters.viewerId) {
    const upvoteResult = await query(
      `
        SELECT report_id
        FROM report_upvotes
        WHERE user_id = $1
          AND report_id = ANY($2)
      `,
      [filters.viewerId, reportIds],
    );

    for (const upvote of upvoteResult.rows) {
      upvotedIds.add(upvote.report_id);
    }
  }

  return result.rows.map((row) =>
    mapReportRow({
      ...row,
      images: imagesMap.get(row.internal_id) || [],
      status_logs: logsMap.get(row.internal_id) || [],
      has_upvoted: upvotedIds.has(row.internal_id),
    }),
  );
}

async function getReportByReferenceCode(referenceCode, viewerId) {
  const reports = await listReports({
    referenceCode,
    viewerId,
  });
  return reports[0] || null;
}

async function getCategoryIdBySlug(client, slug) {
  const result = await client.query(
    "SELECT id FROM report_categories WHERE slug = $1",
    [slug],
  );
  return result.rows[0]?.id || null;
}

async function createReport(input, reporterId) {
  assert(input.title, 400, "Judul laporan wajib diisi.");
  assert(input.description, 400, "Deskripsi laporan wajib diisi.");
  assert(input.categorySlug, 400, "Kategori laporan wajib dipilih.");
  assert(
    Number.isFinite(Number(input.latitude)) && Number.isFinite(Number(input.longitude)),
    400,
    "Koordinat laporan tidak valid.",
  );

  const referenceCode = await withTransaction(async (client) => {
    const categoryId = await getCategoryIdBySlug(client, input.categorySlug);
    assert(categoryId, 400, "Kategori laporan tidak dikenal.");

    let nextReferenceCode = generateReferenceCode();
    let attempts = 0;

    while (attempts < 5) {
      try {
        const reportResult = await client.query(
          `
            INSERT INTO reports (
              reference_code,
              reporter_id,
              category_id,
              title,
              description,
              latitude,
              longitude,
              address,
              district,
              status,
              is_verified,
              upvote_count,
              created_at,
              updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new', FALSE, 0, NOW(), NOW())
            RETURNING id
          `,
          [
            nextReferenceCode,
            reporterId,
            categoryId,
            input.title.trim(),
            input.description.trim(),
            Number(input.latitude),
            Number(input.longitude),
            input.address?.trim() || "",
            input.district?.trim() || deriveDistrict(input.address),
          ],
        );

        const reportId = reportResult.rows[0].id;
        const imageUrl =
          input.imageUrl || getDefaultImageForCategory(input.categorySlug);

        await client.query(
          `
            INSERT INTO report_images (report_id, image_url, storage_key, alt_text)
            VALUES ($1, $2, $3, $4)
          `,
          [
            reportId,
            imageUrl,
            input.storageKey || `reports/${nextReferenceCode}/cover.svg`,
            input.imageAlt || input.title.trim(),
          ],
        );

        await client.query(
          `
            INSERT INTO report_status_logs (
              report_id,
              previous_status,
              next_status,
              note,
              updated_by
            )
            VALUES ($1, NULL, 'new', $2, NULL)
          `,
          [reportId, "Laporan diterima dari warga."],
        );

        return nextReferenceCode;
      } catch (error) {
        if (
          error.code === "23505" &&
          String(error.detail || error.constraint || "").includes("reference_code")
        ) {
          attempts += 1;
          nextReferenceCode = generateReferenceCode();
          continue;
        }

        throw error;
      }
    }

    throw new HttpError(500, "Gagal membuat ID laporan yang unik.");
  });

  return getReportByReferenceCode(referenceCode, reporterId);
}

async function addUpvote(referenceCode, userId) {
  await withTransaction(async (client) => {
    const target = await client.query(
      `
        SELECT id
        FROM reports
        WHERE reference_code = $1
      `,
      [referenceCode],
    );
    assert(target.rowCount > 0, 404, "Laporan tidak ditemukan.");

    const result = await client.query(
      `
        INSERT INTO report_upvotes (user_id, report_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING report_id
      `,
      [userId, target.rows[0].id],
    );

    if (result.rowCount > 0) {
      await client.query(
        `
          UPDATE reports
          SET upvote_count = upvote_count + 1,
              updated_at = NOW()
          WHERE id = $1
        `,
        [target.rows[0].id],
      );
    }
  });

  return getReportByReferenceCode(referenceCode, userId);
}

async function removeUpvote(referenceCode, userId) {
  await withTransaction(async (client) => {
    const target = await client.query(
      `
        SELECT id
        FROM reports
        WHERE reference_code = $1
      `,
      [referenceCode],
    );
    assert(target.rowCount > 0, 404, "Laporan tidak ditemukan.");

    const result = await client.query(
      `
        DELETE FROM report_upvotes
        WHERE user_id = $1
          AND report_id = $2
        RETURNING report_id
      `,
      [userId, target.rows[0].id],
    );

    if (result.rowCount > 0) {
      await client.query(
        `
          UPDATE reports
          SET upvote_count = GREATEST(0, upvote_count - 1),
              updated_at = NOW()
          WHERE id = $1
        `,
        [target.rows[0].id],
      );
    }
  });

  return getReportByReferenceCode(referenceCode, userId);
}

async function updateReportStatus(referenceCode, nextStatus, updatedBy, note) {
  assert(
    allowedStatuses.includes(nextStatus),
    400,
    "Status laporan tidak valid.",
  );

  await withTransaction(async (client) => {
    const reportResult = await client.query(
      `
        SELECT id, status
        FROM reports
        WHERE reference_code = $1
      `,
      [referenceCode],
    );

    assert(reportResult.rowCount > 0, 404, "Laporan tidak ditemukan.");

    const current = reportResult.rows[0];

    await client.query(
      `
        UPDATE reports
        SET status = $2,
            is_verified = CASE WHEN $2 = 'new' THEN FALSE ELSE TRUE END,
            updated_at = NOW()
        WHERE reference_code = $1
      `,
      [referenceCode, nextStatus],
    );

    await client.query(
      `
        INSERT INTO report_status_logs (
          report_id,
          previous_status,
          next_status,
          note,
          updated_by
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [
        current.id,
        current.status,
        nextStatus,
        note || `Status laporan diperbarui menjadi ${nextStatus}.`,
        updatedBy,
      ],
    );
  });

  return getReportByReferenceCode(referenceCode, updatedBy);
}

async function getAdminStats() {
  const result = await query(`
    SELECT
      COUNT(*)::int AS total_reports,
      COUNT(*) FILTER (WHERE status = 'new')::int AS new_reports,
      COUNT(*) FILTER (WHERE status = 'verified')::int AS verified_reports,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_reports,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_reports,
      COALESCE(SUM(upvote_count), 0)::int AS upvotes
    FROM reports
  `);

  const row = result.rows[0];
  return {
    totalReports: row.total_reports,
    newReports: row.new_reports,
    verifiedReports: row.verified_reports,
    inProgressReports: row.in_progress_reports,
    resolvedReports: row.resolved_reports,
    upvotes: row.upvotes,
  };
}

module.exports = {
  allowedStatuses,
  listReports,
  getReportByReferenceCode,
  createReport,
  addUpvote,
  removeUpvote,
  updateReportStatus,
  getAdminStats,
};
