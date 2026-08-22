import { execFileSync } from "node:child_process";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter(file => !file.endsWith(".lock") && !file.startsWith("client/public/") && !file.startsWith("dist/"));

const markerPattern = /(BEGIN (?:RSA|EC|OPENSSH|DSA) PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|sk-(?:live|test)-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})/;
const allowlistedFiles = new Set(["scripts/check-secrets.mjs"]);
const findings = [];

for (const file of trackedFiles) {
  if (allowlistedFiles.has(file)) continue;
  let source;
  try {
    source = execFileSync("git", ["show", `HEAD:${file}`], { encoding: "utf8", maxBuffer: 2 * 1024 * 1024 });
  } catch {
    continue;
  }
  if (markerPattern.test(source)) findings.push(file);
}

if (findings.length > 0) {
  console.error(`Potential credential markers found in: ${findings.join(", ")}`);
  process.exit(1);
}

console.log(`Scanned ${trackedFiles.length} tracked source files. No credential markers found.`);
