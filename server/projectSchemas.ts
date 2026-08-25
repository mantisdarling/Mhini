import { z } from "zod";

const webUrl = z
  .string()
  .trim()
  .refine(value => {
    if (value === "") return true;
    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "URL must be a valid HTTP or HTTPS address without credentials.");

const projectTags = z
  .array(z.string().trim().min(1).max(28))
  .max(8)
  .transform(tags => Array.from(new Set(tags)));

export const projectInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(140),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters.")
    .max(80),
  description: z
    .string()
    .trim()
    .min(12, "Description must be at least 12 characters.")
    .max(1200),
  imageUrl: webUrl.optional().default(""),
  projectUrl: webUrl.optional().default(""),
  tags: projectTags.default([]),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().min(0).max(10000),
});

export const projectUpdateSchema = projectInputSchema.extend({
  id: z.number().int().positive(),
});

export const projectReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        sortOrder: z.number().int().min(0).max(10000),
      })
    )
    .min(1)
    .max(100),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
