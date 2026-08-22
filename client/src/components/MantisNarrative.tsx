const beats = [
  { index: "01", title: "Observe", copy: "Find the signal before the system moves." },
  { index: "02", title: "Dissect", copy: "Go deep enough to see where pressure becomes leverage." },
  { index: "03", title: "Build", copy: "Turn the hard problem into a real instrument." },
  { index: "04", title: "Release", copy: "Ship the edge, then hold the line." },
];

export function MantisNarrative() {
  return (
    <section className="mantis-narrative" id="narrative" aria-label="Mantis operating narrative">
      <div className="mantis-narrative-sticky">
        <div className="mantis-narrative-heading">
          <p>THE MANTIS METHOD / FIELD NOTE</p>
          <h2>Cut through<br /><em>the noise.</em></h2>
        </div>
        <div className="mantis-narrative-track">
          {beats.map((beat) => (
            <article className="mantis-narrative-card" key={beat.index}>
              <span>{beat.index}</span>
              <div>
                <p>PHASE / {beat.index}</p>
                <h3>{beat.title}</h3>
                <span>{beat.copy}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="mantis-narrative-hint">Scroll or swipe to move through the method.</p>
      </div>
    </section>
  );
}
