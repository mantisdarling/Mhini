/**
 * Mantis design reminder: cinematic brutalism meets Japanese precision engineering.
 * Favor the telemetry spine, blade-thin dividers, generous black space, Mantis Red only for intent, and composed motion.
 */
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { DrawSVGPlugin, ScrollTrigger, SplitText } from "gsap/all";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  Cloud,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Menu,
  MoveUpRight,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

const ASSETS = {
  hero: "/manus-storage/mantis-hero-cinematic_ab3f20a9.jpg",
  mark: "/manus-storage/mantis-blade-mark_cdda3c42.png",
  lattice: "/manus-storage/mantis-project-lattice_c7800bac.jpg",
  signal: "/manus-storage/mantis-project-signal_41420e07.jpg",
  forge: "/manus-storage/mantis-project-forge_609a6116.jpg",
};

const navItems = [
  ["Discipline", "#discipline"],
  ["Arsenal", "#arsenal"],
  ["Track Record", "#track-record"],
  ["Run Log", "#run-log"],
];

const railSections = [
  { id: "top", code: "M / 01", label: "ORIGIN" },
  { id: "discipline", code: "M / 02", label: "DISCIPLINE" },
  { id: "arsenal", code: "M / 03", label: "ARSENAL" },
  { id: "track-record", code: "M / 04", label: "TRACK RECORD" },
  { id: "run-log", code: "M / 05", label: "RUN LOG" },
  { id: "pit-stop", code: "M / 06", label: "PIT STOP" },
];

const skillGroups = [
  {
    coordinate: "01 / THINK",
    title: "Strategy & systems",
    skills: [
      ["Product strategy", 94],
      ["Systems thinking", 91],
      ["Research synthesis", 88],
    ],
  },
  {
    coordinate: "02 / MAKE",
    title: "Design & build",
    skills: [
      ["Experience design", 93],
      ["Creative development", 89],
      ["Design systems", 86],
    ],
  },
  {
    coordinate: "03 / SHIP",
    title: "Operations & growth",
    skills: [
      ["Launch direction", 87],
      ["Team alignment", 84],
      ["Iteration loops", 90],
    ],
  },
];

const projects = [
  {
    number: "01",
    image: ASSETS.lattice,
    category: "EXPERIMENTAL WEB",
    title: "Lattice / 01",
    description:
      "A narrative interface that gave a future-facing studio one sharp surface for an unusually dense point of view.",
    tags: ["Strategy", "Art Direction", "Build"],
  },
  {
    number: "02",
    image: ASSETS.signal,
    category: "DATA PLATFORM",
    title: "Signal / 24",
    description:
      "A decision layer that turned fast operational data into a usable cadence for teams already in motion.",
    tags: ["Systems", "Product", "Prototype"],
  },
  {
    number: "03",
    image: ASSETS.forge,
    category: "BRAND SYSTEM",
    title: "Forge / M",
    description:
      "A modular identity and launch toolkit that gave an ambitious product a durable operating system from day one.",
    tags: ["Identity", "Direction", "Launch"],
  },
];

const timeline = [
  {
    period: "CURRENT / 2026",
    role: "Independent builder",
    company: "Mantis / Field Operations",
    summary:
      "Working beside focused teams when the problem has consequences: find the signal, design the system, move the work forward.",
  },
  {
    period: "2023 — 2026",
    role: "Product & design lead",
    company: "Arc / Product Unit",
    summary:
      "Set product direction across research, prototype, and release — keeping the room aligned when the map was still being drawn.",
  },
  {
    period: "2020 — 2023",
    role: "Creative technologist",
    company: "Pulse / Creative Lab",
    summary:
      "Built digital experiments and visual operating systems for technology, culture, and independent ventures with something to prove.",
  },
];

function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="section-eyebrow" aria-label={`${index} ${label}`}>
      <span>{index}</span>
      <i />
      <span>{label}</span>
    </div>
  );
}

function BladeDivider() {
  return (
    <svg className="blade-divider" viewBox="0 0 1200 12" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 6H1148L1200 1" />
    </svg>
  );
}

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(event: MouseEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: y * -7, y: x * 7 });
  }

  return (
    <article
      className="project-card reveal"
      data-cursor="VIEW"
      style={
        {
          "--tilt-x": `${tilt.x}deg`,
          "--tilt-y": `${tilt.y}deg`,
        } as CSSProperties
      }
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="project-image-wrap">
        <img src={project.image} alt="" loading="lazy" />
        <div className="project-image-scrim" />
        <span className="project-number">{project.number}</span>
        <span className="project-view">VIEW</span>
      </div>
      <div className="project-meta">
        <p className="project-category">{project.category}</p>
        <div className="project-title-row">
          <h3>{project.title}</h3>
          <motion.span whileHover={{ x: 4, y: -4 }} transition={{ duration: 0.2 }}>
            <ArrowUpRight size={21} strokeWidth={1.4} aria-hidden="true" />
          </motion.span>
        </div>
        <p className="project-description">{project.description}</p>
        <div className="project-tags" aria-label="Project disciplines">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [introVisible, setIntroVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(railSections[0]);
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const cursorLabel = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const hasDismissedIntro = useRef(false);

  function dismissIntro() {
    if (hasDismissedIntro.current) return;
    hasDismissedIntro.current = true;
    const intro = document.querySelector<HTMLElement>(".intro-screen");
    if (intro) {
      gsap.to(intro, {
        autoAlpha: 0,
        duration: 0.45,
        ease: "power3.inOut",
        onComplete: () => setIntroVisible(false),
      });
    } else {
      setIntroVisible(false);
    }
  }

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.3,
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    const onScroll = () => {
      ScrollTrigger.update();
      if (progressRef.current) {
        progressRef.current.style.setProperty("--progress", `${Math.max(0, lenis.progress * 100)}%`);
      }
      const skew = Math.max(-2.5, Math.min(2.5, lenis.velocity * 0.035));
      document.documentElement.style.setProperty("--scroll-skew", `${skew}deg`);
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!active) return;
        const next = railSections.find((section) => section.id === active.target.id);
        if (next) setActiveSection(next);
      },
      { threshold: [0.25, 0.5, 0.7], rootMargin: "-25% 0px -35% 0px" },
    );
    railSections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setIntroVisible(false);
      hasDismissedIntro.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(".intro-progress-fill", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".intro-word", { autoAlpha: 0, y: 14 });
      const introTimeline = gsap.timeline({ delay: 0.12 });
      introTimeline
        .fromTo(
          ".intro-blade",
          { drawSVG: "0%", autoAlpha: 1 },
          { drawSVG: "100%", duration: 0.68, ease: "power3.inOut" },
        )
        .to(".intro-progress-fill", { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, "<0.05")
        .to(".intro-word", { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.08, ease: "power3.out" }, "<0.18")
        .to({}, { duration: 0.24 })
        .call(dismissIntro);
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    if (!media.matches || !cursorDot.current || !cursorRing.current) return;
    const dotX = gsap.quickTo(cursorDot.current, "x", { duration: 0.1, ease: "power3.out" });
    const dotY = gsap.quickTo(cursorDot.current, "y", { duration: 0.1, ease: "power3.out" });
    const ringX = gsap.quickTo(cursorRing.current, "x", { duration: 0.38, ease: "power3.out" });
    const ringY = gsap.quickTo(cursorRing.current, "y", { duration: 0.38, ease: "power3.out" });

    const moveCursor = (event: PointerEvent) => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };
    const enterInteractive = (event: Event) => {
      const target = event.currentTarget as HTMLElement;
      const label = target.dataset.cursor || "";
      cursorRing.current?.classList.toggle("has-label", Boolean(label));
      if (cursorLabel.current) cursorLabel.current.textContent = label;
    };
    const leaveInteractive = () => {
      cursorRing.current?.classList.remove("has-label");
      if (cursorLabel.current) cursorLabel.current.textContent = "";
    };

    window.addEventListener("pointermove", moveCursor);
    const interactiveElements = Array.from(document.querySelectorAll<HTMLElement>("a, button, [data-cursor]"));
    interactiveElements.forEach((element) => {
      element.addEventListener("mouseenter", enterInteractive);
      element.addEventListener("mouseleave", leaveInteractive);
    });

    return () => {
      window.removeEventListener("pointermove", moveCursor);
      interactiveElements.forEach((element) => {
        element.removeEventListener("mouseenter", enterInteractive);
        element.removeEventListener("mouseleave", leaveInteractive);
      });
    };
  }, [introVisible]);

  useLayoutEffect(() => {
    if (introVisible) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".reveal, .section-line, .skill-fill", { clearProps: "all" });
        return;
      }

      const name = new SplitText(".hero-name", { type: "chars" });
      const deep = new SplitText(".tagline-deep", { type: "chars" });
      const build = new SplitText(".tagline-build", { type: "chars" });
      gsap.set([name.chars, deep.chars, build.chars], { autoAlpha: 0, yPercent: 110 });

      const heroTimeline = gsap.timeline({ delay: 0.08 });
      heroTimeline
        .to(name.chars, { autoAlpha: 1, yPercent: 0, duration: 0.68, stagger: 0.036, ease: "power3.out" })
        .to(deep.chars, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.025, ease: "power2.out" }, "<0.05")
        .to({}, { duration: 0.34 })
        .to(build.chars, { autoAlpha: 1, yPercent: 0, duration: 0.42, stagger: 0.025, ease: "power4.out" })
        .fromTo(".hero-support", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.52, ease: "power3.out" }, "<0.12")
        .fromTo(".scroll-pulse", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }, "<");

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 58 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 83%",
              once: true,
            },
          },
        );
      });

      gsap.utils.toArray<SVGPathElement>(".blade-divider path").forEach((path) => {
        gsap.fromTo(
          path,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: path.closest(".blade-divider"), start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".skill-fill").forEach((fill) => {
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: { trigger: fill.closest(".skill-row"), start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".stat-count").forEach((stat) => {
        const amount = Number(stat.dataset.count || 0);
        const hasLeadingZero = stat.dataset.pad === "true";
        const counter = { value: 0 };
        gsap.to(counter, {
          value: amount,
          duration: 1.15,
          ease: "power2.out",
          scrollTrigger: { trigger: stat, start: "top 90%", once: true },
          onUpdate: () => {
            const value = Math.round(counter.value);
            stat.textContent = hasLeadingZero ? String(value).padStart(2, "0") : String(value);
          },
        });
      });

      gsap.fromTo(
        ".timeline-line",
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: ".timeline-wrap",
            start: "top 78%",
            end: "bottom 78%",
            scrub: 0.55,
          },
        },
      );

      gsap.to(".hero-art", {
        yPercent: 11,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.75 },
      });

      return () => {
        name.revert();
        deep.revert();
        build.revert();
      };
    }, appRef);

    return () => ctx.revert();
  }, [introVisible]);

  return (
    <div className="site-shell" ref={appRef}>
      {introVisible && (
        <section className="intro-screen" aria-label="Site loading sequence">
          <button className="intro-skip" onClick={dismissIntro} type="button">
            Skip intro <span aria-hidden="true">↗</span>
          </button>
          <div className="intro-center">
            <svg className="intro-monogram" viewBox="0 0 132 112" aria-hidden="true">
              <path className="intro-blade" d="M17 94L52 18L70 58L108 12" />
              <path className="intro-blade" d="M49 96L72 50L115 95" />
            </svg>
            <div className="intro-words" aria-hidden="true">
              <span className="intro-word">DEEP</span>
              <span className="intro-word">THEN</span>
              <span className="intro-word">BUILD</span>
            </div>
          </div>
          <div className="intro-progress" aria-hidden="true">
            <span className="intro-progress-fill" />
            <em>INITIALIZE / 01</em>
          </div>
        </section>
      )}

      <div className="noise-overlay" aria-hidden="true" />
      <div className="cursor-dot" ref={cursorDot} aria-hidden="true" />
      <div className="cursor-ring" ref={cursorRing} aria-hidden="true">
        <span ref={cursorLabel} />
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Mantis — return to top">
          <img src={ASSETS.mark} alt="Mantis blade monogram" />
          <span className="brand-wordmark" aria-hidden="true"><b>MAN</b><i /><b>TIS</b></span>
        </a>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map(([label, href], index) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>
              <small>0{index + 1}</small>
              {label}
            </a>
          ))}
          <a className="mobile-contact" href="#pit-stop" onClick={() => setMenuOpen(false)}>
            Pit stop <ArrowUpRight size={16} />
          </a>
        </nav>
        <a className="header-contact" href="#pit-stop">
          <span>Make contact</span>
          <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </header>

      <aside className="telemetry-rail" aria-hidden="true">
        <span className="rail-label">LIVE / RUN</span>
        <span className="rail-coordinate">{activeSection.code}<em>{activeSection.label}</em></span>
        <div className="rail-progress" ref={progressRef}>
          <i />
        </div>
        <span className="rail-label rail-bottom">LOCK / 0.01</span>
      </aside>

      <main>
        <section className="hero" id="top">
          <img className="hero-art" src={ASSETS.hero} alt="" fetchPriority="high" />
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-speed-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="hero-content">
            <p className="hero-kicker"><span /> INDEPENDENT BUILDER / 2026</p>
            <h1 className="hero-name">MANTIS</h1>
            <div className="tagline" aria-label="I go deep, then I build">
              <span className="tagline-deep">I GO DEEP</span>
              <span className="tagline-divider">/</span>
              <span className="tagline-build">THEN I BUILD</span>
            </div>
            <div className="hero-support">
              <p>I work where the signal is faint and the stakes are high. Find the underlying system. Build the next decisive move.</p>
              <motion.a href="#track-record" className="blade-button" whileHover={{ x: 5 }} whileTap={{ scale: 0.97 }}>
                <span>View selected work</span>
                <MoveUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
              </motion.a>
            </div>
          </div>
          <a className="scroll-pulse" href="#discipline" aria-label="Scroll to The Discipline section">
            <span>SCROLL TO ENGAGE</span>
            <ArrowDown size={17} strokeWidth={1.4} aria-hidden="true" />
          </a>
          <div className="hero-coordinate" aria-hidden="true">35° 41' N / 139° 41' E</div>
        </section>

        <section className="discipline section-pad" id="discipline">
          <div className="section-grid">
            <div className="section-aside reveal">
              <SectionEyebrow index="01" label="THE DISCIPLINE" />
              <p className="brush-note">深く、正確に</p>
            </div>
            <div className="discipline-main">
              <p className="large-statement reveal">
                I make room for the hard part: the pattern behind the ask, the system behind the screen, the conviction behind the release.
              </p>
              <div className="discipline-detail reveal">
                <p>
                  Most work breaks at the handoff between meaning and motion. I begin there: absorb the conditions, name the force at play, and turn a crowded field into an executable line.
                </p>
                <p>
                  The practice moves between product, visual direction, and implementation. Not to create more surface area — to create one sharper point of contact with the work ahead.
                </p>
                <div className="stat-strip">
                  <div><strong className="stat-count" data-count="4" data-pad="true">00</strong><span>operating modes</span></div>
                  <div><strong className="stat-count" data-count="12">0</strong><span>signal checks per sprint</span></div>
                  <div><strong className="stat-count" data-count="1">0</strong><span>decisive next move</span></div>
                </div>
              </div>
            </div>
          </div>
          <BladeDivider />
        </section>

        <section className="arsenal section-pad" id="arsenal">
          <div className="section-grid">
            <div className="section-aside reveal">
              <SectionEyebrow index="02" label="THE ARSENAL" />
              <p className="aside-copy">Calibrated tools for moving from signal to action.</p>
            </div>
            <div className="skills-wrap">
              {skillGroups.map((group) => (
                <article className="skill-group reveal" key={group.coordinate}>
                  <div className="skill-group-heading">
                    <span>{group.coordinate}</span>
                    <h3>{group.title}</h3>
                  </div>
                  <div className="skill-list">
                    {group.skills.map(([name, value]) => (
                      <div className="skill-row" key={name}>
                        <div className="skill-name-line">
                          <span>{name}</span>
                          <strong>{value}<small>%</small></strong>
                        </div>
                        <div className="skill-track"><i className="skill-fill" style={{ width: `${value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
          <BladeDivider />
        </section>

        <section className="track-record section-pad" id="track-record">
          <div className="section-heading-wide reveal">
            <SectionEyebrow index="03" label="TRACK RECORD" />
            <div>
              <p className="section-caption">SELECTED SYSTEMS / 2023—26</p>
              <h2>Built to<br /><em>hold pressure.</em></h2>
            </div>
          </div>
          <div className="project-grid">
            {projects.map((project) => <ProjectCard project={project} key={project.number} />)}
          </div>
          <div className="record-footer reveal">
            <span>03 SELECTED ENTRIES</span>
            <p>Field notes from systems built to create clarity, carry a point of view, and keep their composure under load.</p>
          </div>
          <BladeDivider />
        </section>

        <section className="run-log section-pad" id="run-log">
          <div className="section-grid">
            <div className="section-aside reveal">
              <SectionEyebrow index="04" label="RUN LOG" />
              <p className="aside-copy">An evolving record of roles, release cycles, and directional shifts.</p>
            </div>
            <div className="timeline-wrap">
              <svg className="timeline-svg" viewBox="0 0 2 670" preserveAspectRatio="none" aria-hidden="true"><path className="timeline-line" d="M1 0V670" /></svg>
              <div className="timeline-list">
                {timeline.map((item, index) => (
                  <article className="timeline-entry reveal" key={item.period}>
                    <span className="timeline-dot" aria-hidden="true">0{index + 1}</span>
                    <div className="timeline-period">{item.period}</div>
                    <div className="timeline-content">
                      <h3>{item.role}</h3>
                      <p className="timeline-company">{item.company}</p>
                      <p>{item.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <BladeDivider />
        </section>

        <section className="pit-stop" id="pit-stop">
          <div className="pit-stop-rail" aria-hidden="true"><span>05</span><i /></div>
          <div className="pit-stop-content reveal">
            <p className="contact-label">PIT STOP / START A CONVERSATION</p>
            <h2>Bring the hard<br />problem <em>closer.</em></h2>
            <p className="contact-copy">Start with the question that will not leave your head. We will trace the pressure point and decide what deserves to be built.</p>
            <motion.a className="contact-link" href="mailto:mantisdarling@proton.me" whileHover={{ x: 8 }} whileTap={{ scale: 0.98 }}>
              <Mail size={20} strokeWidth={1.4} aria-hidden="true" />
              <span>mantisdarling@proton.me</span>
              <ArrowUpRight size={21} strokeWidth={1.4} aria-hidden="true" />
            </motion.a>
          </div>
          <div className="pit-stop-side reveal">
            <p>THE GARAGE IS OPEN</p>
            <div className="side-stats">
              <span><i /> AVAILABLE FOR SELECTED WORK</span>
              <span>RESPONSE WINDOW / 48H</span>
            </div>
            <div className="social-row" aria-label="Professional networks">
              <a href="https://github.com/mantisdarling" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={20} /></a>
              <a href="https://x.com/mantisxdarling" target="_blank" rel="noreferrer" aria-label="X"><span className="social-x">X</span></a>
              <a href="https://bsky.app/profile/mantisdarling.bsky.social" target="_blank" rel="noreferrer" aria-label="Bluesky"><Cloud size={20} /></a>
              <a href="https://me.developers.google.com/u/mantisdarling" target="_blank" rel="noreferrer" aria-label="Google Developer Program"><BadgeCheck size={20} /></a>
              <a href="https://www.linkedin.com/in/mantisdarling/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.instagram.com/mantisdarling/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#top"><img src={ASSETS.mark} alt="" /><span className="brand-wordmark" aria-hidden="true"><b>MAN</b><i /><b>TIS</b></span></a>
        <span>© 2026 / BUILT WITH DISCIPLINE</span>
        <a href="#top">RETURN TO GRID <ArrowUpRight size={14} /></a>
      </footer>
    </div>
  );
}
