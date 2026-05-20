const http = require("http");
const { URL } = require("url");
const { getPorts } = require("./dev-helpers.cjs");

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  store(setCookieHeaders = []) {
    for (const entry of setCookieHeaders) {
      const [pair] = entry.split(";");
      const [name, value] = pair.split("=");
      if (name && value) {
        this.cookies.set(name.trim(), value.trim());
      }
    }
  }

  header() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }
}

function request(baseUrl, pathname, options = {}, jar) {
  const url = new URL(pathname, baseUrl);
  const body = options.body || null;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: options.method || "GET",
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(jar?.header() ? { Cookie: jar.header() } : {}),
          ...(options.headers || {}),
        },
      },
      (res) => {
        let raw = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          const setCookie = res.headers["set-cookie"] || [];
          jar?.store(setCookie);

          if (res.statusCode < 200 || res.statusCode >= 300) {
            try {
              const payload = raw ? JSON.parse(raw) : {};
              reject(
                new Error(
                  `${options.method || "GET"} ${pathname} failed: ${
                    payload?.error?.message || res.statusCode
                  }`,
                ),
              );
            } catch {
              reject(
                new Error(
                  `${options.method || "GET"} ${pathname} failed with ${res.statusCode}`,
                ),
              );
            }
            return;
          }

          try {
            const payload = raw ? JSON.parse(raw) : {};
            resolve(payload);
          } catch {
            resolve(raw);
          }
        });
      },
    );

    req.on("error", reject);

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function main() {
  const { frontendPort, backendPort } = getPorts();
  const frontendBase = `http://127.0.0.1:${frontendPort}`;
  const backendBase = `http://127.0.0.1:${backendPort}`;

  const publicReports = await request(backendBase, "/api/reports");
  if (!Array.isArray(publicReports.data) || publicReports.data.length === 0) {
    throw new Error("Expected public reports to be available.");
  }

  const citizenJar = new CookieJar();
  await request(
    backendBase,
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: "warga@email.com",
        password: "password",
      }),
    },
    citizenJar,
  );

  const myReportsBefore = await request(
    backendBase,
    "/api/reports/me",
    {},
    citizenJar,
  );
  const created = await request(
    backendBase,
    "/api/reports",
    {
      method: "POST",
      body: JSON.stringify({
        categorySlug: "other",
        title: "Smoke test report",
        description: "Created by automated smoke test.",
        address: "Jl. Smoke Test No. 1, Bandung",
        district: "Bandung",
        latitude: -6.9147,
        longitude: 107.6098,
        imageUrl: "/images/report-road.svg",
        imageAlt: "Smoke test road",
        storageKey: "reports/smoke-test/report.svg",
      }),
    },
    citizenJar,
  );

  const upvoted = await request(
    backendBase,
    `/api/reports/${created.data.id}/upvote`,
    { method: "POST" },
    citizenJar,
  );

  if (upvoted.data.upvoteCount < 1) {
    throw new Error("Expected upvote count to increase.");
  }

  const myReportsAfter = await request(
    backendBase,
    "/api/reports/me",
    {},
    citizenJar,
  );
  if (myReportsAfter.data.length <= myReportsBefore.data.length) {
    throw new Error("Expected citizen report count to increase after report creation.");
  }

  const adminJar = new CookieJar();
  await request(
    backendBase,
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: "admin@dpu.go.id",
        password: "password",
      }),
    },
    adminJar,
  );

  const adminStats = await request(backendBase, "/api/admin/stats", {}, adminJar);
  if (typeof adminStats.data.totalReports !== "number") {
    throw new Error("Expected admin stats to return numeric totals.");
  }

  const verified = await request(
    backendBase,
    `/api/admin/reports/${publicReports.data[0].id}/verify`,
    {
      method: "PATCH",
      body: JSON.stringify({
        note: "Verified by smoke test.",
      }),
    },
    adminJar,
  );

  if (verified.data.status !== "verified") {
    throw new Error("Expected admin verify endpoint to mark report as verified.");
  }

  const homepage = await request(frontendBase, "/");
  if (typeof homepage !== "string" || !homepage.includes("CommunityMap")) {
    throw new Error("Expected frontend homepage HTML to be returned.");
  }

  console.log("Smoke test passed.");
  console.log(`Frontend: ${frontendBase}`);
  console.log(`Backend: ${backendBase}/api`);
  console.log(`Created report: ${created.data.id}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
