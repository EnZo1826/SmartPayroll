/**
 * SmartPayroll Service Worker
 * Caches all app assets for full offline operation.
 */
const CACHE_NAME = 'smartpayroll-v1.5.3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap'
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => {
        return new Request(url, { mode: 'no-cors' });
      })).catch(() => {
        // Partial cache is fine — local assets are priority
        return cache.addAll(['./index.html', './app.css', './app.js']);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for local, network-first for external
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle http/https — skip chrome-extension://, data:, blob:, etc.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Cache-first strategy for same-origin & CDN assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Only cache valid same-origin or CORS responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        // Guard: never cache non-http(s) URLs (belt-and-suspenders)
        if (!request.url.startsWith('http')) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
        return response;
      }).catch(() => {
        // Offline fallback to index.html
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// Message handler — supports SKIP_WAITING and CLEAR_CACHE from the app
self.addEventListener('message', async event => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    self.skipWaiting();
    // Notify all clients that cache is cleared
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.postMessage({ type: 'CACHE_CLEARED' }));
  }
});
