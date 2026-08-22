import express from "express";
import { describe, expect, it } from "vitest";

describe("Express 5 Vite fallback route", () => {
  it("accepts a root-inclusive wildcard path", () => {
    const app = express();

    expect(() => {
      app.use("/{*splat}", (request, response) => {
        response.status(404).end();
      });
    }).not.toThrow();
  });
});
