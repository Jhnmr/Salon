// Service Worker for SALON PWA
// Version-based cache invalidation
const CACHE_VERSION = 'v1.0.0';
const CACHE_PREFIX = 'salon-pwa';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-${CACHE_VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API endpoints to cache
const API_ROUTES = [
  '/api/services',
  '/api/stylists',
  '/api/branches',
  '/api/service-categories',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Failed to cache static assets:', err);
        // Continue installation even if some assets fail
        return Promise.resolve();
      });
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE &&
              cacheName !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Image requests - Cache First strategy
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Static assets - Cache First strategy
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // HTML pages - Network First with offline fallback
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      networkFirstStrategy(request, DYNAMIC_CACHE)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Default - Network First strategy
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Network First Strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If it's an API request, return offline data
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'You are currently offline. Please check your connection.',
          offline: true,
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    throw error;
  }
}

// Cache First Strategy - try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache and network failed for:', request.url);
    throw error;
  }
}

// Background Sync - retry failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-reservations') {
    event.waitUntil(syncReservations());
  } else if (event.tag === 'sync-reviews') {
    event.waitUntil(syncReviews());
  }
});

// Sync reservations from IndexedDB
async function syncReservations() {
  try {
    console.log('[SW] Syncing reservations...');

    // Get pending reservations from IndexedDB
    const db = await openDB();
    const tx = db.transaction('pending-reservations', 'readonly');
    const store = tx.objectStore('pending-reservations');
    const reservations = await store.getAll();

    // Send each reservation to the server
    for (const reservation of reservations) {
      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reservation.data),
        });

        if (response.ok) {
          // Remove from IndexedDB after successful sync
          const deleteTx = db.transaction('pending-reservations', 'readwrite');
          const deleteStore = deleteTx.objectStore('pending-reservations');
          await deleteStore.delete(reservation.id);

          console.log('[SW] Reservation synced:', reservation.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync reservation:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error;
  }
}

// Sync reviews from IndexedDB
async function syncReviews() {
  try {
    console.log('[SW] Syncing reviews...');

    const db = await openDB();
    const tx = db.transaction('pending-reviews', 'readonly');
    const store = tx.objectStore('pending-reviews');
    const reviews = await store.getAll();

    for (const review of reviews) {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(review.data),
        });

        if (response.ok) {
          const deleteTx = db.transaction('pending-reviews', 'readwrite');
          const deleteStore = deleteTx.objectStore('pending-reviews');
          await deleteStore.delete(review.id);

          console.log('[SW] Review synced:', review.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync review:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error;
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('salon-offline-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('pending-reservations')) {
        db.createObjectStore('pending-reservations', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('pending-reviews')) {
        db.createObjectStore('pending-reviews', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push Notification handling (Firebase Cloud Messaging placeholder)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  let notificationData = {
    title: 'SALON',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {},
  };

  // Parse push notification data
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || {},
      };
    } catch (error) {
      console.error('[SW] Failed to parse push data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    tag: 'salon-notification',
    requireInteraction: false,
    data: notificationData.data,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app or focus existing window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window if none exists
        if (clients.openWindow) {
          const url = event.notification.data?.url || '/';
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
