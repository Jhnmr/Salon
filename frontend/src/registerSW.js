/**
 * Service Worker Registration for SALON PWA
 * Handles SW lifecycle, updates, and offline detection
 */

// Check if service workers are supported
const isSupported = 'serviceWorker' in navigator;

// SW registration instance
let swRegistration = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
  if (!isSupported) {
    console.warn('[SW] Service Workers are not supported in this browser');
    return null;
  }

  try {
    // Register the service worker
    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });

    console.log('[SW] Service Worker registered successfully:', swRegistration.scope);

    // Check for updates on page load
    swRegistration.update();

    // Listen for new service worker installations
    swRegistration.addEventListener('updatefound', handleUpdateFound);

    // Check for updates every 60 seconds
    setInterval(() => {
      swRegistration.update();
    }, 60000);

    return swRegistration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Handle service worker update
 */
function handleUpdateFound() {
  const newWorker = swRegistration.installing;

  if (!newWorker) return;

  console.log('[SW] New Service Worker installing...');

  newWorker.addEventListener('statechange', () => {
    console.log('[SW] Service Worker state changed:', newWorker.state);

    if (newWorker.state === 'installed') {
      if (navigator.serviceWorker.controller) {
        // New service worker is available
        console.log('[SW] New Service Worker available!');
        showUpdateNotification();
      } else {
        // First time installation
        console.log('[SW] Service Worker installed for the first time');
        showInstallNotification();
      }
    }

    if (newWorker.state === 'activated') {
      console.log('[SW] Service Worker activated');
    }
  });
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
  // Create a custom event that the app can listen to
  const event = new CustomEvent('swUpdate', {
    detail: {
      message: 'A new version is available!',
      action: 'Update',
      callback: () => updateServiceWorker(),
    },
  });

  window.dispatchEvent(event);

  // Fallback: show browser confirm dialog if no listener
  setTimeout(() => {
    if (confirm('A new version of SALON is available. Update now?')) {
      updateServiceWorker();
    }
  }, 1000);
}

/**
 * Show first-time installation notification
 */
function showInstallNotification() {
  const event = new CustomEvent('swInstalled', {
    detail: {
      message: 'SALON is now available offline!',
      type: 'success',
    },
  });

  window.dispatchEvent(event);

  console.log('[SW] App is ready for offline use');
}

/**
 * Update service worker by skipping waiting
 */
export function updateServiceWorker() {
  if (!swRegistration || !swRegistration.waiting) {
    console.warn('[SW] No waiting service worker to update');
    return;
  }

  // Tell the service worker to skip waiting
  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

  // Reload the page when the new SW is activated
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

/**
 * Unregister service worker (for debugging or cleanup)
 */
export async function unregisterServiceWorker() {
  if (!isSupported) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();

    if (unregistered) {
      console.log('[SW] Service Worker unregistered successfully');

      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      console.log('[SW] All caches cleared');
    }

    return unregistered;
  } catch (error) {
    console.error('[SW] Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Check online/offline status
 */
export function getOnlineStatus() {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function setupNetworkListeners() {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Check initial status
  if (!navigator.onLine) {
    handleOffline();
  }
}

/**
 * Handle online event
 */
function handleOnline() {
  console.log('[Network] Connection restored');

  const event = new CustomEvent('networkStatus', {
    detail: {
      online: true,
      message: 'Connection restored',
      type: 'success',
    },
  });

  window.dispatchEvent(event);

  // Trigger background sync if available
  if (swRegistration && 'sync' in swRegistration) {
    swRegistration.sync.register('sync-reservations').catch((error) => {
      console.error('[SW] Background sync registration failed:', error);
    });
  }
}

/**
 * Handle offline event
 */
function handleOffline() {
  console.log('[Network] Connection lost');

  const event = new CustomEvent('networkStatus', {
    detail: {
      online: false,
      message: 'You are offline',
      type: 'warning',
    },
  });

  window.dispatchEvent(event);
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission:', permission);

    if (permission === 'granted' && swRegistration) {
      // Subscribe to push notifications
      // This would typically involve getting a token from Firebase Cloud Messaging
      console.log('[Notifications] Ready to receive push notifications');
    }

    return permission;
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return null;
  }
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message) {
  if (!navigator.serviceWorker.controller) {
    console.warn('[SW] No active service worker controller');
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
}

/**
 * Cache specific URLs for offline access
 */
export async function cacheUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return;
  }

  sendMessageToSW({
    type: 'CACHE_URLS',
    urls,
  });

  console.log('[SW] Requested to cache URLs:', urls);
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
  sendMessageToSW({
    type: 'CLEAR_CACHE',
  });

  console.log('[SW] Requested to clear all caches');
}

/**
 * Get cached data from service worker
 */
export async function getCachedData(url) {
  try {
    const cache = await caches.open('salon-pwa-api-v1.0.0');
    const response = await cache.match(url);

    if (response) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('[Cache] Failed to get cached data:', error);
    return null;
  }
}

/**
 * Initialize PWA functionality
 */
export async function initializePWA() {
  console.log('[PWA] Initializing...');

  // Register service worker
  await registerServiceWorker();

  // Setup network listeners
  setupNetworkListeners();

  // Log PWA status
  console.log('[PWA] Standalone mode:', isStandalone());
  console.log('[PWA] Online status:', getOnlineStatus());

  // Show install prompt if available
  setupInstallPrompt();

  console.log('[PWA] Initialization complete');
}

/**
 * Setup install prompt (for PWA installation)
 */
let deferredPrompt = null;

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the default install prompt
    event.preventDefault();

    // Store the event for later use
    deferredPrompt = event;

    console.log('[PWA] Install prompt available');

    // Dispatch custom event for the app to show custom install UI
    const customEvent = new CustomEvent('pwaInstallAvailable', {
      detail: {
        showInstallPrompt: () => showInstallPrompt(),
      },
    });

    window.dispatchEvent(customEvent);
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;

    const event = new CustomEvent('pwaInstalled', {
      detail: {
        message: 'SALON installed successfully!',
        type: 'success',
      },
    });

    window.dispatchEvent(event);
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt() {
  if (!deferredPrompt) {
    console.warn('[PWA] Install prompt not available');
    return null;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const result = await deferredPrompt.userChoice;

    console.log('[PWA] Install prompt result:', result.outcome);

    // Clear the deferred prompt
    deferredPrompt = null;

    return result.outcome;
  } catch (error) {
    console.error('[PWA] Install prompt failed:', error);
    return null;
  }
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA() {
  return deferredPrompt !== null;
}

// Auto-initialize on import (can be disabled by importing individual functions)
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePWA);
  } else {
    initializePWA();
  }
}

export default {
  registerServiceWorker,
  updateServiceWorker,
  unregisterServiceWorker,
  isStandalone,
  getOnlineStatus,
  setupNetworkListeners,
  requestNotificationPermission,
  sendMessageToSW,
  cacheUrls,
  clearAllCaches,
  getCachedData,
  initializePWA,
  showInstallPrompt,
  canInstallPWA,
};
