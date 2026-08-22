// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import RouteLoadingSkeleton from "./RouteLoadingSkeleton";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe("RouteLoadingSkeleton", () => {
  it.each([
    ["portfolio", "Loading portfolio"],
    ["privacy", "Loading privacy policy"],
    ["studio", "Loading Studio"],
  ] as const)("renders the %s route loading label", (variant, label) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root?.render(<RouteLoadingSkeleton variant={variant} />));
    const loadingRegion = container?.querySelector(`[aria-label="${label}"]`);
    expect(loadingRegion?.getAttribute("aria-busy")).toBe("true");
  });
});
