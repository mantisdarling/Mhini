import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("deployment security policy", () => {
  it("keeps the Vercel CSP aligned with approved media and frame boundaries", () => {
    const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8")) as {
      headers: Array<{ headers: Array<{ key: string; value: string }> }>;
    };
    const policy = config.headers[0]?.headers.find(header => header.key === "Content-Security-Policy")?.value ?? "";

    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("img-src 'self' data: blob: https://files.manuscdn.com https://manus-analytics.com https://i.pinimg.com");
    expect(policy).toContain("frame-src https://assets.pinterest.com");
    expect(policy).not.toContain("unsafe-eval");
  });
});
