// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useTextReveal } from "./useTextReveal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type ObserverCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  private readonly callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(target: Element, isIntersecting = true) {
    this.callback([{ target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
  }
}

function Fixture() {
  const rootRef = React.useRef<HTMLDivElement>(null);
  useTextReveal(rootRef);
  return <div ref={rootRef}><p data-text-reveal>Primary copy</p><p data-text-reveal="delayed">Delayed copy</p></div>;
}

describe("useTextReveal", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;
  const originalObserver = globalThis.IntersectionObserver;

  afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    container = undefined;
    root = undefined;
    MockIntersectionObserver.instances = [];
    globalThis.IntersectionObserver = originalObserver;
  });

  it("reveals each target once when it enters the viewport and cleans up", () => {
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => root?.render(<Fixture />));

    const observer = MockIntersectionObserver.instances[0];
    const revealRoot = container.firstElementChild as HTMLElement;
    const targets = container.querySelectorAll<HTMLElement>("[data-text-reveal]");
    expect(observer.observe).toHaveBeenCalledTimes(2);
    expect(revealRoot.classList.contains("has-text-reveal")).toBe(true);
    expect(targets[0].classList.contains("is-visible")).toBe(false);

    act(() => observer.trigger(targets[0]));

    expect(targets[0].classList.contains("is-visible")).toBe(true);
    expect(observer.unobserve).toHaveBeenCalledWith(targets[0]);
    expect(targets[1].classList.contains("is-visible")).toBe(false);

    act(() => root?.unmount());
    root = undefined;

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(revealRoot.classList.contains("has-text-reveal")).toBe(false);
    expect(targets[0].classList.contains("is-visible")).toBe(false);
  });

  it("does not hide content when reduced motion is requested", () => {
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
    vi.stubGlobal("matchMedia", () => ({ matches: true, media: "(prefers-reduced-motion: reduce)" }));
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => root?.render(<Fixture />));

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(container.querySelectorAll("[data-text-reveal]")).toHaveLength(2);
    expect(container.firstElementChild?.classList.contains("has-text-reveal")).toBe(false);
    vi.unstubAllGlobals();
  });
});
