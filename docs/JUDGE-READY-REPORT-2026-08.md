# Mantis Portfolio: Judge-Ready Engineering Report

## Executive result

The Mantis portfolio is in a **judge-ready state for the current sandbox-verified scope**. The site preserves the Kinetic Bushido direction: cinematic chapter composition, Mantis Red telemetry cues, editorial project presentation, responsive art direction, deliberate motion, loading recovery, and an offline-capable shell. The final pass prioritized security and regression resistance over adding risky last-minute effects.

No production data, credentials, external infrastructure, or live customer traffic were modified or attacked during this review. Publishing remains a deliberate user action in the project interface.

## Final verification matrix

| Area | Evidence | Result |
|---|---|---|
| Unit and integration regression | Vitest across 20 files | **71 passed** |
| Type safety | `pnpm run check` | **Passed** |
| Dead-code prevention | Unused-export CI gate | **Passed** |
| Offline policy | Service-worker policy checker and `/sw.js` probe | **Passed** |
| Production packaging | Vite production build and Vercel packaging build | **Passed** |
| Dependency risk | Production audit at high severity | **No known vulnerabilities** |
| Repository secret scan | Tracked-file scanner | **Passed** |
| Formatting and diff hygiene | Prettier check and `git diff --check` | **Passed** |
| API boundaries | Health, readiness, auth, public feed, unknown API, and malformed storage probes | **Passed** |
| Security headers | HSTS, CSP, X-Frame-Options, X-Content-Type-Options | **Present** |
| Responsive review | 320px, 390px, 768px, 1024px, and 1440px | **Reviewed; verified Studio tablet correction** |
| Local resilience smoke | 1,800 requests across six routes with 100 concurrent workers | **1,800/1,800 successful** |

## Security findings and remediations

The final audit found and corrected one development-privacy issue: the development debug collector could record same-origin API response bodies in local diagnostic logs. This could expose account-shaped response data in a developer artifact even though the behavior was not part of the production bundle. Fetch and XHR interception now preserve status, headers, timing, and failure metadata while replacing same-origin API response bodies with an explicit non-capture marker. A CI gate protects both interception paths.

The existing hardening remains active. Storage-provider keys reject control characters, repeated decoding, traversal segments, and invalid boundaries before presigning. Unknown `/api` paths return machine-readable 404 responses instead of falling through to the SPA document. Production error responses are redacted. CORS is restricted to an allowlist, security headers are applied at the application boundary, and the service worker bypasses API, authentication, non-GET, and storage-proxy requests.

Historical local logs may still contain entries captured before the collector fix. They are disposable development artifacts and are not shipped as application assets. They should be deleted before sharing a workspace archive.

## Resilience evidence and honest limit

The bounded local smoke test exercised six representative routes at 100 concurrent workers, 300 requests per route. It completed all 1,800 requests successfully at approximately **443 requests per second**, with **131.9 ms p50**, **508.7 ms p95**, and **2.42 s maximum** in the final run. Security headers remained present during the burst, and no failures were reported.

This is evidence that the current code path is stable under a bounded local burst; it is **not proof of 50,000 simultaneous production users**. That claim requires a provider-approved staged test against the deployed environment, with realistic CDN, database, authentication, storage, rate-limit, and observability settings. The application has been prepared for that next test through request coalescing, bounded upstream deadlines, cached readiness, static caching, and explicit provider limits.

## What is intentionally not claimed

The review does not claim that a sandbox can verify physical iPhone or Android rendering, real offline transitions after publication, external provider uptime, email delivery, CDN cache behavior, or live 50,000-user capacity. Those are post-publish checks. It also does not claim that adding more WebGL, fluid simulation, or GSAP timelines would automatically improve the experience; on low-power phones, uncontrolled effects could reduce the quality that the current design already achieves.

## High-impact improvements worth doing after the deadline

| Priority | Improvement | Why it is worth doing | Guardrail |
|---|---|---|---|
| 1 | Add a single, art-directed WebGL ink or telemetry field behind the hero only | Creates a memorable signature moment without turning every section into a GPU demo | Disable on reduced motion, low-power, data-saver, and coarse-pointer devices; cap DPR and use a static poster fallback |
| 2 | Add a chapter progress rail with meaningful story labels | Makes the long-form narrative feel authored and gives judges a clear sense of progression | Keep it semantic, keyboard reachable, and hidden when it competes with mobile content |
| 3 | Add a precomputed project-image art-direction set | Improves perceived quality more reliably than heavier effects, especially on phones | Use responsive `picture` sources, fixed aspect-ratio boxes, and CDN-hosted derivatives |

The safest recommendation for the judge window is **not to implement these experimental additions now**. The current site has already passed the meaningful regression and security gates; introducing a new rendering engine or a third-party animation dependency immediately before judging would create more failure surface than value. If one visual addition is required, choose the constrained hero-only field with a static fallback and a hard frame-budget cap.

## Judge-day checklist

Open the published site in a clean browser and verify the hero media, one project dossier, the mobile menu, privacy choice, `/studio` access gate, and the closing media on both Wi-Fi and a throttled mobile profile. Test one hard refresh after the service worker has registered, then test a previously visited page while offline. Confirm the published domain has HTTPS, the expected security headers, and no stale pre-fix debug artifact is being shared. Keep the Studio credentials private and do not expose the management route during the presentation unless it is part of the intended demonstration.

> **Bottom line:** the implementation is ready to show. The evidence supports strong code-level security, responsive behavior, offline shell support, and bounded burst resilience. It does not replace a staged production load test or physical-device sign-off.
