# Independent Backend Readiness

## Decision

The independent path will use **Supabase Free** as the initial provider for Postgres, email authentication, and optional public or private storage, while Vercel continues to host the frontend and Express function. This replaces the runtime dependency on Manus OAuth and the managed MySQL connection for the Vercel deployment. The current tRPC authorization model can remain unchanged because it already protects `/studio` through the application user role rather than through provider-specific route logic.

> This is a **no-cost starter architecture**, not a promise that a free tier can deliver 50,000-user production reliability. Supabase’s published Free Plan includes 500 MB database capacity, 1 GB storage, 5 GB egress, and 50,000 monthly active users, but free projects pause after one week of inactivity and do not include automatic backups or an uptime SLA. [1]

| Concern | Current dependency | Independent Vercel path | Free-tier boundary |
|---|---|---|---|
| Database | Manus-injected MySQL or TiDB `DATABASE_URL` | Supabase PostgREST through the project URL and server-only secret key | 500 MB database capacity; use a managed production plan before sustained high load. [1] |
| Authentication | Manus OAuth portal, exchange service, and session lookup | Supabase email Magic Link with bearer-token verification at the Express boundary | Email links are one-time use and default-enabled; allowed redirect URLs must be configured. [2] [3] |
| Owner access | `OWNER_OPEN_ID` | `OWNER_EMAIL` comparison after verified Supabase identity | Only the configured owner email is assigned the `admin` role. |
| Project records | Drizzle MySQL tables | Supabase Postgres tables with an explicit SQL migration | No live data migration will run until the user creates and reviews a Supabase project. |
| Recovery data | Existing S3-compatible private snapshot adapter | The same private object-storage adapter, configured separately | A free provider must be selected and credentials supplied by the owner. |

## Migration Boundary

The application adds a provider-aware backend boundary rather than deleting the working Manus development path. When `DATABASE_PROVIDER=supabase`, project and user operations call Supabase PostgREST with the server-only `SUPABASE_SECRET_KEY`; the authentication context verifies a Supabase bearer token. Without that setting, the existing Manus OAuth and MySQL paths continue to work for local development and the managed project preview.

The independent Supabase identity is stored as `supabase:<uuid>` in the existing `openId` field. This avoids a destructive identity-column migration while allowing the role and project APIs to retain their existing contracts. The owner is assigned admin access only when the verified Supabase email matches the server-only `OWNER_EMAIL` variable.

## Required Owner-Operated Setup

The user must create the Supabase project in the Free tier, then provide its values through secure Vercel environment settings. Server secrets must never be placed in source code or a public `VITE_` variable. The current code does not use `POSTGRES_URL`; if the Vercel integration adds one automatically, it may remain unused but is not required for this application path. Vercel’s Supabase integration already supplies the server-side `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` values, plus public names under the `SUPABASE_VITE_` namespace.

| Setting | Scope | Purpose |
|---|---|---|
| `AUTH_PROVIDER=supabase` | Server | Activates Supabase bearer-token verification in the tRPC request context. |
| `DATABASE_PROVIDER=supabase` | Server | Activates the Supabase database adapter. |
| `OWNER_EMAIL=mantisdarling@proton.me` | Server | Exact verified email granted the `admin` role for `/studio`. |
| `SUPABASE_URL` | Server | Supabase project URL used by the database and token-verification requests. |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Publishable key for server-side token-verification requests. |
| `SUPABASE_SECRET_KEY` | Server only | Secret key used only by the server-side Supabase database adapter. |
| `VITE_AUTH_PROVIDER=supabase` | Client build | Enables the Magic Link user interface and bearer-token forwarding. |
| `SUPABASE_VITE_SUPABASE_URL` | Client build | Supplied by the Vercel integration and exposed through the controlled `SUPABASE_VITE_` Vite prefix for Magic Link requests. |
| `SUPABASE_VITE_SUPABASE_PUBLISHABLE_KEY` | Client build | Supplied by the Vercel integration and exposed through the controlled `SUPABASE_VITE_` Vite prefix for Magic Link requests. |
| Supabase Site URL | Supabase dashboard | `https://mhini.vercel.app`. |
| Supabase Redirect URLs | Supabase dashboard | `https://mhini.vercel.app/**` and `http://localhost:3000/**`. [3] |

The initial Studio flow should use a Magic Link to the owner email. Supabase documents Magic Links as one-time email login links and requires the target URL to be included in its redirect allow list. [2] [3]

## Implementation and Activation Sequence

First, the repository gains provider-aware configuration, the Supabase PostgREST adapter, the authenticated tRPC bearer context, and a non-destructive Postgres schema migration. Second, the Supabase Free project is created and the reviewed SQL migration is applied. Third, the Supabase Site URL and redirect allow list are configured. Fourth, the required Vercel variables are added for Production, Preview, and Development, and the project is redeployed. Only after that should the owner sign in, create a first managed project, and verify the `/studio` CRUD and public dossier flows.

## Vercel Activation Checklist

| Step | Required result | Evidence to record |
|---|---|---|
| Create integration | A Supabase project on the Free plan is linked to `mhini`; no paid compute option is selected. | Vercel integration page and Supabase project name. |
| Run migration | `users`, `projects`, and `recovery_snapshots` tables exist in the `public` schema with RLS enabled. | Successful SQL editor result and table list. |
| Configure Auth | Site URL is `https://mhini.vercel.app`; redirect URLs include `https://mhini.vercel.app/**` and `http://localhost:3000/**`. | Supabase Authentication URL Configuration screen. |
| Configure Vercel | The integration-provided Supabase variables plus `AUTH_PROVIDER`, `DATABASE_PROVIDER`, `OWNER_EMAIL`, and `VITE_AUTH_PROVIDER` are set with server secrets kept server-only. | Vercel environment variable names and target environments. |
| Redeploy | A fresh production deployment is built after the variables are saved. | Vercel deployment ID and status. |
| Verify health | `https://mhini.vercel.app/healthz` returns HTTP 200; `readyz` returns HTTP 200 once Supabase is reachable. | Browser or request result. |
| Verify studio gate | `/studio` displays the Magic Link form; submitting the owner email sends a link and the returning session is assigned `admin`. | Owner sign-in result. |

On 21 August 2026, the Vercel Supabase integration provisioned the `mhini-supabase` Free resource in Washington and connected it to Production and Preview for `mhini`. The reviewed migration was applied successfully and verified the `users`, `projects`, and `recovery_snapshots` tables. Supabase Authentication now uses `https://mhini.vercel.app` as the Site URL with production and local redirect allow-list entries. Vercel now has the required provider selectors and owner-email setting. The repository-side namespace bridge, 12 Vitest tests, TypeScript check, and Vercel frontend build have passed. A fresh production deployment and owner Magic Link sign-in remain to be verified.

For the 50,000-user objective, Supabase Free should be treated strictly as an early validation environment. It pauses after inactivity and lacks automatic backups, so a production-scale upgrade requires measured load tests, managed database backups, a pooled connection configuration, observability, and an approved paid or self-hosted capacity plan. [1]

## References

[1] [Supabase Pricing](https://supabase.com/pricing)

[2] [Supabase Passwordless Email Authentication](https://supabase.com/docs/guides/auth/auth-email-passwordless)

[3] [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

[4] [Vercel Supabase Integration](https://vercel.com/marketplace/supabase)
