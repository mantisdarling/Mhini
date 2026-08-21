# Vercel Deployment Research Notes

## Vite Frontend

Vercel supports Vite deployments and requires an explicit SPA rewrite for deep links in a client-routed application. The production configuration must rewrite unmatched public routes to `index.html` without capturing server API routes.

## Express API

Vercel can deploy an Express application as one Vercel Function that scales with traffic. Its serverless lifecycle means the application must export an Express app rather than bind a port. Static assets should be delivered from the Vercel static output, not through `express.static`. Function error handling must be explicit so failures do not leave a warm instance in an undefined state.

## Sources

- Vercel, [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- Vercel, [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
