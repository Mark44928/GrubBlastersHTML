// Bump when index.html changes so clients pick up the new shell instead of
// serving a stale cache forever.
const CACHE_NAME = "grubblasters-v1";
const SHELL = [
  "./",
  "./index.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      ),
    ])
  );
});

// Stale-while-revalidate for navigations: serve the cached game instantly,
// refresh in the background. Other same-origin GETs fall back to cache when
// the network is unreachable. This is what makes re-launching instant — and
// plays offline for free.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        const fresh = fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => cached);
        return cached || fresh;
      })()
    );
    return;
  }
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
