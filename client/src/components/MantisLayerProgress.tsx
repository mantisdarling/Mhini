import React from "react";

export type LayerState = "pending" | "ready" | "fallback";

export function MantisLayerProgress({ fluid, katana }: { fluid: LayerState; katana: LayerState }) {
  const completed = [fluid, katana].filter(state => state !== "pending").length;
  if (completed === 2) return null;
  const progress = Math.max(8, completed * 50);
  const label = completed === 0 ? "CALIBRATING VISUAL FIELD" : "FINISHING VISUAL FIELD";
  return (
    <div className="mantis-layer-progress" role="status" aria-live="polite" aria-label={`${label}, ${String(progress).padStart(2, "0")} percent`}>
      <span className="mantis-layer-progress-label">{label}</span>
      <span className="mantis-layer-progress-value">{String(progress).padStart(2, "0")}%</span>
      <span className="mantis-layer-progress-track" aria-hidden="true"><i style={{ transform: `scaleX(${progress / 100})` }} /></span>
    </div>
  );
}
