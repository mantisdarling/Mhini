// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import PrivacyConsent, { injectAnalyticsScript } from "./PrivacyConsent";
import Privacy from "@/pages/Privacy";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  window.localStorage.clear();
  document.head.querySelectorAll("script[data-mantis-analytics]").forEach(script => script.remove());
  root = undefined;
  container?.remove();
  container = undefined;
});

function renderConsent() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<PrivacyConsent />));
}

describe("PrivacyConsent", () => {
  it("shows a choice and has no analytics script by default", () => {
    renderConsent();
    expect(container?.textContent).toContain("PRIVACY SIGNAL");
    expect(document.head.querySelector("script[data-mantis-analytics]")).toBeNull();
  });

  it("keeps analytics absent after decline", () => {
    renderConsent();
    act(() => (container?.querySelector("button:last-child") as HTMLButtonElement)?.click());
    expect(window.localStorage.getItem("mantis-analytics-consent")).toBe("declined");
    expect(document.head.querySelector("script[data-mantis-analytics]")).toBeNull();
  });

  it("renders the privacy policy alongside the visible consent choice", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root?.render(<><Privacy /><PrivacyConsent /></>));
    expect(container?.textContent).toContain("Privacy, by design.");
    expect(container?.textContent).toContain("PRIVACY SIGNAL");
    expect(document.head.querySelector("script[data-mantis-analytics]")).toBeNull();
  });

  it("injects exactly one analytics script after explicit acceptance", () => {
    expect(injectAnalyticsScript("https://manus-analytics.com/", "site-123")).toBe(true);
    expect(injectAnalyticsScript("https://manus-analytics.com/", "site-123")).toBe(false);
    const scripts = document.head.querySelectorAll("script[data-mantis-analytics]");
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute("src")).toBe("https://manus-analytics.com/umami");
    expect(scripts[0]?.getAttribute("data-website-id")).toBe("site-123");
  });
});
