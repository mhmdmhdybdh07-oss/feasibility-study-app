// Service Worker for Offline Mode (PWA)
const CACHE_NAME = 'feasibility-app-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// تنشيط Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية الشبكة أولاً ثم الكاش (Network First)
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات API (تحتاج شبكة)
  if (event.request.url.includes('/api/')) {
    return;
  }

  // تجاهل طلبات Chrome Extension
  if (event.request.url.includes('chrome-extension://')) {
    return;
  }

  // فقط GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // انسخ الاستجابة للكاش
        if (response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // عند فشل الشبكة، استخدم الكاش
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // إذا كان طلب صفحة، أعد الصفحة الرئيسية
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
