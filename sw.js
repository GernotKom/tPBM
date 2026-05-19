/* WeberBrain Evaluation – Service Worker
   Strategie: Cache-first mit Stale-While-Revalidate (offline-robust)
   - App startet IMMER instant aus dem Cache (auch ohne Internet)
   - Im Hintergrund wird auf Updates geprüft (wenn Internet da ist)
   - Beim NÄCHSTEN Start ist die neue Version aktiv
   - Robuster als Network-first für eine Praxis-Anwendung */

const CACHE = 'weberbrain-v1-21';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon.png'
];

/* INSTALL: alle App-Dateien beim ersten Besuch cachen */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE: alte Caches aufräumen, sofort übernehmen */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* FETCH: Stale-While-Revalidate für ALLES
   - Aus Cache antworten (sofort, auch offline)
   - Im Hintergrund Update versuchen (für nächsten Start)
   - Fallback auf index.html für Navigations-Requests, falls nichts im Cache */
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;

  /* Externe Requests (z.B. CDNs) werden nicht abgefangen */
  if(new URL(req.url).origin !== location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then(res => {
        if(res && res.ok){
          /* Hintergrund-Update: neue Version für nächsten Start cachen */
          cache.put(req, res.clone());
        }
        return res;
      }).catch(() => null);

      /* Cache-First: wenn vorhanden, sofort zurückgeben */
      if(cached) return cached;

      /* Sonst: aufs Netzwerk warten */
      const fresh = await fetchPromise;
      if(fresh) return fresh;

      /* Letzter Ausweg: index.html als SPA-Fallback (für Navigation) */
      const isHTML = req.mode === 'navigate' ||
                     (req.headers.get('accept') || '').includes('text/html');
      if(isHTML){
        const indexCached = await cache.match('./index.html');
        if(indexCached) return indexCached;
      }

      return new Response('Offline und nicht im Cache', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
    })
  );
});
