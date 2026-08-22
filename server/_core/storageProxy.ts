import type { Express } from "express";
import { ENV } from "./env";
import { scalePolicy } from "../../shared/scalePolicy";

type CachedRedirect = { expiresAt: number; url: string };

const redirectCache = new Map<string, CachedRedirect>();
const maxRedirectCacheEntries = 1000;

function cachedUrl(key: string) {
  const value = redirectCache.get(key);
  if (!value) return null;
  if (value.expiresAt <= Date.now()) {
    redirectCache.delete(key);
    return null;
  }
  return value.url;
}

function cacheUrl(key: string, url: string) {
  if (redirectCache.size >= maxRedirectCacheEntries) {
    const oldestKey = redirectCache.keys().next().value;
    if (typeof oldestKey === "string") redirectCache.delete(oldestKey);
  }
  redirectCache.set(key, {
    url,
    expiresAt: Date.now() + scalePolicy.storageRedirectCacheTtlMs,
  });
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/{*key}", async (req, res) => {
    const rawKey = (req.params as Record<string, string | string[]>).key;
    const key = Array.isArray(rawKey) ? rawKey.join("/") : rawKey;
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (key.includes("\0") || key.split("/").includes("..")) {
      res.status(400).send("Invalid storage key");
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
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
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
