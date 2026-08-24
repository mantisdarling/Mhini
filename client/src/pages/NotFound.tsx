import React from "react";
import { ArrowUpRight, CornerDownLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <main className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-field" aria-hidden="true">
        <span className="not-found-field-mark">404 / SIGNAL LOST</span>
        <span className="not-found-field-line" />
        <span className="not-found-field-coordinate">
          MANTIS / ROUTE CONTROL
        </span>
      </div>

      <section className="not-found-content">
        <p className="not-found-kicker">
          <span>ERR_04</span>
          <span className="not-found-kicker-rule" aria-hidden="true" />
          <span>UNMAPPED TERRITORY</span>
        </p>

        <h1 id="not-found-title">
          The path
          <br />
          <em>disappeared.</em>
        </h1>

        <p className="not-found-copy">
          This route is not part of the current record. Return to the field and
          continue from a known point.
        </p>

        <button
          className="not-found-home"
          type="button"
          onClick={() => setLocation("/")}
        >
          <span>Return to Mantis</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </section>

      <footer className="not-found-footer">
        <span>404 / NO RECORD FOUND</span>
        <span className="not-found-footer-hint">
          <CornerDownLeft size={14} aria-hidden="true" />
          <span>Use the return vector</span>
        </span>
      </footer>
    </main>
  );
}
