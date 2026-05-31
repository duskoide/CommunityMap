const { hashPassword } = require("./auth");
const { getDatabaseMode, getPool, query, withTransaction } = require("./db");
const { demoReports, demoUsers } = require("./demo-data");

function buildUsername(fullName, id) {
  const base = (fullName || "user").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${base || "user"}_${String(id).slice(0, 4)}`;
}

async function fillMissingUsernames() {
  const { rows } = await query(`
    SELECT id, full_name
    FROM users
    WHERE username IS NULL
  `);

  for (const row of rows) {
    await query(
      `
        UPDATE users
        SET username = $1
        WHERE id = $2
      `,
      [buildUsername(row.full_name, row.id), row.id],
    );
  }
}

async function runMigrations() {
  await getPool();

  if (getDatabaseMode() !== "memory") {
    await query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
  }

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('citizen', 'admin')),
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_categories (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reference_code VARCHAR(40) UNIQUE,
      reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
      category_id INT NOT NULL REFERENCES report_categories(id),
      title VARCHAR(160) NOT NULL,
      description TEXT NOT NULL,
      latitude NUMERIC(9, 6) NOT NULL,
      longitude NUMERIC(9, 6) NOT NULL,
      address TEXT,
      district VARCHAR(120) NOT NULL DEFAULT '',
      status VARCHAR(30) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'verified', 'in_progress', 'resolved', 'rejected')),
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      upvote_count INT NOT NULL DEFAULT 0,
      downvote_count INT NOT NULL DEFAULT 0,
      rejection_reason TEXT,
      rejected_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      kind VARCHAR(30) NOT NULL DEFAULT 'report'
        CHECK (kind IN ('report', 'resolution_proof')),
      alt_text TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_upvotes (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, report_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_downvotes (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, report_id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES report_comments(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_status_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      previous_status VARCHAR(30),
      next_status VARCHAR(30) NOT NULL,
      note TEXT,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS avatar_url TEXT
  `);

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(50)
  `);

  // Backfill legacy rows without relying on database-specific regex helpers.
  await fillMissingUsernames();

  if (getDatabaseMode() !== "memory") {
    await query(`
      ALTER TABLE users
      ADD CONSTRAINT users_username_key UNIQUE (username)
    `).catch(() => {}); // ignore if constraint already exists
  }

  await query(`
    ALTER TABLE report_comments
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES report_comments(id) ON DELETE CASCADE
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID NOT NULL UNIQUE REFERENCES reports(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS report_chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      chat_id UUID NOT NULL REFERENCES report_chats(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS reference_code VARCHAR(40)
  `);

  await query(`
    ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS district VARCHAR(120) NOT NULL DEFAULT ''
  `);

  await query(`
    ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS downvote_count INT NOT NULL DEFAULT 0
  `);

  await query(`
    ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT
  `);

  await query(`
    ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ
  `);

  await query(`
    ALTER TABLE report_images
    ADD COLUMN IF NOT EXISTS alt_text TEXT
  `);

  await query(`
    ALTER TABLE report_images
    ADD COLUMN IF NOT EXISTS kind VARCHAR(30) NOT NULL DEFAULT 'report'
  `);

  if (getDatabaseMode() !== "memory") {
    await query(`
      ALTER TABLE reports
      DROP CONSTRAINT IF EXISTS reports_status_check
    `);
    await query(`
      ALTER TABLE reports
      ADD CONSTRAINT reports_status_check
      CHECK (status IN ('new', 'verified', 'in_progress', 'resolved', 'rejected'))
    `);
    await query(`
      ALTER TABLE report_images
      DROP CONSTRAINT IF EXISTS report_images_kind_check
    `);
    await query(`
      ALTER TABLE report_images
      ADD CONSTRAINT report_images_kind_check
      CHECK (kind IN ('report', 'resolution_proof'))
    `);
  }

  await query(`
    CREATE INDEX IF NOT EXISTS idx_reports_category_id ON reports(category_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)
  `);
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_reference_code ON reports(reference_code)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id)
  `);

  if (getDatabaseMode() !== "memory") {
    await query(`
      UPDATE reports
      SET reference_code = CONCAT(
        'RPT-',
        TO_CHAR(created_at, 'YYYY-MMDD'),
        '-',
        UPPER(SUBSTRING(REPLACE(id::text, '-', '') FROM 1 FOR 4))
      )
      WHERE reference_code IS NULL
    `);
  }

  await query(`
    UPDATE report_images
    SET alt_text = 'Foto laporan kondisi jalan'
    WHERE alt_text IS NULL OR alt_text = ''
  `);

  await query(`
    INSERT INTO report_categories (slug, name)
    VALUES
      ('pothole', 'Jalan Berlubang'),
      ('streetlight', 'Lampu Jalan Mati'),
      ('puddle', 'Genangan Air'),
      ('flood', 'Banjir Lokal'),
      ('other', 'Lainnya')
    ON CONFLICT (slug) DO NOTHING
  `);
}

async function seedDemoData() {
  const passwordHashes = new Map();

  for (const user of demoUsers) {
    passwordHashes.set(user.email, await hashPassword(user.password));
  }

  await withTransaction(async (client) => {
    await client.query(`
      DELETE FROM reports
      WHERE id::text LIKE '00000000-0000-4000-8000-20%'
    `);

    for (const user of demoUsers) {
      await client.query(
        `
          INSERT INTO users (id, username, full_name, email, password_hash, role, avatar_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE
          SET
            username = EXCLUDED.username,
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            avatar_url = EXCLUDED.avatar_url,
            updated_at = NOW()
        `,
        [
          user.id,
          user.username,
          user.fullName,
          user.email,
          passwordHashes.get(user.email),
          user.role,
          user.avatarUrl || null,
        ],
      );
    }

    const categoryResult = await client.query(
      "SELECT id, slug FROM report_categories",
    );
    const categoryIds = Object.fromEntries(
      categoryResult.rows.map((row) => [row.slug, row.id]),
    );

    for (const report of demoReports) {
      await client.query(
        `
          INSERT INTO reports (
            id,
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
            downvote_count,
            rejection_reason,
            rejected_at,
            created_at,
            updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18
          )
          ON CONFLICT (id) DO UPDATE
          SET
            reference_code = EXCLUDED.reference_code,
            reporter_id = EXCLUDED.reporter_id,
            category_id = EXCLUDED.category_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            address = EXCLUDED.address,
            district = EXCLUDED.district,
            status = EXCLUDED.status,
            is_verified = EXCLUDED.is_verified,
            upvote_count = EXCLUDED.upvote_count,
            downvote_count = EXCLUDED.downvote_count,
            rejection_reason = EXCLUDED.rejection_reason,
            rejected_at = EXCLUDED.rejected_at,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at
        `,
        [
          report.id,
          report.referenceCode,
          report.reporterId,
          categoryIds[report.categorySlug],
          report.title,
          report.description,
          report.latitude,
          report.longitude,
          report.address,
          report.district,
          report.status,
          report.isVerified,
          report.upvoteCount,
          report.downvoteCount || 0,
          report.rejectionReason || null,
          report.rejectedAt || null,
          report.createdAt,
          report.updatedAt,
        ],
      );

      await client.query(
        `
          INSERT INTO report_images (id, report_id, image_url, storage_key, kind, alt_text)
          VALUES ($1, $2, $3, $4, 'report', $5)
        `,
        [
          report.image.id,
          report.id,
          report.image.imageUrl,
          report.image.storageKey,
          report.image.alt,
        ],
      );

      for (const log of report.logs) {
        await client.query(
          `
            INSERT INTO report_status_logs (
              id,
              report_id,
              previous_status,
              next_status,
              note,
              updated_by,
              created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            log.id,
            report.id,
            log.previousStatus || null,
            log.nextStatus,
            log.note,
            log.updatedBy,
            log.createdAt,
          ],
        );
      }

      for (const userId of report.upvoterIds || []) {
        await client.query(
          `
            INSERT INTO report_upvotes (user_id, report_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, report_id) DO NOTHING
          `,
          [userId, report.id],
        );
      }

      for (const userId of report.downvoterIds || []) {
        await client.query(
          `
            INSERT INTO report_downvotes (user_id, report_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, report_id) DO NOTHING
          `,
          [userId, report.id],
        );
      }
    }
  });
}

async function initializeDatabase() {
  await runMigrations();
  await seedDemoData();
}

module.exports = {
  initializeDatabase,
};
