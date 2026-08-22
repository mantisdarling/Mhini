import { describe, expect, it } from "vitest";
import { responseJson } from "./supabaseDb";
import { parseDebugPayload } from "../vite.config";

describe("security boundaries", () => {
  it("redacts provider response bodies from database errors", async () => {
    const response = new Response("private database credential detail", { status: 500 });
    await expect(responseJson(response)).rejects.toThrow("Supabase database request failed.");
    await expect(responseJson(new Response("private database credential detail", { status: 500 }))).rejects.not.toThrow(
      "private database credential detail",
    );
  });

  it("rejects malformed debug payloads and normalizes missing arrays", () => {
    expect(() => parseDebugPayload(null)).toThrow("invalid debug payload");
    expect(parseDebugPayload({ consoleLogs: [{ message: "ok" }] })).toEqual({
      consoleLogs: [{ message: "ok" }],
      networkRequests: [],
      sessionEvents: [],
    });
  });
});
