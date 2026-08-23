import { describe, expect, it } from "vitest";
import { projectInputSchema } from "./projectSchemas";

describe("project input schema", () => {
  it("accepts a complete published project with tags and links", () => {
    const project = projectInputSchema.parse({
      title: "Signal / 24",
      category: "Data platform",
      description: "A concise operating layer for teams making time-sensitive decisions.",
      imageUrl: "https://example.com/signal.webp",
      projectUrl: "https://example.com/signal",
      tags: ["Systems", "Product"],
      status: "published",
      sortOrder: 3,
    });

    expect(project.status).toBe("published");
    expect(project.tags).toEqual(["Systems", "Product"]);
  });

  it("rejects a project with a missing title or invalid external URL", () => {
    expect(() => projectInputSchema.parse({
      title: "",
      category: "Build",
      description: "A real description that is long enough to be meaningful.",
      imageUrl: "not-a-url",
      projectUrl: "",
      tags: [],
      status: "draft",
      sortOrder: 0,
    })).toThrow();
  });

  it("rejects executable and non-web URL schemes", () => {
    const base = {
      title: "Safe project",
      category: "Build",
      description: "A real description that is long enough to be meaningful.",
      imageUrl: "",
      projectUrl: "",
      tags: [],
      status: "draft" as const,
      sortOrder: 0,
    };

    expect(() => projectInputSchema.parse({ ...base, imageUrl: "javascript:alert(1)" })).toThrow("HTTP or HTTPS");
    expect(() => projectInputSchema.parse({ ...base, projectUrl: "data:text/html,unsafe" })).toThrow("HTTP or HTTPS");
    expect(() => projectInputSchema.parse({ ...base, projectUrl: "//example.com/project" })).toThrow("HTTP or HTTPS");
  });
});
