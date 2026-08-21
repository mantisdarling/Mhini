export const scalePolicy = {
  jsonPayloadLimit: "1mb",
  publicProjectCacheTtlMs: 60000,
  storageRedirectCacheTtlMs: 60000,
  staticAssetMaxAgeMs: 31536000000,
  staticFileMaxAgeMs: 3600000,
  documentCacheControl: "no-store",
  storageRedirectCacheControl: "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
} as const;
