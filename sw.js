/* ================================================================
   FLOATING LIFE OS — Service Worker v2
   Strategy: Cache-first app shell, stale-while-revalidate CDN
   ================================================================ */

const CACHE_NAME    = 'lifeos-shell-v2';
const RUNTIME_CACHE = 'lifeos-runtime-v2';
const FONT_CACHE    = 'lifeos-fonts-v2';

const SHELL_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './offline.html',
];

const NEVER_CACHE = ['api.anthropic.com', 'chrome-extension'];

/* ── Install ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(SHELL_ASSETS.map(a => cache.add(a))))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => ![CACHE_NAME, RUNTIME_CACHE, FONT_CACHE].includes(k))
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (NEVER_CACHE.some(p => request.url.includes(p))) return;

  /* Google Fonts → cache-first */
  if (request.url.includes('fonts.gstatic.com') || request.url.includes('fonts.googleapis.com')) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  /* CDN (Three.js, Chart.js) → stale-while-revalidate */
  if (request.url.includes('cdnjs.cloudflare.com') || request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  /* App shell → cache-first with offline fallback */
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(cacheFirstWithFallback(request));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) (await caches.open(cacheName)).put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
  return cached || fresh;
}

async function cacheFirstWithFallback(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) (await caches.open(CACHE_NAME)).put(req, res.clone());
    return res;
  } catch {
    if (req.mode === 'navigate') {
      return caches.match('./offline.html') ||
        new Response('<!doctype html><html><body style="background:#00000e;color:#00e5ff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column"><h1>⬡ OFFLINE</h1><p>Floating Life OS is offline. Your data is safe.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('', { status: 503 });
  }
}

/* ── Notification click ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clients => clients.find(c => c.focus)?.focus() ?? self.clients.openWindow('./'))
  );
});

/* ── Message: allow page to trigger skip-waiting ── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
