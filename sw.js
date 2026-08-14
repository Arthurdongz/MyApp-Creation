// Minimal app-shell cache so the installed PWA opens offline. Bump
// CACHE_NAME whenever the precached file list changes so old caches get
// cleaned up — otherwise a stale entry could hang around forever.
const CACHE_NAME = "barnabas-journal-v1";
const PRECACHE_URLS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "content.js",
  "data-verses.js",
  "data-encouragements.js",
  "data-moments.js",
  "data-wisdom.js",
  "data-stories.js",
  "manifest.json",
  "favicon-32.png",
  "favicon-192.png",
  "apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

// Stale-while-revalidate: serve the cached copy instantly (so it works
// offline), but always fetch a fresh copy in the background to keep the
// next load current.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
