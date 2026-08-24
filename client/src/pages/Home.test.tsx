// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home, { safeExternalUrl } from "./Home";
import { profile, projects, technologyGroups } from "@/data/profileData";

const publicProjectsQuery = vi.hoisted(() =>
  vi.fn(() => ({ data: [], isLoading: false }))
);

vi.mock("@/lib/trpc", () => ({
  trpc: {
    projects: {
      listPublic: {
        useQuery: publicProjectsQuery,
      },
    },
  },
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  document.body.className = "";
  document.body.style.overflow = "";
  root = undefined;
  container?.remove();
  container = undefined;
  publicProjectsQuery.mockReturnValue({ data: [], isLoading: false });
});

function renderHome() {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root?.render(<Home />));
}

describe("rebuilt Mantis Home page", () => {
  it("keeps the verified social links in the profile record", () => {
    expect(profile.links).toEqual(
      expect.arrayContaining([
        {
          label: "Google Developer Program",
          url: "https://me.developers.google.com/u/mantisdarling",
        },
        {
          label: "Bluesky",
          url: "https://bsky.app/profile/mantisdarling.bsky.social",
        },
        { label: "Instagram", url: "https://www.instagram.com/mantisdarling/" },
      ])
    );
  });

  it("keeps the compact navigation connected to its menu control", () => {
    renderHome();
    const menu = container?.querySelector<HTMLButtonElement>(".rebuild-menu");
    const navigation = container?.querySelector<HTMLElement>(
      "#primary-navigation"
    );
    expect(menu?.getAttribute("aria-controls")).toBe("primary-navigation");
    expect(navigation?.getAttribute("aria-label")).toBe("Primary navigation");
    expect(navigation?.querySelectorAll("button")).toHaveLength(5);
  });

  it("keeps the hero telemetry field optional over the static media fallback", () => {
    renderHome();
    const field = container?.querySelector<HTMLCanvasElement>(
      ".hero-telemetry-field"
    );
    expect(field).toBeTruthy();
    expect(field?.getAttribute("aria-hidden")).toBe("true");
    expect(container?.querySelector(".cinematic-video-backdrop")).toBeTruthy();
    expect(["checking", "fallback", "active"]).toContain(
      field?.getAttribute("data-visual-state")
    );
    expect(container?.querySelector(".hero-telemetry-readout")).toBeNull();
    expect(container?.textContent).not.toMatch(/WEBGL|FPS|frame rate/i);
  });

  it("renders a semantic chapter rail with direct navigation", () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    renderHome();
    const rail = document.querySelector<HTMLElement>(
      '[aria-label="Chapter progress"]'
    );
    const buttons = rail?.querySelectorAll<HTMLButtonElement>("button") ?? [];
    expect(rail?.querySelector("ol")).toBeTruthy();
    expect(buttons).toHaveLength(5);
    expect(buttons[0]?.getAttribute("aria-current")).toBe("step");
    expect(buttons[0]?.getAttribute("aria-label")).toContain("Profile");
    act(() => buttons[2]?.click());
    expect(scrollIntoView).toHaveBeenCalled();
    scrollIntoView.mockRestore();
  });

  it("keeps coarse-pointer phone layouts readable and unobstructed", () => {
    const styles = readFileSync(
      resolve(process.cwd(), "client/src/index.css"),
      "utf8"
    );
    expect(styles).toContain(
      "@media (pointer: coarse) and (max-width: 1100px)"
    );
    expect(styles).toMatch(
      /\.rebuild-evidence-grid,\s*\.rebuild-dossier-grid\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/
    );
    expect(styles).toMatch(
      /@media \(pointer: coarse\) and \(max-width: 1100px\)\s*\{[\s\S]*?\.rebuild-chapter-rail\s*\{[\s\S]*?display: none/
    );
  });

  it("marks narrow touch surfaces for desktop-mode safeguards", () => {
    const originalMaxTouchPoints = navigator.maxTouchPoints;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(navigator, "maxTouchPoints", {
      configurable: true,
      value: 5,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 980,
    });

    try {
      renderHome();
      expect(document.body.classList.contains("rebuild-touch-layout")).toBe(
        true
      );
    } finally {
      Object.defineProperty(navigator, "maxTouchPoints", {
        configurable: true,
        value: originalMaxTouchPoints,
      });
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: originalInnerWidth,
      });
    }
  });

  it("provides a skip link and dismisses the mobile menu with Escape", () => {
    renderHome();
    const skipLink =
      container?.querySelector<HTMLAnchorElement>(".rebuild-skip-link");
    const main = container?.querySelector<HTMLElement>("#main-content");
    const menu = container?.querySelector<HTMLButtonElement>(".rebuild-menu");
    expect(skipLink?.getAttribute("href")).toBe("#main-content");
    expect(main?.getAttribute("tabindex")).toBe("-1");
    act(() => menu?.click());
    expect(menu?.getAttribute("aria-expanded")).toBe("true");
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    );
    expect(menu?.getAttribute("aria-expanded")).toBe("false");
  });

  it("shows accessible project skeletons while public records are loading", () => {
    publicProjectsQuery.mockReturnValue({ data: [], isLoading: true });
    renderHome();
    const grid = container?.querySelector<HTMLElement>(".rebuild-project-grid");
    expect(grid?.getAttribute("aria-busy")).toBe("true");
    expect(
      grid?.querySelectorAll(".rebuild-project-card-skeleton")
    ).toHaveLength(2);
    expect(container?.textContent).toContain("Mantis");
  });

  it("keeps the primary identity and every resume project visible in the public archive", () => {
    renderHome();
    expect(container?.textContent).toContain(profile.fullName);
    expect(container?.textContent).toContain(profile.positioning);
    expect(container?.textContent).toContain("Mantis");
    expect(container?.querySelector(".rebuild-wordmark")?.textContent).toBe(
      "Mantis"
    );
    expect(
      container?.querySelector(".rebuild-wordmark")?.textContent
    ).not.toContain("Builds");
    expect(container?.textContent).toContain("Harshit Kumar");
    for (const project of projects)
      expect(container?.textContent).toContain(project.name);
    expect(container?.textContent).toContain("In Progress / Founder");
  });

  it("opens an accessible project dossier without changing the page route", () => {
    renderHome();
    const firstCard = container?.querySelector<HTMLElement>(
      ".rebuild-project-card"
    );
    expect(firstCard).toBeTruthy();
    act(() => firstCard?.click());
    const dialog = container?.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("aria-labelledby")).toBe(
      "project-dossier-title"
    );
    expect(dialog?.getAttribute("aria-describedby")).toBe(
      "project-dossier-description"
    );
    expect(dialog?.querySelector("#project-dossier-title")?.textContent).toBe(
      projects[0].name
    );
    expect(window.location.pathname).toBe("/");
  });

  it("keeps the full technology groups available through compact disclosures", () => {
    renderHome();
    const stackButton = Array.from(
      container?.querySelectorAll(".rebuild-stack-row > button") ?? []
    ).find(button =>
      button.textContent?.includes(technologyGroups[0].category)
    );
    expect(stackButton).toBeTruthy();
    act(() => (stackButton as HTMLButtonElement).click());
    expect(container?.textContent).toContain(technologyGroups[0].items[0]);
    expect(stackButton?.getAttribute("aria-expanded")).toBe("true");
  });

  it("renders one blended backdrop for stack and evidence", () => {
    renderHome();
    expect(
      container
        ?.querySelector("#stack > .cinematic-scene-backdrop img")
        ?.getAttribute("src")
    ).toBe("/manus-storage/mantis-stack-mountain-waterfall_e3d55c7e.jpg");
    expect(
      container?.querySelectorAll("#stack > .cinematic-scene-backdrop")
    ).toHaveLength(1);
    expect(
      container?.querySelector("#stack .rebuild-section-atmosphere-stack")
    ).toBeNull();
    expect(
      container
        ?.querySelector("#evidence > .cinematic-scene-backdrop img")
        ?.getAttribute("src")
    ).toContain("files.manuscdn.com");
    expect(
      container?.querySelector("#evidence .rebuild-section-atmosphere")
    ).toBeNull();
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

  it("keeps each major media section as one backdrop with foreground content", () => {
    renderHome();
    for (const id of ["profile", "work", "stack", "evidence"]) {
      const section = container?.querySelector(`#${id}`);
      expect(
        section?.querySelectorAll(":scope > .cinematic-scene-backdrop")
      ).toHaveLength(1);
      expect(
        section?.querySelector(":scope > .cinematic-scene-backdrop")
          ?.nextElementSibling
      ).toBeTruthy();
    }
    expect(container?.querySelectorAll("#stack > picture")).toHaveLength(0);
  });

  it("gives every project card a samurai visual and keeps the closing scene video-only", () => {
    renderHome();
    const cards = container?.querySelectorAll(".rebuild-project-card") ?? [];
    expect(cards).toHaveLength(projects.length);
    cards.forEach(card =>
      expect(card.querySelector('img[src*="files.manuscdn.com"]')).toBeTruthy()
    );
    expect(
      container?.querySelectorAll(
        ".cinematic-finale .cinematic-video-backdrop img"
      )
    ).toHaveLength(0);
    expect(
      container?.querySelector(
        ".cinematic-finale .cinematic-video-backdrop video"
      )
    ).toBeTruthy();
  });

  it("reveals mobile imagery after the selected source loads", () => {
    renderHome();
    const image = container?.querySelector<HTMLImageElement>(
      ".cinematic-story-scene img.mobile-image-reveal"
    );
    expect(image).toBeTruthy();
    expect(image?.classList.contains("is-loaded")).toBe(false);
    act(() => image?.dispatchEvent(new Event("load")));
    expect(image?.classList.contains("is-loaded")).toBe(true);
  });

  it("resets dossier image reveal state when the selected project changes", () => {
    renderHome();
    const cards =
      container?.querySelectorAll<HTMLElement>(".rebuild-project-card") ?? [];
    act(() => cards[0]?.click());
    const firstImage = container?.querySelector<HTMLImageElement>(
      ".rebuild-modal img.mobile-image-reveal"
    );
    expect(firstImage).toBeTruthy();
    act(() => firstImage?.dispatchEvent(new Event("load")));
    expect(firstImage?.classList.contains("is-loaded")).toBe(true);
    act(() =>
      container
        ?.querySelector<HTMLButtonElement>(".rebuild-modal-close")
        ?.click()
    );
    act(() => cards[1]?.click());
    const secondImage = container?.querySelector<HTMLImageElement>(
      ".rebuild-modal img.mobile-image-reveal"
    );
    expect(secondImage).toBeTruthy();
    expect(secondImage?.classList.contains("is-loaded")).toBe(false);
  });

  it("exposes the project archive as a touch carousel on narrow screens", () => {
    renderHome();
    const carousel = container?.querySelector<HTMLElement>(
      '[role="region"][aria-roledescription="carousel"]'
    );
    const position = container?.querySelector<HTMLElement>(
      ".rebuild-project-position"
    );
    expect(carousel).toBeTruthy();
    expect(carousel?.getAttribute("aria-label")).toBe("Project archive");
    expect(carousel?.querySelectorAll(".rebuild-project-card")).toHaveLength(
      projects.length
    );
    expect(carousel?.tabIndex).toBe(0);
    expect(position?.getAttribute("aria-label")).toBe(
      "Project carousel position"
    );
    expect(position?.querySelector('[aria-live="polite"]')?.textContent).toBe(
      `01 / ${String(projects.length).padStart(2, "0")}`
    );
    expect(
      position?.querySelectorAll(".rebuild-project-position-dots i")
    ).toHaveLength(projects.length);
    expect(
      position?.querySelector(".rebuild-project-position-dots i.is-active")
    ).toBeTruthy();
  });

  it("keeps Evidence dossiers closed until their summary is activated", () => {
    renderHome();
    const dossiers = Array.from(
      container?.querySelectorAll<HTMLElement>("#evidence .rebuild-dossier") ??
        []
    );
    expect(dossiers).toHaveLength(4);
    expect(
      dossiers.every(dossier => dossier.classList.contains("is-open") === false)
    ).toBe(true);
    expect(dossiers[0].textContent).toContain(
      "Securing Agents with NemoClaw and OpenShell"
    );
    expect(
      dossiers.every(dossier =>
        dossier.querySelector('[aria-expanded="false"]')
      )
    ).toBe(true);

    const summary = dossiers[0].querySelector<HTMLButtonElement>(
      ".rebuild-dossier-summary"
    );
    const panel = dossiers[0].querySelector<HTMLElement>(
      ".rebuild-dossier-panel"
    );
    act(() => summary?.click());
    expect(summary?.getAttribute("aria-expanded")).toBe("true");
    expect(dossiers[0].classList.contains("is-open")).toBe(true);
    expect(panel?.getAttribute("aria-hidden")).toBe("false");
    act(() => summary?.click());
    expect(summary?.getAttribute("aria-expanded")).toBe("false");
    expect(dossiers[0].classList.contains("is-open")).toBe(false);
    expect(panel?.getAttribute("aria-hidden")).toBe("true");
  });

  it("serves mobile derivatives for the cinematic backgrounds and project visuals", () => {
    renderHome();
    const mobileSources =
      container?.querySelectorAll('source[media="(max-width: 800px)"]') ?? [];
    expect(mobileSources.length).toBe(projects.length + 9);
    expect(
      container?.querySelector('source[srcset*="/nUUmQGGwbuDjMqAD.webp"]')
    ).toBeTruthy();
    expect(
      container?.querySelector('source[srcset*="/yobFGNuwyHwrFsAO.webp"]')
    ).toBeTruthy();
    expect(
      container?.querySelector(
        '#stack > .cinematic-scene-backdrop source[srcset*="/FTbPLbavzYQOssdo.webp"]'
      )
    ).toBeTruthy();
    container?.querySelectorAll(".rebuild-project-card").forEach(card => {
      expect(
        card.querySelector('source[media="(max-width: 800px)"]')
      ).toBeTruthy();
    });
  });

  it("uses optimized media sources and a closing poster fallback", () => {
    renderHome();
    expect(
      container?.querySelector(".rebuild-brand img")?.getAttribute("src")
    ).toContain("SzCbbuLdJOszlBMq.webp");
    expect(
      container
        ?.querySelector("#top .cinematic-video-backdrop video")
        ?.getAttribute("poster")
    ).toContain("DqFlWdeJBdeaAsZf.webp");
    expect(
      container
        ?.querySelector("#top .cinematic-video-backdrop img")
        ?.getAttribute("fetchpriority")
    ).toBe("high");
    const closingVideo = container?.querySelector<HTMLVideoElement>(
      ".cinematic-finale .cinematic-video-backdrop video"
    );
    expect(closingVideo?.getAttribute("poster")).toContain(
      "DDtXMipemsimcRFJ.webp"
    );
    expect(closingVideo?.getAttribute("preload")).toBe("metadata");
  });

  it("keeps external project links on safe web protocols", () => {
    renderHome();
    const links = Array.from(
      container?.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]') ?? []
    );
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link =>
      expect(["http:", "https:"].includes(new URL(link.href).protocol)).toBe(
        true
      )
    );
    links.forEach(link => expect(link.rel).toContain("noopener"));
  });

  it("exposes accessible project sharing fallbacks in the dossier", () => {
    renderHome();
    act(() =>
      container?.querySelector<HTMLElement>(".rebuild-project-card")?.click()
    );
    const share = container?.querySelector<HTMLElement>(".rebuild-share");
    expect(share?.getAttribute("aria-label")).toBe(`Share ${projects[0].name}`);
    expect(share?.querySelectorAll("button")).toHaveLength(2);
    const copyButton = share?.querySelector<HTMLButtonElement>(
      ".rebuild-copy-link-button"
    );
    const tooltipId = copyButton?.getAttribute("aria-describedby");
    expect(tooltipId).toBe(`copy-link-tooltip-${projects[0].id}`);
    expect(share?.querySelector(`#${tooltipId}`)?.getAttribute("role")).toBe(
      "tooltip"
    );
    expect(share?.querySelector(`#${tooltipId}`)?.textContent).toBe(
      "Copy this project link"
    );
    const shareLinks = Array.from(
      share?.querySelectorAll<HTMLAnchorElement>("a") ?? []
    );
    expect(shareLinks.map(link => new URL(link.href).origin)).toEqual([
      "https://x.com",
      "https://www.linkedin.com",
    ]);
    shareLinks.forEach(link => expect(link.rel).toContain("noopener"));
  });

  it("announces copied links with a temporary accessible toast", async () => {
    const previousClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.useFakeTimers();

    try {
      renderHome();
      act(() =>
        container?.querySelector<HTMLElement>(".rebuild-project-card")?.click()
      );
      const copyButton = container?.querySelector<HTMLButtonElement>(
        '.rebuild-share-button[aria-label^="Copy link"]'
      );
      await act(async () => {
        copyButton?.click();
        await Promise.resolve();
      });

      let toast = container?.querySelector<HTMLElement>(".rebuild-share-toast");
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("https://")
      );
      expect(toast?.textContent).toContain("Link copied");
      expect(toast?.getAttribute("role")).toBe("status");
      expect(toast?.getAttribute("aria-live")).toBe("polite");
      expect(toast?.classList.contains("is-visible")).toBe(true);

      act(() => vi.advanceTimersByTime(2200));
      toast = container?.querySelector<HTMLElement>(".rebuild-share-toast");
      expect(toast?.classList.contains("is-visible")).toBe(false);

      act(() => vi.advanceTimersByTime(240));
      expect(container?.querySelector(".rebuild-share-toast")).toBeNull();
    } finally {
      vi.useRealTimers();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: previousClipboard,
      });
    }
  });

  it("copies the current website link from the footer", async () => {
    const previousClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    try {
      renderHome();
      const copyButton = container?.querySelector<HTMLButtonElement>(
        ".rebuild-footer-copy"
      );
      expect(copyButton?.getAttribute("aria-label")).toBe(
        "Copy the Mantis website link"
      );
      await act(async () => {
        copyButton?.click();
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith(window.location.href);
      expect(
        container?.querySelector(".rebuild-footer-copy-toast")?.textContent
      ).toBe("Link copied");
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: previousClipboard,
      });
    }
  });

  it("rejects unsafe external URL schemes", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,unsafe")).toBeNull();
    expect(safeExternalUrl("https://example.com/path")).toBe(
      "https://example.com/path"
    );
  });

  it("keeps chapter copy inside stable alignment owners", () => {
    renderHome();
    expect(
      container?.querySelector(".rebuild-hero-copy .rebuild-lede")
    ).toBeTruthy();
    expect(
      container?.querySelector("#profile .rebuild-intro-body")
    ).toBeTruthy();
    expect(
      container?.querySelectorAll(".rebuild-section-heading > p")
    ).toHaveLength(3);
    expect(
      container?.querySelectorAll(".rebuild-record > div").length
    ).toBeGreaterThan(0);
    expect(
      container?.querySelector("#contact .rebuild-contact-card")
    ).toBeTruthy();
    expect(container?.querySelector(".rebuild-footer > a")).toBeTruthy();
  });

  it("keeps the scroll reveal attached to the intended text groups", () => {
    renderHome();
    const targets = container?.querySelectorAll("[data-text-reveal]");
    expect(targets?.length).toBeGreaterThan(10);
    expect(
      container?.querySelector('[data-text-reveal="delayed"]')
    ).toBeTruthy();
    expect(container?.textContent).toContain("Mantis");
    expect(container?.textContent).toContain("Proof,");
    expect(container?.textContent).toContain("Depth");
  });

  it("keeps the image-led story references separate from functional portfolio content", () => {
    renderHome();
    expect(container?.textContent).toContain("Enter through");
    expect(
      container?.querySelector(
        'a[href="https://in.pinterest.com/pin/894105332291615495/"]'
      )
    ).toBeNull();
    expect(
      container
        ?.querySelector("#top .cinematic-video-backdrop video")
        ?.getAttribute("autoplay")
    ).toBe("");
    expect(
      container
        ?.querySelector(".cinematic-finale .cinematic-video-backdrop video")
        ?.getAttribute("loop")
    ).toBe("");
    expect(
      container?.querySelector(
        'video[src*="files.manuscdn.com"][src$="dQgTwaCcLKHSusnt.mp4"]'
      )
    ).toBeTruthy();
    expect(
      container?.querySelector(
        'video[src*="files.manuscdn.com"][src$="qPIGKaMzyrRrveJB.mp4"]'
      )
    ).toBeTruthy();
    expect(container?.querySelectorAll(".cinematic-story-scene")).toHaveLength(
      4
    );
    expect(
      container?.querySelectorAll(
        ".cinematic-section .cinematic-scene-backdrop img"
      ).length
    ).toBeGreaterThanOrEqual(4);
  });
});
