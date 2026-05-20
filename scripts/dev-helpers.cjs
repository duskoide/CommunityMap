const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env") });

function getPorts() {
  const frontendPort = Number(process.env.FRONTEND_PORT || 3000);
  const backendPort = Number(process.env.BACKEND_PORT || 4000);

  return {
    frontendPort,
    backendPort,
  };
}

function getNpmCommand() {
  return process.platform === "win32" ? "cmd.exe" : "npm";
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "pipe",
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          stderr.trim() || stdout.trim() || `${command} exited with code ${code}`,
        ),
      );
    });
  });
}

async function killPort(port) {
  if (process.platform === "win32") {
    const script = [
      `$connections = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue`,
      "if ($connections) {",
      "  $targets = New-Object System.Collections.Generic.List[int]",
      "  foreach ($connection in $connections) {",
      "    $currentPid = [int]$connection.OwningProcess",
      "    while ($currentPid -gt 0) {",
      "      $processInfo = Get-CimInstance Win32_Process -Filter \"ProcessId = $currentPid\" -ErrorAction SilentlyContinue",
      "      if (-not $processInfo) { break }",
      "      $name = $processInfo.Name.ToLowerInvariant()",
      "      if ($name -notin @('node.exe', 'cmd.exe')) { break }",
      "      $targets.Add($currentPid)",
      "      $parentPid = [int]$processInfo.ParentProcessId",
      "      if ($parentPid -le 0 -or $parentPid -eq $currentPid) { break }",
      "      $currentPid = $parentPid",
      "    }",
      "  }",
      "  ($targets | Sort-Object -Unique) -join ','",
      "}",
    ].join("; ");

    const result = await runCommand("powershell.exe", [
      "-NoProfile",
      "-Command",
      script,
    ]).catch(() => ({ stdout: "" }));

    const pids = result.stdout
      .trim()
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    for (const pid of pids) {
      await runCommand("taskkill", ["/pid", pid, "/T", "/F"]).catch(
        () => undefined,
      );
    }

    return;
  }

  await runCommand("bash", ["-lc", `lsof -ti tcp:${port} | xargs -r kill -9`]).catch(
    () => undefined,
  );
}

async function cleanupDevPorts(options = {}) {
  const { frontendPort, backendPort } = getPorts();
  const ports = [frontendPort, frontendPort + 1, backendPort];
  const excludedPids = new Set(
    (options.excludePids || []).map((pid) => String(pid)).filter(Boolean),
  );

  for (const port of ports) {
    await killPort(port);
  }

  if (process.platform === "win32") {
    const script = [
      "$targets = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {",
      "  $_.Name -eq 'node.exe' -and $_.CommandLine -like '*scripts/dev.cjs*'",
      "}",
      "if ($targets) {",
      "  ($targets | Select-Object -ExpandProperty ProcessId | Sort-Object -Unique) -join ','",
      "}",
    ].join("; ");

    const result = await runCommand("powershell.exe", [
      "-NoProfile",
      "-Command",
      script,
    ]).catch(() => ({ stdout: "" }));

    const pids = result.stdout
      .trim()
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value && !excludedPids.has(value));

    for (const pid of pids) {
      await runCommand("taskkill", ["/pid", pid, "/T", "/F"]).catch(
        () => undefined,
      );
    }
  }
}

function prefixStream(stream, label) {
  if (!stream) {
    return;
  }

  const reader = readline.createInterface({ input: stream });
  reader.on("line", (line) => {
    console.log(`[${label}] ${line}`);
  });
}

function spawnLabeledProcess(label, cwd, args, extraEnv = {}) {
  const baseOptions = {
    cwd,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: ["inherit", "pipe", "pipe"],
  };

  const child =
    process.platform === "win32"
      ? spawn(getNpmCommand(), ["/d", "/s", "/c", `npm ${args.join(" ")}`], baseOptions)
      : spawn(getNpmCommand(), args, baseOptions);

  prefixStream(child.stdout, label);
  prefixStream(child.stderr, label);

  return child;
}

async function terminateProcessTree(pid) {
  if (!pid) {
    return;
  }

  if (process.platform === "win32") {
    await runCommand("taskkill", ["/pid", String(pid), "/T", "/F"]).catch(
      () => undefined,
    );
    return;
  }

  process.kill(-pid, "SIGTERM");
}

module.exports = {
  cleanupDevPorts,
  getPorts,
  rootDir,
  spawnLabeledProcess,
  terminateProcessTree,
};
