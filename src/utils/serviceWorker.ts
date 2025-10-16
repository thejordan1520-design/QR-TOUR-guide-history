// Service Worker registration and management
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  // No registrar en desarrollo
  if ((import.meta as any)?.env?.DEV) {
    return null;
  }
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('Service Worker unregistered successfully');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

export const clearServiceWorkerCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Service Worker cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear Service Worker cache:', error);
    }
  }
};

export const getServiceWorkerStatus = async (): Promise<{
  isSupported: boolean;
  isRegistered: boolean;
  isControlling: boolean;
  registration: ServiceWorkerRegistration | null;
}> => {
  const isSupported = 'serviceWorker' in navigator;
  
  if (!isSupported) {
    return {
      isSupported: false,
      isRegistered: false,
      isControlling: false,
      registration: null
    };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const isRegistered = !!registration;
    const isControlling = !!navigator.serviceWorker.controller;
    
    return {
      isSupported: true,
      isRegistered,
      isControlling,
      registration
    };
  } catch (error) {
    console.error('Failed to get Service Worker status:', error);
    return {
      isSupported: true,
      isRegistered: false,
      isControlling: false,
      registration: null
    };
  }
};