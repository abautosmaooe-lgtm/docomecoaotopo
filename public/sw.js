const CACHE_NAME = "comeco-ao-topo-v3";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/manifest.json"
];

// Install Service Worker & Pre-cache basic shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("Pre-cache warning on install:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker & clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listen for custom messages from app (e.g. manual offline sync)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PRECACHE_ALL") {
    caches.open(CACHE_NAME).then((cache) => {
      if (event.data.urls && Array.isArray(event.data.urls)) {
        cache.addAll(event.data.urls).then(() => {
          if (event.source) {
            event.source.postMessage({ type: "PRECACHE_COMPLETE", success: true });
          }
        }).catch((err) => {
          if (event.source) {
            event.source.postMessage({ type: "PRECACHE_COMPLETE", success: false, error: String(err) });
          }
        });
      }
    });
  }
});

// Fetch Interceptor: Network-first with Cache-fallback strategy
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  
  // Never intercept API backend calls or Vite dev files
  if (
    !url.startsWith(self.location.origin) ||
    event.request.method !== "GET" ||
    url.includes("/api/") ||
    url.includes("/src/") ||
    url.includes("/@vite") ||
    url.includes("/@fs") ||
    url.includes("/node_modules/") ||
    url.endsWith(".tsx") ||
    url.endsWith(".ts") ||
    url.endsWith(".jsx")
  ) {
    return;
  }

  // Handle SPA navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match("/");
          if (fallback) return fallback;
          return caches.match("/index.html");
        })
    );
    return;
  }

  // Static assets: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
