import { performance } from "node:perf_hooks";
import { readFileSync } from "node:fs";

const baseUrl = process.env.CAPACITY_BASE_URL ?? "http://127.0.0.1:3000";
const concurrency = Number(process.env.CAPACITY_CONCURRENCY ?? 100);
const requestsPerRoute = Number(process.env.CAPACITY_REQUESTS_PER_ROUTE ?? 300);
const routes = [
  "/healthz",
  "/readyz",
  "/api/trpc/auth.me",
  "/api/trpc/projects.listPublic",
  "/",
  "/sw.js",
];
const expectedTypes = new Map([
  ["/healthz", "application/json"],
  ["/readyz", "application/json"],
  ["/api/trpc/auth.me", "application/json"],
  ["/api/trpc/projects.listPublic", "application/json"],
  ["/", "text/html"],
  ["/sw.js", "text/javascript"],
]);

function readRssBytes() {
  try {
    return (
      Number(
        readFileSync("/proc/self/status", "utf8").match(
          /VmRSS:\s+(\d+)/
        )?.[1] ?? 0
      ) * 1024
    );
  } catch {
    return 0;
  }
}

const samples = [];
let cursor = 0;
const startedAt = performance.now();

async function request(path) {
  const start = performance.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? "";
    samples.push({
      path,
      status: response.status,
      ok: response.ok && contentType.includes(expectedTypes.get(path)),
      ms: performance.now() - start,
      bytes: body.byteLength,
      contentType,
    });
  } catch (error) {
    samples.push({
      path,
      status: 0,
      ok: false,
      ms: performance.now() - start,
      error: error instanceof Error ? error.name : "request-failed",
    });
  }
}

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= routes.length * requestsPerRoute) return;
    await request(routes[index % routes.length]);
  }
}

const beforeRss = readRssBytes();
await Promise.all(Array.from({ length: concurrency }, worker));
const elapsedMs = performance.now() - startedAt;
const afterRss = readRssBytes();
const sorted = samples.map(sample => sample.ms).sort((a, b) => a - b);
const percentile = ratio =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
const failures = samples.filter(sample => !sample.ok);
const byRoute = Object.fromEntries(
  routes.map(path => {
    const routeSamples = samples.filter(sample => sample.path === path);
    return [
      path,
      {
        total: routeSamples.length,
        success: routeSamples.filter(sample => sample.ok).length,
        p50Ms: routeSamples.map(sample => sample.ms).sort((a, b) => a - b)[
          Math.floor(routeSamples.length * 0.5)
        ],
        p95Ms: routeSamples.map(sample => sample.ms).sort((a, b) => a - b)[
          Math.floor(routeSamples.length * 0.95)
        ],
      },
    ];
  })
);

const securityHeaders = await fetch(`${baseUrl}/`)
  .then(response =>
    Object.fromEntries(
      [
        "strict-transport-security",
        "content-security-policy",
        "x-frame-options",
        "x-content-type-options",
      ].map(name => [name, Boolean(response.headers.get(name))])
    )
  )
  .catch(() => ({}));
const result = {
  baseUrl,
  concurrency,
  requestsPerRoute,
  total: samples.length,
  success: samples.length - failures.length,
  failureCount: failures.length,
  successRate: (samples.length - failures.length) / samples.length,
  elapsedMs,
  throughputPerSecond: samples.length / (elapsedMs / 1000),
  p50Ms: percentile(0.5),
  p95Ms: percentile(0.95),
  maxMs: sorted.at(-1),
  rssBeforeBytes: beforeRss,
  rssAfterBytes: afterRss,
  rssDeltaBytes: afterRss - beforeRss,
  securityHeaders,
  byRoute,
  failures: failures.slice(0, 20),
};
console.log(JSON.stringify(result, null, 2));
if (failures.length > 0 || Object.values(securityHeaders).some(value => !value))
  process.exit(1);
