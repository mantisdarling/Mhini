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
  projects as projectRecords,
  technologyGroups,
  vision,
  writing,
} from "@/data/profileData";
import { ArrowUpRight, Award, BookOpen, BrainCircuit, GraduationCap, Network, Orbit, ShieldCheck, Users } from "lucide-react";

function SignalHeading({ index, label, title, accent }: { index: string; label: string; title: string; accent: string }) {
  return (
    <header className="data-section-heading reveal">
      <div><span>{index}</span><i />{label}</div>
      <h2>{title}<em>{accent}</em></h2>
    </header>
  );
}

function ExternalLink({ url, children }: { url?: string; children: React.ReactNode }) {
  if (!url) return null;
  return <a href={url} className="data-external">{children}<ArrowUpRight size={14} /></a>;
}

export function ProfileIdentitySection() {
  const liveProjects = projectRecords.filter(project => project.status === "Live").length;
  const inProgressProjects = projectRecords.filter(project => project.status === "In Progress").length;
  return (
    <>
      <section className="data-section identity-section section-pad" id="identity">
        <SignalHeading index="01" label="IDENTITY / OPERATING SYSTEM" title="Built across the" accent="whole stack." />
        <div className="identity-layout">
          <div className="identity-side reveal"><BrainCircuit size={28} /><p>{profile.fullName}</p><small>{profile.oneLineBio}</small><div className="identity-link-list">{profile.links.map(link => <a key={link.label} href={link.url}>{link.label}<ArrowUpRight size={12} /></a>)}</div></div>
          <div className="identity-copy reveal"><div className="identity-record"><p>{profile.headline}</p><p>{profile.linkedInHeadline}</p><p>{profile.xBio}</p><p>{profile.microBio}</p></div>{profile.fullBio.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <section className="systems-index section-pad" aria-label="AI systems field index">
        <div className="systems-index-intro reveal"><p>FIELD INDEX / 2026</p><h2>Serious systems<br />leave <em>evidence.</em></h2><span>{profile.positioning}</span></div>
        <div className="systems-index-grid">
          <article className="systems-index-card reveal"><strong>{String(liveProjects).padStart(2, "0")}</strong><span>LIVE SYSTEMS</span><p>Finished projects currently available in the field.</p></article>
          <article className="systems-index-card reveal"><strong>{String(inProgressProjects).padStart(2, "0")}</strong><span>IN DEVELOPMENT</span><p>AI systems moving through active build cycles.</p></article>
          <article className="systems-index-card reveal"><strong>{String(credentials.length).padStart(2, "0")}</strong><span>CREDENTIALS</span><p>Active and completed technical credentials.</p></article>
          <article className="systems-index-card reveal"><strong>{String(memberships.length).padStart(2, "0")}</strong><span>MEMBERSHIPS</span><p>Developer communities and global campus networks.</p></article>
        </div>
      </section>

      <section className="data-section education-section section-pad" id="education">
        <SignalHeading index="02" label="EDUCATION" title="Learning in" accent="public." />
        <div className="education-grid">
          {education.map((entry, index) => <article className="education-card reveal" key={entry.degree}>
            <span>0{index + 1}</span><GraduationCap size={22} />
            <p className="data-status">{entry.status}</p>
            <h3>{entry.degree}</h3>{entry.degree === "BA in Industrial Relations and Personnel Management" ? null : <p className="education-institution">{entry.institution}</p>}<p className="education-date">{entry.dates}</p>
            {entry.focusAreas && <p className="education-focus">{entry.focusAreas}</p>}<p className="education-note">{entry.note}</p>
          </article>)}
        </div>
      </section>
    </>
  );
}

export function TechnologySection() {
  return <section className="data-section technology-section section-pad" id="technology">
    <SignalHeading index="03" label="TECHNOLOGIES I'VE WORKED WITH" title="Tools are" accent="judgment." />
    <div className="technology-grid">
      {technologyGroups.map((group, index) => <article className="technology-group reveal" key={group.category}>
        <div><span>{String(index + 1).padStart(2, "0")}</span><h3>{group.category}</h3></div>
        <div className="technology-chips">{group.items.map(item => <span key={item}>{item}</span>)}</div>
      </article>)}
    </div>
  </section>;
}

export function CredentialsSection() {
  return <section className="data-section credentials-section section-pad" id="credentials">
    <SignalHeading index="05" label="CREDENTIALS / LEARNING" title="Training for" accent="the field." />
    <div className="credential-grid">
      {credentials.map((credential, index) => <article className="credential-card reveal" key={credential.name}>
        <div className="credential-index"><Award size={17} /><span>0{index + 1}</span></div><p className="data-status">{credential.status}</p>
        <h3>{credential.name}</h3><p className="credential-issuer">{credential.issuer}{"date" in credential && credential.date ? ` / ${credential.date}` : ""}</p><p>{credential.description}</p><p className="credential-skills">{credential.skills}</p>
        {"credentialId" in credential && credential.credentialId ? <small>CREDENTIAL ID / {credential.credentialId}</small> : null}<ExternalLink url={credential.url}>VIEW CREDENTIAL</ExternalLink>
      </article>)}
    </div>
    <div className="course-stack">
      <div className="course-stack-label reveal"><BookOpen size={20} /><p>COURSES AND LEARNING</p></div>
      {courses.map((course, index) => <article className="course-row reveal" key={course.name}>
        <span>{String(index + 1).padStart(2, "0")}</span><div><p className="data-status">{course.status}</p><h3>{course.name}</h3><p>{course.provider} / {course.subject}</p></div><div className="course-description">{course.description}</div><ExternalLink url={"url" in course ? course.url : undefined}>OPEN</ExternalLink>
      </article>)}
    </div>
  </section>;
}

export function EcosystemSection() {
  return <>
    <section className="data-section ecosystem-section section-pad" id="network">
      <SignalHeading index="06" label="OPEN SOURCE / COMMUNITY" title="Build with" accent="others." />
      <div className="open-source-list">
        {openSource.map((entry, index) => <article className="open-source-row reveal" key={entry.name}><span>{String(index + 1).padStart(2, "0")}</span><div><p className="data-status">{entry.role}</p><h3>{entry.name}</h3><p>{entry.description}</p><ExternalLink url={"url" in entry ? entry.url : undefined}>OPEN SOURCE</ExternalLink></div></article>)}
      </div>
      <div className="membership-head reveal"><Users size={20} /><p>COMMUNITY AND MEMBERSHIPS</p></div>
      <div className="membership-grid">
        {memberships.map((entry, index) => <article className="membership-card reveal" key={entry.organization}><span>{String(index + 1).padStart(2, "0")}</span><p className="data-status">{entry.role}</p><h3>{entry.organization}</h3>{"location" in entry && entry.location ? <p className="membership-location">{entry.location}</p> : null}{"description" in entry && entry.description ? <p>{entry.description}</p> : null}<ExternalLink url={"url" in entry ? entry.url : undefined}>VISIT</ExternalLink></article>)}
      </div>
    </section>

    <section className="data-section research-section section-pad" id="research">
      <SignalHeading index="07" label="RESEARCH / COMPETITION" title="Think in" accent="systems." />
      <article className="writing-card reveal"><div><Orbit size={23} /><p className="data-status">{writing.platform}</p><h3>{writing.title}</h3><p>{writing.description}</p><ExternalLink url={writing.url}>READ THE ARTICLE</ExternalLink></div></article>
      <div className="hackathon-grid">{hackathons.map((item, index) => <article className="hackathon-card reveal" key={item.name}><span>{String(index + 1).padStart(2, "0")}</span><p className="data-status">{item.status}</p><h3>{item.name}</h3>{"organizer" in item && item.organizer ? <p className="hackathon-organizer">{item.organizer}</p> : null}<p>{item.description}</p></article>)}</div>
    </section>
  </>;
}

export function PersonalSignalSection() {
  return <section className="data-section personal-signal section-pad" id="vision">
    <SignalHeading index="08" label="LANGUAGE / VISION" title="Ship at" accent="every layer." />
    <div className="personal-grid">
      <article className="signal-list reveal"><Network size={22} /><h3>LANGUAGES</h3>{languages.map(item => <p key={item}>{item}</p>)}<h3 className="signal-subtitle">INTERESTS AND HOBBIES</h3>{interests.map(item => <p key={item}>{item}</p>)}</article>
      <article className="vision-card reveal"><ShieldCheck size={23} /><p className="data-status">CORE POSITIONING</p><h3>{vision.core}</h3><p className="vision-message">{vision.landingMessage}</p><div className="goal-columns"><div><p>SHORT TERM GOALS</p>{vision.shortTerm.map(goal => <span key={goal}>{goal}</span>)}</div><div><p>LONG TERM VISION</p>{vision.longTerm.map(goal => <span key={goal}>{goal}</span>)}</div></div></article>
    </div>
  </section>;
}
