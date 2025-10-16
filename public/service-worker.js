// Simple service worker for offline support
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('qr-tour-guide-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        // Add more assets as needed
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // No hacer CacheFirst aquí: delegar a sw.js principal. Sólo fallback mínimo.
      if (response) return response;
      return fetch(event.request).catch(() => Response.error());
    })
  );
});
