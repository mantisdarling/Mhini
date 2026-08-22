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

  it("renders blended atmosphere layers for stack and evidence", () => {
    renderHome();
    expect(container?.querySelector("#stack .rebuild-section-atmosphere-stack img")?.getAttribute("src")).toContain("1000237109");
    expect(container?.querySelector("#evidence .rebuild-section-atmosphere-evidence img")?.getAttribute("src")).toContain("1000237108");
    expect(container?.querySelector("#stack .rebuild-section-atmosphere")?.getAttribute("aria-hidden")).toBe("true");
    expect(container?.querySelector("#evidence .rebuild-section-atmosphere")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("keeps the image-led story references separate from functional portfolio content", () => {
    renderHome();
    expect(container?.textContent).toContain("Enter through");
    expect(container?.querySelector('a[href="https://pin.it/1uzOHjzz9"]')).toBeTruthy();
    expect(container?.querySelector('a[href="https://in.pinterest.com/pin/894105332291615495/"]')).toBeNull();
    expect(container?.querySelector('iframe[src="https://assets.pinterest.com/ext/embed.html?id=544865254939654931"]')).toBeTruthy();
    expect(container?.querySelector('a[href="https://pin.it/1uzOHjzz9"]')).toBeTruthy();
    expect(container?.querySelectorAll(".rebuild-story-frame img")).toHaveLength(4);
    expect(container?.querySelectorAll(".rebuild-final-still img")).toHaveLength(1);
  });
});
