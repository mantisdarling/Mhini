// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectListSkeleton } from "./ProjectConsole";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
});

describe("project console loading state", () => {
  it("announces loading and preserves three record-shaped rows", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root?.render(<ProjectListSkeleton />));

    expect(container.querySelector('[role="status"]')?.textContent).toContain("Loading project entries");
    expect(container.querySelectorAll(".project-console-loading-row")).toHaveLength(3);
    expect(container.querySelector(".project-console-loading")?.classList.contains("project-console-loading")).toBe(true);
  });
});
