import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("repository secret scan", () => {
  it("runs successfully and emits only a summary", () => {
    const output = execFileSync("node", ["scripts/check-secrets.mjs"], { encoding: "utf8" });
    expect(output).toMatch(/^Secret scan passed for \d+ tracked files\.\n$/);
    expect(output).not.toMatch(/AKIA|Bearer|private key/i);
  });
});
