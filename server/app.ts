import express, { type RequestHandler } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { isDatabaseReady } from "./db";
import { runScheduledRecoverySnapshot, runVercelRecoverySnapshot } from "./recoverySnapshot";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { createContext } from "./_core/context";
import { scalePolicy } from "../shared/scalePolicy";

type ApplicationOptions = {
  vercelRecoveryHandler?: RequestHandler;
};

export function createApplication(options: ApplicationOptions = {}) {
  const app = express();
  let acceptingTraffic = true;

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  const allowedOrigins = new Set([
    "https://mhini.vercel.app",
    process.env.PUBLIC_APP_ORIGIN,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter((origin): origin is string => Boolean(origin)));
  const isDevelopment = process.env.NODE_ENV === "development";
  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self'${isDevelopment ? " 'unsafe-inline'" : ""} https://manus-analytics.com`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
    "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://files.manuscdn.com https://manus-analytics.com",
    `connect-src 'self' https://manus-analytics.com https://*.supabase.co${isDevelopment ? " ws://localhost:* ws://127.0.0.1:*" : ""}`,
    "frame-src https://assets.pinterest.com",
    "upgrade-insecure-requests",
  ].join("; ");
  app.use((req, res, next) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Content-Security-Policy", contentSecurityPolicy);
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    // Public hero assets live on a separate CDN origin and must remain readable.
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    const origin = req.headers.origin;
    if (origin && allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.setHeader("Access-Control-Max-Age", "600");
    }
    if (req.method === "OPTIONS") {
      if (!origin || !allowedOrigins.has(origin)) {
        res.status(403).json({ error: "origin not allowed" });
        return;
      }
      res.status(204).end();
      return;
    }
    next();
  });
  app.use(express.json({ limit: scalePolicy.jsonPayloadLimit }));
  app.use(express.urlencoded({ limit: scalePolicy.jsonPayloadLimit, extended: true }));
  app.get(["/healthz", "/api/healthz"], (_req, res) => {
    res.status(acceptingTraffic ? 200 : 503).json({ ok: acceptingTraffic });
  });
  app.get(["/readyz", "/api/readyz"], async (_req, res) => {
    if (!acceptingTraffic) {
      res.status(503).json({ ok: false, reason: "shutting down" });
      return;
    }
    try {
      if (!(await isDatabaseReady())) throw new Error("database unavailable");
      res.status(200).json({ ok: true });
    } catch {
      res.status(503).json({ ok: false, reason: "database unavailable" });
    }
  });
  app.post("/api/scheduled/recoverySnapshot", runScheduledRecoverySnapshot);
  app.get("/api/cron/recoverySnapshot", options.vercelRecoveryHandler ?? runVercelRecoverySnapshot);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );
  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[Application] Unhandled request error", error);
    if (res.headersSent) return next(error);
    res.status(500).json({ error: "internal server error" });
  });

  return {
    app,
    stopAcceptingTraffic: () => {
      acceptingTraffic = false;
    },
  };
}
