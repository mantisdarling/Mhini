import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { getDb } from "../db";
import { runScheduledRecoverySnapshot } from "../recoverySnapshot";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { scalePolicy } from "../../shared/scalePolicy";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
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
      const db = await getDb();
      if (!db) throw new Error("database unavailable");
      await db.execute(sql`SELECT 1`);
      res.status(200).json({ ok: true });
    } catch {
      res.status(503).json({ ok: false, reason: "database unavailable" });
    }
  });
  app.post("/api/scheduled/recoverySnapshot", runScheduledRecoverySnapshot);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  const stop = (signal: string) => {
    if (!acceptingTraffic) return;
    acceptingTraffic = false;
    console.log(`Received ${signal}; draining active requests.`);
    server.close(error => {
      if (error) {
        console.error("Graceful shutdown failed", error);
        process.exit(1);
      }
      process.exit(0);
    });
    const forceExit = setTimeout(() => process.exit(1), 25000);
    forceExit.unref();
  };
  process.once("SIGTERM", () => stop("SIGTERM"));
  process.once("SIGINT", () => stop("SIGINT"));
}

startServer().catch(console.error);
