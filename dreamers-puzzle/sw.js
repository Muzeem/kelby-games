const CACHE_NAME = 'dreamers-puzzle-v1';
const urlsToCache = [
  '/games/dreamers-puzzle/',
  '/games/dreamers-puzzle/index.html',
  '/games/dreamers-puzzle/styles.css',
  '/games/dreamers-puzzle/app.js',
  '/games/dreamers-puzzle/puzzles-data.js',
  '/games/dreamers-puzzle/manifest.json',
  '/games/dreamers-puzzle/offline.html'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened, adding files...');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('All files cached successfully');
            self.skipWaiting();
          })
          .catch((err) => {
            console.error('Error caching files:', err);
            throw err;
          });
      })
      .catch((err) => {
        console.error('Error opening cache:', err);
        throw err;
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated and ready');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          });
      })
      .catch(() => {
        console.log('Offline - serving offline page');
        return caches.match('/games/dreamers-puzzle/offline.html');
      })
  );
});
