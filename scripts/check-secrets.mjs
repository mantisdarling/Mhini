import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter(fileName => !fileName.startsWith(".env"))
  .filter(fileName => !fileName.endsWith(".lock"));

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:ghp|github_pat|sk|rk)_[A-Za-z0-9_-]{16,}\b/,
  /\bBearer\s+[A-Za-z0-9._~-]{24,}\b/,
];

const findings = [];
for (const fileName of trackedFiles) {
  let source;
  try {
    source = readFileSync(fileName, "utf8");
  } catch {
    continue;
  }

  source.split("\n").forEach((line, index) => {
    if (secretPatterns.some(pattern => pattern.test(line))) {
      findings.push(`${fileName}:${index + 1}`);
    }
  });
}

if (findings.length > 0) {
  console.error("Potential credential patterns found at:");
  findings.forEach(finding => console.error(`- ${finding}`));
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed for ${trackedFiles.length} tracked files.`);
}
