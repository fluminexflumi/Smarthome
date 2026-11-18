// Smarthome-Dashboard – App-Funktionen: Service Worker registrieren, Knopf „App installieren“.
// Ein Service Worker geht nur über HTTPS oder localhost, also auf GitHub Pages
// (https://fluminexflumi.github.io/Smarthome/) und localhost, nicht über die LAN-Adresse mit http.
(() => {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;

  // Neue Version übernommen → einmal neu laden (nicht beim allerersten Installieren)
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true; location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('Service Worker:', e));
  });

  // Knopf erscheint nur, wenn der Browser die Installation anbietet (Chrome/Edge, noch nicht installiert)
  let offer = null;
  const btn = document.createElement('button');
  btn.className = 'icon-btn install-btn';
  btn.id = 'install';
  btn.hidden = true;
  btn.title = 'Als App installieren';
  btn.setAttribute('aria-label', 'Als App installieren');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>';
  const place = () => { const tr = document.querySelector('.top-right'); if (tr && !btn.isConnected) tr.prepend(btn); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); offer = e; btn.hidden = false;
  });
  btn.addEventListener('click', async () => {
    if (!offer) return;
    btn.hidden = true;
    offer.prompt();
    try { await offer.userChoice; } catch {}
    offer = null;
  });
  window.addEventListener('appinstalled', () => { btn.hidden = true; offer = null; });
})();
