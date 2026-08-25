import { describe, expect, it } from "vitest";
import {
  getMagicLinkFailureMessage,
  IndependentAuthError,
} from "./independentAuth";

describe("Magic Link failure messaging", () => {
  it.each([
    ["invalid-email", "Check the email address"],
    ["rate-limit", "Please wait before trying again"],
    ["timeout", "The request took too long"],
    ["unavailable", "Sign-in link unavailable"],
  ] as const)("maps %s to calm actionable copy", (code, title) => {
    const message = getMagicLinkFailureMessage(new IndependentAuthError(code));
    expect(message.title).toBe(title);
    expect(message.body).not.toContain("provider");
    expect(message.body).not.toContain("credential");
  });

  it("uses a generic safe fallback for unknown failures", () => {
    const message = getMagicLinkFailureMessage(
      new Error("private provider response: credential detail")
    );
    expect(message.title).toBe("Sign-in link unavailable");
    expect(message.body).toBe(
      "We could not send the link right now. Please try again in a moment."
    );
    expect(message.body).not.toContain("credential");
  });
});
