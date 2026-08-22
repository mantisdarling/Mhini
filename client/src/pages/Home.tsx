/**
 * Mantis design reminder: cinematic brutalism meets Japanese precision engineering.
 * Favor the telemetry spine, blade-thin dividers, generous black space, Mantis Red only for intent, and composed motion.
 */
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { CredentialsSection, EcosystemSection, PersonalSignalSection, ProfileIdentitySection, TechnologySection } from "@/components/ProfileDataSections";
import { profile, projects as profileProjects } from "@/data/profileData";
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
  hero: import.meta.env.VITE_HERO_ASSET_URL || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/LzfUFsJmwAEdqRuc.jpg",
  mark: import.meta.env.VITE_MARK_ASSET_URL || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/UymLNLvVjhliLKJj.png",
  caseStudy: "/manus-storage/mantis-samurai-case-study-cover_d193f233.jpg",
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).get("motion") === "off";
}

const navItems = [
  ["Identity", "#identity"],
  ["Technology", "#technology"],
  ["Work", "#track-record"],
  ["Credentials", "#credentials"],
  ["Network", "#network"],
];

const railSections = [
  { id: "top", code: "M / 01", label: "ORIGIN" },
  { id: "identity", code: "M / 02", label: "IDENTITY" },
  { id: "technology", code: "M / 03", label: "TECHNOLOGY" },
  { id: "track-record", code: "M / 04", label: "PROJECTS" },
  { id: "credentials", code: "M / 05", label: "CREDENTIALS" },
  { id: "network", code: "M / 06", label: "NETWORK" },
  { id: "research", code: "M / 07", label: "RESEARCH" },
  { id: "vision", code: "M / 08", label: "VISION" },
  { id: "pit-stop", code: "M / 09", label: "PIT STOP" },
];

type PortfolioProject = {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  projectUrl: string | null;
  tags: string[];
  tagline?: string;
  problem?: string;
  solution?: string;
  highlights?: string[];
  githubUrl?: string;
  liveUrl?: string;
};

const resumeProjects: PortfolioProject[] = profileProjects.map((project, index) => ({
  id: -(index + 1),
  title: project.name,
  category: project.role ? `${project.status} / ${project.role}` : project.status,
  description: project.description,
  imageUrl: index === 0 ? ASSETS.caseStudy : null,
  projectUrl: project.liveUrl ?? project.githubUrl ?? null,
  tags: [...project.technologies],
  tagline: project.tagline,
  problem: project.problem,
  solution: project.solution,
  highlights: [...project.highlights],
  githubUrl: project.githubUrl,
  liveUrl: project.liveUrl,
}));

const archiveModes = [
  { id: "scan", label: "SCAN", line: "Signal sweep is active. The release bay is waiting for its first published record." },
  { id: "stage", label: "STAGE", line: "Three calibrated slots are ready for the next field release and its operating notes." },
  { id: "dispatch", label: "DISPATCH", line: "Open the private console to log the project, choose its signal, and publish when ready." },
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

function SectionCut() {
  return (
    <div className="section-cut" aria-hidden="true">
      <span className="section-cut-glint" />
      <i />
      <b />
    </div>
  );
}

function ProjectCard({ project, index, onOpen }: { project: PortfolioProject; index: number; onOpen: (project: PortfolioProject) => void }) {
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
      onClick={() => onOpen(project)}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(project); } }}
      role="button"
      tabIndex={0}
      aria-label={`Open project dossier for ${project.title}`}
    >
      <div className="project-image-wrap">
        {project.imageUrl ? <img src={project.imageUrl} alt="" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = ASSETS.hero; }} /> : <div className="project-image-placeholder"><span>NO COVER FRAME</span></div>}
        <div className="project-image-scrim" />
        <div className="project-blade-flash" aria-hidden="true" />
        <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
        <span className="project-view">VIEW</span>
      </div>
      <div className="project-meta">
        <p className="project-category">{project.category}</p>
        <div className="project-title-row">
          <h3>{project.title}</h3>
          {project.projectUrl ? (
            <motion.a href={project.projectUrl} aria-label={`Open ${project.title}`} whileHover={{ x: 4, y: -4 }} transition={{ duration: 0.2 }} onClick={event => event.stopPropagation()}>
              <ArrowUpRight size={21} strokeWidth={1.4} aria-hidden="true" />
            </motion.a>
          ) : <motion.span whileHover={{ x: 4, y: -4 }} transition={{ duration: 0.2 }}><ArrowUpRight size={21} strokeWidth={1.4} aria-hidden="true" /></motion.span>}
        </div>
        {project.tagline && <p className="project-tagline">{project.tagline}</p>}
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
  const [archiveMode, setArchiveMode] = useState("scan");
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const publicProjectsQuery = trpc.projects.listPublic.useQuery();
  const displayedProjects: PortfolioProject[] = [...resumeProjects, ...(publicProjectsQuery.data ?? [])];
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);
  const cursorLabel = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroPointerFrame = useRef<number | null>(null);
  const pendingHeroPointer = useRef({ x: 63, y: 42 });
  const hasDismissedIntro = useRef(false);
  const selectedArchiveMode = archiveModes.find(mode => mode.id === archiveMode) ?? archiveModes[0];

  useEffect(() => {
    const motionOff = prefersReducedMotion();
    document.documentElement.classList.toggle("motion-off", motionOff);
    return () => document.documentElement.classList.remove("motion-off");
  }, []);

  function trackHeroPointer(event: MouseEvent<HTMLElement>) {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pendingHeroPointer.current = {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    if (heroPointerFrame.current) return;
    heroPointerFrame.current = window.requestAnimationFrame(() => {
      heroRef.current?.style.setProperty("--pointer-x", `${pendingHeroPointer.current.x}%`);
      heroRef.current?.style.setProperty("--pointer-y", `${pendingHeroPointer.current.y}%`);
      heroPointerFrame.current = null;
    });
  }

  function resetHeroPointer() {
    if (heroPointerFrame.current) window.cancelAnimationFrame(heroPointerFrame.current);
    heroPointerFrame.current = null;
    heroRef.current?.style.setProperty("--pointer-x", "63%");
    heroRef.current?.style.setProperty("--pointer-y", "42%");
  }

  function moveMagnetic(event: MouseEvent<HTMLElement>) {
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    gsap.to(event.currentTarget, { x: (event.clientX - (bounds.left + bounds.width / 2)) * 0.18, y: (event.clientY - (bounds.top + bounds.height / 2)) * 0.18, duration: 0.28, ease: "power3.out", overwrite: true });
  }

  function resetMagnetic(event: MouseEvent<HTMLElement>) {
    gsap.to(event.currentTarget, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" });
  }

  function dismissIntro() {
    if (hasDismissedIntro.current) return;
    hasDismissedIntro.current = true;
    const intro = document.querySelector<HTMLElement>(".intro-screen");
    if (intro) {
      gsap.timeline({ onComplete: () => setIntroVisible(false) })
        .to(".intro-exit-cut", { scaleX: 1, duration: 0.24, ease: "power4.in" })
        .to(intro, { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", autoAlpha: 0, duration: 0.5, ease: "power4.inOut" }, "<0.05");
    } else {
      setIntroVisible(false);
    }
  }

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({
      duration: 1.25,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      wheelMultiplier: 0.84,
      touchMultiplier: 1.05,
      anchors: { offset: -76, duration: 1.2 },
      autoRaf: false,
    });
    const tick = (time: number) => lenis.raf(time * 1000);
    let settleTimer: number | undefined;
    const onScroll = () => {
      ScrollTrigger.update();
      if (progressRef.current) {
        progressRef.current.style.setProperty("--progress", `${Math.max(0, lenis.progress * 100)}%`);
      }
      const skew = Math.max(-2.5, Math.min(2.5, lenis.velocity * 0.035));
      document.documentElement.style.setProperty("--scroll-skew", `${skew}deg`);
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => document.documentElement.style.setProperty("--scroll-skew", "0deg"), 120);
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      if (settleTimer) window.clearTimeout(settleTimer);
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
    const reduceMotion = prefersReducedMotion();
    if (reduceMotion) {
      setIntroVisible(false);
      hasDismissedIntro.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(".intro-progress-fill", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".intro-word", { autoAlpha: 0, y: 14 });
      gsap.set(".intro-entry-cut", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".intro-exit-cut", { scaleX: 0, transformOrigin: "right center" });
      gsap.set(".intro-sabre-ridge", { drawSVG: "0%" });
      const introTimeline = gsap.timeline({ delay: 0.12 });
      introTimeline
        .to(".intro-entry-cut", { scaleX: 1, duration: 0.24, ease: "power4.in" })
        .to(".intro-entry-cut", { scaleX: 0, duration: 0.28, transformOrigin: "right center", ease: "power3.out" })
        .fromTo(
          ".intro-blade, .intro-sabre-ridge",
          { drawSVG: "0%", autoAlpha: 1 },
          { drawSVG: "100%", duration: 0.68, stagger: 0.08, ease: "power3.inOut" },
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
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".reveal, .section-line, .skill-fill", { clearProps: "all" });
        return;
      }

      const name = new SplitText(".hero-name", { type: "chars" });
      const deep = new SplitText(".tagline-deep", { type: "chars" });
      const build = new SplitText(".tagline-build", { type: "chars" });
      gsap.set([name.chars, deep.chars, build.chars], { autoAlpha: 0, yPercent: 110 });
      gsap.set(".hero-katana-core, .hero-katana-thread", { drawSVG: "0%" });
      gsap.set(".hero-cut-flash", { scaleX: 0, transformOrigin: "left center" });

      const heroTimeline = gsap.timeline({ delay: 0.08 });
      heroTimeline
        .to(".hero-cut-flash", { scaleX: 1, duration: 0.28, ease: "power4.in" })
        .to(".hero-cut-flash", { scaleX: 0, duration: 0.32, transformOrigin: "right center", ease: "power3.out" })
        .to(".hero-katana-core", { drawSVG: "100%", duration: 0.72, ease: "power3.inOut" }, "<0.03")
        .to(".hero-katana-thread", { drawSVG: "100%", duration: 0.42, ease: "power2.out" }, "<0.1")
        .to(name.chars, { autoAlpha: 1, yPercent: 0, duration: 0.68, stagger: 0.036, ease: "power3.out" }, "<0.08")
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

      gsap.utils.toArray<HTMLElement>(".section-pad").forEach((section) => {
        const cut = section.querySelector<HTMLElement>(".section-cut");
        if (!cut) return;
        gsap.fromTo(
          cut,
          { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" },
          {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.62,
            ease: "power4.out",
            scrollTrigger: { trigger: section, start: "top 80%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, index) => {
        const image = card.querySelector<HTMLElement>(".project-image-wrap");
        if (!image) return;
        gsap.fromTo(
          image,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            duration: 0.9,
            delay: index * 0.09,
            ease: "power4.out",
            scrollTrigger: { trigger: card, start: "top 86%", once: true },
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

      gsap.to(".hero-katana", {
        yPercent: -12,
        xPercent: 4,
        rotate: -2,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.85 },
      });

      gsap.to(".kinetic-track", {
        xPercent: -42,
        ease: "none",
        scrollTrigger: { trigger: ".kinetic-stage", start: "top top", end: "bottom bottom", scrub: 0.72 },
      });
      gsap.to(".kinetic-orbit", {
        rotate: 160,
        ease: "none",
        scrollTrigger: { trigger: ".kinetic-stage", start: "top bottom", end: "bottom top", scrub: 0.65 },
      });
      gsap.fromTo(".kinetic-index", { autoAlpha: 0, x: -28 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".kinetic-stage", start: "top 68%", once: true } });

      return () => {
        name.revert();
        deep.revert();
        build.revert();
      };
    }, appRef);

    return () => ctx.revert();
  }, [introVisible]);

  return (
    <div className={`site-shell stage-${activeSection.id}`} ref={appRef}>
      {introVisible && (
        <section className="intro-screen" aria-label="Site loading sequence">
          <div className="intro-entry-cut" aria-hidden="true" />
          <div className="intro-exit-cut" aria-hidden="true" />
          <button className="intro-skip" onClick={dismissIntro} type="button">
            Skip intro <span aria-hidden="true">↗</span>
          </button>
          <div className="intro-center">
            <svg className="intro-monogram" viewBox="0 0 132 112" aria-hidden="true">
              <path className="intro-blade" d="M17 94L52 18L70 58L108 12" />
              <path className="intro-blade" d="M49 96L72 50L115 95" />
              <path className="intro-sabre-ridge" d="M6 103C48 76 88 45 126 9" />
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
      <div className="ambient-sweep" aria-hidden="true" />
      <div className="cursor-dot" ref={cursorDot} aria-hidden="true" />
      <div className="cursor-ring" ref={cursorRing} aria-hidden="true">
        <span ref={cursorLabel} />
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Mantis, return to top">
          <img src={ASSETS.mark} alt="Mantis blade monogram" />
          <span className="brand-wordmark" aria-hidden="true"><b>MAN</b><i /><b>TIS</b></span>
        </a>
        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map(([label, href], index) => (
            <a href={href} key={href} className={href === `#${activeSection.id}` ? "is-active" : ""} onClick={() => setMenuOpen(false)}>
              <small>0{index + 1}</small>
              {label}
            </a>
          ))}
          <a className="mobile-contact" href="#pit-stop" onClick={() => setMenuOpen(false)}>
            Pit stop <ArrowUpRight size={16} />
          </a>
        </nav>
        <a className={`header-contact ${activeSection.id === "pit-stop" ? "is-active" : ""}`} href="#pit-stop">
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
        <section className="hero" id="top" ref={heroRef} onMouseMove={trackHeroPointer} onMouseLeave={resetHeroPointer}>
          <img className="hero-art" src={ASSETS.hero} alt="" fetchPriority="high" />
          <svg className="hero-samurai" viewBox="0 0 260 520" aria-hidden="true" focusable="false">
            <path className="samurai-shadow" d="M156 76c16 4 28 18 28 35 0 12-5 22-14 29 18 13 31 29 39 49l13 33-19 8-21-31 11 59 28 71-34 13-30-69-4 54 35 112-47 12-23-93-8 89-45-3 11-117 18-55 4-66c-12 6-22 17-31 32l-19-10 18-34c11-19 25-33 42-42-7-8-11-18-11-29 0-22 16-40 37-43l15-18 7 18z" />
            <path className="samurai-plate" d="M86 185c17-18 38-27 64-27 22 0 42 8 59 22l-12 29-48-8-49 10zM78 230l49-13 52 10-3 22-52 8-49-10zM83 274l40-7 50 6 6 34-54 9-43-11z" />
            <path className="samurai-helmet" d="M111 96c8-22 27-35 48-35 20 0 36 9 46 27l-12 14-10-9-2 20-51 3-2-16-11 8z" />
            <path className="samurai-blade" d="M117 239 258 96l2 7-129 163z" />
            <path className="samurai-hilt" d="m105 236 24 23-11 10-24-23z" />
            <path className="samurai-rim" d="M158 76c16 4 28 18 28 35 0 12-5 22-14 29 18 13 31 29 39 49l13 33" />
          </svg>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-field" aria-hidden="true"><i /><b /><span /></div>
          <div className="hero-cut-flash" aria-hidden="true" />
          <svg className="hero-katana" viewBox="0 0 1440 820" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="katanaSteel" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#f2efe9" stopOpacity="0" />
                <stop offset="0.42" stopColor="#f2efe9" stopOpacity="0.82" />
                <stop offset="0.6" stopColor="#d4af37" stopOpacity="0.9" />
                <stop offset="1" stopColor="#c81e1e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="hero-katana-core" d="M-110 704C278 475 776 244 1546 20" />
            <path className="hero-katana-thread" d="M-160 735C318 524 835 298 1555 72" />
          </svg>
          <div className="hero-speed-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="hero-content">
            <p className="hero-kicker"><span /> FOUNDER @ MANTIS / IIT MADRAS CS</p>
            <h1 className="hero-name">MANTIS</h1>
            <div className="tagline" aria-label="I GO DEEP AND THEN I BUILD">
              <span className="tagline-deep">I GO DEEP</span>
              <span className="tagline-build">AND THEN I BUILD</span>
            </div>
            <div className="hero-support">
              <p>{profile.shortBio}</p>
              <motion.a href="#track-record" className="blade-button" data-cursor="PULL" whileTap={{ scale: 0.97 }} onMouseMove={moveMagnetic} onMouseLeave={resetMagnetic}>
                <span>View selected work</span>
                <MoveUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
              </motion.a>
            </div>
            <div className="hero-specs" aria-label="Mantis operating profile">
              <span><b>01</b><small>DISCIPLINE</small><strong>BUSHIDO</strong></span>
              <span><b>02</b><small>EDGE</small><strong>KATANA</strong></span>
              <span><b>03</b><small>PACE</small><strong>F1 / 60 FPS</strong></span>
            </div>
          </div>
          <a className="scroll-pulse" href="#identity" aria-label="Scroll to Identity">
            <span>SCROLL TO ENGAGE</span>
            <ArrowDown size={17} strokeWidth={1.4} aria-hidden="true" />
          </a>
          <div className="hero-coordinate" aria-hidden="true">35° 41' N / 139° 41' E</div>
          <div className="hero-readout" aria-hidden="true"><span>POINTER / SIGNAL</span><b>ACTIVE</b></div>
        </section>

        <section className="kinetic-stage" aria-label="Operating principle">
          <div className="kinetic-sticky">
            <p className="kinetic-index">M / MOTION STUDY / 01</p>
            <div className="kinetic-orbit" aria-hidden="true"><i /><i /><i /></div>
            <div className="kinetic-track" aria-hidden="true"><span>FIND THE SIGNAL</span><em>THEN</em><span>HOLD THE LINE</span><em>THEN</em><span>MAKE THE MOVE</span></div>
            <p className="kinetic-caption">Scroll to calibrate the field.</p>
          </div>
        </section>

        <ProfileIdentitySection />

        <TechnologySection />

        <section className="track-record section-pad" id="track-record">
          <SectionCut />
          <div className="section-heading-wide reveal">
            <SectionEyebrow index="03" label="TRACK RECORD" />
            <div>
              <p className="section-caption">SELECTED SYSTEMS 2023 TO 2026</p>
              <h2>Built to<br /><em>hold pressure.</em></h2>
            </div>
          </div>
          <div className="project-grid">
            {displayedProjects.length ? displayedProjects.map((project, index) => <ProjectCard project={project} index={index} onOpen={setSelectedProject} key={project.id} />) : (
              <div className={`project-empty-state archive-mode-${archiveMode}`}>
                <div className="archive-coordinate">ARCHIVE / 00</div>
                <div className="archive-scan" aria-hidden="true"><i /></div>
                <div className="archive-slots" aria-hidden="true"><i>01</i><i>02</i><i>03</i></div>
                <span>{publicProjectsQuery.isLoading ? "SYNCHRONIZING ARCHIVE" : `${selectedArchiveMode.label} / RELEASE BAY`}</span>
                <p>{publicProjectsQuery.isLoading ? "Calibrating the selected-work archive." : selectedArchiveMode.line}</p>
                <div className="archive-controls" role="tablist" aria-label="Archive interaction modes">
                  {archiveModes.map(mode => <button key={mode.id} type="button" role="tab" aria-selected={archiveMode === mode.id} className={archiveMode === mode.id ? "is-active" : ""} onClick={() => setArchiveMode(mode.id)} data-cursor={mode.label}>{mode.label}</button>)}
                </div>
                <a className="archive-console-link" href="/studio" data-cursor="CONSOLE" onMouseMove={moveMagnetic} onMouseLeave={resetMagnetic}>OPEN PROJECT CONSOLE <ArrowUpRight size={14} /></a>
                <small>LOCK / STANDBY / M-04</small>
              </div>
            )}
          </div>
          <div className="record-footer reveal">
            <span>{String(displayedProjects.length).padStart(2, "0")} PROJECT RECORDS</span>
            <p>Finished projects first. In-progress systems follow. Every record is sourced from Harshit Kumar’s portfolio data document.</p>
          </div>
          <BladeDivider />
        </section>

        <CredentialsSection />
        <EcosystemSection />
        <PersonalSignalSection />

        <section className="pit-stop" id="pit-stop">
          <div className="pit-stop-rail" aria-hidden="true"><span>05</span><i /></div>
          <div className="pit-stop-content reveal">
            <p className="contact-label">PIT STOP / START A CONVERSATION</p>
            <h2>Bring the hard<br />problem <em>closer.</em></h2>
            <p className="contact-copy">Open to collaborations, internships, and interesting conversations. {profile.location}.</p>
            <motion.a className="contact-link" href={`mailto:${profile.primaryEmail}`} whileHover={{ x: 8 }} whileTap={{ scale: 0.98 }}>
              <Mail size={20} strokeWidth={1.4} aria-hidden="true" />
              <span>{profile.primaryEmail}</span>
              <ArrowUpRight size={21} strokeWidth={1.4} aria-hidden="true" />
            </motion.a>
            <a className="contact-link contact-link-secondary" href={`mailto:${profile.secondaryEmail}`}>{profile.secondaryEmail}<ArrowUpRight size={16} /></a>
          </div>
          <div className="pit-stop-side reveal">
            <p>THE GARAGE IS OPEN</p>
            <div className="side-stats">
              <span><i /> AVAILABLE FOR SELECTED WORK</span>
              <span>RESPONSE WINDOW / 48H</span>
            </div>
            <div className="social-row" aria-label="Professional networks">
              <a href="https://github.com/mantisdarling" aria-label="GitHub"><Github size={20} /></a>
              <a href="https://github.com/XY-COMBINATOR" aria-label="XY-COMBINATOR GitHub Organization"><Github size={20} /></a>
              <a href="https://x.com/mantisxdarling" aria-label="X"><span className="social-x">X</span></a>
              <a href="https://bsky.app/profile/mantisdarling.bsky.social" aria-label="Bluesky"><Cloud size={20} /></a>
              <a href="https://g.dev/mantisdarling" aria-label="Google Developer Profile"><BadgeCheck size={20} /></a>
              <a href="https://forums.developer.nvidia.com" aria-label="NVIDIA Developer Forums"><Cloud size={20} /></a>
              <a href="https://www.linkedin.com/in/mantisdarling/" aria-label="LinkedIn"><Linkedin size={20} /></a>
              <a href="https://www.instagram.com/mantisdarling/" aria-label="Instagram"><Instagram size={20} /></a>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <motion.div className="project-dossier-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)}>
            <motion.article className="project-dossier" role="dialog" aria-modal="true" aria-label={`${selectedProject.title} project dossier`} initial={{ opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 28, scale: 0.98 }} transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }} onClick={event => event.stopPropagation()}>
              <button className="dossier-close" type="button" onClick={() => setSelectedProject(null)} aria-label="Close project dossier"><X size={19} /></button>
              <div className="dossier-visual">{selectedProject.imageUrl ? <img src={selectedProject.imageUrl} alt="" /> : <div className="dossier-fallback">M / PROJECT DOSSIER</div>}</div>
              <div className="dossier-content">
                <p>{selectedProject.category} / FIELD DOSSIER</p>
                <h2>{selectedProject.title}</h2>
                {selectedProject.tagline && <p className="dossier-tagline">{selectedProject.tagline}</p>}
                <div className="dossier-rule" aria-hidden="true" />
                <p className="dossier-description">{selectedProject.description}</p>
                {selectedProject.problem && <div className="dossier-brief"><p>PROBLEM IT SOLVES</p><span>{selectedProject.problem}</span></div>}
                {selectedProject.solution && <div className="dossier-brief"><p>SOLUTION</p><span>{selectedProject.solution}</span></div>}
                {selectedProject.highlights?.length ? <div className="dossier-highlights"><p>KEY HIGHLIGHTS</p>{selectedProject.highlights.map(highlight => <span key={highlight}>{highlight}</span>)}</div> : null}
                <div className="dossier-tags">{selectedProject.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <div className="dossier-actions">
                  {selectedProject.liveUrl && <a href={selectedProject.liveUrl}>OPEN LIVE PROJECT <ArrowUpRight size={16} /></a>}
                  {selectedProject.githubUrl && <a href={selectedProject.githubUrl}>OPEN GITHUB <ArrowUpRight size={16} /></a>}
                  {!selectedProject.liveUrl && !selectedProject.githubUrl && selectedProject.projectUrl && <a href={selectedProject.projectUrl}>OPEN PROJECT <ArrowUpRight size={16} /></a>}
                  <button type="button" onClick={() => setSelectedProject(null)}>RETURN TO TRACK</button>
                </div>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="site-footer">
        <a className="footer-brand" href="#top"><img src={ASSETS.mark} alt="" /><span className="brand-wordmark" aria-hidden="true"><b>MAN</b><i /><b>TIS</b></span></a>
        <span>© 2026 / BUILT WITH DISCIPLINE</span>
        <a href="#top">RETURN TO GRID <ArrowUpRight size={14} /></a>
      </footer>
    </div>
  );
}
