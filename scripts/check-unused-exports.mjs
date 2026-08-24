import { spawnSync } from "node:child_process";

const ignoredPaths = [
  /components\/ui\//,
  /server\/_core\//,
  /\.test\.(ts|tsx)$/,
];
const intentionalExports = [
  /^shared\/types\.ts:/,
  /^server\/vercelFunction\.ts:.* - default$/,
];

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "ts-prune",
    "-i",
    "(components/ui|server/_core|.*\\.test\\.)",
    "-s",
    ".*\\.test\\.",
  ],
  {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }
);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const findings = output
  .split("\n")
  .map(line => line.trim())
  .filter(Boolean)
  .filter(line => !line.includes("(used in module)"))
  .filter(line => !ignoredPaths.some(pattern => pattern.test(line)))
  .filter(line => !intentionalExports.some(pattern => pattern.test(line)));

if (result.error) {
  console.error(`Unused-export check could not start: ${result.error.message}`);
  process.exit(1);
}
if (result.status !== 0 && findings.length === 0) {
  console.error(
    output.trim() || `Unused-export check exited with status ${result.status}`
  );
  process.exit(result.status ?? 1);
}
if (findings.length) {
  console.error("Unused exports detected:");
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("Unused-export check passed.");
