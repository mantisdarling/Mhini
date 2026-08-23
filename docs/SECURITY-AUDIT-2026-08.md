# Mantis repository security and maintainability audit

## Scope

This review covers the React and Vite client, Express and tRPC application boundary, MySQL and Supabase database adapters, storage proxy, recovery handlers, authentication paths, Vercel configuration, dependency manifest and lockfile, secret scanner, tests, build entrypoints, and recent runtime logs. Production data, credentials, and provider-side settings were not changed.

## Verified findings

| ID | Boundary | Severity | Observation | Remediation | Evidence |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | `server/supabaseDb.ts` user upsert | High | Supabase writes defaulted every user without an explicit role to `user`, while the MySQL path promotes the configured owner open ID to `admin`. The two database providers therefore did not enforce the same owner authorization invariant. | Mirror the existing owner promotion rule in the Supabase adapter and add a deterministic regression for owner and ordinary-user role selection. | Existing MySQL logic in `server/db.ts`; Supabase role branch at the former upsert implementation; new unit test. |
| SEC-02 | `vercel.json` CSP | Medium | The deployment CSP differed from the application CSP: it omitted the approved Pinterest image origin and declared `frame-src 'none'` while the application explicitly allows the Pinterest asset frame origin. This can cause production policy drift and break approved media behavior. | Align the deployment CSP with the application policy while preserving `frame-ancestors 'none'` and all existing restrictive directives. | `server/app.ts` and `server/app.test.ts` compared with `vercel.json`; production build validation. |
| MAINT-01 | `server/index.ts` | Medium maintainability | This alternate bootstrap is not referenced by the active `dev`, `build`, `start`, or Vercel function paths. It serves a different, un-hardened Express surface and can mislead future security changes. | Remove the unreferenced bootstrap; keep the active `server/_core/index.ts` and `server/vercelFunction.ts` entrypoints. | `git grep` reference inventory and package/Vercel entrypoint inspection. |
| MAINT-02 | direct dependencies | Low maintainability | `body-parser`, `lodash`, `lodash-es`, and `mdast-util-to-hast` have no direct source imports in the tracked application, server, API, shared, or script code. | Remove only these unused direct dependencies and regenerate the lockfile; retain dependencies with verified component or runtime imports. | Usage scan and post-removal type, test, and build gates. |

## Controls already verified

The repository already uses Zod bounds for project writes, Drizzle parameterized query builders, owner-only tRPC procedures, HTTP(S)-only public project links, storage traversal rejection in the public proxy, redacted server errors, restrictive security headers, request body limits, cache bounds, secret-marker scanning, and recovery checksum metadata.

## Residual limitations

This audit does not prove provider-level DDoS protection, immutable off-site backups, secret rotation, uptime alerting, or capacity for 50,000 concurrent users. Those properties require deployment-provider evidence and an approved production test plan. No third-party infrastructure or production data was attacked or modified.

## Remediation status

SEC-01 was fixed by adding `resolveSupabaseUserRole`, which preserves explicit roles and promotes only the configured owner open ID. SEC-02 was fixed by aligning the Vercel CSP with the application policy for the approved Pinterest image and frame origins. MAINT-01 was fixed by removing the unreferenced alternate `server/index.ts` bootstrap. MAINT-02 was fixed by removing the four unused direct dependencies identified by source usage scanning. Storage proxy and recovery logs were additionally hardened to avoid provider response bodies and raw exception objects.

## Validation evidence

The focused security suite passed 20 tests. The complete suite passed 62 tests across 17 files. TypeScript, production build, Vercel build, high-severity production dependency audit, secret scan, diff checks, and recent browser/network error scans passed. The source scan found no dynamic execution or unsafe HTML use in application code beyond the existing static chart-style generator, which is constrained to generated CSS from typed chart configuration.
