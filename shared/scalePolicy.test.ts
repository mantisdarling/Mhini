import { describe, expect, it } from "vitest";
import { scalePolicy } from "./scalePolicy";

describe("scale policy", () => {
  it("keeps the public cache window bounded", () => {
    expect(scalePolicy.publicProjectCacheTtlMs).toBe(60000);
    expect(scalePolicy.storageRedirectCacheTtlMs).toBe(60000);
  });

  it("keeps HTML dynamic while allowing immutable built assets", () => {
    expect(scalePolicy.documentCacheControl).toBe("no-store");
    expect(scalePolicy.staticAssetMaxAgeMs).toBeGreaterThan(scalePolicy.staticFileMaxAgeMs);
  });
});
