// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { MantisLayerProgress } from "./MantisLayerProgress";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => { act(() => root?.unmount()); container?.remove(); root = undefined; container = undefined; });

function renderProgress(fluid: "pending" | "ready" | "fallback", katana: "pending" | "ready" | "fallback") {
  container = document.createElement("div"); document.body.appendChild(container); root = createRoot(container);
  act(() => root?.render(<MantisLayerProgress fluid={fluid} katana={katana} />));
}

describe("MantisLayerProgress", () => {
  it("starts with a quiet accessible calibration state", () => {
    renderProgress("pending", "pending");
    expect(container?.querySelector('[role="status"]')?.getAttribute("aria-label")).toContain("08 percent");
    expect(container?.textContent).toContain("CALIBRATING VISUAL FIELD");
  });
  it("reports partial progress when one layer is ready", () => {
    renderProgress("ready", "pending");
    expect(container?.textContent).toContain("50%");
    expect(container?.textContent).toContain("FINISHING VISUAL FIELD");
  });
  it("removes itself when both layers are ready or safely fallback", () => {
    renderProgress("ready", "ready");
    expect(container?.querySelector('[role="status"]')).toBeNull();
    renderProgress("fallback", "fallback");
    expect(container?.querySelector('[role="status"]')).toBeNull();
  });
});
