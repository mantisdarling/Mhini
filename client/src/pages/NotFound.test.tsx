// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotFound from "./NotFound";

const setLocation = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/missing-route", setLocation],
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  container = undefined;
  root = undefined;
  setLocation.mockReset();
});

function renderNotFound() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<NotFound />));
}

describe("cinematic NotFound page", () => {
  it("renders a clear recovery message and accessible home control", () => {
    renderNotFound();

    expect(container?.querySelector("main.not-found-page")).toBeTruthy();
    expect(container?.querySelector("h1")?.textContent).toContain("The path");
    expect(container?.textContent).toContain("UNMAPPED TERRITORY");

    const button =
      container?.querySelector<HTMLButtonElement>(".not-found-home");
    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.textContent).toContain("Return to Mantis");
  });

  it("returns visitors to the portfolio root", () => {
    renderNotFound();

    act(() => {
      container?.querySelector<HTMLButtonElement>(".not-found-home")?.click();
    });

    expect(setLocation).toHaveBeenCalledWith("/");
  });
});
