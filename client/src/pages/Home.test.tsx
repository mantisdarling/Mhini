// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";
import { profile, projects, technologyGroups } from "@/data/profileData";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    projects: {
      listPublic: {
        useQuery: () => ({ data: [], isLoading: false }),
      },
    },
  },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  document.body.className = "";
  document.body.style.overflow = "";
  root = undefined;
  container?.remove();
  container = undefined;
});

function renderHome() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<Home />));
}

describe("rebuilt Mantis Home page", () => {
  it("keeps the primary identity and every resume project visible in the public archive", () => {
    renderHome();
    expect(container?.textContent).toContain(profile.fullName);
    expect(container?.textContent).toContain(profile.positioning);
    for (const project of projects) expect(container?.textContent).toContain(project.name);
  });

  it("opens a project dossier without changing the page route", () => {
    renderHome();
    const firstCard = container?.querySelector<HTMLElement>(".rebuild-project-card");
    expect(firstCard).toBeTruthy();
    act(() => firstCard?.click());
    expect(container?.querySelector('[role="dialog"]')).toBeTruthy();
    expect(window.location.pathname).toBe("/");
  });

  it("keeps the full technology groups available through compact disclosures", () => {
    renderHome();
    const stackButton = Array.from(container?.querySelectorAll(".rebuild-stack-row > button") ?? []).find(button => button.textContent?.includes(technologyGroups[0].category));
    expect(stackButton).toBeTruthy();
    act(() => (stackButton as HTMLButtonElement).click());
    expect(container?.textContent).toContain(technologyGroups[0].items[0]);
    expect(stackButton?.getAttribute("aria-expanded")).toBe("true");
  });
});
