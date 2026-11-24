/* AgroDesign (Campo + Lab) — Service Worker — network-first com tempo-limite (guia §8 / r147) */

const CACHE_NAME = 'agrodesign-v77';
const HTML_ESPERA_MS = 3500;   // quanto a abertura espera a rede antes de usar a cópia do cache (r147)

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

  const url = event.request.url;
  const isHTML = url.includes('AgroDesign.html') ||
                 url.includes('AgroDesignLab.html');
  const isAppFile = isHTML ||
                    url.includes('manifest.json') ||
                    url.includes('icon-');

  // Para arquivos do app, força cache: 'no-cache' para ignorar o cache HTTP
  // do browser e garantir que atualizações cheguem imediatamente no PWA.
  const req = isAppFile ? new Request(event.request, { cache: 'no-cache' }) : event.request;

  // HTML do app (Campo e Lab): network-first COM TEMPO-LIMITE (r147). Em campo o caso difícil
  // não é "offline", é sinal que conecta e não responde: sem o limite, a abertura esperava o
  // fetch desistir. Só resposta ok entra no cache; erro do servidor com cópia boa → cópia;
  // a cópia é gravada e procurada SEM a query (?origem=qr…), uma só por arquivo.
  if (isHTML) {
    const chave = url.split('#')[0].split('?')[0];
    const doCache = () => caches.match(chave, { ignoreSearch: true });
    let gravou = Promise.resolve();
    const daRede = fetch(req).then(resp => {
      if (resp.ok) { const copia = resp.clone(); gravou = caches.open(CACHE_NAME).then(c => c.put(chave, copia)); }
      return resp;
    });
    event.waitUntil(daRede.then(() => gravou).catch(() => {}));   // resposta tardia ainda atualiza o cache
    const espera = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), HTML_ESPERA_MS));
    event.respondWith(
      Promise.race([daRede, espera])
        .then(resp => (resp.ok || resp.type === 'opaqueredirect') ? resp : doCache().then(c => c || resp))
        .catch(() => doCache().then(c => c || daRede.catch(() => new Response('Offline', { status: 503 }))))
    );
    return;
  }

  // Demais (manifest, ícones e o resto do mesmo origin): network-first simples;
  // manifest/ícones guardam cópia (só resposta ok) para o fallback offline.
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
