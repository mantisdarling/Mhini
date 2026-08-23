import { describe, expect, it } from "vitest";
import { upstreamRequestTimeoutMs, withRequestTimeout } from "./requestPolicy";

describe("upstream request policy", () => {
  it("adds the shared timeout when no caller signal exists", () => {
    const init = withRequestTimeout();

    expect(upstreamRequestTimeoutMs).toBe(8000);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.signal?.aborted).toBe(false);
  });

  it("preserves a caller-provided signal", () => {
    const controller = new AbortController();

    expect(withRequestTimeout({ signal: controller.signal }).signal).toBe(controller.signal);
  });
});
