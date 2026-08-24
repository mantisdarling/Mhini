// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import PortfolioBoundary from "./PortfolioBoundary";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
  vi.restoreAllMocks();
});

describe("PortfolioBoundary", () => {
  it("recovers locally without exposing internal error details", () => {
    let shouldThrow = true;
    const Thrower = () => {
      if (shouldThrow) throw new Error("private component detail");
      return <p>Recovered content</p>;
    };
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() =>
      root?.render(
        <PortfolioBoundary label="Project record">
          <Thrower />
        </PortfolioBoundary>
      )
    );

    expect(container.textContent).toContain("Project record paused");
    expect(container.textContent).toContain("Try again");
    expect(container.textContent).not.toContain("private component detail");

    shouldThrow = false;
    act(() =>
      (container?.querySelector("button") as HTMLButtonElement)?.click()
    );

    expect(container.textContent).toContain("Recovered content");
  });
});
