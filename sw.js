// EduScreen Service Worker v1.2.0 - Optimized Offline-First PWA
const CACHE_NAME = 'eduscreen-v1.2.0';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg'
];

// Pre-cache essential static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Purge obsolete caches on activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Robust Fetch Strategy:
// 1. Navigation requests: Network-First with Cache fallback (ensures latest app version)
// 2. Static Assets: Cache-First with Network background refresh
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Network-First for HTML navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match('./index.html') || caches.match('./');
                })
        );
        return;
    }

    // Cache-First for same-origin static assets
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const copy = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return networkResponse;
                }).catch(() => {
                    // Safe fallback without throwing TypeError
                    return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
                });
            })
        );
    }
});
