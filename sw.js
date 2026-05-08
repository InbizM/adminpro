const CACHE_NAME = 'adminpro-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests to the network.
  // This is a minimal service worker just to pass PWA criteria.
  event.respondWith(fetch(event.request).catch(() => {
    return caches.match(event.request);
  }));
});
