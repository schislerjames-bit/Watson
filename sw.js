const CACHE_NAME = "watson-v1";
const CORE_ASSETS = ["./", "./index.html", "./app.jsx", "./manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for CDN scripts (so updates come through), cache-first for the app's own files.
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  const isOwnFile = CORE_ASSETS.some((a) => url.endsWith(a.replace("./", "")));
  if (isOwnFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
