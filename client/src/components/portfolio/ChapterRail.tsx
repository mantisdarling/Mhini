import React from "react";
import { createPortal } from "react-dom";
import type { ChapterItem } from "./model";

type ChapterRailProps = {
  items: readonly ChapterItem[];
  activeId: string;
  onNavigate: (id: string) => void;
};

export default function ChapterRail({
  items,
  activeId,
  onNavigate,
}: ChapterRailProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <nav className="rebuild-chapter-rail" aria-label="Chapter progress">
      <p className="rebuild-chapter-rail-title">Navigate the record</p>
      <ol>
        {items.map(item => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                className={isActive ? "is-active" : undefined}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Go to chapter ${item.number}: ${item.label}`}
              >
                <span
                  className="rebuild-chapter-rail-number"
                  aria-hidden="true"
                >
                  {item.number}
                </span>
                <span className="rebuild-chapter-rail-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>,
    document.body
  );
}
