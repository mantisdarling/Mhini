# Security and Scale Review

## Scope

This review covers the Mantis portfolio repository, including the React client, Express and tRPC boundary, MySQL or Supabase adapters, Vercel configuration, recovery metadata path, dependency lockfile, secret-marker scan, and public project data flow. Production data was treated as read-only. No intrusive traffic generation, credential testing, destructive database operation, or third-party infrastructure scan was performed.

## Verified controls

| Boundary | Control | Evidence |
| --- | --- | --- |
| Public project feed | Public procedure returns published records only, normalizes tags, and emits a short shared-cache policy | `server/routers.ts`, `server/db.ts` |
| Admin mutations | Project CRUD, reorder, and recovery procedures use the admin procedure boundary | `server/routers.ts` |
| Input validation | Project fields, URLs, statuses, tags, and reorder limits are validated with Zod | `server/projectSchemas.ts` |
| Browser headers | HSTS, CSP, frame denial, MIME sniffing protection, referrer policy, permissions policy, and cross-origin policy are configured | `server/app.ts`, `vercel.json` |
| Request safety | JSON and form payloads are capped at 1 MB; generic production errors avoid stack traces | `shared/scalePolicy.ts`, `server/app.ts` |
| External links | Client links accept only HTTP and HTTPS schemes and use `noopener noreferrer` | `client/src/pages/Home.tsx` |
| Secrets | Repository scan checks tracked files for credential markers and reports redacted paths only | `scripts/check-secrets.mjs` |
| Recovery | Snapshot metadata records storage key, checksum, and record count | `server/recoverySnapshot.ts`, `server/db.ts` |

## Repository and licensing review

No minified production bundle was copied into the project and no scraped third-party site implementation was introduced during this pass. The changed code is modular application code written inside the repository. This is not a legal clearance: the owner should retain license records for fonts, images, videos, icons, dependencies, and any future media added to the portfolio. A qualified lawyer should review any commercial or third-party asset license question.

## Scale posture

The public site is predominantly static and media-backed, which is favorable for edge caching and large anonymous readership. The public project query has a 60-second in-memory cache, but that cache is local to each server instance and is not a shared cache. The database adapter therefore remains the main variable for dynamic traffic, and Supabase project reordering still performs sequential administrative updates. Neither issue affects ordinary anonymous portfolio reads, but neither should be described as proof of 50,000-user capacity.

A verified 50,000-user result requires an approved staging or disposable environment, a defined traffic model, provider limits, database metrics, error budgets, and a non-destructive load test. This repository audit cannot prove that production will sustain 50,000 concurrent users. The safe conclusion is that the static frontend and bounded public read path are prepared for further measurement, while backend capacity remains provider- and workload-dependent.

A bounded local smoke test sent 200 successful public read requests with 25 concurrent workers. It measured a local p50 of 1 ms, p95 of 1,937 ms, and a maximum of 2,158 ms. This is useful evidence that the endpoint responds correctly under a small local burst, but it is not a production capacity benchmark and must not be extrapolated to 50,000 users.

## Remaining owner checks

Before a high-volume launch, confirm the Vercel and database plan limits, run a staging load test with realistic read traffic, inspect cache hit rate and database latency, verify recovery restoration against a disposable destination, and retain asset license records. These checks are external operational gates, not claims that can be established from source code alone.
