// Aventura360 Service Worker — Network First Strategy
// Version: always fetches fresh content, cache only as fallback

const CACHE_NAME = 'aventura360-v' + Date.now();

self.addEventListener('install', event => {
  // Skip waiting so new SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Delete ALL old caches
      caches.keys().then(keys =>
        Promise.all(keys.map(key => caches.delete(key)))
      )
    ])
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests for our own origin
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // Always try network first
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        // Got fresh response — return it directly, don't cache HTML
        return response;
      })
      .catch(() => {
        // Network failed — try cache as fallback (offline mode)
        return caches.match(event.request);
      })
  );
});
