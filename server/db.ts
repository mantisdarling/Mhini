import { asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertProject,
  InsertUser,
  Project,
  projects,
  recoverySnapshots,
  RecoverySnapshot,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { scalePolicy } from "../shared/scalePolicy";
import * as supabaseDb from "./supabaseDb";

let mysqlDb: ReturnType<typeof drizzle> | null = null;
let publishedProjectCache: { expiresAt: number; values: Project[] } | null = null;

function useSupabase() {
  return ENV.databaseProvider === "supabase";
}

function clearPublishedProjectCache() {
  publishedProjectCache = null;
}

function withDatabase<T>(db: T | null): T {
  if (!db) throw new Error("Database is unavailable.");
  return db;
}

export async function getDb() {
  if (useSupabase()) return null;
  if (!mysqlDb && process.env.DATABASE_URL) {
    try {
      mysqlDb = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      mysqlDb = null;
    }
  }
  return mysqlDb;
}

export async function isDatabaseReady() {
  if (useSupabase()) return supabaseDb.isReady();
  const db = await getDb();
  if (!db) return false;
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  if (useSupabase()) return supabaseDb.upsertUser(user);
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  if (useSupabase()) return supabaseDb.getUserByOpenId(openId);
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getPublishedProjects() {
  if (publishedProjectCache && publishedProjectCache.expiresAt > Date.now()) return publishedProjectCache.values;
  const values = useSupabase()
    ? await supabaseDb.getProjects("published")
    : await withDatabase(await getDb())
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
  publishedProjectCache = {
    values,
    expiresAt: Date.now() + scalePolicy.publicProjectCacheTtlMs,
  };
  return values;
}

export async function getAllProjects() {
  if (useSupabase()) return supabaseDb.getProjects();
  return withDatabase(await getDb()).select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
}

export async function createProject(values: InsertProject) {
  if (useSupabase()) {
    const created = await supabaseDb.createProject(values);
    clearPublishedProjectCache();
    return created;
  }
  const db = withDatabase(await getDb());
  const result = await db.insert(projects).values(values);
  const id = Number(result[0].insertId);
  const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  clearPublishedProjectCache();
  return created[0];
}

export async function updateProject(id: number, values: Partial<InsertProject>) {
  if (useSupabase()) {
    const updated = await supabaseDb.updateProject(id, values);
    clearPublishedProjectCache();
    return updated;
  }
  const db = withDatabase(await getDb());
  await db.update(projects).set(values).where(eq(projects.id, id));
  const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  clearPublishedProjectCache();
  return updated[0];
}

export async function deleteProject(id: number) {
  if (useSupabase()) {
    const result = await supabaseDb.deleteProject(id);
    clearPublishedProjectCache();
    return result;
  }
  const db = withDatabase(await getDb());
  await db.delete(projects).where(eq(projects.id, id));
  clearPublishedProjectCache();
  return { id };
}

export async function reorderProjects(items: Array<{ id: number; sortOrder: number }>) {
  if (useSupabase()) {
    const values = await supabaseDb.reorderProjects(items);
    clearPublishedProjectCache();
    return values;
  }
  const db = withDatabase(await getDb());
  await db.transaction(async transaction => {
    for (const item of items) {
      await transaction.update(projects).set({ sortOrder: item.sortOrder }).where(eq(projects.id, item.id));
    }
  });
  clearPublishedProjectCache();
  return getAllProjects();
}

export async function createRecoverySnapshotRecord(values: { storageKey: string; checksum: string; recordCount: number }) {
  if (useSupabase()) return supabaseDb.createRecoverySnapshotRecord(values);
  const db = withDatabase(await getDb());
  const result = await db.insert(recoverySnapshots).values({
    storageKey: values.storageKey,
    checksum: values.checksum,
    recordCount: values.recordCount,
  });
  const id = Number(result[0].insertId);
  const rows = await db.select().from(recoverySnapshots).where(eq(recoverySnapshots.id, id)).limit(1);
  if (!rows[0]) throw new Error("Recovery snapshot metadata was not created.");
  return rows[0] as RecoverySnapshot;
}

export async function listRecoverySnapshotRecords(limit: number) {
  if (useSupabase()) return supabaseDb.listRecoverySnapshots(limit);
  const db = withDatabase(await getDb());
  return db.select().from(recoverySnapshots).orderBy(desc(recoverySnapshots.createdAt)).limit(limit);
}
