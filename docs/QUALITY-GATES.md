# Quality gates

The repository uses the same deterministic checks locally and in GitHub Actions. Run `pnpm install --frozen-lockfile`, then `pnpm run check:unused-exports`, `pnpm run check`, `pnpm test`, `pnpm build`, and `pnpm run security:secrets` before opening a production change.

`check:unused-exports` runs `ts-prune` through `scripts/check-unused-exports.mjs`. It fails only on true unused exports. Framework internals under `server/_core`, generated UI primitives under `client/src/components/ui`, test files, the shared type barrel, and the required Vercel function default export are explicitly excluded because they are framework or contract surfaces rather than application dead code. The exclusions are narrow and visible in the script so new exceptions cannot be hidden by a broad allowlist.

The active portfolio page is composed from `client/src/pages/Home.tsx`, shared portfolio definitions in `client/src/components/portfolio/model.ts`, and reusable media, card, sharing, and dossier behavior in `client/src/components/portfolio/PortfolioPrimitives.tsx`. Keep new behavior in the smallest relevant module and preserve the existing mobile art direction, reduced-motion rules, safe external-link validation, and accessible keyboard interactions.

The workflow runs on every push and pull request with read-only repository permissions, a pinned pnpm version, Node 22, frozen-lockfile installation, and a ten-minute job timeout. Build-generated Vercel entrypoints remain tracked because they are deployment artifacts and are not treated as unused source modules.
