// server/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  authProvider: process.env.AUTH_PROVIDER ?? "manus",
  databaseProvider: process.env.DATABASE_PROVIDER ?? "mysql",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/db.ts
import { asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var projects = mysqlTable(
  "projects",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 140 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    description: text("description").notNull(),
    imageUrl: text("imageUrl"),
    projectUrl: text("projectUrl"),
    tags: text("tags").notNull(),
    status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
  },
  (table) => ({
    statusOrderIdx: index("projects_status_order_idx").on(table.status, table.sortOrder),
    sortOrderIdx: index("projects_sort_order_idx").on(table.sortOrder)
  })
);
var recoverySnapshots = mysqlTable(
  "recovery_snapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    checksum: varchar("checksum", { length: 64 }).notNull(),
    recordCount: int("recordCount").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull()
  },
  (table) => ({
    createdAtIdx: index("recovery_snapshots_created_at_idx").on(table.createdAt)
  })
);

// shared/scalePolicy.ts
var scalePolicy = {
  jsonPayloadLimit: "1mb",
  publicProjectCacheTtlMs: 6e4,
  storageRedirectCacheTtlMs: 6e4,
  staticAssetMaxAgeMs: 31536e6,
  staticFileMaxAgeMs: 36e5,
  documentCacheControl: "no-store",
  storageRedirectCacheControl: "public, max-age=60, s-maxage=60, stale-while-revalidate=300"
};

// server/supabaseDb.ts
function requireConfig() {
  if (!ENV.supabaseUrl || !ENV.supabaseSecretKey) {
    throw new Error("Supabase database is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
  return { baseUrl: ENV.supabaseUrl.replace(/\/$/, ""), secret: ENV.supabaseSecretKey };
}
async function rest(path, init = {}) {
  const { baseUrl, secret } = requireConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", secret);
  headers.set("Authorization", `Bearer ${secret}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${baseUrl}/rest/v1/${path}`, { ...init, headers });
}
async function responseJson(response) {
  if (!response.ok) {
    throw new Error(`Supabase database request failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}
function mapUser(row) {
  return {
    id: row.id,
    openId: row.open_id,
    name: row.name,
    email: row.email,
    loginMethod: row.login_method,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lastSignedIn: new Date(row.last_signed_in)
  };
}
function mapProject(row) {
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
    updatedAt: new Date(row.updated_at)
  };
}
function mapSnapshot(row) {
  return {
    id: row.id,
    storageKey: row.storage_key,
    checksum: row.checksum,
    recordCount: row.record_count,
    createdAt: new Date(row.created_at)
  };
}
function projectValues(values) {
  return {
    ...values.title === void 0 ? {} : { title: values.title },
    ...values.category === void 0 ? {} : { category: values.category },
    ...values.description === void 0 ? {} : { description: values.description },
    ...values.imageUrl === void 0 ? {} : { image_url: values.imageUrl },
    ...values.projectUrl === void 0 ? {} : { project_url: values.projectUrl },
    ...values.tags === void 0 ? {} : { tags: values.tags },
    ...values.status === void 0 ? {} : { status: values.status },
    ...values.sortOrder === void 0 ? {} : { sort_order: values.sortOrder }
  };
}
async function isReady() {
  const response = await rest("projects?select=id&limit=1");
  return response.ok;
}
async function upsertUser(user) {
  const response = await rest("users?on_conflict=open_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      open_id: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      login_method: user.loginMethod ?? null,
      role: user.role ?? "user",
      last_signed_in: (user.lastSignedIn ?? /* @__PURE__ */ new Date()).toISOString()
    })
  });
  await responseJson(response);
}
async function getUserByOpenId(openId) {
  const response = await rest(`users?open_id=eq.${encodeURIComponent(openId)}&select=*`);
  const rows = await responseJson(response);
  return rows[0] ? mapUser(rows[0]) : void 0;
}
async function getProjects(status) {
  const statusFilter = status ? `&status=eq.${status}` : "";
  const response = await rest(`projects?select=*&order=sort_order.asc,updated_at.desc${statusFilter}`);
  return (await responseJson(response)).map(mapProject);
}
async function createProject(values) {
  const response = await rest("projects", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(projectValues(values))
  });
  const rows = await responseJson(response);
  return rows[0] ? mapProject(rows[0]) : void 0;
}
async function updateProject(id, values) {
  const response = await rest(`projects?id=eq.${id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(projectValues(values))
  });
  const rows = await responseJson(response);
  return rows[0] ? mapProject(rows[0]) : void 0;
}
async function deleteProject(id) {
  const response = await rest(`projects?id=eq.${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`Supabase database request failed: ${response.status} ${await response.text()}`);
  return { id };
}
async function reorderProjects(items) {
  for (const item of items) {
    await updateProject(item.id, { sortOrder: item.sortOrder });
  }
  return getProjects();
}
async function createRecoverySnapshotRecord(values) {
  const response = await rest("recovery_snapshots", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ storage_key: values.storageKey, checksum: values.checksum, record_count: values.recordCount })
  });
  const rows = await responseJson(response);
  if (!rows[0]) throw new Error("Supabase recovery snapshot metadata was not created.");
  return mapSnapshot(rows[0]);
}
async function listRecoverySnapshots(limit) {
  const response = await rest(`recovery_snapshots?select=*&order=created_at.desc&limit=${limit}`);
  return (await responseJson(response)).map(mapSnapshot);
}

// server/db.ts
var mysqlDb = null;
var publishedProjectCache = null;
function useSupabase() {
  return ENV.databaseProvider === "supabase";
}
function clearPublishedProjectCache() {
  publishedProjectCache = null;
}
function withDatabase(db) {
  if (!db) throw new Error("Database is unavailable.");
  return db;
}
async function getDb() {
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
async function isDatabaseReady() {
  if (useSupabase()) return isReady();
  const db = await getDb();
  if (!db) return false;
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}
async function upsertUser2(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  if (useSupabase()) return upsertUser(user);
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  textFields.forEach((field) => {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId2(openId) {
  if (useSupabase()) return getUserByOpenId(openId);
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getPublishedProjects() {
  if (publishedProjectCache && publishedProjectCache.expiresAt > Date.now()) return publishedProjectCache.values;
  const values = useSupabase() ? await getProjects("published") : await withDatabase(await getDb()).select().from(projects).where(eq(projects.status, "published")).orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
  publishedProjectCache = {
    values,
    expiresAt: Date.now() + scalePolicy.publicProjectCacheTtlMs
  };
  return values;
}
async function getAllProjects() {
  if (useSupabase()) return getProjects();
  return withDatabase(await getDb()).select().from(projects).orderBy(asc(projects.sortOrder), desc(projects.updatedAt));
}
async function createProject2(values) {
  if (useSupabase()) {
    const created2 = await createProject(values);
    clearPublishedProjectCache();
    return created2;
  }
  const db = withDatabase(await getDb());
  const result = await db.insert(projects).values(values);
  const id = Number(result[0].insertId);
  const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  clearPublishedProjectCache();
  return created[0];
}
async function updateProject2(id, values) {
  if (useSupabase()) {
    const updated2 = await updateProject(id, values);
    clearPublishedProjectCache();
    return updated2;
  }
  const db = withDatabase(await getDb());
  await db.update(projects).set(values).where(eq(projects.id, id));
  const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  clearPublishedProjectCache();
  return updated[0];
}
async function deleteProject2(id) {
  if (useSupabase()) {
    const result = await deleteProject(id);
    clearPublishedProjectCache();
    return result;
  }
  const db = withDatabase(await getDb());
  await db.delete(projects).where(eq(projects.id, id));
  clearPublishedProjectCache();
  return { id };
}
async function reorderProjects2(items) {
  if (useSupabase()) {
    const values = await reorderProjects(items);
    clearPublishedProjectCache();
    return values;
  }
  const db = withDatabase(await getDb());
  await db.transaction(async (transaction) => {
    for (const item of items) {
      await transaction.update(projects).set({ sortOrder: item.sortOrder }).where(eq(projects.id, item.id));
    }
  });
  clearPublishedProjectCache();
  return getAllProjects();
}
async function createRecoverySnapshotRecord2(values) {
  if (useSupabase()) return createRecoverySnapshotRecord(values);
  const db = withDatabase(await getDb());
  const result = await db.insert(recoverySnapshots).values({
    storageKey: values.storageKey,
    checksum: values.checksum,
    recordCount: values.recordCount
  });
  const id = Number(result[0].insertId);
  const rows = await db.select().from(recoverySnapshots).where(eq(recoverySnapshots.id, id)).limit(1);
  if (!rows[0]) throw new Error("Recovery snapshot metadata was not created.");
  return rows[0];
}
async function listRecoverySnapshotRecords(limit) {
  if (useSupabase()) return listRecoverySnapshots(limit);
  const db = withDatabase(await getDb());
  return db.select().from(recoverySnapshots).orderBy(desc(recoverySnapshots.createdAt)).limit(limit);
}

// server/recoverySnapshot.ts
import { createHash } from "crypto";

// server/storage.ts
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var externalStorageClient = null;
function getExternalStorageConfig() {
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    accessKeyId,
    bucket,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    region: process.env.S3_REGION || "auto",
    secretAccessKey
  };
}
function getExternalStorageClient(config) {
  if (!externalStorageClient) {
    externalStorageClient = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
  }
  return externalStorageClient;
}
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  const externalConfig = getExternalStorageConfig();
  if (externalConfig) {
    const client = getExternalStorageClient(externalConfig);
    await client.send(new PutObjectCommand({
      Bucket: externalConfig.bucket,
      Key: key,
      Body: data,
      ContentType: contentType
    }));
    return {
      key,
      url: await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: externalConfig.bucket, Key: key }),
        { expiresIn: 900 }
      )
    };
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    let user = await getUserByOpenId2(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser2({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        user = await getUserByOpenId2(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/recoverySnapshot.ts
function buildRecoveryPayload(projectRows, createdAt = (/* @__PURE__ */ new Date()).toISOString()) {
  return {
    formatVersion: 1,
    createdAt,
    tables: {
      projects: projectRows
    }
  };
}
function recoveryKey(createdAt) {
  return `recovery-snapshots/mantis-${createdAt.replaceAll(":", "-").replaceAll(".", "-")}.json`;
}
async function createRecoverySnapshot() {
  const payload = buildRecoveryPayload(await getAllProjects());
  const body = JSON.stringify(payload);
  const checksum = createHash("sha256").update(body).digest("hex");
  const recordCount = payload.tables.projects.length;
  const stored = await storagePut(recoveryKey(payload.createdAt), body, "application/json");
  const result = await createRecoverySnapshotRecord2({
    checksum,
    recordCount,
    storageKey: stored.key
  });
  return {
    checksum,
    createdAt: payload.createdAt,
    id: result.id,
    recordCount,
    storageKey: stored.key
  };
}
async function listRecoverySnapshots2(limit = 30) {
  return listRecoverySnapshotRecords(limit);
}
async function runScheduledRecoverySnapshot(req, res) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      res.status(403).json({ error: "cron-only" });
      return;
    }
    const snapshot = await createRecoverySnapshot();
    res.status(200).json({ ok: true, snapshot });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "recovery snapshot failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}
function isAuthorizedVercelCron(authorization, secret = process.env.CRON_SECRET) {
  return Boolean(secret && authorization === `Bearer ${secret}`);
}
function createVercelRecoverySnapshotHandler(snapshotCreator = createRecoverySnapshot) {
  return async (req, res) => {
    if (!isAuthorizedVercelCron(req.headers.authorization)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    try {
      const snapshot = await snapshotCreator();
      res.status(200).json({ ok: true, snapshot });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "recovery snapshot failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
}
var runVercelRecoverySnapshot = createVercelRecoverySnapshotHandler();

// server/projectSchemas.ts
import { z as z2 } from "zod";
var webUrl = z2.string().trim().url().or(z2.literal(""));
var projectInputSchema = z2.object({
  title: z2.string().trim().min(2, "Title must be at least 2 characters.").max(140),
  category: z2.string().trim().min(2, "Category must be at least 2 characters.").max(80),
  description: z2.string().trim().min(12, "Description must be at least 12 characters.").max(1200),
  imageUrl: webUrl.optional().default(""),
  projectUrl: webUrl.optional().default(""),
  tags: z2.array(z2.string().trim().min(1).max(28)).max(8).default([]),
  status: z2.enum(["draft", "published"]),
  sortOrder: z2.number().int().min(0).max(1e4)
});
var projectUpdateSchema = projectInputSchema.extend({
  id: z2.number().int().positive()
});
var projectReorderSchema = z2.object({
  items: z2.array(
    z2.object({
      id: z2.number().int().positive(),
      sortOrder: z2.number().int().min(0).max(1e4)
    })
  ).min(1).max(100)
});

// server/routers.ts
function normalizeTags(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === "string") : [];
  } catch {
    return [];
  }
}
function presentProject(project) {
  return { ...project, tags: normalizeTags(project.tags) };
}
function toProjectValues(input) {
  return {
    title: input.title,
    category: input.category,
    description: input.description,
    imageUrl: input.imageUrl || null,
    projectUrl: input.projectUrl || null,
    tags: JSON.stringify(input.tags),
    status: input.status,
    sortOrder: input.sortOrder
  };
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  projects: router({
    listPublic: publicProcedure.query(async () => (await getPublishedProjects()).map(presentProject)),
    listPrivate: adminProcedure.query(async () => (await getAllProjects()).map(presentProject)),
    create: adminProcedure.input(projectInputSchema).mutation(async ({ input }) => {
      const created = await createProject2(toProjectValues(input));
      if (!created) throw new Error("Project could not be created.");
      return presentProject(created);
    }),
    update: adminProcedure.input(projectUpdateSchema).mutation(async ({ input }) => {
      const { id, ...values } = input;
      const updated = await updateProject2(id, toProjectValues(values));
      if (!updated) throw new Error("Project could not be found.");
      return presentProject(updated);
    }),
    remove: adminProcedure.input(projectUpdateSchema.pick({ id: true })).mutation(({ input }) => deleteProject2(input.id)),
    reorder: adminProcedure.input(projectReorderSchema).mutation(({ input }) => reorderProjects2(input.items))
  }),
  recovery: router({
    createSnapshot: adminProcedure.mutation(() => createRecoverySnapshot()),
    listSnapshots: adminProcedure.query(() => listRecoverySnapshots2())
  })
});

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser2({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
var redirectCache = /* @__PURE__ */ new Map();
var maxRedirectCacheEntries = 1e3;
function cachedUrl(key) {
  const value = redirectCache.get(key);
  if (!value) return null;
  if (value.expiresAt <= Date.now()) {
    redirectCache.delete(key);
    return null;
  }
  return value.url;
}
function cacheUrl(key, url) {
  if (redirectCache.size >= maxRedirectCacheEntries) {
    const oldestKey = redirectCache.keys().next().value;
    if (typeof oldestKey === "string") redirectCache.delete(oldestKey);
  }
  redirectCache.set(key, {
    url,
    expiresAt: Date.now() + scalePolicy.storageRedirectCacheTtlMs
  });
}
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    const cached = cachedUrl(key);
    if (cached) {
      res.set("Cache-Control", scalePolicy.storageRedirectCacheControl);
      res.redirect(307, cached);
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      cacheUrl(key, url);
      res.set("Cache-Control", scalePolicy.storageRedirectCacheControl);
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/independentAuth.ts
function independentAuthEnabled() {
  return ENV.authProvider === "supabase";
}
function mapSupabaseIdentity(identity) {
  if (!identity.id || !identity.email) throw new Error("Supabase identity is missing an id or email.");
  const owner = ENV.ownerEmail.length > 0 && identity.email.toLowerCase() === ENV.ownerEmail.toLowerCase();
  return {
    openId: `supabase:${identity.id}`,
    email: identity.email,
    name: identity.user_metadata?.full_name ?? identity.user_metadata?.name ?? null,
    loginMethod: identity.app_metadata?.provider ?? "supabase-email",
    role: owner ? "admin" : "user",
    lastSignedIn: /* @__PURE__ */ new Date()
  };
}
function bearerToken(req) {
  const value = req.headers.authorization;
  return typeof value === "string" && value.startsWith("Bearer ") ? value.slice(7) : null;
}
async function authenticateIndependentRequest(req) {
  if (!independentAuthEnabled()) throw new Error("Independent authentication is not enabled.");
  const token = bearerToken(req);
  if (!token || !ENV.supabaseUrl || !ENV.supabasePublishableKey) throw new Error("Independent session is unavailable.");
  const response = await fetch(`${ENV.supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: ENV.supabasePublishableKey,
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Independent session is invalid.");
  const values = mapSupabaseIdentity(await response.json());
  await upsertUser2(values);
  const user = await getUserByOpenId2(values.openId);
  if (!user) throw new Error("Independent user record could not be loaded.");
  return user;
}

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  const authorization = opts.req.headers.authorization;
  const mayHaveSession = Boolean(opts.req.headers.cookie) || typeof authorization === "string" && authorization.startsWith("Bearer ");
  if (mayHaveSession) {
    try {
      user = independentAuthEnabled() ? await authenticateIndependentRequest(opts.req) : await sdk.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/app.ts
function createApplication(options = {}) {
  const app2 = express();
  let acceptingTraffic = true;
  app2.disable("x-powered-by");
  app2.set("trust proxy", 1);
  app2.use(express.json({ limit: scalePolicy.jsonPayloadLimit }));
  app2.use(express.urlencoded({ limit: scalePolicy.jsonPayloadLimit, extended: true }));
  app2.get(["/healthz", "/api/healthz"], (_req, res) => {
    res.status(acceptingTraffic ? 200 : 503).json({ ok: acceptingTraffic });
  });
  app2.get(["/readyz", "/api/readyz"], async (_req, res) => {
    if (!acceptingTraffic) {
      res.status(503).json({ ok: false, reason: "shutting down" });
      return;
    }
    try {
      if (!await isDatabaseReady()) throw new Error("database unavailable");
      res.status(200).json({ ok: true });
    } catch {
      res.status(503).json({ ok: false, reason: "database unavailable" });
    }
  });
  app2.post("/api/scheduled/recoverySnapshot", runScheduledRecoverySnapshot);
  app2.get("/api/cron/recoverySnapshot", options.vercelRecoveryHandler ?? runVercelRecoverySnapshot);
  registerStorageProxy(app2);
  registerOAuthRoutes(app2);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app2.use((error, _req, res, next) => {
    console.error("[Application] Unhandled request error", error);
    if (res.headersSent) return next(error);
    res.status(500).json({ error: "internal server error" });
  });
  return {
    app: app2,
    stopAcceptingTraffic: () => {
      acceptingTraffic = false;
    }
  };
}

// server/vercelFunction.ts
var { app } = createApplication();
var vercelFunction_default = app;
export {
  vercelFunction_default as default
};
