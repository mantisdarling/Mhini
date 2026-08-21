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
    const missingApi = await fetch(`${baseUrl}/api/not-a-route`);

    expect(health.status).toBe(200);
    await expect(health.json()).resolves.toEqual({ ok: true });
    expect(missingApi.status).toBe(404);
  });

  it("rejects an unsigned Vercel cron invocation", async () => {
    const response = await fetch(`${baseUrl}/api/cron/recoverySnapshot`);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
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
