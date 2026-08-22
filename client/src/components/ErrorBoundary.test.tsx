// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

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

describe("ErrorBoundary", () => {
  it("does not render an internal stack trace", () => {
    const error = new Error("private implementation detail");
    const Thrower = () => {
      throw error;
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => root?.render(<ErrorBoundary><Thrower /></ErrorBoundary>));

    expect(container.textContent).toContain("Reload Page");
    expect(container.textContent).toContain("The interface could not complete that action.");
    expect(container.textContent).not.toContain("private implementation detail");
    expect(container.textContent).not.toContain("Error: private implementation detail");
  });
});
