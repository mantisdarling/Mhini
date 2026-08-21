import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const projects = mysqlTable(
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
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    statusOrderIdx: index("projects_status_order_idx").on(table.status, table.sortOrder),
    sortOrderIdx: index("projects_sort_order_idx").on(table.sortOrder),
  }),
);

export const recoverySnapshots = mysqlTable(
  "recovery_snapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    checksum: varchar("checksum", { length: 64 }).notNull(),
    recordCount: int("recordCount").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    createdAtIdx: index("recovery_snapshots_created_at_idx").on(table.createdAt),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type RecoverySnapshot = typeof recoverySnapshots.$inferSelect;
