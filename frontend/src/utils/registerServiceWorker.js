/**
 * Service Worker Registration
 * Registers the service worker for PWA functionality
 */

export const registerServiceWorker = async () => {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser');
    return;
  }

  try {
    // Wait for page to load
    await new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });

    // Register the service worker
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js',
      {
        scope: '/',
      }
    );

    console.log('Service Worker registered successfully:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('New service worker available! Please refresh.');

          // Optionally show a toast notification to the user
          if (window.showUpdateNotification) {
            window.showUpdateNotification();
          }
        }
      });
    });

    // Listen for controller change (new service worker took over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

/**
 * Unregister service worker
 * Useful for development or cleanup
 */
export const unregisterServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();

    if (result) {
      console.log('Service Worker unregistered successfully');
    }

    return result;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
};

/**
 * Check if app is running as installed PWA
 */
export const isInstalledPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Prompt user to install PWA
 */
export const promptPWAInstall = (() => {
  let deferredPrompt = null;

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default prompt
    e.preventDefault();

    // Store the event for later use
    deferredPrompt = e;

    console.log('PWA install prompt ready');
  });

  // Return function to trigger the prompt
  return async () => {
    if (!deferredPrompt) {
      console.log('PWA install prompt not available');
      return false;
    }

    try {
      // Show the prompt
      deferredPrompt.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`PWA install prompt outcome: ${outcome}`);

      // Clear the prompt
      deferredPrompt = null;

      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing PWA install prompt:', error);
      return false;
    }
  };
})();

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Notifications are not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Request notification permission
      const hasPermission = await requestNotificationPermission();

      if (!hasPermission) {
        console.log('Notification permission denied');
        return null;
      }

      // Subscribe to push notifications
      // You'll need to generate VAPID keys and add the public key here
      // const publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY';

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      console.log('Push notification subscription created:', subscription);
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

export default registerServiceWorker;
