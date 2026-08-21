import { describe, expect, it } from "vitest";
import { mapSupabaseIdentity } from "./independentAuth";

describe("independent Supabase identity mapping", () => {
  it("preserves the provider subject in the existing openId contract", () => {
    const result = mapSupabaseIdentity({
      id: "aa2f9329-c2a4-44be-8e79-71f12dd4ce01",
      email: "builder@example.com",
      user_metadata: { full_name: "Builder" },
      app_metadata: { provider: "email" },
    });

    expect(result).toMatchObject({
      openId: "supabase:aa2f9329-c2a4-44be-8e79-71f12dd4ce01",
      email: "builder@example.com",
      name: "Builder",
      loginMethod: "email",
    });
  });

  it("rejects identities that cannot safely be bound to an owner role", () => {
    expect(() => mapSupabaseIdentity({ id: "subject-only" })).toThrow("missing an id or email");
  });
});
