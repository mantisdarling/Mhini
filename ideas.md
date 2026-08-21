# Mantis Portfolio — Design Direction

## Three Possible Approaches

### 1. Kinetic Bushido Instrument Panel
**Very Brief Intro:** A cinematic portfolio treated as a disciplined performance machine: asymmetric type, blade-thin geometry, and restrained telemetry. It fuses the composure of bushido with the deliberate force of a race-start sequence.

**Probability:** 0.07

### 2. Wabi-Sabi Workshop
**Very Brief Intro:** A softer editorial system shaped by handmade paper, ink bleed, and quiet archival photography, with only occasional technical measurement marks. It would feel reflective, tactile, and deliberately imperfect.

**Probability:** 0.04

### 3. Grand Prix Atelier
**Very Brief Intro:** A gallery-like typographic composition using editorial ivory fields, lacquered red planes, and elegant motorsport ephemera. It puts luxury publishing before raw technical instrumentation.

**Probability:** 0.08

---

## Chosen Approach — Kinetic Bushido Instrument Panel

### Design Movement
**Cinematic brutalism meets Japanese precision engineering.** The site is informed by the decisive, economical rhythm of a katana draw and the legibility of Formula 1 telemetry rather than literal historical or automotive illustration.

### Core Principles
1. **Controlled velocity:** Motion is intentional, quick to commit, and never ornamental.
2. **Negative space as tension:** Large dark fields create room for type, telemetry, and a single decisive accent.
3. **Instrumental hierarchy:** Information is framed as performance data, using strict alignment, code-like labels, and drawn blade-line rules.
4. **Material restraint:** Carbon grain, soft light bloom, and a small checkered cue add texture without visual noise.

### Color Philosophy
Near-black is the primary field, creating the quiet of a pit lane before the signal. **Mantis Red** (#C81E1E) is reserved for intent, speed, and action; it should arrive like a brake light, not a background wash. Aged gold (#D4AF37) marks craft, calibration, and milestones. Ivory (#F2EFE9) keeps reading warm and human against the technical darkness.

### Layout Paradigm
The single page follows a **telemetry spine** instead of a conventional centered grid. A left-aligned rail carries section coordinates and an animated rule; each section shifts its content mass independently to create a procession of trackside data panels, editorial pauses, and performance plates.

### Signature Elements
- A blade-shaped M monogram constructed from two asymmetrical strokes.
- A fixed micro telemetry rail with changing section coordinates and scroll progress.
- Red diagonal speed marks and technical crop lines that reveal content through masks.

### Interaction Philosophy
Interaction should feel tuned rather than playful: magnetic responses are limited to priority controls, project cards lean with a measured 3D response, and cursor state changes clarify interactive depth. Every active state acknowledges input in under 300ms.

### Animation
The entry sequence draws the monogram, charges a telemetry bar, and wipes into the hero. Hero copy splits into two rhythmic beats: **“I GO DEEP”** rises with composure, then **“THEN I BUILD”** arrives with decisive acceleration. Sections use scroll-synced reveals and blade-lines draw into place. Project cards use small-angle perspective tilt, masked image zoom, and delayed technology labels. Reduced-motion mode replaces choreography with simple opacity transitions and static linework.

### Typography System
**Cabinet Grotesk** carries display headings in wide, high-contrast scales. **Satoshi** supports long-form reading with soft human texture. **Barlow Condensed** is reserved for telemetry labels, sequence IDs, and numeric values. A small, non-load-bearing brush face provides rare editorial accents only. Headings are compact and strong; labels are uppercase with intentional tracking; paragraphs retain generous leading.

### Brand Essence
**Mantis is a disciplined builder’s portfolio for complex work that demands both depth and decisive execution.**

Personality: **precise, relentless, composed.**

### Brand Voice
Headlines are terse, active, and slightly theatrical; CTAs name the next action rather than offering a generic invitation. Microcopy reads like an instrument readout: specific, calm, and direct.

Example lines: “Depth before velocity.” and “Open the build log.”

### Wordmark & Logo
The wordmark is a sharply spaced, custom-cut **MANTIS** wordmark with one angled diagonal break; the icon is a text-free blade-M monogram made from two tapering, offset strokes. It is built to animate as a drawn line and remains visible as a substantial mark in the header and browser icon.

### Signature Brand Color
**Mantis Red — #C81E1E.**

## Style Decisions

- **Copy voice rule:** Every line reads like a calm instrument readout or terse field note. Generic welcome copy and literal placeholder language are excluded from the site.
- **Red usage rule:** Mantis Red #C81E1E is a signal for action, speed marks, emphasis, and decisive transitions. Near-black remains the dominant material; red appears as a charged plane, line, or ignition event rather than a default background wash.
- **Brand mark rule:** The blade-M monogram and split MANTIS wordmark use deliberate angled cuts and disciplined spacing in the header, footer, and entry sequence. They are treated as engineered assets rather than a standard-font nameplate.

## Motion Upgrade — Blade Discipline

The enhanced choreography follows a controlled three-beat sword-draw rhythm: **stillness, draw, impact**. The loading sequence now carries a diagonal steel-and-red cut before the monogram is traced. The hero is scored by a drawn katana arc and a brief optical strike ahead of the type reveal. On scroll, sections receive a small calibrated cut mark and project covers are revealed through a directional slice rather than a generic fade. The motion remains abstract: it borrows the economy, force, and timing of a sword cut without illustrating weapons or using a character.

### Live motion check

Desktop browser validation confirmed that the intro resolves cleanly from the draw sequence into the hero, with the katana arc remaining as a restrained diagonal trace once the wordmark has landed. The visual language remains readable after the impact rather than obscuring the primary call to action.

The Track Record empty state was refined and rechecked as a full-width locked archive: its cropped border, red diagonal signal, archive coordinate, and standby label now occupy the entire project bay instead of leaving unused neutral space.

The runtime motion-off verification confirmed that the page applies the accessibility state, removes the intro overlay, and leaves the complete hero visible. The same behavior is used for the operating system’s reduced-motion preference; `?motion=off` is retained as a testable equivalent.

## Experience Upgrade — Signal Theatre

The next interaction layer must be **obvious at first touch**, not only visible in an animation inspection. The hero will become a responsive signal field: the pointer drives a red-and-gold scanner glow, background strata drift at different rates, a live coordinate readout follows the cursor, and the main action behaves magnetically. Scroll will trigger a kinetic word-stage and sectional calibration shifts that make the page feel choreographed rather than merely revealed. The empty work archive will become an interactive dispatch bay with a responsive scanner, parked release slots, and a direct route to the private project console. The visual language stays technical and graphic—more precision instrument than generic 3D showcase.

The system’s behaviors are explicitly assigned. **Hero:** pointer-driven scanner field, concentric sight rings, magnetic primary action, and a live signal readout. **Cursor:** expands into intentional action labels over clickable controls and supports magnetic movement only for high-value calls to action. **Navigation:** retains the fixed telemetry rail as the continuous scroll state and adds a larger kinetic scroll landmark directly after the hero. **Sections:** use sticky horizontal type and orbital geometry to make scroll position obvious before returning to readable content. **Project display:** real published entries retain their tilt, hover, and blade impact; the no-project state becomes a selectable scan/stage/dispatch bay with an owner-console escape route.

### Live interaction observation

The revised desktop hero visibly carries the signal field above the source art: red scanner light and concentric targeting rings now remain present after the entry sequence, alongside the live pointer status readout. The new kinetic stage and archive controls are exposed in the document flow, confirming that the interaction layer is no longer limited to a transient page-load effect.

Pointer testing confirmed that the scanner field visibly repositions with the desktop cursor. The Track Record bay now renders three parked release slots around a central control stack; the scan/stage/dispatch buttons provide a directly observable interaction loop before real work is published.

The stage mode was exercised live: it changed both the central release-bay copy and the highlighted control state while promoting the middle parked slot in the surrounding composition. The active telemetry rail also shifted to the Track Record coordinate during this interaction.

The kinetic landmark was observed across two scroll positions. Its headline visibly advanced from **FIND THE SIGNAL** to **HOLD THE LINE** while the orbital instrument rotated and the following content entered beneath it. This establishes an immediately perceivable scroll-linked interaction rather than a hidden transition.

The refreshed interactive archive loaded without browser-console output after the visible-motion implementation. The stage-mode state remained intact on direct navigation to the Track Record section.

### Smoothness refinement — Continuity pass

The refinement pass will reduce the sense of isolated visual tricks by treating the portfolio as a single moving instrument. Lenis should decelerate more deliberately at scroll endpoints, anchor navigation should inherit the same scroll curve, the hero scanner should be frame-throttled, and ambient colour should travel between active sections rather than abruptly appearing. Navigation receives a progress underline driven by the telemetry state, while project hover depth uses a slower, physically credible settle.

The refreshed hero completed its entry sequence cleanly and settled into the interactive field without a visible state jump. The fixed navigation and telemetry rail remained stable during the introduction, preserving the composed baseline needed for the slower scroll interpolation.

Anchor navigation moved the page into Track Record with the matching header cue and telemetry coordinate. Continuing one smooth scroll handoff advanced the active instrument state to Run Log without disrupting the fixed rail or the surrounding visual rhythm.

The corrected Run Log continuity layer now sits behind the content rather than vanishing below the section background; text remains legible and the active header cue is visible. The browser console remained clean after the refined section transition.
