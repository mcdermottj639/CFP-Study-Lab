/* FP Study Lab — service worker (offline support) */
const VERSION = 'v2.8.0';
const CORE_CACHE = `fpsl-core-${VERSION}`;
const RUNTIME_CACHE = `fpsl-runtime-${VERSION}`;

/* Same-origin assets precached on install so the app opens offline. */
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/chart.umd.js',
  './vendor/fonts/dancing-script-latin-700-normal.woff2',
  './vendor/fonts/dancing-script-latin-400-normal.woff2',
  './flashcards.js',
  './reader-theme.css',
  './reader-theme.js',
  './vendor/mathjax/tex-mml-svg.js',
  './apps/fp511-reading.html',
  './apps/fp512-reading.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then((cache) => Promise.all(CORE_ASSETS.map((u) =>
        fetch(new Request(u, { cache: "reload" }))
          .then((r) => { if (r && (r.ok || r.type === "opaque")) return cache.put(u, r); })
          .catch(function(){})
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CORE_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigations: network-first, fall back to cache, then offline shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CORE_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Same-origin static assets (incl. PDFs): cache-first.
  if (sameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached)
      )
    );
    return;
  }

  // Cross-origin (Google Fonts, CDN scripts): stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
