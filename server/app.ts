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
  app.use(express.json({ limit: scalePolicy.jsonPayloadLimit }));
  app.use(express.urlencoded({ limit: scalePolicy.jsonPayloadLimit, extended: true }));
  app.get("/healthz", (_req, res) => {
    res.status(acceptingTraffic ? 200 : 503).json({ ok: acceptingTraffic });
  });
  app.get("/readyz", async (_req, res) => {
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
