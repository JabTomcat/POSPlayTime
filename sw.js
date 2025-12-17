
/* Service Worker for offline caching */
const CACHE_NAME = 'posplaytime-v5';
const ASSETS = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'admin.html',
  'admin.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/sounds/cha-ching.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).then(resp => {
        if (request.method === 'GET' && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
               return resp;
      }).catch(() => cached)
    })
  )
})