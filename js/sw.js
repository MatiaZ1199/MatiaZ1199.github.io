
const CACHE_NAME = 'auth-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/css/dashboard.css',
  '/css/styles.css',
  '/js/app.js'  
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
