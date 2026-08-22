# Production Readiness

## Implemented

The application now emits browser security headers through the Express application and Vercel edge configuration. These include HSTS, CSP, clickjacking protection, MIME sniffing protection, a strict referrer policy, a restrictive Permissions Policy, and cross-origin isolation headers. API CORS is restricted to the production origin, configured public origin, and local development origins. Untrusted preflight requests receive a 403 response.

Internal recovery errors are logged server side and returned to callers as a generic message. No stack trace or storage detail is returned. The existing daily Vercel Cron recovery snapshot remains configured at `/api/cron/recoverySnapshot` and is protected by the cron secret. The snapshot path stores project data in object storage and metadata in the database.

Analytics is now opt in. The analytics script is not loaded until a visitor allows it. A public privacy policy is available at `/privacy`, and the consent choice is stored only in the visitor’s browser.

Vite now emits separate motion, UI, and query chunks. Vercel is configured to cache hashed assets for one year with immutable caching.

## Validation

The complete code audit reviewed authored client, server, shared, build, deployment, dependency, authentication, storage, backup, privacy, and test files. Unsafe provider response bodies are redacted, storage keys reject traversal segments, the development debug collector validates payloads without `any`, and public CDN assets remain compatible with the resource policy. The second zero-trust pass also verified the project URL boundary, finding and fixing unsafe URL schemes by restricting accepted project and image URLs to HTTP and HTTPS with regression coverage.

The final local validation pass completed with 26 passing Vitest tests across ten files, a clean TypeScript check, valid Vercel JSON, a successful production build, and the existing desktop and mobile visual checks for `/` and `/privacy`. Both production-only and full dependency audits report zero known advisories. The development graph now uses patched Vite 7.3.6, Rollup 4.62.5, Picomatch 4.0.5, Babel 7.29.7, Nanoid 5.1.16, PostCSS 8.5.26, and esbuild releases, including a package-specific override for Drizzle Kit's deprecated loader. The Express 5 storage wildcard route remains covered by the application test harness, and the legacy server entry has no hardcoded port fallback.

The latest local production build emitted these browser assets:

| Asset | Raw size | Gzip estimate |
|---|---:|---:|
| Main application chunk | 781.49 kB | 217.25 kB |
| Motion chunk | 206.91 kB | 72.04 kB |
| Query chunk | 112.67 kB | 33.25 kB |
| UI chunk | 56.62 kB | 18.00 kB |
| CSS | 178.56 kB | 30.83 kB |

These are local build measurements, not live Core Web Vitals. The build still emits one large application chunk at 781.49 kB raw, so further route-level code splitting could improve first-load cost. A live benchmark requires the hardened version to be published and measured from the production domain.

## Deliberate boundaries

No paid monitoring service, external error tracking account, custom SMTP provider, or new secret was activated. Adding one without a selected provider and credentials would be unsafe and could create unexpected cost. The existing liveness and readiness endpoints are suitable for a free uptime monitor if the owner later selects one. The daily recovery schedule is already present, but a full restoration drill should be run against a staging target before relying on it for disaster recovery.

The unused Drizzle migration CLI and its obsolete configuration were removed from this project. The existing Supabase schema remains the independent backend source of truth; future schema changes should be reviewed as explicit, non-destructive SQL migrations through the project database workflow rather than a local CLI shortcut.

Publishing remains a user action in the Management UI. Do not describe this checkpoint as live until the user publishes it and the production endpoints are checked afterward.
