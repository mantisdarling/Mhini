import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProject, InsertUser, projects, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
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
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function withDatabase<T>(db: T | null): T {
  if (!db) throw new Error("Database is unavailable.");
  return db;
}

export async function getPublishedProjects() {
  const db = withDatabase(await getDb());
  return db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
}

export async function getAllProjects() {
  const db = withDatabase(await getDb());
  return db.select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
}

export async function createProject(values: InsertProject) {
  const db = withDatabase(await getDb());
  const result = await db.insert(projects).values(values);
  const id = Number(result[0].insertId);
  const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return created[0];
}

export async function updateProject(id: number, values: Partial<InsertProject>) {
  const db = withDatabase(await getDb());
  await db.update(projects).set(values).where(eq(projects.id, id));
  const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return updated[0];
}

export async function deleteProject(id: number) {
  const db = withDatabase(await getDb());
  await db.delete(projects).where(eq(projects.id, id));
  return { id };
}

export async function reorderProjects(items: Array<{ id: number; sortOrder: number }>) {
  const db = withDatabase(await getDb());
  await Promise.all(items.map(item => db.update(projects).set({ sortOrder: item.sortOrder }).where(eq(projects.id, item.id))));
  return getAllProjects();
}
