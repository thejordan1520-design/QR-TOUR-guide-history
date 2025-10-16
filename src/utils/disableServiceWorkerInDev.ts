export const disableServiceWorkerInDev = async () => {
  try {
    // Solo en desarrollo, asegura que no quede ningún SW controlando
    // el scope del dev server (previene caché corrupto e interceptores de fetch)
    // Se ejecuta en todos los paths, no solo /admin
    const isDev = (import.meta as any)?.env?.DEV;
    if (!isDev || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      try { await r.unregister(); } catch {}
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch {}

    // Forzar liberación del controlador activo
    if (navigator.serviceWorker.controller) {
      try { navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' }); } catch {}
    }

    // Añadir pequeño delay para asegurar liberación antes de primeras peticiones
    await new Promise((res) => setTimeout(res, 50));
    console.log('🧹 DEV: Service Worker desregistrado y cachés limpiados');
  } catch (err) {
    console.warn('DEV SW cleanup failed:', err);
  }
};









