import { useEffect, type RefObject } from "react";

const MAX_OFFSET = 18;

export function getStoryParallaxOffset(top: number, height: number, viewportHeight: number) {
  const travel = viewportHeight + height;
  if (travel <= 0) return 0;
  const progress = (viewportHeight - top) / travel - 0.5;
  return Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, progress * MAX_OFFSET));
}

export function useStoryParallax(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const narrowViewport = window.matchMedia("(max-width: 800px)").matches;
    if (reducedMotion || coarsePointer || narrowViewport) return;

    const images = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (!images.length) return;

    const visible = new Set<HTMLElement>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
        else visible.delete(entry.target as HTMLElement);
      }
    }, { rootMargin: "18% 0px" });

    images.forEach(image => observer.observe(image));
    let frame = 0;
    let mounted = true;

    const render = () => {
      if (!mounted) return;
      visible.forEach(image => {
        const offset = getStoryParallaxOffset(image.getBoundingClientRect().top, image.offsetHeight, window.innerHeight);
        image.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.08)`;
      });
      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => {
      mounted = false;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      images.forEach(image => { image.style.transform = ""; });
    };
  }, [rootRef]);
}
