// Service Worker para PWA con soporte para Supabase
const CACHE_NAME = 'puerto-plata-audio-v1';
const STATIC_CACHE_NAME = 'puerto-plata-static-v1';
const DYNAMIC_CACHE_NAME = 'puerto-plata-dynamic-v1';

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/audio/audios/fortalezaING.mp3',
  '/audio/audios/telefericoING.mp3',
  '/audio/audios/callesombrillaING.mp3',
  '/audio/audios/callerosadaING.mp3',
  '/audio/audios/letreroING.mp3',
  '/audio/audios/museoambarING.mp3',
  '/audio/audios/ronfactoryING.mp3',
  '/audio/audios/larimarING.mp3',
  '/audio/audios/hermanasmirabalING.mp3',
  '/audio/audios/neptuneiING.mp3',
  '/audio/audios/catedralING.mp3',
  '/audio/audios/cristoredentorING.mp3',
  '/audio/audios/cometasING.mp3',
  '/audio/audios/telefericoING.mp3',
  '/audio/audios/paequecentralING.mp3',
  '/audio/audios/museogregorioluperonING.mp3',
  '/audio/audios/oceanworldING.mp3'
];

// URLs de Supabase para cachear dinámicamente
const SUPABASE_URLS = [
  '/rest/v1/destinations',
  '/rest/v1/user',
  '/rest/v1/user_subscriptions',
  '/rest/v1/payments',
  '/rest/v1/qr_codes',
  '/rest/v1/scans',
  '/rest/v1/advertisements',
  '/rest/v1/app_settings',
  '/rest/v1/avatar_collectibles',
  '/rest/v1/badges',
  '/rest/v1/admin_users',
  '/rest/v1/ad_metrics'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Interceptación de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia para archivos estáticos
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
              return response;
            });
        })
    );
    return;
  }

  // Estrategia para Supabase API
  if (url.hostname.includes('supabase') || SUPABASE_URLS.some(supabaseUrl => url.pathname.includes(supabaseUrl))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                // Si hay respuesta cacheada, devuélvela inmediatamente (stale-while-revalidate)
                // y actualiza en segundo plano sin depender de headers mutados
                fetch(request).then(netRes => {
                  if (netRes && netRes.status === 200) {
                    cache.put(request, netRes.clone());
                  }
                }).catch(() => {});
                return response;
              }

              // Hacer request a la red
              return fetch(request)
                .then((response) => {
                  if (response.status === 200) {
                    cache.put(request, response.clone());
                  }
                  return response;
                })
                .catch(() => {
                  // Si falla la red, devolver respuesta del cache si existe
                  return caches.match(request);
                });
            });
        })
    );
    return;
  }

  // Estrategia para imágenes y archivos de audio
  if (request.destination === 'image' || request.destination === 'audio') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                // SWR para imágenes/audio
                fetch(request).then(netRes => {
                  if (netRes && netRes.status === 200) {
                    cache.put(request, netRes.clone());
                  }
                }).catch(() => {});
                return response;
              }

              return fetch(request)
                .then((netRes) => {
                  if (netRes.status === 200) {
                    cache.put(request, netRes.clone());
                  }
                  return netRes;
                });
            });
        })
    );
    return;
  }

  // Estrategia por defecto: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_INVALIDATE':
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.delete(payload.url);
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;
      
    case 'CACHE_CLEAR':
      caches.delete(DYNAMIC_CACHE_NAME)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;
      
    case 'GET_CACHE_SIZE':
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.keys();
        })
        .then((keys) => {
          event.ports[0].postMessage({ size: keys.length });
        });
      break;
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí podrías sincronizar datos con Supabase
      console.log('Background sync: Syncing data with Supabase')
    );
  }
});

// Notificaciones push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver más',
          icon: '/icons/explore.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/icons/close.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/biblioteca-react')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
  } else {
    // Clic en la notificación (no en una acción)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
