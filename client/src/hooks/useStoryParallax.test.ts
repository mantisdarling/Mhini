import { describe, expect, it } from "vitest";
import { getStoryParallaxOffset } from "./useStoryParallax";

describe("getStoryParallaxOffset", () => {
  it("keeps the image travel bounded inside its crop", () => {
    expect(getStoryParallaxOffset(-1200, 500, 800)).toBe(18);
    expect(getStoryParallaxOffset(1800, 500, 800)).toBe(-18);
  });

  it("rests at the center of the viewport travel", () => {
    expect(getStoryParallaxOffset(150, 500, 800)).toBe(0);
  });
});
