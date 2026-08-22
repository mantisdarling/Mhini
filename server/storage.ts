// Preconfigured storage helpers for Manus WebDev templates
// Uploads use Vercel-compatible S3 credentials when supplied, otherwise the
// existing Forge presigned URL integration remains available for Manus hosting.

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

type ExternalStorageConfig = {
  accessKeyId: string;
  bucket: string;
  endpoint?: string;
  forcePathStyle: boolean;
  region: string;
  secretAccessKey: string;
};

let externalStorageClient: S3Client | null = null;

function getExternalStorageConfig(): ExternalStorageConfig | null {
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
    secretAccessKey,
  };
}

function getExternalStorageClient(config: ExternalStorageConfig) {
  if (!externalStorageClient) {
    externalStorageClient = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return externalStorageClient;
}

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}-${hash}`;
  return `${relKey.slice(0, lastDot)}-${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const externalConfig = getExternalStorageConfig();
  if (externalConfig) {
    const client = getExternalStorageClient(externalConfig);
    await client.send(new PutObjectCommand({
      Bucket: externalConfig.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    }));
    return {
      key,
      url: await getSignedUrl(
        client,
        new GetObjectCommand({ Bucket: externalConfig.bucket, Key: key }),
        { expiresIn: 900 },
      ),
    };
  }

  const { forgeUrl, forgeKey } = getForgeConfig();

  // 1. Get presigned PUT URL from Forge
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    console.error("[Storage] Forge presign failed", { status: presignResp.status });
    throw new Error("Storage presign failed.");
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  // 2. PUT file directly to S3
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([Uint8Array.from(data).buffer], { type: contentType });

  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    console.error("[Storage] Object upload failed", { status: uploadResp.status });
    throw new Error("Storage upload failed.");
  }

  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const externalConfig = getExternalStorageConfig();
  if (externalConfig) {
    return { key, url: await storageGetSignedUrl(key) };
  }
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const externalConfig = getExternalStorageConfig();
  if (externalConfig) {
    const client = getExternalStorageClient(externalConfig);
    return getSignedUrl(client, new GetObjectCommand({ Bucket: externalConfig.bucket, Key: normalizeKey(relKey) }), { expiresIn: 900 });
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);

  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);

  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!resp.ok) {
    console.error("[Storage] Forge signed URL failed", { status: resp.status });
    throw new Error("Storage signed URL failed.");
  }

  const { url } = (await resp.json()) as { url: string };
  return url;
}
