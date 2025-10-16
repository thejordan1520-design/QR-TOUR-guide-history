export const disableServiceWorkerForAdmin = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Solo deshabilitar si estamos en una ruta de admin
  if (!window.location.pathname.startsWith('/admin')) {
    return;
  }

  console.log('🚫 Deshabilitando Service Worker para el panel admin...');

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('🧹 Service Worker desregistrado:', registration.scope);
    }

    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('🗑️ Cache eliminado:', cacheName);
    }

    console.log('✅ Service Worker y caches limpiados para admin.');
  } catch (error) {
    console.error('❌ Error al deshabilitar Service Worker para admin:', error);
  }
};

// ✅ FUNCIÓN OBSOLETA - Ya no se necesita limpiar storage corrupto
// Ahora cada cliente usa su propio storage key separado
