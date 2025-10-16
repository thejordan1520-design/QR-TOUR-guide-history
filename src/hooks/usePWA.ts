import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: any;
  registration: ServiceWorkerRegistration | null;
}

interface PWAInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
    registration: null
  });

  // Verificar si la app está instalada
  const checkIfInstalled = useCallback(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    
    setPwaState(prev => ({ ...prev, isInstalled }));
  }, []);

  // Manejar el prompt de instalación
  const handleInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setPwaState(prev => ({ 
      ...prev, 
      installPrompt: e,
      isInstallable: true 
    }));
  }, []);

  // Instalar la PWA
  const installPWA = useCallback(async () => {
    if (!pwaState.installPrompt) return false;

    try {
      await (pwaState.installPrompt as PWAInstallPromptEvent).prompt();
      const choiceResult = await (pwaState.installPrompt as PWAInstallPromptEvent).userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setPwaState(prev => ({ 
          ...prev, 
          isInstallable: false,
          installPrompt: null,
          isInstalled: true 
        }));
        return true;
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
    
    return false;
  }, [pwaState.installPrompt]);

  // Registrar Service Worker
  const registerServiceWorker = useCallback(async () => {
    // Evitar registrar Service Worker en desarrollo para prevenir caché inconsistente
    // y problemas de actualización durante el dev server
    if ((import.meta as any)?.env?.DEV) {
      // Asegurar limpieza de SW previamente instalados si el dev server estuvo en producción
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (err) {
          console.warn('SW cleanup in DEV failed:', err);
        }
      }
      return null;
    }
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setPwaState(prev => ({ ...prev, registration }));

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPwaState(prev => ({ ...prev, isUpdateAvailable: true }));
              }
            });
          }
        });

        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, payload } = event.data;
          
          switch (type) {
            case 'CACHE_UPDATED':
              console.log('Cache updated:', payload);
              break;
            case 'OFFLINE_MODE':
              setPwaState(prev => ({ ...prev, isOnline: false }));
              break;
            case 'ONLINE_MODE':
              setPwaState(prev => ({ ...prev, isOnline: true }));
              break;
          }
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    return null;
  }, []);

  // Actualizar Service Worker
  const updateServiceWorker = useCallback(async () => {
    if (pwaState.registration) {
      try {
        await pwaState.registration.update();
        setPwaState(prev => ({ ...prev, isUpdateAvailable: false }));
        return true;
      } catch (error) {
        console.error('Error updating Service Worker:', error);
      }
    }
    return false;
  }, [pwaState.registration]);

  // Manejar cambios de conectividad
  const handleOnline = useCallback(() => {
    setPwaState(prev => ({ ...prev, isOnline: true }));
  }, []);

  const handleOffline = useCallback(() => {
    setPwaState(prev => ({ ...prev, isOnline: false }));
  }, []);

  // Inicializar PWA
  useEffect(() => {
    checkIfInstalled();
    registerServiceWorker();

    // Escuchar eventos de instalación
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkIfInstalled, registerServiceWorker, handleInstallPrompt, handleOnline, handleOffline]);

  // Funciones de utilidad
  const clearCache = useCallback(async () => {
    if (pwaState.registration) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        return true;
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
    return false;
  }, [pwaState.registration]);

  const getCacheSize = useCallback(async () => {
    if (pwaState.registration) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalSize += keys.length;
        }
        
        return totalSize;
      } catch (error) {
        console.error('Error getting cache size:', error);
      }
    }
    return 0;
  }, [pwaState.registration]);

  const invalidateCache = useCallback(async (url: string) => {
    if (pwaState.registration) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => 
            caches.open(cacheName).then(cache => cache.delete(url))
          )
        );
        return true;
      } catch (error) {
        console.error('Error invalidating cache:', error);
      }
    }
    return false;
  }, [pwaState.registration]);

  return {
    ...pwaState,
    installPWA,
    updateServiceWorker,
    clearCache,
    getCacheSize,
    invalidateCache
  };
};
