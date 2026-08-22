# Security references used

The hardening pass was adapted from these current sources:

- Vercel security headers: https://vercel.com/docs/cdn-security/security-headers
- Vercel CORS guidance: https://vercel.com/kb/guide/how-to-enable-cors
- OWASP HTTP Headers Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html

Key decisions grounded in those sources:

- Use CSP as a layered defense and avoid broad script sources where practical.
- Use `frame-ancestors 'none'` and `X-Frame-Options: DENY` for clickjacking protection.
- Use `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive Permissions Policy.
- Apply HSTS only for the HTTPS production deployment and use a meaningful max age before considering preload.
- Do not use credentialed wildcard CORS. Allow only known production and local development origins, and reject untrusted preflight requests.
- Use immutable caching for hashed static assets.

These references support the implemented header and CORS configuration but do not replace a live external penetration test or production Core Web Vitals measurement.
