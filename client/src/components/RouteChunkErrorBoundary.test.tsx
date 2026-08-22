// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import RouteChunkErrorBoundary from "./RouteChunkErrorBoundary";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  vi.restoreAllMocks();
});

describe("RouteChunkErrorBoundary", () => {
  it("renders a safe recovery panel when a route chunk fails", () => {
    const error = new Error("private chunk details");
    const Thrower = () => {
      throw error;
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => root?.render(<RouteChunkErrorBoundary><Thrower /></RouteChunkErrorBoundary>));

    const panel = container.querySelector('[role="alert"]');
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain("route-chunk-error-enter");
    expect(container.textContent).toContain("ROUTE SIGNAL LOST");
    expect(container.textContent).toContain("TRY AGAIN");
    expect(container.textContent).toContain("RETURN HOME");
    expect(container.textContent).not.toContain("private chunk details");
  });
});
