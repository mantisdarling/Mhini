# Mantis

> **I go deep, then I build.**

Mantis is a cinematic, image-led portfolio for an AI systems builder at IIT Madras. The experience combines Japanese visual restraint with an instrument-panel language: quiet charcoal surfaces, Mantis Red intent cues, chapter navigation, project dossiers, responsive art direction, and carefully bounded motion.

The site is designed as a public-facing portfolio first. Visitors can explore the record without signing in. An authenticated Studio surface is available for managing portfolio records through the existing Manus OAuth and tRPC application boundary.

[View the repository on GitHub](https://github.com/mantisdarling/Mhini)

## What the site includes

| Area               | Experience                                                                                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero               | Full-bleed visual opening with responsive media, restrained WebGL telemetry ink on capable fine-pointer devices, and a static fallback everywhere else. |
| Chapter navigation | Semantic progress rail with active-location state, keyboard support, direct smooth navigation, and a compact touch-friendly dock.                       |
| Profile            | A clear working record covering the builder’s focus, background, and external professional links.                                                       |
| Work               | Project cards with responsive art direction, mobile derivatives, touch carousel behavior, accessible dossiers, sharing actions, and Copy Link feedback. |
| Stack              | Technology groups presented through compact disclosures with image-led background treatment.                                                            |
| Evidence           | Closed-by-default evidence dossiers that keep the reading path focused.                                                                                 |
| Finale             | A closing visual chapter with a media-first composition and video-safe fallback behavior.                                                               |
| Privacy            | Consent-aware, privacy-focused analytics controls with an explicit decline path.                                                                        |

## Product and engineering principles

Mantis treats a portfolio as a working record rather than a collection of decorative cards. Content remains real HTML, visual media supports the narrative instead of replacing it, and motion is used for orientation and emphasis rather than constant spectacle.

The implementation follows a few non-negotiable rules:

- **Progressive enhancement:** core content, navigation, and project records remain usable without WebGL, high-end graphics hardware, or motion.
- **Responsive art direction:** media sources and layout behavior adapt for phone, tablet, and desktop contexts instead of simply shrinking one composition.
- **Compositor-safe motion:** interaction effects prefer `transform` and `opacity`, use requestAnimationFrame where appropriate, clean up listeners and animation loops, and respect reduced-motion preferences.
- **Accessibility by default:** semantic landmarks, keyboard paths, visible focus states, skip navigation, `aria-current`, live status messaging, and closed-by-default disclosures are part of the feature design.
- **No fabricated social proof:** the repository does not seed or invent customer reviews, ratings, or testimonials.

## Technical stack

| Layer                  | Technology                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| Client                 | React 19, TypeScript, Vite 7, Tailwind CSS 4                                                                  |
| Motion and interaction | Framer Motion, GSAP, Lenis, requestAnimationFrame, bounded WebGL canvas                                       |
| Routing and data       | Wouter, tRPC 11, TanStack Query, SuperJSON                                                                    |
| Server                 | Express 5, Vercel function entrypoint, Manus OAuth boundary                                                   |
| Persistence            | Drizzle ORM with the configured MySQL-compatible database and Supabase-backed public integrations             |
| Validation             | Vitest, jsdom, TypeScript, Prettier, ts-prune, repository policy scripts                                      |
| Delivery               | Vercel configuration with immutable asset caching, security headers, service-worker delivery, and SPA routing |

## Architecture

```text
client/
  index.html                         Browser entry document
  public/                            Small runtime files, including sw.js
  src/
    App.tsx                          Route shell and providers
    main.tsx                         React and tRPC bootstrap
    pages/Home.tsx                   Public cinematic portfolio composition
    components/portfolio/            Portfolio primitives, models, rail, media, and boundaries
    components/ui/                   Reusable accessible interface primitives
    hooks/                           Responsive and motion-aware client hooks
    index.css                        Design system, responsive layout, and motion rules

server/
  app.ts                            Express application and request boundaries
  routers.ts                        tRPC procedure surface
  db.ts                              Database helpers
  storage.ts                         Storage boundary
  _core/                            Auth, runtime, OAuth, storage, and framework plumbing

shared/
  const.ts                           Shared protocol and auth constants
  types.ts                           Shared application types

drizzle/
  schema.ts                          Database schema
  migrations/                        Generated migration history

scripts/
  check-*.mjs                        CI policy and repository quality gates
  capacity-smoke.mjs                 Bounded local resilience smoke test
  build-vercel-function.mjs          Vercel function packaging

docs/
  SECURITY-AUDIT-2026-08.md          Security audit evidence and limitations
  RESPONSIVE-AUDIT.md                Device and layout verification
  CAPACITY-TEST-2026-08.md           Local capacity evidence
  QUALITY-GATES.md                   Quality-gate reference
```

## Security and resilience

The project uses defense-in-depth boundaries rather than relying on a single control. External project URLs are restricted to HTTP(S), storage keys are normalized and checked against multi-encoded traversal, API errors are redacted, and unknown API paths return machine-readable errors instead of silently falling through to the SPA shell.

The development debug collector is also privacy-hardened: same-origin API and authentication response bodies are not recorded in local network logs. The behavior is protected by a dedicated CI policy check.

Production headers are configured in `vercel.json`, including HSTS, Content Security Policy, `X-Frame-Options`, `X-Content-Type-Options`, Referrer Policy, Permissions Policy, Cross-Origin Opener Policy, and Cross-Origin Resource Policy. The policy is intentionally explicit about permitted media, font, analytics, storage, and API origins.

The public project feed uses bounded request deadlines, shared in-flight request coalescing, and cached readiness responses to reduce cold-cache stampedes. These protections improve failure behavior, but they are not a claim that a local smoke test proves 50,000 simultaneous production users. Provider-aware load testing remains the appropriate next step for capacity certification.

## Offline and loading behavior

A production-only service worker provides a versioned shell cache, network-first navigation with an offline fallback, and cache-first handling for same-origin scripts, styles, fonts, and images. API, authentication, non-GET, and storage-proxy requests are deliberately excluded from unsafe caching. The service worker is served with a no-cache policy so lifecycle updates are not trapped behind a stale browser cache.

Loading skeletons reserve geometry for fetched data, while media shells fade into their selected sources after load. Component-level error boundaries provide local recovery without replacing the entire page, and reduced-motion fallbacks remove non-essential animation.

## Local development

### Requirements

- Node.js 22 or a compatible modern Node.js runtime
- pnpm
- The project environment variables supplied by the Manus WebDev project or an equivalent local configuration

### Install and run

```bash
pnpm install
pnpm dev
```

The development server runs through the full Express/Vite entrypoint. Do not hardcode a deployment port in application code; the managed runtime supplies the appropriate port.

### Environment configuration

Do not commit `.env` files or credentials. The managed project supplies the following core values when enabled:

| Variable group     | Examples                                                                 | Purpose                                            |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------------------- |
| Database           | `DATABASE_URL`                                                           | MySQL-compatible database connection               |
| Sessions and OAuth | `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Session signing and Manus authentication           |
| Owner context      | `OWNER_OPEN_ID`, `OWNER_NAME`                                            | Owner identity used by protected application flows |
| Built-in services  | `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`                       | Server-side Manus service access                   |
| Browser services   | `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY`             | Approved browser-facing Manus service access       |
| Analytics          | `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`                   | Optional consent-gated analytics configuration     |

Use the project’s managed secret configuration for development and production values. Never place secrets directly in React components, committed configuration, or public assets.

## Quality commands

The repository keeps the primary checks explicit and reproducible:

```bash
# Type checking
pnpm run check

# Full test suite
pnpm test

# Production and Vercel builds
pnpm build
pnpm run vercel:build

# Policy gates
pnpm run check:unused-exports
pnpm run check:service-worker
pnpm run check:debug-privacy
pnpm run security:secrets

# Formatting
pnpm run format
```

The GitHub Actions workflow in `.github/workflows/quality.yml` runs the repository’s quality gates for pushes and pull requests. The configured suite covers client behavior, server boundaries, storage validation, authentication paths, recovery behavior, responsive portfolio regressions, service-worker policy, debug-log privacy, secrets, and unused exports.

## Production delivery

Vercel uses the repository configuration in `vercel.json`:

```text
Build command:    pnpm vercel:build
Output directory: dist/public
Health endpoint:  /healthz
Readiness endpoint:/readyz
```

The build creates the Vite client output and packages the Vercel server function. Static assets receive immutable caching, while `sw.js` is explicitly marked no-cache. The existing deployment should be managed through the configured Vercel project or the Manus project Publish action; do not treat a local preview URL as the production URL.

## Contribution workflow

Keep changes small, evidence-based, and scoped to the feature being improved. Before opening a pull request, run the type check, test suite, build, security checks, formatting check, and `git diff --check`. Review responsive behavior at phone, tablet, and desktop widths, and test reduced-motion behavior for motion-heavy changes.

Commits for this repository are maintained under the project owner’s Git identity:

```text
mantisdarling <mantisdarling@users.noreply.github.com>
```

Do not add generated credentials, private media, local logs, or large untracked assets. Static media belongs in the project’s managed storage workflow rather than in the repository tree.

## Project documentation

The repository contains deeper evidence and implementation notes for reviewers who want the engineering details:

- [`docs/JUDGE-READY-REPORT-2026-08.md`](docs/JUDGE-READY-REPORT-2026-08.md) — concise presentation handoff and verified checks
- [`docs/SECURITY-AUDIT-2026-08.md`](docs/SECURITY-AUDIT-2026-08.md) — security boundaries, findings, remediations, and limitations
- [`docs/RESPONSIVE-AUDIT.md`](docs/RESPONSIVE-AUDIT.md) — device-by-device layout review
- [`docs/CAPACITY-TEST-2026-08.md`](docs/CAPACITY-TEST-2026-08.md) — bounded local resilience evidence
- [`docs/QUALITY-GATES.md`](docs/QUALITY-GATES.md) — automated checks and CI policy

## License and ownership

This repository contains a personal portfolio and its supporting application code. Unless a separate license file states otherwise, reuse of portfolio content, visual media, personal identity, or project case-study material requires permission from the owner.
