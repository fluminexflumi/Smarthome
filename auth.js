// Smarthome-Dashboard – Anmeldung für den Fernzugriff (Microsoft Entra, Authorization Code + PKCE, ohne Bibliothek)
// Lokal (Heimnetz, Port 8080) ist keine Anmeldung nötig.
// Fernmodus: auf GitHub Pages oder zum Testen mit ?remote=1. Dann spricht die Seite mit dem Fern-Port des PCs.
(() => {
  const CFG = {
    tenantId: '8a032887-3bad-43ba-b817-0140a7e8edbe',
    clientId: '25e9e75c-ff6b-4974-b1b3-6381eb33baf6',
    scope: 'Dashboard.Control',
    publicApi: 'https://esu3.taile0658a.ts.net', // Tailscale Funnel → PC, Port 8081
    testApi: 'http://localhost:8081'
  };
  const q = new URLSearchParams(location.search);
  try { if (q.get('remote') === '1') sessionStorage.setItem('sh.remote', '1'); if (q.get('remote') === '0') sessionStorage.removeItem('sh.remote'); } catch {}
  let forced = false; try { forced = sessionStorage.getItem('sh.remote') === '1'; } catch {}
  const onPages = location.hostname.endsWith('github.io');
  const remote = onPages || forced;
  const apiBase = !remote ? '' : onPages ? CFG.publicApi : CFG.testApi;

  const AUTH = `https://login.microsoftonline.com/${CFG.tenantId}/oauth2/v2.0`;
  const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, '');
  const SCOPES = `api://${CFG.clientId}/${CFG.scope} offline_access openid profile`;
  const KEY = 'sh.auth';

  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } },
    set(v) { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch {} }
  };
  const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const rand = (n = 32) => b64url(crypto.getRandomValues(new Uint8Array(n)));
  const claimsOf = (jwt) => { try { return JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch { return {}; } };

  async function tokenRequest(params) {
    const body = new URLSearchParams({ client_id: CFG.clientId, scope: SCOPES, ...params });
    const r = await fetch(AUTH + '/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error_description || j.error || 'Anmeldung fehlgeschlagen');
    const old = store.get() || {};
    const idc = j.id_token ? claimsOf(j.id_token) : {};
    const t = {
      access: j.access_token,
      refresh: j.refresh_token || old.refresh,
      exp: Date.now() + (j.expires_in - 120) * 1000,
      user: idc.preferred_username || idc.name || old.user || ''
    };
    store.set(t); return t;
  }

  // pick = Kontoauswahl erzwingen (wichtig auf Geräten, wo der Browser schon mit einem anderen Microsoft-Konto angemeldet ist → sonst AADSTS50197)
  async function login(pick) {
    const verifier = rand(48), st = rand(16);
    const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    try { sessionStorage.setItem('sh.pkce', JSON.stringify({ verifier, state: st })); } catch {}
    const old = store.get();
    const p = new URLSearchParams({
      client_id: CFG.clientId, response_type: 'code', redirect_uri: REDIRECT, scope: SCOPES,
      code_challenge: challenge, code_challenge_method: 'S256', state: st, response_mode: 'query'
    });
    if (old?.user && pick !== true) p.set('login_hint', old.user);
    else p.set('prompt', 'select_account');
    location.assign(AUTH + '/authorize?' + p);
  }

  // Rückkehr von Microsoft mit ?code=…
  async function handleRedirect() {
    if (!q.get('code') && !q.get('error')) return;
    let saved = null; try { saved = JSON.parse(sessionStorage.getItem('sh.pkce') || 'null'); sessionStorage.removeItem('sh.pkce'); } catch {}
    history.replaceState(null, '', REDIRECT);
    if (q.get('error')) throw new Error(q.get('error_description') || q.get('error'));
    if (!saved || saved.state !== q.get('state')) throw new Error('Anmeldung ungültig (state)');
    await tokenRequest({ grant_type: 'authorization_code', code: q.get('code'), code_verifier: saved.verifier, redirect_uri: REDIRECT });
  }

  let refreshing = null;
  async function getToken() {
    const t = store.get();
    if (!t) return null;
    if (t.access && t.exp > Date.now()) return t.access;
    if (!t.refresh) return null;
    refreshing ||= tokenRequest({ grant_type: 'refresh_token', refresh_token: t.refresh }).catch(() => { store.set({ user: t.user }); return null; }).finally(() => { refreshing = null; });
    return (await refreshing)?.access || null;
  }

  function logout() {
    const u = store.get()?.user; store.set(u ? { user: u } : null);
    location.assign(REDIRECT);
  }

  // Anmeldemaske
  function showGate(msg) {
    let g = document.getElementById('gate');
    if (!g) {
      g = document.createElement('div'); g.id = 'gate'; g.className = 'gate';
      g.innerHTML = `<div class="gate-card">
        <svg class="brand-icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M5 19 20 6l15 13"/><path d="M9 16v17h22V16"/><path d="M17 33v-8h6v8"/></svg>
        <h1>Smarthome</h1><p>Für den Zugriff von unterwegs mit dem Microsoft-Konto anmelden.</p>
        <button class="gate-btn" id="gate-login">Mit Microsoft anmelden</button>
        <button class="gate-link" id="gate-other">Anderes Microsoft-Konto wählen</button>
        <p class="gate-msg" id="gate-msg"></p></div>`;
      document.body.appendChild(g);
      g.querySelector('#gate-login').onclick = () => login(false);
      g.querySelector('#gate-other').onclick = () => login(true);
    }
    g.querySelector('#gate-msg').textContent = msg || '';
    g.hidden = false;
  }
  const hideGate = () => { const g = document.getElementById('gate'); if (g) g.hidden = true; };

  // Bereit, sobald Anmeldung geklärt ist. Lokal sofort.
  const ready = (async () => {
    if (!remote) return true;
    try { await handleRedirect(); } catch (e) { showGate(e.message); return false; }
    if (await getToken()) { hideGate(); return true; }
    showGate(); return false;
  })();

  async function authHeaders() {
    if (!remote) return {};
    const t = await getToken();
    if (!t) { showGate('Bitte erneut anmelden.'); throw new Error('nicht angemeldet'); }
    return { Authorization: 'Bearer ' + t };
  }

  window.SH = { remote, apiBase, ready, authHeaders, login, logout, showGate, user: () => store.get()?.user || '' };
})();
