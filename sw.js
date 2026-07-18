const CACHE_NAME = 'registros-v2';
const FILES_STATIC = [
  './style.css',
  './manifest.json',
  './icon.png'
];

// Al instalar, cachea solo archivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_STATIC))
  );
  self.skipWaiting();
});

// Al activar, elimina cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: network first para HTML y JS, cache fallback para el resto
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // HTML y JS siempre desde la red primero
  if (url.endsWith('.html') || url.endsWith('.js') || url.includes('index') || url.includes('script')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // El resto: cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
