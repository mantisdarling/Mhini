import { describe, expect, it } from "vitest";
import { buildRecoveryPayload, isAuthorizedVercelCron } from "./recoverySnapshot";

describe("recovery snapshot format", () => {
  it("captures the core tables in a versioned recovery envelope", () => {
    const payload = buildRecoveryPayload([{ id: 2 }], "2026-08-21T00:00:00.000Z");
    expect(payload).toEqual({
      formatVersion: 1,
      createdAt: "2026-08-21T00:00:00.000Z",
      tables: { projects: [{ id: 2 }] },
    });
  });

  it("requires a matching bearer secret for Vercel cron execution", () => {
    expect(isAuthorizedVercelCron("Bearer trusted", "trusted")).toBe(true);
    expect(isAuthorizedVercelCron("Bearer wrong", "trusted")).toBe(false);
    expect(isAuthorizedVercelCron(undefined, "trusted")).toBe(false);
  });
});
