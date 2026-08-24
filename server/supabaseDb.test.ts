import { describe, expect, it } from "vitest";
import { resolveSupabaseUserRole } from "./supabaseDb";

describe("Supabase user role resolution", () => {
  it("promotes the configured owner when no role is supplied", () => {
    expect(resolveSupabaseUserRole({ openId: "owner-123", role: undefined }, "owner-123")).toBe("admin");
  });

  it("keeps ordinary users as users", () => {
    expect(resolveSupabaseUserRole({ openId: "visitor-456", role: undefined }, "owner-123")).toBe("user");
  });

  it("preserves an explicit role", () => {
    expect(resolveSupabaseUserRole({ openId: "owner-123", role: "user" }, "owner-123")).toBe("user");
    expect(resolveSupabaseUserRole({ openId: "visitor-456", role: "admin" }, "owner-123")).toBe("admin");
  });
});
