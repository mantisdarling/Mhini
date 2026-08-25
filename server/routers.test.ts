import { describe, expect, it } from "vitest";
import { normalizeTags } from "./routers";

describe("public project tag normalization", () => {
  it("trims, deduplicates, bounds, and ignores malformed stored tags", () => {
    const longTag = "x".repeat(40);
    expect(
      normalizeTags(
        JSON.stringify([" Systems ", "Systems", "", 42, longTag, "Product"])
      )
    ).toEqual(["Systems", "x".repeat(28), "Product"]);
  });

  it("returns an empty list for invalid JSON or non-array values", () => {
    expect(normalizeTags("not-json")).toEqual([]);
    expect(normalizeTags(JSON.stringify({ tag: "Systems" }))).toEqual([]);
  });
});
