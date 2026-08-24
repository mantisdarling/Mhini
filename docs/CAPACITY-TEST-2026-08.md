# Capacity and resilience test

## Scope

This was a non-invasive local simulation against the running Mantis application. It used read-only requests across `/healthz`, `/readyz`, anonymous `auth.me`, the public project feed, `/`, and `/sw.js`. No production data, writes, authentication credentials, or third-party infrastructure were modified.

## Results

| Run           | Concurrency | Requests | Success rate |     Throughput |    p50 |    p95 | Maximum | Security headers |
| ------------- | ----------: | -------: | -----------: | -------------: | -----: | -----: | ------: | ---------------- |
| Warm baseline | 100 workers |    1,800 |         100% | 434 requests/s | 140 ms | 535 ms |  2.11 s | 4 of 4 present   |
| Higher burst  | 500 workers |    1,800 |         100% | 448 requests/s | 309 ms | 3.30 s |  3.56 s | 4 of 4 present   |

The checked headers were Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options. After each burst, health, readiness, and anonymous authentication probes remained successful, and the development server remained running without a new crash or unhandled application error.

## Resilience changes made

The first burst exposed a cold-cache stampede risk: concurrent readiness checks and public-feed requests could each initiate an upstream provider request. Readiness now coalesces concurrent probes and caches the result for five seconds. Published project reads now share one in-flight request on a cold cache while retaining the existing one-minute freshness window. Focused application regressions cover readiness coalescing, and the existing security boundary suite remains passing.

## Interpretation

These results demonstrate that the current application handled the tested local burst without request failures after the resilience changes. They do **not** prove that 50,000 real users can be served simultaneously. A credible 50,000-user claim requires an approved production-like load test with the actual Vercel execution model, Supabase quotas, CDN behavior, database limits, geographic distribution, authenticated traffic, media delivery, and an agreed latency and error budget. The local development server, localhost network, and empty or small data set are not substitutes for that test.

The next production validation should be staged, read-only, rate-limited, and scheduled with the hosting and database providers’ quotas in mind. It should begin at a low rate, increase in controlled steps, and stop automatically on elevated 5xx responses, latency, provider throttling, or resource exhaustion.
