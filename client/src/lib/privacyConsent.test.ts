import { describe, expect, it } from "vitest";
import {
  analyticsScriptDetails,
  privacyConsentKey,
  savePrivacyChoice,
  shouldLoadAnalytics,
} from "./privacyConsent";

describe("privacy consent", () => {
  it("does not load analytics before a choice", () => {
    expect(shouldLoadAnalytics(null)).toBe(false);
    expect(shouldLoadAnalytics("declined")).toBe(false);
  });

  it("loads analytics only after acceptance", () => {
    expect(shouldLoadAnalytics("accepted")).toBe(true);
    expect(analyticsScriptDetails("https://manus-analytics.com/", "site-123")).toEqual({
      src: "https://manus-analytics.com/umami",
      websiteId: "site-123",
    });
  });

  it("persists an explicit choice under the consent key", () => {
    const values = new Map<string, string>();
    const storage = { setItem: (key: string, value: string) => values.set(key, value) };
    savePrivacyChoice(storage, "declined");
    expect(values.get(privacyConsentKey)).toBe("declined");
    savePrivacyChoice(storage, "accepted");
    expect(values.get(privacyConsentKey)).toBe("accepted");
  });
});
