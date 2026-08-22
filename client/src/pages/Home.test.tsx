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
    expect(container?.textContent).toContain("Mantis");
    expect(container?.querySelector(".rebuild-wordmark")?.textContent).toBe("Mantis");
    expect(container?.querySelector(".rebuild-wordmark")?.textContent).not.toContain("Builds");
    expect(container?.textContent).toContain("Harshit Kumar");
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
    expect(container?.querySelector("#stack .rebuild-section-atmosphere-stack img")?.getAttribute("src")).toContain("files.manuscdn.com");
    expect(container?.querySelector("#evidence > .cinematic-scene-backdrop img")?.getAttribute("src")).toContain("files.manuscdn.com");
    expect(container?.querySelector("#stack .rebuild-section-atmosphere")?.getAttribute("aria-hidden")).toBe("true");
    expect(container?.querySelector("#evidence .rebuild-section-atmosphere")).toBeNull();
  });

  it("keeps the Stack artwork in its background layer behind the foreground content", () => {
    renderHome();
    const stack = container?.querySelector<HTMLElement>("#stack");
    const backdrop = stack?.querySelector(":scope > .cinematic-scene-backdrop");
    const heading = stack?.querySelector(":scope > .rebuild-section-heading");
    const list = stack?.querySelector(":scope > .rebuild-stack-list");
    expect(backdrop).toBeTruthy();
    expect(heading).toBeTruthy();
    expect(list).toBeTruthy();
    expect(backdrop?.parentElement).toBe(stack);
    expect(heading?.parentElement).toBe(stack);
    expect(list?.parentElement).toBe(stack);
  });

  it("gives every project card a samurai visual and keeps the closing scene video-only", () => {
    renderHome();
    const cards = container?.querySelectorAll(".rebuild-project-card") ?? [];
    expect(cards).toHaveLength(projects.length);
    cards.forEach(card => expect(card.querySelector('img[src*="files.manuscdn.com"]')).toBeTruthy());
    expect(container?.querySelectorAll(".cinematic-finale .cinematic-video-backdrop img")).toHaveLength(0);
    expect(container?.querySelector(".cinematic-finale .cinematic-video-backdrop video")).toBeTruthy();
  });

  it("reveals mobile imagery after the selected source loads", () => {
    renderHome();
    const image = container?.querySelector<HTMLImageElement>('.cinematic-story-scene img.mobile-image-reveal');
    expect(image).toBeTruthy();
    expect(image?.classList.contains("is-loaded")).toBe(false);
    act(() => image?.dispatchEvent(new Event("load")));
    expect(image?.classList.contains("is-loaded")).toBe(true);
  });

  it("resets dossier image reveal state when the selected project changes", () => {
    renderHome();
    const cards = container?.querySelectorAll<HTMLElement>(".rebuild-project-card") ?? [];
    act(() => cards[0]?.click());
    const firstImage = container?.querySelector<HTMLImageElement>(".rebuild-modal img.mobile-image-reveal");
    expect(firstImage).toBeTruthy();
    act(() => firstImage?.dispatchEvent(new Event("load")));
    expect(firstImage?.classList.contains("is-loaded")).toBe(true);
    act(() => container?.querySelector<HTMLButtonElement>(".rebuild-modal-close")?.click());
    act(() => cards[1]?.click());
    const secondImage = container?.querySelector<HTMLImageElement>(".rebuild-modal img.mobile-image-reveal");
    expect(secondImage).toBeTruthy();
    expect(secondImage?.classList.contains("is-loaded")).toBe(false);
  });

  it("exposes the project archive as a touch carousel on narrow screens", () => {
    renderHome();
    const carousel = container?.querySelector<HTMLElement>('[role="region"][aria-roledescription="carousel"]');
    expect(carousel).toBeTruthy();
    expect(carousel?.getAttribute("aria-label")).toBe("Project archive");
    expect(carousel?.querySelectorAll(".rebuild-project-card")).toHaveLength(projects.length);
    expect(carousel?.tabIndex).toBe(0);
  });

  it("serves mobile derivatives for the cinematic backgrounds and project visuals", () => {
    renderHome();
    const mobileSources = container?.querySelectorAll('source[media="(max-width: 800px)"]') ?? [];
    expect(mobileSources.length).toBe(projects.length + 10);
    expect(container?.querySelector('source[srcset*="/nUUmQGGwbuDjMqAD.webp"]')).toBeTruthy();
    expect(container?.querySelector('source[srcset*="/yobFGNuwyHwrFsAO.webp"]')).toBeTruthy();
    expect(container?.querySelector('#stack .rebuild-section-atmosphere source[srcset*="/FTbPLbavzYQOssdo.webp"]')).toBeTruthy();
    container?.querySelectorAll(".rebuild-project-card").forEach(card => {
      expect(card.querySelector('source[media="(max-width: 800px)"]')).toBeTruthy();
    });
  });

  it("uses optimized media sources and a closing poster fallback", () => {
    renderHome();
    expect(container?.querySelector(".rebuild-brand img")?.getAttribute("src")).toContain("SzCbbuLdJOszlBMq.webp");
    expect(container?.querySelector("#top .cinematic-video-backdrop video")?.getAttribute("poster")).toContain("DqFlWdeJBdeaAsZf.webp");
    const closingVideo = container?.querySelector<HTMLVideoElement>(".cinematic-finale .cinematic-video-backdrop video");
    expect(closingVideo?.getAttribute("poster")).toContain("DDtXMipemsimcRFJ.webp");
    expect(closingVideo?.getAttribute("preload")).toBe("metadata");
  });

  it("keeps the image-led story references separate from functional portfolio content", () => {
    renderHome();
    expect(container?.textContent).toContain("Enter through");
    expect(container?.querySelector('a[href="https://in.pinterest.com/pin/894105332291615495/"]')).toBeNull();
    expect(container?.querySelector("#top .cinematic-video-backdrop video")?.getAttribute("autoplay")).toBe("");
    expect(container?.querySelector(".cinematic-finale .cinematic-video-backdrop video")?.getAttribute("loop")).toBe("");
    expect(container?.querySelector('video[src*="files.manuscdn.com"][src$="dQgTwaCcLKHSusnt.mp4"]')).toBeTruthy();
    expect(container?.querySelector('video[src*="files.manuscdn.com"][src$="qPIGKaMzyrRrveJB.mp4"]')).toBeTruthy();
    expect(container?.querySelectorAll(".cinematic-story-scene")).toHaveLength(4);
    expect(container?.querySelectorAll(".cinematic-section .cinematic-scene-backdrop img").length).toBeGreaterThanOrEqual(4);
  });
});
