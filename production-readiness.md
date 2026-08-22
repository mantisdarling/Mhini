# Production Readiness

## Implemented

The application now emits browser security headers through the Express application and Vercel edge configuration. These include HSTS, CSP, clickjacking protection, MIME sniffing protection, a strict referrer policy, a restrictive Permissions Policy, and cross-origin isolation headers. API CORS is restricted to the production origin, configured public origin, and local development origins. Untrusted preflight requests receive a 403 response.

Internal recovery errors are logged server side and returned to callers as a generic message. No stack trace or storage detail is returned. The existing daily Vercel Cron recovery snapshot remains configured at `/api/cron/recoverySnapshot` and is protected by the cron secret. The snapshot path stores project data in object storage and metadata in the database.

Analytics is now opt in. The analytics script is not loaded until a visitor allows it. A public privacy policy is available at `/privacy`, and the consent choice is stored only in the visitor’s browser.

Vite now emits separate motion, UI, and query chunks. Vercel is configured to cache hashed assets for one year with immutable caching.

## Validation

The current local validation pass completed with 21 passing Vitest tests, a clean TypeScript check, valid Vercel JSON, a successful production build, and desktop and mobile visual checks for `/` and `/privacy`.

The latest local production build emitted these browser assets:

| Asset | Raw size | Gzip estimate |
|---|---:|---:|
| Main application chunk | 783.33 kB | 217.74 kB |
| Motion chunk | 234.51 kB | 80.98 kB |
| Query chunk | 86.24 kB | 24.07 kB |
| UI chunk | 63.92 kB | 18.51 kB |
| CSS | 178.58 kB | 30.77 kB |

These are build measurements, not live Core Web Vitals. A live benchmark requires the hardened version to be published and measured from the production domain.

## Deliberate boundaries

No paid monitoring service, external error tracking account, custom SMTP provider, or new secret was activated. Adding one without a selected provider and credentials would be unsafe and could create unexpected cost. The existing liveness and readiness endpoints are suitable for a free uptime monitor if the owner later selects one. The daily recovery schedule is already present, but a full restoration drill should be run against a staging target before relying on it for disaster recovery.

Publishing remains a user action in the Management UI. Do not describe this checkpoint as live until the user publishes it and the production endpoints are checked afterward.
