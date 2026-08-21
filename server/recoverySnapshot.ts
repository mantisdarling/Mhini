import { createHash } from "crypto";
import { desc } from "drizzle-orm";
import type { Request, Response } from "express";
import { projects, recoverySnapshots } from "../drizzle/schema";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";

type RecoveryPayload = {
  formatVersion: 1;
  createdAt: string;
  tables: {
    projects: unknown[];
  };
};

export function buildRecoveryPayload(
  projectRows: unknown[],
  createdAt = new Date().toISOString(),
): RecoveryPayload {
  return {
    formatVersion: 1,
    createdAt,
    tables: {
      projects: projectRows,
    },
  };
}

function recoveryKey(createdAt: string) {
  return `recovery-snapshots/mantis-${createdAt.replaceAll(":", "-").replaceAll(".", "-")}.json`;
}

export async function createRecoverySnapshot() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for recovery snapshot.");

  const payload = await db.transaction(async transaction => {
    const projectRows = await transaction.select().from(projects);
    return buildRecoveryPayload(projectRows);
  });

  const body = JSON.stringify(payload);
  const checksum = createHash("sha256").update(body).digest("hex");
  const recordCount = payload.tables.projects.length;
  const stored = await storagePut(recoveryKey(payload.createdAt), body, "application/json");

  const result = await db.insert(recoverySnapshots).values({
    checksum,
    recordCount,
    storageKey: stored.key,
  });
  const id = Number(result[0].insertId);
  return {
    checksum,
    createdAt: payload.createdAt,
    id,
    recordCount,
    storageKey: stored.key,
  };
}

export async function listRecoverySnapshots(limit = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for recovery snapshot listing.");
  return db.select().from(recoverySnapshots).orderBy(desc(recoverySnapshots.createdAt)).limit(limit);
}

export async function runScheduledRecoverySnapshot(req: Request, res: Response) {
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
      timestamp: new Date().toISOString(),
    });
  }
}
