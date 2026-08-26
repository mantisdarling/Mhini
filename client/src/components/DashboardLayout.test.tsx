// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: null }),
}));
vi.mock("@/lib/independentAuth", () => ({
  independentAuthEnabled: () => false,
  requestIndependentMagicLink: vi.fn(),
  getMagicLinkFailureMessage: vi.fn(),
}));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));

import DashboardLayout from "./DashboardLayout";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container?.remove();
  container = undefined;
});

describe("Studio sign-in gate", () => {
  it("offers an accessible Back to Portfolio link at the public root", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
      root?.render(
        <DashboardLayout>
          <div />
        </DashboardLayout>
      )
    );

    const link =
      container.querySelector<HTMLAnchorElement>(".studio-back-link");
    expect(link?.textContent).toContain("Back to Portfolio");
    expect(link?.getAttribute("href")).toBe("/");
    const arrow = link?.querySelector<SVGElement>('svg[aria-hidden="true"]');
    expect(arrow).toBeTruthy();
    expect(arrow?.getAttribute("width")).toBe("14");
    expect(arrow?.getAttribute("height")).toBe("14");
  });
});
