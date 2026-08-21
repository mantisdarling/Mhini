import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createProject,
  deleteProject,
  getAllProjects,
  getPublishedProjects,
  reorderProjects,
  updateProject,
} from "./db";
import { createRecoverySnapshot, listRecoverySnapshots } from "./recoverySnapshot";
import { projectInputSchema, projectReorderSchema, projectUpdateSchema, type ProjectInput } from "./projectSchemas";

function normalizeTags(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

function presentProject(project: NonNullable<Awaited<ReturnType<typeof getAllProjects>>[number]>) {
  return { ...project, tags: normalizeTags(project.tags) };
}

function toProjectValues(input: ProjectInput) {
  return {
    title: input.title,
    category: input.category,
    description: input.description,
    imageUrl: input.imageUrl || null,
    projectUrl: input.projectUrl || null,
    tags: JSON.stringify(input.tags),
    status: input.status,
    sortOrder: input.sortOrder,
  } as const;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  projects: router({
    listPublic: publicProcedure.query(async () => (await getPublishedProjects()).map(presentProject)),
    listPrivate: adminProcedure.query(async () => (await getAllProjects()).map(presentProject)),
    create: adminProcedure.input(projectInputSchema).mutation(async ({ input }) => {
      const created = await createProject(toProjectValues(input));
      if (!created) throw new Error("Project could not be created.");
      return presentProject(created);
    }),
    update: adminProcedure.input(projectUpdateSchema).mutation(async ({ input }) => {
      const { id, ...values } = input;
      const updated = await updateProject(id, toProjectValues(values));
      if (!updated) throw new Error("Project could not be found.");
      return presentProject(updated);
    }),
    remove: adminProcedure.input(projectUpdateSchema.pick({ id: true })).mutation(({ input }) => deleteProject(input.id)),
    reorder: adminProcedure.input(projectReorderSchema).mutation(({ input }) => reorderProjects(input.items)),
  }),
  recovery: router({
    createSnapshot: adminProcedure.mutation(() => createRecoverySnapshot()),
    listSnapshots: adminProcedure.query(() => listRecoverySnapshots()),
  }),
});

export type AppRouter = typeof appRouter;
