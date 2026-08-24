import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve("client/public/__manus__/debug-collector.js"),
  "utf8"
);

const requiredMarkers = [
  "function isSameOriginApiRequest(url)",
  "parsed.origin === location.origin",
  'entry.response.body = "[API response body not captured]"',
  'responseBody = "[API response body not captured]"',
  "if (isSameOriginApiRequest(url))",
  "if (isSameOriginApiRequest(xhr._manusData.url))",
];

const missing = requiredMarkers.filter(marker => !source.includes(marker));
if (missing.length > 0) {
  console.error(
    `Debug privacy check failed; missing markers: ${missing.join(", ")}`
  );
  process.exit(1);
}

console.log(
  "Debug privacy check passed: same-origin API response bodies are not captured."
);
