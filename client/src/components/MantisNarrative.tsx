import { useEffect, useRef } from "react";

const beats = [
  { index: "01", title: "Observe", copy: "Find the signal before the system moves." },
  { index: "02", title: "Dissect", copy: "Go deep enough to see where pressure becomes leverage." },
  { index: "03", title: "Build", copy: "Turn the hard problem into a real instrument." },
  { index: "04", title: "Release", copy: "Ship the edge, then hold the line." },
];

export function MantisNarrative() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (window.innerWidth <= 980 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        track.style.transform = "none";
        return;
      }
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(0, track.scrollWidth - window.innerWidth * 0.46);
      const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height - window.innerHeight)));
      track.style.transform = `translate3d(${-travel * progress}px, -50%, 0)`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <section ref={sectionRef} className="mantis-narrative" id="narrative" aria-label="Mantis operating narrative">
      <div className="mantis-narrative-sticky">
        <div className="mantis-narrative-heading">
          <p>THE MANTIS METHOD / FIELD NOTE</p>
          <h2>Cut through<br /><em>the noise.</em></h2>
        </div>
        <div ref={trackRef} className="mantis-narrative-track">
          {beats.map((beat) => (
            <article className="mantis-narrative-card" key={beat.index}>
              <span>{beat.index}</span>
              <div><p>PHASE / {beat.index}</p><h3>{beat.title}</h3><span>{beat.copy}</span></div>
            </article>
          ))}
        </div>
        <p className="mantis-narrative-hint">Scroll or swipe to move through the method.</p>
      </div>
    </section>
  );
}
