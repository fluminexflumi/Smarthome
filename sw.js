// Smarthome-Dashboard – Service Worker (macht die Seite als App installierbar)
// Regeln:
//  - Nur eigene Dateien (gleicher Ursprung, GET, nicht /api/). Live-Daten, Steuerbefehle,
//    Tailscale-Funnel und Microsoft-Anmeldung laufen immer direkt übers Netz und werden nie gespeichert.
//  - Netz zuerst: Neue Versionen (GitHub Pages / lokaler Server) sind sofort da.
//    Der Zwischenspeicher dient nur dazu, dass die App ohne Netz noch startet.
// Bei Änderungen an der Dateiliste VERSION erhöhen.
const VERSION = 'sh-v8';
const SHELL = ['./', 'index.html', 'style.css', 'layouts.css', 'layouts2.css', 'app.js', 'layouts.js', 'layouts2.js', 'auth.js', 'pwa.js', 'manifest.webmanifest',
  'wohnzimmer.jpg', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // Funnel, Microsoft, Google Fonts
  if (url.pathname.includes('/api/')) return;          // Live-Daten nie anfassen
  const isPage = req.mode === 'navigate';
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      // Anmelde-Rückkehr (?code=…) nicht speichern, nur saubere Antworten
      if (res.ok && !url.search) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(isPage ? './' : req, copy));
      }
      return res;
    } catch (err) {
      const hit = await caches.match(isPage ? './' : req, { ignoreSearch: isPage });
      if (hit) return hit;
      throw err;
    }
  })());
});
