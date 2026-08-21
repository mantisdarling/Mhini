import { createHash } from "crypto";
import type { Request, Response } from "express";
import { storagePut } from "./storage";
import { createRecoverySnapshotRecord, getAllProjects, listRecoverySnapshotRecords } from "./db";
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
  const payload = buildRecoveryPayload(await getAllProjects());

  const body = JSON.stringify(payload);
  const checksum = createHash("sha256").update(body).digest("hex");
  const recordCount = payload.tables.projects.length;
  const stored = await storagePut(recoveryKey(payload.createdAt), body, "application/json");

  const result = await createRecoverySnapshotRecord({
    checksum,
    recordCount,
    storageKey: stored.key,
  });
  return {
    checksum,
    createdAt: payload.createdAt,
    id: result.id,
    recordCount,
    storageKey: stored.key,
  };
}

export async function listRecoverySnapshots(limit = 30) {
  return listRecoverySnapshotRecords(limit);
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

export function isAuthorizedVercelCron(authorization: string | undefined, secret = process.env.CRON_SECRET) {
  return Boolean(secret && authorization === `Bearer ${secret}`);
}

export function createVercelRecoverySnapshotHandler(snapshotCreator = createRecoverySnapshot) {
  return async (req: Request, res: Response) => {
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
        timestamp: new Date().toISOString(),
      });
    }
  };
}

export const runVercelRecoverySnapshot = createVercelRecoverySnapshotHandler();
