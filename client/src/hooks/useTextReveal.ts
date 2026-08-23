import { useLayoutEffect, type RefObject } from "react";

export function useTextReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    if (reducedMotion) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-text-reveal]"));
    if (!targets.length) return;

    root.classList.add("has-text-reveal");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        target.classList.add("is-visible");
        observer.unobserve(target);
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    targets.forEach(target => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove("has-text-reveal");
      targets.forEach(target => target.classList.remove("is-visible"));
    };
  }, [rootRef]);
}
