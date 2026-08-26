import { describe, expect, it } from "vitest";
import {
  buildRecoveryPayload,
  isAuthorizedVercelCron,
  scheduledRecoveryError,
} from "./recoverySnapshot";
import { ForbiddenError, UnauthorizedError } from "../shared/_core/errors";

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

  it("maps authentication failures to safe scheduled-route responses", () => {
    expect(scheduledRecoveryError(ForbiddenError("Invalid session cookie"))).toEqual({
      statusCode: 403,
      body: { error: "cron-only" },
    });
    expect(scheduledRecoveryError(UnauthorizedError("missing token"))).toEqual({
      statusCode: 401,
      body: { error: "unauthorized" },
    });
    expect(scheduledRecoveryError(new Error("provider internals"))).toEqual({
      statusCode: 500,
      body: { error: "recovery snapshot failed" },
    });
  });
});
