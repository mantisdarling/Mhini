import { readFile } from "node:fs/promises";

const source = await readFile(
  new URL("../client/public/sw.js", import.meta.url),
  "utf8"
);
const requiredMarkers = [
  'const CACHE_VERSION = "mantis-shell-v1"',
  'request.mode === "navigate"',
  'url.pathname.startsWith("/api/")',
  'request.method !== "GET"',
  "OFFLINE_RESPONSE",
  "self.skipWaiting()",
  "self.clients.claim()",
];

const missing = requiredMarkers.filter(marker => !source.includes(marker));
if (missing.length > 0) {
  console.error(
    `Service-worker policy check failed. Missing: ${missing.join(", ")}`
  );
  process.exit(1);
}

if (
  !source.includes("cache.put(APP_SHELL") ||
  !source.includes("cache.put(request")
) {
  console.error(
    "Service-worker policy check failed. Shell and asset caching are incomplete."
  );
  process.exit(1);
}

console.log(
  "Service-worker policy check passed: versioning, offline fallback, static caching, and API bypass are present."
);
