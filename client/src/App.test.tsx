import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(import.meta.dirname, "App.tsx"), "utf8");
const stylesSource = readFileSync(
  resolve(import.meta.dirname, "index.css"),
  "utf8"
);

describe("route transition contract", () => {
  it("wraps lazy routes with a location-keyed transition", () => {
    expect(appSource).toContain('className="route-transition"');
    expect(appSource).toContain("key={location}");
    expect(appSource).toContain("<Suspense fallback={<RouteLoading />}");
  });

  it("uses a restrained transform/opacity transition and disables it for reduced motion", () => {
    expect(stylesSource).toContain("animation: route-enter 420ms");
    expect(stylesSource).toContain("animation: route-line 520ms");
    expect(stylesSource).toContain("transform: translate3d(0, 10px, 0)");
    expect(stylesSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(stylesSource).toContain(".route-transition {\n    animation: none;");
  });
});
