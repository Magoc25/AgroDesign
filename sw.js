/* AgroDesign — Service Worker v1.0.0 — cache v24 */

const CACHE_NAME = 'agrodesign-v47';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const isAppFile = event.request.url.includes('AgroDesign.html') ||
                    event.request.url.includes('AgroDesignLab.html') ||
                    event.request.url.includes('manifest.json') ||
                    event.request.url.includes('icon-');

  // Network-first: busca sempre a versão mais recente quando online;
  // usa o cache apenas como fallback offline.
  // Para arquivos do app, força cache: 'no-cache' para ignorar o cache HTTP
  // do browser e garantir que atualizações cheguem imediatamente no PWA.
  const req = isAppFile ? new Request(event.request, { cache: 'no-cache' }) : event.request;

  event.respondWith(
    fetch(req).then(response => {
      if (response.ok && isAppFile) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request)
                    .then(cached => cached || new Response('Offline', { status: 503 })))
  );
});
