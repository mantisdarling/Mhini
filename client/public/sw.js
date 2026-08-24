const CACHE_VERSION = "mantis-shell-v2";
const APP_SHELL = "/index.html";
const OFFLINE_RESPONSE = new Response(
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mantis is offline</title><body style="margin:0;background:#0a0a0a;color:#f2efe9;font:16px system-ui,sans-serif;display:grid;min-height:100vh;place-items:center"><main style="max-width:32rem;padding:2rem"><p style="color:#e31d2f;letter-spacing:.14em;text-transform:uppercase;font-size:.72rem">Mantis / offline</p><h1>Stay with the signal.</h1><p>The latest page shell is unavailable right now. Reconnect and try again.</p></main></body></html>',
  { headers: { "Content-Type": "text/html; charset=utf-8" } }
);

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then(cache => cache.add(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(
              key => key.startsWith("mantis-shell-") && key !== CACHE_VERSION
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isCacheableAsset(request) {
  return (
    request.method === "GET" &&
    new URL(request.url).origin === self.location.origin &&
    (request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "font" ||
      request.destination === "image")
  );
}

self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/manus-storage/")
  )
    return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE_VERSION)
              .then(cache => cache.put(APP_SHELL, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(APP_SHELL).then(response => response || OFFLINE_RESPONSE)
        )
    );
    return;
  }

  if (isCacheableAsset(request)) {
    event.respondWith(
      caches.match(request).then(
        cached =>
          cached ||
          fetch(request).then(response => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(CACHE_VERSION)
                .then(cache => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
