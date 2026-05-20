const fs = require("fs");
const path = require("path");
const { cleanupDevPorts, getPorts } = require("./dev-helpers.cjs");

async function main() {
  const { frontendPort, backendPort } = getPorts();
  await cleanupDevPorts();
  fs.rmSync(path.join(__dirname, "..", "frontend", ".next"), {
    recursive: true,
    force: true,
  });
  console.log(
    `Freed dev ports ${frontendPort}, ${frontendPort + 1}, and ${backendPort}, and reset Next.js cache.`,
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
