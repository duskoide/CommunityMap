const { app } = require("./app");
const { env } = require("./config/env");
const { initializeDatabase } = require("./lib/bootstrap");

async function start() {
  await initializeDatabase();

  const server = app.listen(env.port, () => {
    console.log(`CommunityMap backend listening on http://localhost:${env.port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${env.port} sedang dipakai proses lain. Jalankan 'npm run dev:clean' lalu coba lagi.`,
      );
      process.exit(1);
    }

    console.error("Backend server failed", error);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
