export function MantisAtmosphere() {
  return (
    <>
      <div className="mantis-kanji-field" aria-hidden="true">
        <span>螳</span>
        <span>螂</span>
      </div>
      <svg className="mantis-film-grain" aria-hidden="true" viewBox="0 0 160 160" preserveAspectRatio="none">
        <filter id="mantis-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mantis-grain-filter)" opacity="0.18" />
      </svg>
    </>
  );
}
