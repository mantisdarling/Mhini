import { describe, expect, it } from "vitest";
import { normalizeStorageKey } from "./storage";

describe("storage key normalization", () => {
  it("strips leading slashes from valid nested keys", () => {
    expect(normalizeStorageKey("/recovery-snapshots/mantis-file.json")).toBe("recovery-snapshots/mantis-file.json");
  });

  it.each([
    "",
    "../outside.json",
    "recovery/../outside.json",
    "recovery\\outside.json",
    "recovery/\u0000file.json",
  ])("rejects unsafe key %j", key => {
    expect(() => normalizeStorageKey(key)).toThrow("Invalid storage key.");
  });
});
