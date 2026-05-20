const fs = require("fs");
const path = require("path");
const {
  cleanupDevPorts,
  getPorts,
  rootDir,
  spawnLabeledProcess,
  terminateProcessTree,
} = require("./dev-helpers.cjs");

const children = [];
let shuttingDown = false;

function ensureCleanNextCache() {
  const cacheDir = path.join(rootDir, "frontend", ".next", "cache");
  fs.rmSync(cacheDir, { recursive: true, force: true });
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  await Promise.all(children.map((child) => terminateProcessTree(child.pid)));
  process.exit(exitCode);
}

async function main() {
  const { frontendPort, backendPort } = getPorts();

  await cleanupDevPorts({ excludePids: [process.pid] });
  ensureCleanNextCache();

  const backend = spawnLabeledProcess(
    "backend",
    path.join(rootDir, "backend"),
    ["run", "dev"],
    {
      BACKEND_PORT: String(backendPort),
      FRONTEND_ORIGIN: `http://localhost:${frontendPort}`,
    },
  );

  const frontend = spawnLabeledProcess(
    "frontend",
    path.join(rootDir, "frontend"),
    ["run", "dev", "--", "--port", String(frontendPort)],
    {
      PORT: String(frontendPort),
      NEXT_PUBLIC_API_BASE_URL: `http://localhost:${backendPort}/api`,
    },
  );

  children.push(backend, frontend);

  backend.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[backend] exited with code ${code}`);
      shutdown(code || 1);
    }
  });

  frontend.on("exit", (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`[frontend] exited with code ${code}`);
      shutdown(code || 1);
    }
  });

  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
