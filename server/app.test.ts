import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { createApplication } from "./app";
import { createVercelRecoverySnapshotHandler } from "./recoverySnapshot";

describe("Vercel Express application", () => {
  let baseUrl = "";
  let server: Server;

  beforeAll(async () => {
    const { app } = createApplication();
    server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("test server address unavailable");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  });

  it("exposes health while retaining a non-SPA API boundary", async () => {
    const health = await fetch(`${baseUrl}/healthz`);
    const vercelHealth = await fetch(`${baseUrl}/api/healthz`);
    const trpcAuth = await fetch(`${baseUrl}/api/trpc/auth.me?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`);
    const missingApi = await fetch(`${baseUrl}/api/not-a-route`);

    expect(health.status).toBe(200);
    await expect(health.json()).resolves.toEqual({ ok: true });
    expect(vercelHealth.status).toBe(200);
    await expect(vercelHealth.json()).resolves.toEqual({ ok: true });
    expect(trpcAuth.status).not.toBe(404);
    expect(missingApi.status).toBe(404);
  });

  it("sets browser security headers and rejects untrusted preflight origins", async () => {
    const response = await fetch(`${baseUrl}/healthz`, { headers: { Origin: "https://mhini.vercel.app" } });
    expect(response.headers.get("strict-transport-security")).toContain("max-age=31536000");
    expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("access-control-allow-origin")).toBe("https://mhini.vercel.app");

    const blocked = await fetch(`${baseUrl}/healthz`, {
      method: "OPTIONS",
      headers: { Origin: "https://attacker.example", "Access-Control-Request-Method": "POST" },
    });
    expect(blocked.status).toBe(403);
  });

  it("rejects an unsigned Vercel cron invocation", async () => {
    const response = await fetch(`${baseUrl}/api/cron/recoverySnapshot`);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
  });

  it("redacts internal errors from an authorized Vercel cron response", async () => {
    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-cron-secret";
    const { app } = createApplication({
      vercelRecoveryHandler: createVercelRecoverySnapshotHandler(async () => {
        throw new Error("private storage credential detail");
      }),
    });
    const errorServer = createServer(app);
    await new Promise<void>(resolve => errorServer.listen(0, "127.0.0.1", resolve));
    const address = errorServer.address();
    if (!address || typeof address === "string") throw new Error("error server address unavailable");

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/cron/recoverySnapshot`, {
        headers: { Authorization: "Bearer test-cron-secret" },
      });
      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: "recovery snapshot failed" });
    } finally {
      await new Promise<void>((resolve, reject) => errorServer.close(error => error ? reject(error) : resolve()));
      if (originalSecret === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = originalSecret;
    }
  });

  it("executes an authorized Vercel cron invocation through the injected snapshot handler", async () => {
    const originalSecret = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-cron-secret";
    const fakeSnapshot = {
      checksum: "test-checksum",
      createdAt: "2026-08-21T00:00:00.000Z",
      id: 99,
      recordCount: 0,
      storageKey: "recovery-snapshots/test.json",
    };
    const { app } = createApplication({
      vercelRecoveryHandler: createVercelRecoverySnapshotHandler(async () => fakeSnapshot),
    });
    const cronServer = createServer(app);
    await new Promise<void>(resolve => cronServer.listen(0, "127.0.0.1", resolve));
    const address = cronServer.address();
    if (!address || typeof address === "string") throw new Error("cron test server address unavailable");

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/cron/recoverySnapshot`, {
        headers: { Authorization: "Bearer test-cron-secret" },
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ ok: true, snapshot: fakeSnapshot });
    } finally {
      await new Promise<void>((resolve, reject) => cronServer.close(error => error ? reject(error) : resolve()));
      if (originalSecret === undefined) delete process.env.CRON_SECRET;
      else process.env.CRON_SECRET = originalSecret;
    }
  });
});
