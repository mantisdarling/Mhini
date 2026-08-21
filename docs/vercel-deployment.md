# Production Deployment on Vercel

## Deployment Position

This repository is now prepared for a **Vercel Vite frontend plus Express Function** deployment. The visual portfolio is emitted to `dist/public`; API, OAuth callback, tRPC procedures, health checks, and scheduled recovery work are served through `api/[...route].ts`. The Vercel entry point exports the Express application directly, so it does not bind a port or depend on a long-lived process.

> **Important:** This is a deployment-ready application revision, not a claim that any platform can guarantee zero downtime or zero data loss. Reliability at 50,000 users depends on the external database, private object storage, CDN/WAF, rate limiting, region selection, and load-test evidence described below.

## Target Architecture

| Concern | Vercel-ready implementation | Production requirement |
|---|---|---|
| Web experience | Vite static build served from `dist/public` with SPA deep-link rewrites. | Enable Vercel CDN and protect the public hostname with the Vercel Firewall or a compatible WAF. |
| Application API | One Express Vercel Function at `/api/[...route]`, including tRPC, OAuth callback, health, readiness, and cron routes. | Keep the function in the same region as the database and configure function observability and alerts. |
| Database | Existing Drizzle and MySQL-compatible schema. | Use a managed MySQL or TiDB service with TLS, point-in-time recovery, automated backups, and a serverless-safe connection strategy. |
| Authentication | Existing Manus OAuth path remains supported at `/api/oauth/callback`. | Add every Vercel production and preview callback URL permitted by the OAuth provider, or migrate to an independent OAuth provider before disconnecting Manus services. |
| Asset delivery | `VITE_HERO_ASSET_URL` and `VITE_MARK_ASSET_URL` override the development-only Manus asset routes. | Host these two public assets on a cacheable CDN-backed URL. Do not expose private recovery objects. |
| Recovery snapshots | Daily authenticated Vercel Cron calls `/api/cron/recoverySnapshot`; snapshots are stored privately through S3-compatible credentials and indexed in the database. | Set a strong `CRON_SECRET`, verify every scheduled run, retain managed database backups, and perform restore drills. |

## Repository Configuration

The repository root now contains `vercel.json`. It defines the `pnpm vercel:build` command, serves `dist/public`, applies an SPA rewrite that excludes `/api`, and schedules the daily recovery snapshot at `03:00 UTC`. Vercel invokes cron paths with HTTP `GET`; the handler compares `Authorization: Bearer <CRON_SECRET>` before it creates a snapshot. Vercel automatically supplies this header when `CRON_SECRET` is configured. [1]

The production build command is:

```bash
pnpm vercel:build
```

The standard repository build remains available for the existing local and Manus runtime:

```bash
pnpm build
```

## Required Vercel Environment Variables

Set the following variables in **Production**, **Preview**, and **Development** as appropriate. Never commit values to GitHub or place secret values in `VITE_` variables.

| Variable | Scope | Purpose |
|---|---|---|
| `DATABASE_URL` | Server only | TLS-enabled MySQL or TiDB connection string, located near the Vercel function region. |
| `JWT_SECRET` | Server only | High-entropy session-signing secret; use a new production value. |
| `OAUTH_SERVER_URL` | Server only | Current Manus OAuth service base URL when preserving the existing sign-in system. |
| `VITE_OAUTH_PORTAL_URL` | Client public | Current Manus OAuth portal base URL. |
| `VITE_APP_ID` | Client public | OAuth application identifier for the existing sign-in flow. |
| `OWNER_OPEN_ID` | Server only | Owner identity allowed to use `/studio` administrative controls. |
| `OWNER_NAME` | Server only | Owner display value used by the current application. |
| `S3_BUCKET` | Server only | Private bucket for recovery snapshots and future managed uploads. |
| `S3_ACCESS_KEY_ID` | Server only | Least-privilege S3-compatible credential. |
| `S3_SECRET_ACCESS_KEY` | Server only | Matching least-privilege storage credential. |
| `S3_REGION` | Server only | Bucket region; use `auto` only for providers that require it. |
| `S3_ENDPOINT` | Server only, optional | Endpoint for an S3-compatible provider such as R2 or a private object store. |
| `S3_FORCE_PATH_STYLE` | Server only, optional | Set `true` only when the selected provider requires path-style S3 requests. |
| `CRON_SECRET` | Server only | A random value of at least 16 characters used to authenticate Vercel Cron. [1] |
| `VITE_HERO_ASSET_URL` | Client public | Full CDN URL for the hero image. |
| `VITE_MARK_ASSET_URL` | Client public | Full CDN URL for the Mantis blade mark. |

For an independent Vercel deployment, do **not** set `BUILT_IN_FORGE_API_URL` or `BUILT_IN_FORGE_API_KEY`; they are only retained as a fallback for the current Manus development environment. The S3 variables above activate the portable storage path automatically.

## Deployment Procedure

First, import [`mantisdarling/Mhini`](https://github.com/mantisdarling/Mhini) into Vercel. Select **Vite** if Vercel asks for a framework, retain the repository root as the root directory, and allow `vercel.json` to supply the build configuration. Add the environment variables before the first production deployment.

Next, upload the hero image and blade mark to a public CDN-backed asset location, then set the two `VITE_*_ASSET_URL` values. Add `https://<your-vercel-domain>/api/oauth/callback` and the eventual custom-domain callback URL to the OAuth application's allowed redirect URIs. The callback must exactly match the deployed origin because the current OAuth state binds the login attempt to that URL.

After deployment, open `/healthz` and `/readyz`; both must return `200`. Visit `/studio` after authenticating as the owner. Confirm that a production project change creates a Vercel deployment and that an API mutation completes against the production database. Finally, inspect the Vercel Cron page after the first scheduled invocation and verify a new `recovery_snapshots` record with a matching object in the private bucket.

## 50,000-User Launch Gates

Before advertising a 50,000-user capacity target, use a staging Vercel project connected to staging database and storage resources. Run load tests against public pages and high-value API calls, measure database connection usage, p95 and p99 latency, function errors, and cache-hit behavior, then set capacity from those measurements. The static site can benefit from CDN caching, but the `/studio` controls, tRPC procedures, and snapshot path must be tested separately.

Configure alerts for availability, function errors, timeout rate, database connection saturation, database replication or backup failures, object-storage failures, and failed cron runs. Vercel Cron delivery can be missed or duplicated; this implementation treats each snapshot as an immutable, independently checksummed object, while the operating process must monitor missed runs and periodically test restores. [1]

## Validation Record

The Vercel frontend build, the standard full-stack build, TypeScript check, and nine automated tests have passed locally. The automated tests start the same reusable Express application exported by `api/[...route].ts`; they confirm `GET /healthz`, the non-SPA `/api` boundary, and rejection of an unsigned Vercel Cron request. The existing Manus preview still renders the public portfolio and both health endpoints return `200`.

An actual `vercel build` invocation requires a valid Vercel account token or a linked Vercel project. This sandbox does not have a valid Vercel credential, so the final packaging and production-preview validation must run after the repository is imported into the user's Vercel account. This is an external-account requirement, not an application build failure.

## Rollback and Recovery

Use Vercel's deployment history to roll back frontend and function code. Do not use a code rollback as a database rollback. Database migrations must remain non-destructive and require an approved restoration procedure. The recovery snapshot is an additional application-level control for managed project configuration; it does not replace managed database point-in-time recovery for user accounts or operational data.

## References

[1] [Vercel, Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)

[2] [Vercel, Express on Vercel](https://vercel.com/docs/frameworks/backend/express)

[3] [Vercel, Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)

[4] [Vercel, Functions](https://vercel.com/docs/functions)
