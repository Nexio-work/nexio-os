/// <reference lib="webworker" />

// Workbox-style service worker for Nexio OS PWA
const CACHE_NAME = 'nexio-os-v1';
const STATIC_CACHE = 'nexio-static-v1';

// Precache shell assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/app.css',
        '/icons/logo.svg',
      ]);
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API routes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API requests: NetworkFirst with fallback to cached
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch {
          return cache.match(event.request) || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  // Static assets: CacheFirst
  if (url.pathname.match(/\.(js|css|svg|png|woff2?)$/)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Navigation: SPA fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).catch(() => caches.match('/'));
      })
    );
  }
});

// Background sync: push pending operations when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(
      (async () => {
        // The sync engine's pushQueue will be called here
        // In practice, the main thread handles this via online event
        const clients = await self.clients.matchAll();
        clients.forEach(client => client.postMessage({ type: 'SYNC_PUSH' }));
      })()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  let data: any = {};
  try { data = event.data?.json(); } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'Nexio OS', {
      body: data.body || 'Mise à jour disponible',
      icon: '/icons/logo.svg',
      badge: '/icons/logo.svg',
      tag: data.tag || 'default',
      actions: [
        { action: 'open', title: 'Ouvrir' },
        { action: 'dismiss', title: 'Fermer' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
