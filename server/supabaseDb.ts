import type { InsertProject, InsertUser, Project, RecoverySnapshot, User } from "../drizzle/schema";
import { ENV } from "./_core/env";

type SupabaseUserRow = {
  id: number;
  open_id: string;
  name: string | null;
  email: string | null;
  login_method: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
  last_signed_in: string;
};

type SupabaseProjectRow = {
  id: number;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  tags: string;
  status: "draft" | "published";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type SupabaseSnapshotRow = {
  id: number;
  storage_key: string;
  checksum: string;
  record_count: number;
  created_at: string;
};

function requireConfig() {
  if (!ENV.supabaseUrl || !ENV.supabaseSecretKey) {
    throw new Error("Supabase database is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
  return { baseUrl: ENV.supabaseUrl.replace(/\/$/, ""), secret: ENV.supabaseSecretKey };
}

async function rest(path: string, init: RequestInit = {}) {
  const { baseUrl, secret } = requireConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", secret);
  headers.set("Authorization", `Bearer ${secret}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${baseUrl}/rest/v1/${path}`, { ...init, headers });
}

async function responseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Supabase database request failed: ${response.status} ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

function mapUser(row: SupabaseUserRow): User {
  return {
    id: row.id,
    openId: row.open_id,
    name: row.name,
    email: row.email,
    loginMethod: row.login_method,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lastSignedIn: new Date(row.last_signed_in),
  };
}

function mapProject(row: SupabaseProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    imageUrl: row.image_url,
    projectUrl: row.project_url,
    tags: row.tags,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapSnapshot(row: SupabaseSnapshotRow): RecoverySnapshot {
  return {
    id: row.id,
    storageKey: row.storage_key,
    checksum: row.checksum,
    recordCount: row.record_count,
    createdAt: new Date(row.created_at),
  };
}

function projectValues(values: Partial<InsertProject>) {
  return {
    ...(values.title === undefined ? {} : { title: values.title }),
    ...(values.category === undefined ? {} : { category: values.category }),
    ...(values.description === undefined ? {} : { description: values.description }),
    ...(values.imageUrl === undefined ? {} : { image_url: values.imageUrl }),
    ...(values.projectUrl === undefined ? {} : { project_url: values.projectUrl }),
    ...(values.tags === undefined ? {} : { tags: values.tags }),
    ...(values.status === undefined ? {} : { status: values.status }),
    ...(values.sortOrder === undefined ? {} : { sort_order: values.sortOrder }),
  };
}

export async function isReady() {
  const response = await rest("projects?select=id&limit=1");
  return response.ok;
}

export async function upsertUser(user: InsertUser) {
  const response = await rest("users?on_conflict=open_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      open_id: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      login_method: user.loginMethod ?? null,
      role: user.role ?? "user",
      last_signed_in: (user.lastSignedIn ?? new Date()).toISOString(),
    }),
  });
  await responseJson<SupabaseUserRow[]>(response);
}

export async function getUserByOpenId(openId: string) {
  const response = await rest(`users?open_id=eq.${encodeURIComponent(openId)}&select=*`);
  const rows = await responseJson<SupabaseUserRow[]>(response);
  return rows[0] ? mapUser(rows[0]) : undefined;
}

export async function getProjects(status?: "draft" | "published") {
  const statusFilter = status ? `&status=eq.${status}` : "";
  const response = await rest(`projects?select=*&order=sort_order.asc,updated_at.desc${statusFilter}`);
  return (await responseJson<SupabaseProjectRow[]>(response)).map(mapProject);
}

export async function createProject(values: InsertProject) {
  const response = await rest("projects", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(projectValues(values)),
  });
  const rows = await responseJson<SupabaseProjectRow[]>(response);
  return rows[0] ? mapProject(rows[0]) : undefined;
}

export async function updateProject(id: number, values: Partial<InsertProject>) {
  const response = await rest(`projects?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(projectValues(values)),
  });
  const rows = await responseJson<SupabaseProjectRow[]>(response);
  return rows[0] ? mapProject(rows[0]) : undefined;
}

export async function deleteProject(id: number) {
  const response = await rest(`projects?id=eq.${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Supabase database request failed: ${response.status} ${await response.text()}`);
  return { id };
}

export async function reorderProjects(items: Array<{ id: number; sortOrder: number }>) {
  for (const item of items) {
    await updateProject(item.id, { sortOrder: item.sortOrder });
  }
  return getProjects();
}

export async function createRecoverySnapshotRecord(values: { storageKey: string; checksum: string; recordCount: number }) {
  const response = await rest("recovery_snapshots", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ storage_key: values.storageKey, checksum: values.checksum, record_count: values.recordCount }),
  });
  const rows = await responseJson<SupabaseSnapshotRow[]>(response);
  if (!rows[0]) throw new Error("Supabase recovery snapshot metadata was not created.");
  return mapSnapshot(rows[0]);
}

export async function listRecoverySnapshots(limit: number) {
  const response = await rest(`recovery_snapshots?select=*&order=created_at.desc&limit=${limit}`);
  return (await responseJson<SupabaseSnapshotRow[]>(response)).map(mapSnapshot);
}
