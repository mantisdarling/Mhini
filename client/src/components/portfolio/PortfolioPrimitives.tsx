import { ArrowUpRight, ChevronDown, Copy, Link2, Share2 } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ASSETS, safeExternalUrl, type DisplayProject } from "./model";

export function ExternalLink({
  href,
  children,
}: {
  href?: string | null;
  children: React.ReactNode;
}) {
  const safeHref = safeExternalUrl(href);
  if (!safeHref) return null;
  return (
    <a
      className="rebuild-link"
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export function SectionMarker({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <p className="rebuild-marker">
      <span>{number}</span>
      <i aria-hidden="true" />
      {label}
    </p>
  );
}

function projectShareUrl(project: DisplayProject) {
  if (typeof window === "undefined") return "https://mhini.vercel.app/#work";
  const url = new URL(window.location.href);
  url.hash = "work";
  return (
    safeExternalUrl(project.liveUrl ?? project.projectUrl) ?? url.toString()
  );
}

export function ProjectShareActions({ project }: { project: DisplayProject }) {
  const [feedback, setFeedback] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const feedbackTimer = useRef<number | null>(null);
  const feedbackRemoveTimer = useRef<number | null>(null);
  const title = project.title ?? project.name ?? "Mantis project";
  const shareUrl = projectShareUrl(project);
  const shareText = project.tagline ?? project.description;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title} by Mantis`);

  const clearFeedbackTimers = () => {
    if (feedbackTimer.current !== null)
      window.clearTimeout(feedbackTimer.current);
    if (feedbackRemoveTimer.current !== null)
      window.clearTimeout(feedbackRemoveTimer.current);
    feedbackTimer.current = null;
    feedbackRemoveTimer.current = null;
  };

  const showFeedback = (message: string) => {
    clearFeedbackTimers();
    setFeedback(message);
    setFeedbackVisible(true);
    feedbackTimer.current = window.setTimeout(() => {
      setFeedbackVisible(false);
      feedbackTimer.current = null;
      feedbackRemoveTimer.current = window.setTimeout(() => {
        setFeedback("");
        feedbackRemoveTimer.current = null;
      }, 240);
    }, 2200);
  };

  useEffect(() => () => clearFeedbackTimers(), []);

  const copyLink = async () => {
    if (!navigator.clipboard?.writeText) {
      showFeedback("Copy unavailable");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showFeedback("Link copied");
    } catch {
      showFeedback("Copy unavailable");
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, text: shareText, url: shareUrl });
      showFeedback("Shared");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showFeedback("Share unavailable");
    }
  };

  return (
    <div className="rebuild-share" aria-label={`Share ${title}`}>
      <span className="rebuild-share-label">SHARE THIS RECORD</span>
      <div className="rebuild-share-actions">
        <button
          className="rebuild-share-button"
          type="button"
          onClick={nativeShare}
          aria-label={`Share ${title}`}
        >
          <Share2 size={14} aria-hidden="true" />
          Share
        </button>
        <span className="rebuild-share-tooltip-wrap">
          <button
            className="rebuild-share-button rebuild-copy-link-button"
            type="button"
            onClick={copyLink}
            aria-label={`Copy link to ${title}`}
            aria-describedby={`copy-link-tooltip-${project.id}`}
          >
            <Link2 size={14} aria-hidden="true" />
            Copy link
          </button>
          <span
            className="rebuild-share-tooltip"
            id={`copy-link-tooltip-${project.id}`}
            role="tooltip"
          >
            Copy this project link
          </span>
        </span>
        <a
          className="rebuild-share-button"
          href={`https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
        <a
          className="rebuild-share-button"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </div>
      {feedback && (
        <div
          className={`rebuild-share-toast${feedbackVisible ? " is-visible" : ""}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <i aria-hidden="true" />
          {feedback}
        </div>
      )}
    </div>
  );
}

export function FooterCopyLink() {
  const [feedback, setFeedback] = useState("");
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const feedbackTimer = useRef<number | null>(null);
  const feedbackRemoveTimer = useRef<number | null>(null);

  const clearFeedbackTimers = () => {
    if (feedbackTimer.current !== null)
      window.clearTimeout(feedbackTimer.current);
    if (feedbackRemoveTimer.current !== null)
      window.clearTimeout(feedbackRemoveTimer.current);
    feedbackTimer.current = null;
    feedbackRemoveTimer.current = null;
  };

  const showFeedback = (message: string) => {
    clearFeedbackTimers();
    setFeedback(message);
    setFeedbackVisible(true);
    feedbackTimer.current = window.setTimeout(() => {
      setFeedbackVisible(false);
      feedbackTimer.current = null;
      feedbackRemoveTimer.current = window.setTimeout(() => {
        setFeedback("");
        feedbackRemoveTimer.current = null;
      }, 240);
    }, 2200);
  };

  useEffect(() => () => clearFeedbackTimers(), []);

  const copyLink = async () => {
    if (!navigator.clipboard?.writeText) {
      showFeedback("Copy unavailable");
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      showFeedback("Link copied");
    } catch {
      showFeedback("Copy unavailable");
    }
  };

  return (
    <span className="rebuild-footer-copy-wrap">
      <button
        className="rebuild-footer-copy"
        type="button"
        onClick={copyLink}
        aria-label="Copy the Mantis website link"
        title="Copy website link"
      >
        <Copy size={14} aria-hidden="true" />
        Copy link
      </button>
      {feedback && (
        <span
          className={`rebuild-footer-copy-toast ${feedback === "Link copied" ? "is-success" : "is-error"}${feedbackVisible ? " is-visible" : ""}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <i className="rebuild-footer-copy-toast-mark" aria-hidden="true" />
          {feedback}
        </span>
      )}
    </span>
  );
}

export function ResponsiveImage({
  src,
  mobileSrc,
  alt = "",
  className = "",
  loading = "lazy",
  fetchPriority = "auto",
}: {
  src: string;
  mobileSrc?: string;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [mobileFailed, setMobileFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setMobileFailed(false);
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, [src, mobileSrc]);

  return (
    <picture
      className={`portfolio-image-shell ${loaded ? "is-loaded" : "is-loading"}`}
      aria-busy={!loaded}
    >
      {mobileSrc && !mobileFailed && (
        <source media="(max-width: 800px)" srcSet={mobileSrc} />
      )}
      <img
        ref={imageRef}
        className={`mobile-image-reveal ${className} ${loaded ? "is-loaded" : ""}`.trim()}
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (mobileSrc && !mobileFailed) {
            setMobileFailed(true);
            setLoaded(false);
          } else {
            setLoaded(true);
          }
        }}
      />
    </picture>
  );
}

export function ProjectCardSkeleton() {
  return (
    <article
      className="rebuild-project-card rebuild-project-card-skeleton"
      aria-hidden="true"
    >
      <div className="rebuild-project-visual rebuild-skeleton-surface">
        <span className="rebuild-skeleton-index" />
        <span className="rebuild-skeleton-corner" />
      </div>
      <div className="rebuild-project-copy">
        <div className="rebuild-project-meta">
          <span className="rebuild-skeleton-line rebuild-skeleton-meta" />
          <span className="rebuild-skeleton-line rebuild-skeleton-meta rebuild-skeleton-meta-short" />
        </div>
        <span className="rebuild-skeleton-line rebuild-skeleton-title" />
        <span className="rebuild-skeleton-line rebuild-skeleton-copy" />
      </div>
    </article>
  );
}

export function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: DisplayProject;
  index: number;
  onOpen: (project: DisplayProject) => void;
}) {
  const title = project.title ?? project.name ?? "Untitled project";
  const projectMeta = project.role
    ? `${project.status ?? "Project"} / ${project.role}`
    : (project.status ?? "Project");
  const open = () => onOpen(project);
  return (
    <article
      className={`rebuild-project-card ${index === 0 ? "is-featured" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`Open project dossier for ${title}`}
      onClick={open}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
    >
      <div className="rebuild-project-visual">
        <ResponsiveImage
          src={project.imageUrl ?? ASSETS.caseStudy}
          mobileSrc={project.mobileImageUrl ?? ASSETS.story.mobile.caseStudy}
          className="rebuild-project-image"
        />
        <div className="rebuild-project-overlay" aria-hidden="true" />
        <span className="rebuild-project-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rebuild-project-open">
          Open dossier <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </div>
      <div className="rebuild-project-copy" data-text-reveal>
        <div className="rebuild-project-meta">
          <span>{projectMeta}</span>
          <span>{project.tags.slice(0, 3).join(" / ")}</span>
        </div>
        <h3>{title}</h3>
        {project.tagline && <p>{project.tagline}</p>}
      </div>
    </article>
  );
}

export function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rebuild-detail-block">
      <p>{label}</p>
      <div>{children}</div>
    </div>
  );
}

export function SceneBackdrop({
  src,
  mobileSrc,
  alt = "",
}: {
  src: string;
  mobileSrc?: string;
  alt?: string;
}) {
  return (
    <div className="cinematic-scene-backdrop" aria-hidden="true">
      <ResponsiveImage src={src} mobileSrc={mobileSrc} alt={alt} />
    </div>
  );
}

function useCompactViewport() {
  const [isCompact, setIsCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 800px)").matches === true
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(max-width: 800px)");
    const update = () => setIsCompact(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return isCompact;
}

export function VideoBackdrop({
  src,
  fallbackSrc,
  mobileFallbackSrc,
  poster,
  mobilePoster,
  preload = "auto",
}: {
  src: string;
  fallbackSrc?: string;
  mobileFallbackSrc?: string;
  poster?: string;
  mobilePoster?: string;
  preload?: "auto" | "metadata" | "none";
}) {
  const isCompact = useCompactViewport();
  const activePoster = isCompact ? (mobilePoster ?? poster) : poster;
  return (
    <div className="cinematic-video-backdrop" aria-hidden="true">
      {fallbackSrc && (
        <ResponsiveImage
          src={fallbackSrc}
          mobileSrc={mobileFallbackSrc}
          loading="eager"
          fetchPriority={preload === "auto" ? "high" : "auto"}
        />
      )}
      <video
        src={src}
        {...(activePoster ? { poster: activePoster } : {})}
        autoPlay
        muted
        loop
        playsInline
        preload={preload}
      />
      <span />
    </div>
  );
}

export function StoryScene({
  src,
  mobileSrc,
  label,
  title,
}: {
  src: string;
  mobileSrc: string;
  label: string;
  title: string;
}) {
  return (
    <article className="cinematic-story-scene">
      <ResponsiveImage
        src={src}
        mobileSrc={mobileSrc}
        className="cinematic-story-image"
      />
      <span data-text-reveal>{label}</span>
      <h3 data-text-reveal="delayed">{title}</h3>
    </article>
  );
}

export function EvidenceDossier({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const panelInnerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panelInner = panelInnerRef.current;
    if (!panelInner) return;
    let measuredHeight = 0;
    let frame = 0;
    const applyHeight = (height: number) => {
      const nextHeight = Math.ceil(height);
      if (nextHeight === measuredHeight) return;
      measuredHeight = nextHeight;
      setPanelHeight(nextHeight);
    };
    const measureNow = () =>
      applyHeight(panelInner.getBoundingClientRect().height);
    let pendingHeight: number | undefined;
    const queueMeasure = (entries: ResizeObserverEntry[]) => {
      pendingHeight = entries[0]?.contentRect.height;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const nextHeight = pendingHeight;
        pendingHeight = undefined;
        if (typeof nextHeight === "number") applyHeight(nextHeight);
        else measureNow();
      });
    };

    measureNow();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(queueMeasure);
    observer.observe(panelInner);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className={`rebuild-dossier ${open ? "is-open" : ""}`}>
      <h3 className="rebuild-dossier-heading">
        <button
          id={`${id}-summary`}
          className="rebuild-dossier-summary"
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(value => !value)}
        >
          <span>{title}</span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        className="rebuild-dossier-panel"
        role="region"
        aria-labelledby={`${id}-summary`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
        style={{ maxHeight: open ? panelHeight : 0 }}
      >
        <div ref={panelInnerRef} className="rebuild-dossier-panel-inner">
          {children}
        </div>
      </div>
    </section>
  );
}
