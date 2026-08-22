import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import {
  credentials,
  courses,
  education,
  hackathons,
  interests,
  languages,
  memberships,
  openSource,
  profile,
  projects as profileProjects,
  technologyGroups,
  vision,
  writing,
} from "@/data/profileData";
import { ArrowUpRight, Check, ChevronDown, Github, Instagram, Linkedin, Mail, Menu, X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStoryParallax } from "@/hooks/useStoryParallax";

type DisplayProject = {
  id: string | number;
  title?: string;
  name?: string;
  category?: string;
  status?: string;
  role?: string;
  description: string;
  imageUrl?: string | null;
  projectUrl?: string | null;
  tags: string[];
  tagline?: string;
  problem?: string;
  solution?: string;
  highlights?: string[];
  githubUrl?: string;
  liveUrl?: string;
};

const ASSETS = {
  hero: import.meta.env.VITE_HERO_ASSET_URL || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/LzfUFsJmwAEdqRuc.jpg",
  mark: import.meta.env.VITE_MARK_ASSET_URL || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663723812308/UymLNLvVjhliLKJj.png",
  caseStudy: "/manus-storage/mantis-samurai-case-study-cover_5c9adaba.webp",
  story: {
    motion: "/manus-storage/1000237115_8b0e09c1.jpg",
    blade: "/manus-storage/1000237109_816dcef4.jpg",
    descent: "/manus-storage/1000237108_5000beb5.jpg",
    stillness: "/manus-storage/1000237111_401cecb1.jpg",
    finalFrame: "/manus-storage/1000237112_a359eaa2.jpg",
  },
};

const resumeProjects: DisplayProject[] = profileProjects.map((project, index) => ({
  ...project,
  id: project.id,
  title: project.name,
  category: project.role ? `${project.status} / ${project.role}` : project.status,
  imageUrl: index === 0 ? ASSETS.caseStudy : null,
  projectUrl: project.liveUrl ?? project.githubUrl ?? null,
  tags: [...project.technologies],
}));

const navItems = [
  ["Work", "work"],
  ["Profile", "profile"],
  ["Stack", "stack"],
  ["Evidence", "evidence"],
  ["Contact", "contact"],
] as const;

function ExternalLink({ href, children }: { href?: string | null; children: React.ReactNode }) {
  if (!href) return null;
  return <a className="rebuild-link" href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /></a>;
}

function SectionMarker({ number, label }: { number: string; label: string }) {
  return <p className="rebuild-marker"><span>{number}</span><i aria-hidden="true" />{label}</p>;
}

function SamuraiMark() {
  return (
    <svg className="rebuild-samurai" viewBox="0 0 360 560" aria-hidden="true" focusable="false">
      <circle className="samurai-sun" cx="250" cy="175" r="115" />
      <path className="samurai-body" d="M235 78c26 8 43 31 43 58 0 17-7 32-20 43 26 20 46 48 57 82l22 69-28 10-33-68 16 107 38 91-50 22-43-95-10 76 38 92-67 9-26-104-6 99-61-4 15-126 27-82 6-69c-18 8-34 25-48 49l-27-15 28-52c16-28 37-49 63-63-10-12-16-27-16-45 0-32 23-59 54-65l24-27 10 28z" />
      <path className="samurai-armor" d="M129 222c26-25 58-37 96-37 32 0 62 11 87 31l-18 43-71-11-73 17zm-10 62 72-19 77 15-5 32-77 12-72-15zm7 63 59-11 74 9 9 49-80 14-65-16z" />
      <path className="samurai-helmet" d="M165 107c12-32 39-51 70-51 29 0 53 14 67 40l-18 18-16-13-3 31-75 5-3-24-16 11z" />
      <path className="samurai-blade" d="m177 281 183-188 2 11-166 217z" />
      <path className="samurai-hilt" d="m161 277 34 31-16 17-34-31z" />
      <path className="samurai-rim" d="M235 78c26 8 43 31 43 58 0 17-7 32-20 43 26 20 46 48 57 82l22 69" />
    </svg>
  );
}

function ProjectCard({ project, index, onOpen }: { project: DisplayProject; index: number; onOpen: (project: DisplayProject) => void }) {
  const title = project.title ?? project.name ?? "Untitled project";
  return (
    <article
      className={`rebuild-project-card ${index === 0 ? "is-featured" : ""}`}
      tabIndex={0}
      role="button"
      aria-label={`Open project dossier for ${title}`}
      onClick={() => onOpen(project)}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(project);
        }
      }}
    >
      <div className="rebuild-project-visual">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt="" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = ASSETS.hero; }} />
        ) : (
          <div className="rebuild-project-placeholder" aria-hidden="true"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
        )}
        <div className="rebuild-project-grid" aria-hidden="true" />
        <span className="rebuild-project-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="rebuild-project-open">Open dossier <ArrowUpRight size={15} aria-hidden="true" /></span>
      </div>
      <div className="rebuild-project-copy">
        <div className="rebuild-project-meta"><span>{project.status ?? project.category ?? "Project"}</span><span>{project.tags.slice(0, 3).join(" / ")}</span></div>
        <h3>{title}</h3>
        {project.tagline && <p>{project.tagline}</p>}
      </div>
    </article>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rebuild-detail-block"><p>{label}</p><div>{children}</div></div>;
}

export default function Home() {
  const publicProjectsQuery = trpc.projects.listPublic.useQuery();
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const storyRef = useRef<HTMLElement>(null);
  useStoryParallax(storyRef);
  const displayedProjects = useMemo<DisplayProject[]>(() => [...resumeProjects, ...(publicProjectsQuery.data ?? [])], [publicProjectsQuery.data]);

  useEffect(() => {
    document.body.classList.add("rebuild-body");
    return () => document.body.classList.remove("rebuild-body");
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedProject]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div className="rebuild-site">
      <header className="rebuild-header">
        <button className="rebuild-brand" type="button" onClick={() => scrollTo("top")} aria-label="Return to the top of Mantis">
          <img src={ASSETS.mark} alt="" />
          <span>MANTIS</span>
        </button>
        <nav className={`rebuild-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map(([label, id], index) => <button type="button" key={id} onClick={() => scrollTo(id)}><span>0{index + 1}</span>{label}</button>)}
        </nav>
        <button className="rebuild-menu" type="button" onClick={() => setMenuOpen(open => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <main>
        <section className="rebuild-hero" id="top">
          <div className="rebuild-hero-grid" aria-hidden="true" />
          <div className="rebuild-hero-copy">
            <SectionMarker number="00" label="AI SYSTEMS BUILDER / IIT MADRAS" />
            <p className="rebuild-kicker">I GO DEEP. THEN I BUILD.</p>
            <h1>Harshit<br /><em>Kumar</em></h1>
            <p className="rebuild-lede">{profile.oneLineBio}</p>
            <div className="rebuild-hero-actions"><button className="rebuild-primary" type="button" onClick={() => scrollTo("work")}>See the work <ArrowUpRight size={17} aria-hidden="true" /></button><a className="rebuild-secondary" href={`mailto:${profile.secondaryEmail}`}>Start a conversation</a></div>
            <div className="rebuild-hero-proof"><span><b>01</b> MANTIS / FOUNDER</span><span><b>02</b> IIT MADRAS / CS</span><span><b>03</b> AI / SYSTEMS</span></div>
          </div>
          <div className="rebuild-hero-art" aria-hidden="true"><div className="rebuild-sun" /><SamuraiMark /><div className="rebuild-art-label">DISCIPLINE / PRECISION / PACE</div></div>
          <div className="rebuild-hero-foot"><span>SCROLL TO READ</span><i aria-hidden="true" /></div>
        </section>

        <section className="rebuild-intro" id="profile">
          <div className="rebuild-section-lead"><SectionMarker number="01" label="PROFILE" /><h2>Not a portfolio.<br /><em>A working record.</em></h2></div>
          <div className="rebuild-intro-body"><p className="rebuild-statement">{profile.positioning}</p><p>{profile.shortBio}</p><details className="rebuild-disclosure"><summary>Read the full profile <ChevronDown size={16} aria-hidden="true" /></summary><div>{profile.fullBio.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></details><div className="rebuild-links">{profile.links.map(link => <ExternalLink href={link.url} key={link.label}>{link.label}</ExternalLink>)}</div></div>
        </section>

        <section className="rebuild-story" ref={storyRef} aria-label="Mantis visual story">
          <div className="rebuild-story-intro"><SectionMarker number="01A" label="THE FIELD NOTE" /><h2>Enter through<br /><em>the image.</em></h2><p>A visual interlude for the discipline behind the work. The first reference opens the motion study externally, while the stills remain lightweight and readable inside the page.</p></div>
          <div className="rebuild-story-grid">
            <a className="rebuild-story-frame rebuild-story-motion" href="https://pin.it/1uzOHjzz9" target="_blank" rel="noreferrer"><img data-parallax src={ASSETS.story.motion} alt="Samurai figure standing in a misty landscape" loading="lazy" /><span>OPEN MOTION STUDY <ArrowUpRight size={15} aria-hidden="true" /></span></a>
            <figure className="rebuild-story-frame rebuild-story-blade"><img data-parallax src={ASSETS.story.blade} alt="Katana arranged on a quiet neutral field" loading="lazy" /><figcaption>01 / EDGE / A precise line is enough.</figcaption></figure>
            <figure className="rebuild-story-frame rebuild-story-descent"><img data-parallax src={ASSETS.story.descent} alt="Figure carrying a katana through dense leaves" loading="lazy" /><figcaption>02 / DEPTH / Go lower than the obvious layer.</figcaption></figure>
            <figure className="rebuild-story-frame rebuild-story-stillness"><img data-parallax src={ASSETS.story.stillness} alt="Overgrown house and quiet road in a deep green landscape" loading="lazy" /><figcaption>03 / SYSTEM / Let the environment carry the weight.</figcaption></figure>
          </div>
        </section>

        <section className="rebuild-work" id="work">
          <div className="rebuild-section-heading"><div><SectionMarker number="02" label="SELECTED WORK" /><h2>Proof,<br /><em>not promises.</em></h2></div><p>{displayedProjects.length} project records. Real links, real constraints, real systems.</p></div>
          <div className="rebuild-project-grid">{displayedProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={setSelectedProject} />)}</div>
        </section>

        <section className="rebuild-stack" id="stack">
          <div className="rebuild-section-heading"><div><SectionMarker number="03" label="THE STACK" /><h2>Tools are<br /><em>judgment.</em></h2></div><p>Every technology below is retained from the working record. Open a category to scan the full field.</p></div>
          <div className="rebuild-stack-list">{technologyGroups.map((group, index) => <div className={`rebuild-stack-row ${expandedGroup === group.category ? "is-open" : ""}`} key={group.category}><button type="button" onClick={() => setExpandedGroup(expandedGroup === group.category ? null : group.category)} aria-expanded={expandedGroup === group.category}><span>0{index + 1}</span><strong>{group.category}</strong><ChevronDown size={19} aria-hidden="true" /></button><div className="rebuild-chip-list">{group.items.map(item => <span key={item}>{item}</span>)}</div></div>)}</div>
        </section>

        <section className="rebuild-evidence" id="evidence">
          <div className="rebuild-section-heading"><div><SectionMarker number="04" label="EVIDENCE" /><h2>Depth<br /><em>over noise.</em></h2></div><p>Education, credentials, courses, communities, research, and the long view. Nothing omitted, just organized.</p></div>
          <div className="rebuild-evidence-grid">
            <div className="rebuild-evidence-column"><h3>Education</h3>{education.map(item => <article className="rebuild-record" key={item.degree}><div><span>{item.status}</span><b>{item.degree}</b><small>{item.institution}</small></div><p>{item.dates}<br />{item.note}</p></article>)}</div>
            <div className="rebuild-evidence-column"><h3>Credentials</h3>{credentials.map(item => <article className="rebuild-record" key={item.name}><div><span>{item.status}</span><b>{item.name}</b><small>{item.issuer}{"date" in item && item.date ? ` / ${item.date}` : ""}</small></div><ExternalLink href={item.url}>View</ExternalLink></article>)}</div>
          </div>
          <div className="rebuild-dossier-grid">
            <details className="rebuild-dossier" open><summary>Courses and learning <ChevronDown size={17} aria-hidden="true" /></summary><div>{courses.map(item => <article key={item.name}><span>{item.status}</span><b>{item.name}</b><small>{item.provider} / {item.subject}</small><p>{item.description}</p><ExternalLink href={"url" in item ? item.url : undefined}>Open course</ExternalLink></article>)}</div></details>
            <details className="rebuild-dossier"><summary>Open source and community <ChevronDown size={17} aria-hidden="true" /></summary><div>{[...openSource.map(item => ({ title: item.name, meta: item.role, body: item.description, url: "url" in item ? item.url : undefined })), ...memberships.map(item => ({ title: item.organization, meta: item.role, body: "description" in item ? item.description : item.location, url: "url" in item ? item.url : undefined }))].map(item => <article key={item.title}><span>{item.meta}</span><b>{item.title}</b><p>{item.body}</p><ExternalLink href={item.url}>Visit record</ExternalLink></article>)}</div></details>
            <details className="rebuild-dossier"><summary>Research and competition <ChevronDown size={17} aria-hidden="true" /></summary><div><article><span>{writing.platform}</span><b>{writing.title}</b><p>{writing.description}</p><ExternalLink href={writing.url}>Read article</ExternalLink></article>{hackathons.map(item => <article key={item.name}><span>{item.status}{"organizer" in item && item.organizer ? ` / ${item.organizer}` : ""}</span><b>{item.name}</b><p>{item.description}</p></article>)}</div></details>
            <details className="rebuild-dossier"><summary>Life outside the stack <ChevronDown size={17} aria-hidden="true" /></summary><div><article><span>Languages</span><p>{languages.join(" / ")}</p></article><article><span>Interests and hobbies</span><p>{interests.join(" / ")}</p></article><article><span>Core positioning</span><b>{vision.core}</b><p>{vision.landingMessage}</p></article><article><span>Short term goals</span>{vision.shortTerm.map(item => <p key={item}>{item}</p>)}</article><article><span>Long term vision</span>{vision.longTerm.map(item => <p key={item}>{item}</p>)}</article></div></details>
          </div>
        </section>

        <section className="rebuild-finale" aria-label="Closing motion and image chapter">
          <div className="rebuild-finale-copy"><SectionMarker number="05A" label="CLOSING MOTION" /><h2>Let the<br /><em>frame breathe.</em></h2><p>The story ends in motion. The Pinterest player is embedded in the page so the closing reference can be watched without leaving the experience.</p><a className="rebuild-source-link" href="https://pin.it/1uzOHjzz9" target="_blank" rel="noreferrer">Open source pin <ArrowUpRight size={14} aria-hidden="true" /></a></div>
          <div className="rebuild-finale-media"><div className="rebuild-final-still"><img src={ASSETS.story.finalFrame} alt="Black and white mountain landscape with a lone tree and waterfalls" loading="lazy" /></div><div className="rebuild-inline-video"><iframe title="Mantis closing samurai motion study" src="https://assets.pinterest.com/ext/embed.html?id=544865254939654931" loading="lazy" allow="autoplay; fullscreen" referrerPolicy="strict-origin-when-cross-origin" /><p className="rebuild-video-fallback">If the player is unavailable, <a href="https://pin.it/1uzOHjzz9" target="_blank" rel="noreferrer">open the motion study</a>.</p></div></div>
        </section>

        <section className="rebuild-contact" id="contact">
          <div><SectionMarker number="05" label="CONTACT" /><h2>Bring the hard<br /><em>problem closer.</em></h2><p>{profile.fullName} is open to collaborations, internships, and interesting conversations from {profile.location}.</p></div>
          <div className="rebuild-contact-card"><span>THE GARAGE IS OPEN</span><a href={`mailto:${profile.primaryEmail}`}><Mail size={19} aria-hidden="true" />{profile.primaryEmail}<ArrowUpRight size={17} aria-hidden="true" /></a><a href={`mailto:${profile.secondaryEmail}`}>{profile.secondaryEmail}<ArrowUpRight size={15} aria-hidden="true" /></a><div className="rebuild-socials"><a href="https://github.com/mantisdarling" aria-label="GitHub"><Github size={18} /></a><a href="https://x.com/mantisxdarling" aria-label="X">X</a><a href="https://www.linkedin.com/in/mantisdarling/" aria-label="LinkedIn"><Linkedin size={18} /></a><a href="https://www.instagram.com/mantisdarling/" aria-label="Instagram"><Instagram size={18} /></a><span><Check size={15} aria-hidden="true" /> AVAILABLE FOR SELECTED WORK</span></div></div>
        </section>
      </main>

      <footer className="rebuild-footer"><span>© 2026 MANTIS / BUILT WITH DISCIPLINE</span><span>HARSHIT KUMAR / EAST INDIA</span><a href="#top">RETURN TO TOP <ArrowUpRight size={14} aria-hidden="true" /></a></footer>

      <AnimatePresence>
        {selectedProject && <motion.div className="rebuild-modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProject(null)}><motion.article className="rebuild-modal" role="dialog" aria-modal="true" aria-label={`${selectedProject.title ?? selectedProject.name ?? "Project"} dossier`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} onClick={event => event.stopPropagation()}><button className="rebuild-modal-close" type="button" onClick={() => setSelectedProject(null)} aria-label="Close project dossier"><X size={20} /></button><div className="rebuild-modal-visual">{selectedProject.imageUrl ? <img src={selectedProject.imageUrl} alt="" /> : <div className="rebuild-project-placeholder"><span>PROJECT DOSSIER</span><i /></div>}</div><div className="rebuild-modal-content"><SectionMarker number="DOSSIER" label={selectedProject.status ?? "PROJECT"} /><h2>{selectedProject.title ?? selectedProject.name}</h2>{selectedProject.tagline && <p className="rebuild-modal-tagline">{selectedProject.tagline}</p>}<p className="rebuild-modal-description">{selectedProject.description}</p>{selectedProject.problem && <DetailBlock label="Problem">{selectedProject.problem}</DetailBlock>}{selectedProject.solution && <DetailBlock label="Solution">{selectedProject.solution}</DetailBlock>}{selectedProject.highlights?.length ? <DetailBlock label="Highlights"><ul>{selectedProject.highlights.map(item => <li key={item}>{item}</li>)}</ul></DetailBlock> : null}<div className="rebuild-modal-tags">{selectedProject.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="rebuild-modal-actions"><ExternalLink href={selectedProject.liveUrl ?? selectedProject.projectUrl}>Open live project</ExternalLink><ExternalLink href={selectedProject.githubUrl}>View source</ExternalLink></div></div></motion.article></motion.div>}
      </AnimatePresence>
    </div>
  );
}
