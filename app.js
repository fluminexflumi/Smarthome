// Smarthome-Dashboard – Oberfläche (Layout im Stil der Vorlage: Seitenleiste, Raumansicht, Kacheln)
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let S = null;            // Zustand vom Server
let live = false;        // SSE verbunden
let busy = false;        // Regler wird gerade bedient → nicht neu zeichnen
let view = 'home';
let roomId = null;
try { view = localStorage.getItem('sh.view') || 'home'; } catch {}

// ---------- Icons ----------
const I = {
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
  pad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 5v1M12 18v1M5 12h1M18 12h1"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  blind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8h16M4 12h16"/><path d="M12 12v4"/></svg>',
  tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  lamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l3 7H5z"/><path d="M12 10v8M8 21h8"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v9"/><path d="M6.3 7a8 8 0 1 0 11.4 0"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M7 6.5h10"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
  dock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M12 11v3m0 0-2-2m2 2 2-2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>'
};

// ---------- Server ----------
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
async function api(path, body = {}) {
  try {
    const r = await fetch(SH.apiBase + '/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await SH.authHeaders()) }, body: JSON.stringify(body) });
    if (r.status === 401) { SH.showGate('Anmeldung abgelaufen oder nicht berechtigt.'); throw new Error('nicht angemeldet'); }
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Fehler');
  } catch (e) { toast('Hat nicht geklappt: ' + e.message); }
}
// holdRender (layouts2.js): z. B. während im Terminal getippt wird nicht neu zeichnen
const held = () => typeof holdRender === 'function' && holdRender();
function onState(data) { S = JSON.parse(data); if (!busy && !held()) render(); }
function setLive(v) { if (live !== v) { live = v; if (S) render(); } }
function connect() {
  if (!SH.remote) {
    const es = new EventSource('/api/events');
    es.onopen = () => setLive(true);
    es.onmessage = (e) => onState(e.data);
    es.onerror = () => setLive(false);
    return;
  }
  // Fernmodus: EventSource kann kein Token mitschicken → Live-Strom per fetch lesen
  (async function stream() {
    try {
      const r = await fetch(SH.apiBase + '/api/events', { headers: await SH.authHeaders(), cache: 'no-store' });
      if (r.status === 401) { setLive(false); SH.showGate('Anmeldung abgelaufen oder nicht berechtigt.'); return; }
      if (!r.ok || !r.body) throw new Error('HTTP ' + r.status);
      setLive(true);
      const rd = r.body.getReader(), dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { value, done } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
          const data = chunk.split('\n').filter(l => l.startsWith('data: ')).map(l => l.slice(6)).join('\n');
          if (data) onState(data);
        }
      }
    } catch (e) { if (e.message === 'nicht angemeldet') { setLive(false); return; } }
    setLive(false);
    setTimeout(stream, 5000);
  })();
}

// ---------- Hilfen ----------
const pct = (bri) => bri == null ? 0 : Math.max(1, Math.round(bri / 254 * 100));
const toBri = (p) => Math.max(1, Math.min(254, Math.round(p / 100 * 254)));
const blindText = (p) => p == null ? '–' : p <= 2 ? 'offen' : p >= 98 ? 'geschlossen' : `${p} % zu`; // TRÅDFRI: 0 = offen
const sw = (checked, action, color = '', disabled = false, label = '') =>
  `<label class="switch ${color}" aria-label="${esc(label)}"><input type="checkbox" data-action="${action}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span class="track"></span></label>`;

function derive() {
  const hue = S.hue, ikea = S.ikea, har = S.harmony;
  const rooms = hue.rooms || [];
  if (!rooms.find(r => r.id === roomId)) roomId = rooms[0]?.id ?? null;
  const room = rooms.find(r => r.id === roomId) || null;
  const roomLights = room ? room.lights.map(id => hue.lights[id]).filter(Boolean) : [];
  const allLights = [...Object.values(hue.lights || {}), ...(ikea.lights || [])];
  const blinds = ikea.blinds || [];
  const reachBlinds = blinds.filter(b => b.reachable);
  const actId = har.currentActivity;
  const actOn = har.ok && !!actId && actId !== '-1';
  const actLabel = !har.ok ? 'Offline' : actOn ? (har.activities.find(a => a.id === actId)?.label || `Aktivität ${actId}`) : 'Aus';
  const onLights = allLights.filter(l => l.on && l.reachable !== false);
  const roomOnLights = roomLights.filter(l => l.on && l.reachable);
  const dimOn = roomOnLights.filter(l => l.bri != null);
  const roomPct = room && room.anyOn ? (dimOn.length ? Math.round(dimOn.reduce((a, l) => a + pct(l.bri), 0) / dimOn.length) : 100) : 0;
  const lowBatt = blinds.filter(b => b.battery != null && b.battery < 20);
  const openBlinds = blinds.filter(b => b.position != null && b.position <= 2);
  const vac = S.vacuum || { configured: false, ok: false, rooms: [] };
  const sp = S.spotify || { configured: false, linked: false, ok: false, devices: [] };
  return { hue, ikea, har, rooms, room, roomLights, allLights, blinds, reachBlinds, actId, actOn, actLabel, onLights, roomPct, lowBatt, openBlinds, vac, sp };
}

// ---------- Saugroboter ----------
// Status laut MIoT-Spec xiaomi.vacuum.d109gl (siid 2 / piid 2)
const VAC_STATUS = { 1: 'Bereit', 2: 'Lädt', 3: 'Lädt (Pause)', 4: 'Saugt', 5: 'Pausiert', 6: 'Fährt zur Station', 7: 'Fährt zum Waschen', 8: 'Fernsteuerung', 9: 'Geladen', 10: 'Erstellt Karte', 11: 'Update', 12: 'Station arbeitet', 13: 'Lädt zwischendurch', 14: 'Station arbeitet', 15: 'Fehler', 16: 'Saugt und wischt', 17: 'Wischt', 18: 'Karte pausiert', 19: 'Rückfahrt pausiert', 20: 'Waschen pausiert', 21: 'Erstellt Karte' };
const VAC_CLEANING = new Set([4, 7, 10, 16, 17, 21]);
const VAC_PAUSED = new Set([5, 18, 19, 20]);
const VAC_MODES = [[1, 'Saugen'], [2, 'Wischen'], [3, 'Saugen + Wischen'], [4, 'Erst saugen, dann wischen']];
const VAC_POWER = [[1, 'Leise'], [2, 'Normal'], [3, 'Stark'], [4, 'Max']];
const VAC_WATER = [[0, 'Aus'], [1, 'Wenig'], [2, 'Mittel'], [3, 'Viel']];
const vacSel = new Set(); // ausgewählte Räume (bleibt beim Neuzeichnen erhalten)
// Grundriss, von Hand nach der Karte in Xiaomi Home nachgezeichnet (Koordinaten im viewBox 0 450 985 750).
// Schlüssel = Raum-ID des Roboters. Ändert sich die Karte in der App, hier anpassen.
const VAC_MAP = {
  6:  { p: '294,465 318,465 312,592 345,556 398,560 398,510 418,510 418,690 410,690 410,925 258,925 258,690 265,690 265,612 296,600', l: [334, 800] },   // Nino
  8:  { p: '425,670 552,670 552,905 460,905 460,775 425,775', l: [506, 835] },                                                                     // Chuchi
  16: { p: '560,668 975,668 975,895 560,895', l: [768, 785] },                                                                                     // Wohnzimmer
  4:  { p: '0,718 250,718 250,940 0,940', l: [120, 830] },                                                                                         // Toni
  13: { p: '45,945 166,945 166,1030 45,1030', l: [105, 990] },                                                                                     // Bad1
  21: { p: '170,945 254,945 254,966 352,966 352,928 412,928 412,952 488,952 488,902 628,902 628,1068 552,1068 552,1098 486,1098 486,1062 456,1062 456,1030 170,1030', l: [560, 995] }, // Gang
  14: { p: '328,1036 452,1036 452,1100 328,1100', l: [390, 1070] },                                                                                // Bad2
  5:  { p: '662,905 985,905 985,1045 662,1045', l: [822, 977] },                                                                                   // Büro
  20: { p: '5,1040 240,1040 240,1048 305,1048 305,1190 5,1192', l: [140, 1118] }                                                                   // Lelo
};
const VAC_STATION = [440, 742];
const VAC_DOCKED = new Set([2, 3, 9, 12, 13, 14]);
function vacMap(v) {
  const rooms = v.rooms.filter(r => VAC_MAP[r.id]);
  if (!rooms.length) return '';
  const docked = v.ok && (VAC_DOCKED.has(v.status) || v.charging === 1);
  const busy = vacOn(v);
  const shapes = rooms.map(r => {
    const m = VAC_MAP[r.id], sel = vacSel.has(r.id);
    return `<g class="vmap-room ${sel ? 'sel' : ''}" data-vacmap="${r.id}" role="button" tabindex="0" aria-pressed="${sel}" aria-label="${esc(r.name)} ${sel ? 'abwählen' : 'auswählen'}">
      <polygon points="${m.p}"/>
      <text x="${m.l[0]}" y="${m.l[1]}">${esc(r.name)}</text></g>`;
  }).join('');
  const [sx, sy] = VAC_STATION;
  return `<div class="vmap-wrap">
    <svg class="vmap" viewBox="-10 450 1005 755" role="group" aria-label="Grundriss, Räume antippen zum Auswählen">
      ${shapes}
      <g class="vmap-station" transform="translate(${sx} ${sy})" aria-hidden="true">
        <rect x="-20" y="-24" width="40" height="34" rx="7"/>
        ${docked ? `<circle class="vmap-bot" cx="0" cy="16" r="20"/><circle class="vmap-bot-eye" cx="0" cy="16" r="7"/>` : ''}
      </g>
    </svg>
    <div class="vmap-legend"><span><i class="sw sel"></i>ausgewählt</span><span><i class="sw st"></i>Station${docked ? ' · Roboter ist hier' : busy ? ' · Roboter unterwegs' : ''}</span></div>
  </div>`;
}
// 3D-Grundriss (isoMap aus layouts2.js) für die Sauger-Ansicht, Farben je Layout über --iso-* in layouts2.css
function vacIso(d) {
  const v = d.vac, docked = v.ok && (VAC_DOCKED.has(v.status) || v.charging === 1);
  return `<div class="vac-iso">${isoMap(d)}
    <div class="vmap-legend"><span><i class="sw sel"></i>ausgewählt</span><span><i class="sw lit"></i>Licht an</span><span><i class="sw st"></i>Station${docked ? ' · Roboter ist hier' : vacOn(v) ? ' · Roboter unterwegs' : ''}</span></div></div>`;
}
const vacText = (v) => !v.configured ? 'Nicht eingerichtet' : !v.ok ? 'Nicht erreichbar' : v.faults?.length ? 'Störung' : (VAC_STATUS[v.status] || `Status ${v.status}`);
const vacOn = (v) => v.ok && (VAC_CLEANING.has(v.status) || v.status === 6);

function vacButtons(v, big = false) {
  const dis = v.ok ? '' : 'disabled';
  const main = VAC_CLEANING.has(v.status)
    ? `<button class="round${big ? ' big' : ''}" data-vac="pause" aria-label="Pause" title="Pause" ${dis}>${I.pause}</button>`
    : VAC_PAUSED.has(v.status)
      ? `<button class="round${big ? ' big' : ''} accent" data-vac="resume" aria-label="Weiter" title="Weiter" ${dis}>${I.play}</button>`
      : `<button class="round${big ? ' big' : ''} accent" data-vac="start" aria-label="Reinigung starten" title="Starten" ${dis}>${I.play}</button>`;
  return `${main}
    <button class="round${big ? ' big' : ''}" data-vac="dock" aria-label="Zur Station" title="Zur Station" ${dis}>${I.dock}</button>
    <button class="round${big ? ' big' : ''}" data-vac="locate" aria-label="Roboter finden (Ton)" title="Finden (Ton)" ${dis}>${I.search}</button>`;
}
function battRing(p) {
  const r = 26, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, p ?? 0));
  return `<svg class="vac-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" stroke="rgba(255,255,255,.12)" stroke-width="6" fill="none"/>
    <circle cx="32" cy="32" r="${r}" stroke="${v < 20 ? 'var(--red)' : 'var(--teal)'}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${(c * v / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 32 32)"/></svg>`;
}
function vacCard(d) {
  const v = d.vac;
  if (!v.configured) return '';
  const modeName = VAC_MODES.find(m => m[0] === v.mode)?.[1] || '–';
  const powerName = VAC_POWER.find(m => m[0] === v.power)?.[1] || '–';
  return `<section class="card vac-card a-vac ${vacOn(v) ? 'on' : ''}">
    <div class="vac-left">
      <div class="vac-batt">${battRing(v.battery)}<div class="vac-batt-val">${v.ok ? (v.battery ?? '–') : '–'}<small>%</small></div></div>
      <div style="min-width:0">
        <div class="card-title">${I.robot}<div><h3>Saugroboter</h3><div class="sub">Xiaomi X20 Max</div></div></div>
        <div class="vac-state">${esc(vacText(v))}${v.ok ? ` <span class="muted">· ${esc(modeName)} · ${esc(powerName)}</span>` : ''}</div>
      </div>
    </div>
    <div class="vac-btns">${vacButtons(v)}<button class="chip-tag outline btn" data-goto="sauger">Räume</button></div>
  </section>`;
}
function renderSauger(d) {
  const v = d.vac;
  if (!v.configured) return `<div class="view-head"><h2>Saugroboter</h2></div><p class="muted">Kein Saugroboter eingerichtet (Token fehlt in config.local.json).</p>`;
  const dis = v.ok ? '' : 'disabled';
  const chips = (list, cur, key) => list.map(([val, name]) => `<button class="chip ${cur === val ? 'active' : ''}" data-vacset="${key}" data-val="${val}" ${dis}>${esc(name)}</button>`).join('');
  for (const id of [...vacSel]) if (!v.rooms.some(r => r.id === id)) vacSel.delete(id);
  return `<div class="view-head"><h2>Saugroboter</h2><span class="muted">${esc(vacText(v))}</span></div>
  <div class="card vac-hero ${vacOn(v) ? 'on' : ''}" style="margin-bottom:14px">
    <div class="vac-left">
      <div class="vac-batt big">${battRing(v.battery)}<div class="vac-batt-val">${v.ok ? (v.battery ?? '–') : '–'}<small>%</small></div></div>
      <div><div class="sub">Xiaomi X20 Max</div><div class="nm" style="font-size:22px;font-weight:700">${esc(vacText(v))}</div>
        <div class="muted">${v.ok ? (v.charging === 1 ? 'Lädt' : 'Akku') + ` · Mopp ${v.mop ?? '–'} %` : 'Der Roboter antwortet gerade nicht.'}</div>
        ${v.faults?.length ? `<div class="chip-tag warn" style="display:inline-block;margin-top:6px">Störung ${esc(v.faults.join(', '))} – siehe Xiaomi Home</div>` : ''}</div>
    </div>
    <div class="vac-btns">${vacButtons(v, true)}<button class="round big" data-vac="stop" aria-label="Stopp" title="Stopp" ${dis}>${I.stop}</button></div>
  </div>
  <div class="card row-card" style="margin-bottom:14px">
    <div class="row-top"><div><div class="nm">Räume reinigen</div><div class="sub">Räume im Plan oder unten antippen, dann starten. Es gelten die Einstellungen unten.</div></div></div>
    ${typeof isoMap === 'function' ? vacIso(d) : vacMap(v)}
    <div class="chips">${v.rooms.map(r => `<button class="chip ${vacSel.has(r.id) ? 'vsel' : ''}" aria-pressed="${vacSel.has(r.id)}" data-vacroom="${r.id}" ${dis}>${esc(r.name)}</button>`).join('') || '<span class="muted">Noch keine Räume bekannt.</span>'}</div>
    <div class="chips"><button class="chip accent" data-vacrooms ${vacSel.size && v.ok ? '' : 'disabled'}>${I.play.replace('<svg', '<svg width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:6px"')}${vacSel.size ? `${vacSel.size} ${vacSel.size === 1 ? 'Raum' : 'Räume'} reinigen` : 'Raum wählen'}</button>
      ${vacSel.size ? '<button class="chip" data-vacclear>Auswahl löschen</button>' : ''}</div>
  </div>
  <div class="list-grid">
    <div class="card row-card"><div class="nm">Reinigungsart</div><div class="chips">${chips(VAC_MODES, v.mode, 'mode')}</div></div>
    <div class="card row-card"><div class="nm">Saugstärke</div><div class="chips">${chips(VAC_POWER, v.power, 'power')}</div></div>
    <div class="card row-card"><div class="nm">Wassermenge (Wischen)</div><div class="chips">${chips(VAC_WATER, v.water, 'water')}</div></div>
    <div class="card row-card"><div class="nm">Station</div><div class="chips">
      <button class="chip" data-vac="dust" ${dis}>Absaugen</button><button class="chip" data-vac="wash" ${dis}>Mopp waschen</button><button class="chip" data-vac="dry" ${dis}>Mopp trocknen</button></div></div>
  </div>`;
}

// ---------- Rahmen ----------
function renderFrame(d) {
  const pill = (name, ok) => `<span class="pill ${S ? (ok ? '' : 'down') : 'wait'}"><i></i>${name}</span>`;
  $('#pills').innerHTML = pill('Hue', d.hue.ok) + pill('IKEA', d.ikea.ok) + pill('Harmony', d.har.ok) + (d.vac.configured ? pill('Sauger', d.vac.ok) : '') + pill(live ? 'Live' : 'Getrennt', live);
  const hints = [...d.lowBatt.map(b => `${b.name}: Batterie ${b.battery} %`), ...d.blinds.filter(b => !b.reachable).map(b => `${b.name}: nicht erreichbar`)];
  if (d.vac.ok && d.vac.faults?.length) hints.push(`Saugroboter: Störung ${d.vac.faults.join(', ')}`);
  if (d.vac.ok && d.vac.mop != null && d.vac.mop < 10) hints.push(`Saugroboter: Mopp ersetzen (${d.vac.mop} %)`);
  const badge = $('#bell-badge'); badge.hidden = !hints.length; badge.textContent = hints.length;
  $('#bell').title = hints.join('\n') || 'Keine Hinweise';
  $('#foot-updated').textContent = 'Stand ' + new Date(S.updated).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  // Glas/Panorama: unscharfes Wohnzimmer als Hintergrund (nur neu zeichnen, wenn sich etwas ändert)
  const bg = $('#bgscene');
  if (bg) {
    const html = layout === 'glas' || layout === 'panorama' ? roomSvg(d) : '';
    if (bg.dataset.sig !== html) { bg.innerHTML = html; bg.dataset.sig = html; }
  }
}

// ---------- Home ----------
function greetCard(d) {
  const now = new Date(), h = now.getHours();
  const day = h >= 7 && h < 18;
  const hello = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 14 ? 'Guten Tag' : h < 18 ? 'Guten Nachmittag' : h < 22 ? 'Guten Abend' : 'Gute Nacht';
  const date = now.toLocaleDateString('de-CH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const icon = day
    ? `<svg class="greet-icon" viewBox="0 0 64 64"><circle cx="26" cy="24" r="12" fill="#ffc24a"/><g stroke="#ffc24a" stroke-width="3" stroke-linecap="round"><path d="M26 4v5M26 39v5M8 24h5M6 10l4 4M42 10l-4 4"/></g><path d="M22 52h28a9 9 0 0 0 0-18 12 12 0 0 0-23 3 7.5 7.5 0 0 0-5 15z" fill="#eef3fb"/></svg>`
    : `<svg class="greet-icon" viewBox="0 0 64 64"><path d="M40 10a20 20 0 1 0 14 34A22 22 0 0 1 40 10z" fill="#ffd48a"/><circle cx="14" cy="14" r="1.6" fill="#fff"/><circle cx="56" cy="20" r="1.2" fill="#fff"/><circle cx="20" cy="52" r="1" fill="#fff"/></svg>`;
  return `<section class="card greet a-greet ${day ? 'day' : ''}">
    <svg class="scenery" viewBox="0 0 400 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      ${day ? '<circle cx="330" cy="120" r="22" fill="#ffd27a" opacity=".9"/>' : '<circle cx="250" cy="40" r="1.2" fill="#fff" opacity=".7"/><circle cx="310" cy="70" r="1" fill="#fff" opacity=".6"/><circle cx="370" cy="30" r="1.4" fill="#fff" opacity=".8"/>'}
      <path d="M0 175 60 140 110 160 170 120 230 155 290 130 350 150 400 135V240H0z" fill="${day ? '#3d5f86' : '#24324a'}" opacity=".9"/>
      <path d="M0 195 70 170 140 185 220 160 300 182 400 165V240H0z" fill="${day ? '#2c4767' : '#1a2537'}"/>
      <path d="M0 215 120 205 260 212 400 200V240H0z" fill="#121a26"/>
    </svg>
    <div class="greet-top"><span>${I.pin.replace('<svg', '<svg width="15" height="15"')} Zuhause</span><span>${esc(date)}</span></div>
    <div class="greet-main">${icon}<div><div class="greet-time">${now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</div><div class="greet-hello">${hello}, Toni</div></div></div>
    <div class="greet-stats">
      <div class="gstat"><div class="ic">${I.bulb}</div><div><div class="k">Lichter</div><div class="v">${d.onLights.length} / ${d.allLights.length} an</div></div></div>
      <div class="gstat"><div class="ic">${I.blind}</div><div><div class="k">Rollos</div><div class="v">${d.openBlinds.length} / ${d.blinds.length} offen</div></div></div>
      <div class="gstat"><div class="ic">${I.tv}</div><div style="min-width:0"><div class="k">Harmony</div><div class="v">${esc(d.actLabel)}</div></div></div>
    </div>
  </section>`;
}

function blindsCard(d) {
  const tag = d.lowBatt.length ? `<span class="chip-tag warn">Batterie tief</span>` : `<span class="chip-tag green">${d.openBlinds.length} offen</span>`;
  const rows = d.blinds.map(b => `<div class="brow ${b.reachable ? '' : 'unreach'}">
      <div class="brow-name">${esc(b.name)} <small>${b.reachable ? blindText(b.position) : 'nicht erreichbar'}</small></div>
      <div class="brow-btns">
        <button class="round" data-blind="${b.id}" data-pos="0" aria-label="${esc(b.name)} hoch" ${b.reachable ? '' : 'disabled'}>${I.up}</button>
        <button class="round" data-blind="${b.id}" data-pos="100" aria-label="${esc(b.name)} runter" ${b.reachable ? '' : 'disabled'}>${I.down}</button>
      </div>
      <div class="brow-bar"><span style="width:${100 - (b.position ?? 0)}%"></span></div>
      <div class="batt ${b.battery != null && b.battery < 20 ? 'low' : ''}" style="grid-column:1">Batterie ${b.battery ?? '–'} %</div>
    </div>`).join('');
  return `<section class="card blinds-card a-blinds">
    <div class="card-head"><div class="card-title">${I.blind}<div><h3>Rollos</h3><div class="sub">IKEA · Öffnung</div></div></div>${tag}</div>
    <div class="blind-list">${rows || `<div class="muted">${d.ikea.ok ? 'Keine Rollos gefunden.' : 'IKEA Gateway nicht erreichbar.'}</div>`}</div>
  </section>`;
}

function arcPath(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos(a * Math.PI / 180), cy + r * Math.sin(a * Math.PI / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}
function dialCard(d) {
  const on = !!d.room?.anyOn, v = on ? d.roomPct : 0;
  const A0 = 150, A1 = 390, a = A0 + (A1 - A0) * v / 100;
  const kx = 120 + 88 * Math.cos(a * Math.PI / 180), ky = 112 + 88 * Math.sin(a * Math.PI / 180);
  return `<section class="card dial-card a-dial">
    <div class="card-head"><div class="card-title">${I.sun}<div><h3>Helligkeit</h3><div class="sub">${esc(d.room?.name || '–')}</div></div></div>
      <button class="chip-tag outline btn" data-room-toggle>${on ? 'Ausschalten' : 'Einschalten'}</button></div>
    <div class="dial-wrap">
      <svg class="dial-svg" viewBox="0 0 240 210" aria-hidden="true">
        <defs><linearGradient id="dg" x1="0" x2="1"><stop offset="0" stop-color="#e0782f"/><stop offset=".6" stop-color="#ffb15c"/><stop offset="1" stop-color="#3cc7b7"/></linearGradient></defs>
        <path d="${arcPath(120, 112, 88, A0, A1)}" stroke="rgba(255,255,255,.1)" stroke-width="14" fill="none" stroke-linecap="round"/>
        ${v > 0 ? `<path d="${arcPath(120, 112, 88, A0, Math.max(a, A0 + 0.5))}" stroke="url(#dg)" stroke-width="14" fill="none" stroke-linecap="round"/>` : ''}
        <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="11" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width="2"/>
      </svg>
      <div class="dial-center"><div class="dial-val">${v}<small> %</small></div><div class="dial-state">${on ? `${d.roomLights.filter(l => l.on).length} Lampen an` : 'Aus'}</div></div>
      <div class="dial-btns">
        <button class="round" data-dial="-10" aria-label="Dunkler">${I.minus}</button>
        <button class="round" data-dial="10" aria-label="Heller">${I.plus}</button>
      </div>
    </div>
  </section>`;
}

// Raumansicht: Tonis Foto (public/wohnzimmer.jpg), wird überall verwendet, wo früher die Zeichnung war.
// Helligkeit des Fotos folgt dem Licht im Raum, bei laufendem TV leuchtet der Fernseher blau.
function roomSvg(d) {
  const on = !!d.room?.anyOn, l = on ? Math.max(.35, d.roomPct / 100) : 0;
  return `<div class="room-photo ${on ? 'on' : ''}" style="--l:${l.toFixed(2)}" aria-hidden="true"><img src="wohnzimmer.jpg" alt="" decoding="async">${d.actOn ? '<i class="rp-tv"></i>' : ''}</div>`;
}
// frühere gezeichnete Raumansicht (rote/grüne Kissen), nicht mehr verwendet
function roomDrawing(d) {
  const h = new Date().getHours(), day = h >= 7 && h < 18;
  const light = d.room?.anyOn ? Math.max(.25, d.roomPct / 100) : 0;
  const tvOn = d.actOn;
  const wins = (d.blinds.length ? d.blinds : [{ position: 0 }]).slice(0, 3);
  const W = 104, gap = 22, x0 = 40;
  const windows = wins.map((b, i) => {
    const x = x0 + i * (W + gap), y = 96, H = 190, sh = H * Math.min(100, b.position ?? 0) / 100;
    return `<g>
      <rect x="${x - 6}" y="${y - 6}" width="${W + 12}" height="${H + 12}" rx="6" fill="#0d0a08"/>
      <rect x="${x}" y="${y}" width="${W}" height="${H}" fill="url(#sky)"/>
      ${day ? '' : `<circle cx="${x + 70}" cy="${y + 40}" r="1.4" fill="#fff" opacity=".8"/><circle cx="${x + 30}" cy="${y + 70}" r="1" fill="#fff" opacity=".6"/>`}
      <path d="M${x} ${y + H - 40} l30 -22 30 14 44 -26 V${y + H} H${x}z" fill="#0e1622" opacity=".9"/>
      <rect x="${x}" y="${y}" width="${W}" height="${sh.toFixed(1)}" fill="url(#slats)"/>
      <rect x="${x}" y="${(y + sh - 4).toFixed(1)}" width="${W}" height="5" fill="#8b8f96"/>
      <rect x="${x + W / 2 - 1.5}" y="${y}" width="3" height="${H}" fill="#0d0a08"/>
    </g>`;
  }).join('');
  return `<svg class="room-svg" viewBox="0 0 800 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1611"/><stop offset="1" stop-color="#120d0a"/></linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1e15"/><stop offset="1" stop-color="#140e0a"/></linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${day ? '<stop offset="0" stop-color="#5d9ad6"/><stop offset="1" stop-color="#b8d4ee"/>' : '<stop offset="0" stop-color="#0b1626"/><stop offset="1" stop-color="#22385a"/>'}</linearGradient>
      <pattern id="slats" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#b9bcc2"/><rect y="6.5" width="8" height="1.5" fill="#8f939a"/></pattern>
      <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb35c" stop-opacity=".95"/><stop offset=".45" stop-color="#ff9a3c" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
      <radialGradient id="tvglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5c9dff" stop-opacity=".7"/><stop offset="1" stop-color="#5c9dff" stop-opacity="0"/></radialGradient>
      <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d5fb0"/><stop offset=".5" stop-color="#6a4fc7"/><stop offset="1" stop-color="#e0782f"/></linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    </defs>
    <rect width="800" height="440" fill="url(#wall)"/>
    <rect y="330" width="800" height="110" fill="url(#floor)"/>
    ${windows}
    <!-- Regal + TV -->
    <rect x="430" y="150" width="190" height="112" rx="6" fill="#07080b" stroke="#2a2a2e" stroke-width="3"/>
    ${tvOn ? `<ellipse cx="525" cy="206" rx="180" ry="120" fill="url(#tvglow)"/><rect x="436" y="156" width="178" height="100" rx="3" fill="url(#screen)" opacity=".9"/>` : ''}
    <rect x="420" y="300" width="210" height="34" rx="4" fill="#2b1f16"/>
    <!-- Stehlampe -->
    <path d="M712 334 V170 q0 -40 -46 -40" stroke="#1b1b1e" stroke-width="5" fill="none"/>
    <path d="M640 128 h52 l-8 -20 h-36z" fill="#2a2a2e"/>
    ${light ? `<ellipse cx="666" cy="150" rx="${120 + 80 * light}" ry="${110 + 70 * light}" fill="url(#glow)" opacity="${(.45 + .55 * light).toFixed(2)}"/><ellipse cx="666" cy="132" rx="22" ry="6" fill="#ffd9a0"/>` : ''}
    <ellipse cx="712" cy="336" rx="26" ry="5" fill="#0a0806"/>
    <!-- Pflanze -->
    <rect x="360" y="296" width="34" height="38" rx="4" fill="#3a2a1e"/>
    <path d="M377 296 q-30 -40 -14 -80 q10 30 14 80 q4 -60 26 -84 q-6 50 -26 84" fill="#2f5a34"/>
    <!-- Sofa -->
    <ellipse cx="420" cy="410" rx="300" ry="26" fill="#0b0806" opacity=".7"/>
    <rect x="170" y="318" width="470" height="80" rx="26" fill="#8c8a86"/>
    <rect x="186" y="290" width="438" height="64" rx="22" fill="#a3a19c"/>
    <rect x="150" y="320" width="54" height="84" rx="22" fill="#97958f"/>
    <rect x="606" y="320" width="54" height="84" rx="22" fill="#97958f"/>
    <rect x="236" y="300" width="70" height="44" rx="12" fill="#c8682a"/>
    <rect x="510" y="300" width="70" height="44" rx="12" fill="#3f6b4e"/>
    <!-- Deckenlicht-Ambiente -->
    <rect width="800" height="440" fill="#ff9a3c" opacity="${(light * .12).toFixed(3)}"/>
    <rect width="800" height="440" fill="#000" opacity="${light ? (.25 - light * .2).toFixed(3) : .45}"/>
    <rect width="800" height="440" fill="url(#shade)"/>
  </svg>`;
}

function heroCard(d) {
  const ikeaLamp = d.ikea.lights?.[0];
  const anyOpen = d.reachBlinds.some(b => (b.position ?? 100) < 98);
  const nodes = [
    { x: 24, y: 22, k: 'light', on: !!d.room?.anyOn, icon: I.bulb, label: 'Licht' },
    { x: 24, y: 80, k: 'blinds', on: anyOpen, icon: I.blind, label: 'Rollos' },
    { x: 76, y: 22, k: 'tv', on: d.actOn, icon: I.tv, label: 'Harmony' },
    { x: 76, y: 80, k: 'ikealamp', on: !!(ikeaLamp?.on && ikeaLamp?.reachable), icon: I.lamp, label: ikeaLamp ? ikeaLamp.name : 'IKEA' }
  ];
  const lines = nodes.map(n => `<path d="M50 50 H${(n.x + (n.x < 50 ? 6 : -6))} V${n.y}" vector-effect="non-scaling-stroke"/>`).join('');
  const scenes = (d.hue.scenes || []).filter(s => s.group === d.room?.id).slice(0, 3);
  const v = d.room?.anyOn ? d.roomPct : 0;
  return `<section class="card hero a-hero">
    ${roomSvg(d)}
    <div class="hero-top">${d.rooms.map(r => `<button class="tab ${r.id === d.room?.id ? 'active' : ''}" data-room="${r.id}">${r.id === d.room?.id ? I.home : ''}${esc(r.name)}</button>`).join('')}
      <button class="tab" data-goto="rollos">Rollos</button><button class="tab" data-goto="szenen">Szenen</button></div>
    <div class="hub">
      <svg class="hub-lines" viewBox="0 0 100 100" preserveAspectRatio="none"><g stroke="rgba(255,255,255,.45)" stroke-width="1.2" fill="none" vector-effect="non-scaling-stroke" style="vector-effect:non-scaling-stroke">${lines}</g></svg>
      <div class="node center" style="left:50%;top:50%">${I.home}</div>
      ${nodes.map(n => `<button class="node ${n.on ? 'on' : ''}" style="left:${n.x}%;top:${n.y}%" data-node="${n.k}" aria-label="${esc(n.label)} umschalten">${n.icon}<span class="node-label">${esc(n.label)}</span></button>`).join('')}
    </div>
    <div class="vslider-box">
      <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      <div class="pct" id="vs-pct">${v} %</div>
      <div class="vslider" id="vslider" role="slider" aria-label="Helligkeit ${esc(d.room?.name || '')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" tabindex="0">
        <div class="fill" style="height:${v}%"></div><div class="knob" style="bottom:${v}%"></div>
      </div>
      <button class="power ${d.room?.anyOn ? 'on' : ''}" data-room-toggle aria-label="Raum ein/aus">${I.power}</button>
    </div>
    <div class="hero-bottom">
      <span class="glass ${live ? 'ok' : ''}"><i class="live"></i>${live ? 'Live' : 'Getrennt'}</span>
      <div class="scene-strip">
        ${scenes.map(s => `<button class="glass" data-scene="${esc(s.id)}">${I.play}${esc(s.name)}</button>`).join('')}
        <button class="glass" data-goto="licht">${I.grid}Alle Szenen</button>
      </div>
    </div>
  </section>`;
}

function tilesCard(d) {
  const ikeaLamp = d.ikea.lights?.[0];
  const anyOpen = d.reachBlinds.some(b => (b.position ?? 100) < 98);
  const tile = (color, on, icon, name, sub, foot, action, disabled = false) => `
    <div class="tile ${color} ${on ? 'on' : ''} ${disabled ? 'unreach' : ''}">
      <div class="tile-top"><div class="tile-ic">${icon}</div>${sw(on, action, color, disabled, name)}</div>
      <div class="tile-name">${esc(name)}</div><div class="tile-sub">${esc(sub)}</div>
      <div class="tile-foot"><i></i>${esc(foot)}</div>
    </div>`;
  return `<section class="tiles a-tiles">
    ${tile('orange', !!d.room?.anyOn, I.bulb, 'Licht', d.room?.name || 'Hue', d.room?.anyOn ? `${d.roomPct} % · ${d.roomLights.filter(l => l.on).length} an` : 'Aus', `tile/light`)}
    ${tile('blue', anyOpen, I.blind, 'Rollos', 'Alle Fenster', `${d.openBlinds.length} offen · ${d.blinds.length - d.openBlinds.length} zu`, 'tile/blinds', !d.reachBlinds.length)}
    ${tile('purple', d.actOn, I.tv, 'Harmony', d.actLabel, d.har.ok ? (d.actOn ? 'Läuft' : 'Aus') : 'Offline', 'tile/tv', !d.har.ok)}
    ${tile('green', !!(ikeaLamp?.on && ikeaLamp?.reachable), I.lamp, ikeaLamp?.name || 'IKEA-Lampe', 'IKEA', ikeaLamp?.reachable ? (ikeaLamp.on ? 'An' : 'Aus') : 'Nicht erreichbar', 'tile/ikealamp', !ikeaLamp?.reachable)}
  </section>`;
}

function chartCard(d) {
  const ls = d.roomLights;
  const vals = ls.map(l => (l.on && l.reachable) ? (l.bri == null ? 100 : pct(l.bri)) : 0);
  const max = Math.max(...vals, 0);
  const maxIdx = vals.indexOf(max);
  const avg = d.roomPct;
  const bars = ls.map((l, i) => `<div class="bar ${vals[i] === 0 ? 'off' : i === maxIdx ? 'max' : ''}" title="${esc(l.name)}: ${vals[i]} %">
      ${i === maxIdx && max > 0 ? `<span class="tip" style="bottom:calc(${Math.max(vals[i], 3)}% + 6px);top:auto">${vals[i]} %</span>` : ''}
      <div class="col" style="height:${Math.max(vals[i], 3)}%"></div><span class="lbl">${esc(l.name.split(' ')[0])}</span></div>`).join('');
  return `<section class="card chart-card a-chart">
    <div class="card-head"><div class="card-title">${I.bolt}<h3>Helligkeit pro Lampe</h3></div><span class="chip-tag outline">${esc(d.room?.name || '')}</span></div>
    <div class="chart-big"><b>${d.roomLights.filter(l => l.on && l.reachable).length}</b><span>von ${ls.length} Lampen an</span></div>
    <div class="chart-delta">Ø ${avg} % Helligkeit</div>
    <div class="bars">
      <div class="y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <div class="bar-area">
        ${[0, 25, 50, 75].map(p => `<div class="grid-line" style="bottom:calc(22px + (100% - 22px) * ${p / 100})"></div>`).join('')}
        ${bars}
      </div>
    </div>
  </section>`;
}

function renderHome(d) {
  const cal = typeof calendarCard === 'function' ? calendarCard('wide', 4) : ''; // layouts2.js
  return `<div class="home">${greetCard(d)}${heroCard(d)}${blindsCard(d)}${dialCard(d)}${tilesCard(d)}${chartCard(d)}${vacCard(d)}${cal}</div>`;
}

// ---------- Detailansichten ----------
function renderLicht(d) {
  let h = `<div class="view-head"><h2>Licht</h2><span class="muted">${d.onLights.length} von ${d.allLights.length} an</span></div>${allLightsCard(d)}`;
  for (const room of d.rooms) {
    const ls = room.lights.map(id => d.hue.lights[id]).filter(Boolean);
    const scenes = (d.hue.scenes || []).filter(s => s.group === room.id);
    h += `<div class="card row-card" style="margin-bottom:14px">
      <div class="row-top"><div><div class="nm">${esc(room.name)}</div><div class="sub">${ls.filter(l => l.on).length} von ${ls.length} an</div></div>${sw(room.anyOn, `hue/room/${room.id}`, '', false, room.name)}</div>
      ${room.anyOn ? `<input type="range" min="1" max="254" value="${room.bri ?? 254}" data-action="hue/room/${room.id}" aria-label="Helligkeit ${esc(room.name)}">` : ''}
      ${scenes.length ? `<div class="chips">${scenes.map(s => `<button class="chip" data-scene="${esc(s.id)}">${esc(s.name)}</button>`).join('')}</div>` : ''}
    </div>
    <div class="list-grid">${ls.map(l => lightCard(l, 'hue/light', 254)).join('')}</div>`;
  }
  if (d.ikea.lights?.length) h += `<div class="section-title">IKEA</div><div class="list-grid">${d.ikea.lights.map(l => lightCard(l, 'ikea/light', 100)).join('')}</div>`;
  return h;
}
function lightCard(l, base, max) {
  return `<div class="card row-card ${l.reachable ? '' : 'unreach'}" style="${l.reachable ? '' : 'opacity:.55'}">
    <div class="row-top"><div class="nm">${esc(l.name)}</div>${sw(l.on, `${base}/${l.id}`, '', !l.reachable, l.name)}</div>
    ${!l.reachable ? '<div class="muted">nicht erreichbar</div>' : l.on && l.bri != null ? `<input type="range" min="1" max="${max}" value="${l.bri}" data-action="${base}/${l.id}" aria-label="Helligkeit ${esc(l.name)}">` : '<div class="muted">Aus</div>'}
  </div>`;
}
function renderRollos(d) {
  return `<div class="view-head"><h2>Rollos</h2><div class="chips"><button class="chip" data-allblinds="0">Alle hoch</button><button class="chip" data-allblinds="100">Alle runter</button></div></div>
  <div class="list-grid">${d.blinds.map(b => `<div class="card row-card" style="${b.reachable ? '' : 'opacity:.55'}">
    <div class="row-top"><div><div class="nm">${esc(b.name)}</div><div class="sub">${b.reachable ? blindText(b.position) : 'nicht erreichbar'} · <span class="batt ${b.battery != null && b.battery < 20 ? 'low' : ''}" style="color:inherit">Batterie ${b.battery ?? '–'} %</span></div></div>
      <div class="brow-btns" style="grid-row:auto">
        <button class="round" data-blind="${b.id}" data-pos="0" aria-label="hoch" ${b.reachable ? '' : 'disabled'}>${I.up}</button>
        <button class="round" data-blind="${b.id}" data-stop="1" aria-label="stopp" ${b.reachable ? '' : 'disabled'}>${I.stop}</button>
        <button class="round" data-blind="${b.id}" data-pos="100" aria-label="runter" ${b.reachable ? '' : 'disabled'}>${I.down}</button>
      </div></div>
    <input class="blue-range" type="range" min="0" max="100" value="${b.position ?? 0}" data-action="ikea/blind/${b.id}" aria-label="Position ${esc(b.name)}" ${b.reachable ? '' : 'disabled'}>
    <div class="muted" style="display:flex;justify-content:space-between"><span>offen</span><span>geschlossen</span></div>
  </div>`).join('') || '<p class="muted">Keine Rollos gefunden.</p>'}</div>`;
}
// Farbvorschau je Szene (Hue v1 liefert die Farben einer Szene nicht mit → nach Namen; dark = dunkle Schrift)
const SCENE_LOOK = {
  'kino': ['#0a1640', '#5a3a10'], 'abendessen': ['#ff9f4f', '#ffd9a0', 1], 'romantisch': ['#c2185b', '#ff7a7a'],
  'party': ['#ff2fb2', '#2f6bff', '#36e27a'], 'polarlicht': ['#1fd1b9', '#36e27a', '#7b4dff'], 'gemütlich': ['#e9782a', '#ffc77a'],
  'frühstück': ['#fff1d6', '#ffe2a8', 1], 'meditation': ['#5a2db8', '#1f3fa8'], 'entspannen': ['#ffa45c', '#ffd28a', 1],
  'lesen': ['#fff0cf', '#ffe0a6', 1], 'konzentration': ['#e6f0ff', '#fff8e6', 1], 'aktivieren': ['#cfe2ff', '#ffffff', 1],
  'hell': ['#fff7e0', '#ffffff', 1], 'gedimmt': ['#b36b2a', '#6b3a14'], 'nachtlicht': ['#7a1d0c', '#2a0a05'],
  'dunkel': ['#2a2018', '#120d0a'], 'stehlampe': ['#ffbe73', '#8a4a1a'], 'sonnenuntergang savanne': ['#ff7a2f', '#ffbf4a', '#c2185b']
};
function sceneStyle(name) {
  const l = SCENE_LOOK[name.toLowerCase()] || ['#f5953a', '#8d7cf8'];
  const cols = l.filter(x => typeof x === 'string'), dark = l.includes(1);
  return { bg: `linear-gradient(135deg, ${cols.join(', ')})`, dark };
}
// Alle Lampen (Hue + IKEA) auf einmal: an/aus, dimmen
function allLightsCard(d) {
  const lights = d.allLights.filter(l => l.reachable !== false);
  const dim = d.onLights.filter(l => l.bri != null);
  const avg = dim.length ? Math.round(dim.reduce((a, l) => a + (typeof l.id === 'number' ? l.bri : pct(l.bri)), 0) / dim.length) : 0;
  return `<div class="card row-card all-lights ${d.onLights.length ? 'on' : ''}" style="margin-bottom:14px">
    <div class="row-top"><div><div class="nm">Alle Lampen</div><div class="sub">${d.onLights.length} von ${lights.length} an${avg ? ` · Ø ${avg} %` : ''}</div></div>
      <div class="chips" style="margin:0"><button class="chip ${d.onLights.length === lights.length && lights.length ? 'active' : ''}" data-alllights="on">Alle an</button><button class="chip ${d.onLights.length ? '' : 'active'}" data-alllights="off">Alle aus</button></div></div>
    <input type="range" min="1" max="100" value="${avg || 50}" data-action="lights/all" aria-label="Alle Lampen dimmen">
    <div class="chips">${[10, 25, 50, 75, 100].map(p => `<button class="chip" data-allpct="${p}">${p} %</button>`).join('')}</div>
  </div>`;
}
// Fernbedienung für die laufende Harmony-Aktivität. Der Server liefert in har.keys nur die Tasten, die die Aktivität kennt.
function remoteCard(d) {
  if (!d.actOn) return '';
  const has = new Set(d.har.keys || []);
  const k = (key, label, cls = '', title = '') => has.has(key)
    ? `<button class="rk ${cls}" data-hkey="${key}" title="${esc(title || label)}" aria-label="${esc(title || label)}">${label}</button>`
    : `<span class="rk ${cls} none" aria-hidden="true"></span>`;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].filter(n => has.has(String(n)));
  const hasVol = has.has('volup') && has.has('voldown');
  const hasPad = ['up', 'down', 'left', 'right', 'ok'].some(x => has.has(x));
  const tog = (id, icon, label, show = true) => show
    ? `<button class="rk rk-tog ${remotePanel === id ? 'open' : ''}" data-rpanel="${id}" aria-label="${label}" aria-expanded="${remotePanel === id}">${icon}</button>` : '';
  // Drehregler (Variante 8): im Kreis fahren = lauter/leiser in Stufen, Mitte = stumm. Harmony kennt keine absolute Lautstärke → nur Schritte.
  const ring = hasVol ? `<div class="vol-ring" id="vol-ring" role="slider" tabindex="0" aria-label="Lautstärke: im Kreis drehen, Pfeiltasten hoch/runter"
      aria-valuetext="Schritte">
      <div class="vr-track"><div class="vr-knob" id="vr-knob" style="transform:rotate(${volAngle}deg)"><i></i></div></div>
      <div class="vr-center">${has.has('mute') ? `<button class="vr-mute" data-hkey="mute" aria-label="Stumm">${I.mute}</button>` : ''}
        <div class="vr-txt" id="vr-txt">Lautstärke</div><div class="vr-hint">drehen</div></div>
      <span class="vr-sym vr-minus">−</span><span class="vr-sym vr-plus">+</span>
    </div>` : '';
  const panel = remotePanel === 'pad' && hasPad ? `<div class="rk-pad">
        ${k('up', '▲', 'p-up', 'Hoch')}${k('left', '◀', 'p-left', 'Links')}${k('ok', 'OK', 'p-ok', 'OK')}${k('right', '▶', 'p-right', 'Rechts')}${k('down', '▼', 'p-down', 'Runter')}
      </div>
      <div class="rk-row">${k('guide', 'Guide', 'txt')}${k('info', 'Info', 'txt')}</div>
      <div class="rk-row">${k('rew', '«', '', 'Zurückspulen')}${k('play', '▶', '', 'Play')}${k('pause', '❚❚', 'mini', 'Pause')}${k('stop', '■', '', 'Stopp')}${k('ff', '»', '', 'Vorspulen')}</div>`
    : remotePanel === 'num' && nums.length ? `<div class="rk-nums">${nums.map(n => k(String(n), String(n))).join('')}</div>` : '';
  return `<div class="card row-card remote-card" style="margin-bottom:14px">
    <div class="row-top"><div><div class="nm">Fernbedienung</div><div class="sub">${esc(d.actLabel)}</div></div></div>
    ${ring}
    <div class="rk-chrow">${k('chdown', '◀&nbsp; Programm', 'txt wide', 'Programm zurück')}${k('chup', 'Programm &nbsp;▶', 'txt wide', 'Programm weiter')}</div>
    <div class="rk-row">${k('back', I.back, '', 'Zurück')}${tog('pad', I.pad, 'Steuerkreuz und Wiedergabe', hasPad)}${k('menu', I.menu, '', 'Menü')}${tog('num', '123', 'Zahlen', nums.length > 0)}</div>
    ${panel ? `<div class="rk-panel">${panel}</div>` : ''}
  </div>`;
}
let remotePanel = null; // aufgeklapptes Feld unter dem Drehregler: 'pad' | 'num' | null
let volAngle = 0;        // Stellung des Drehknopfs (nur Anzeige)
// Drehregler: alle VOL_STEP Grad eine Taste lauter/leiser; Befehle über eine Warteschlange, damit der Hub nicht überflutet wird
const VOL_STEP = 24;
let volQueue = 0, volTimer = null, volShown = 0, volShowTimer = null;
function volPump() {
  if (volTimer || !volQueue) return;
  const up = volQueue > 0; volQueue += up ? -1 : 1;
  api('harmony/key/' + (up ? 'volup' : 'voldown'));
  volTimer = setTimeout(() => { volTimer = null; volPump(); }, 140);
}
function volFeedback(step) {
  volShown += step;
  const t = $('#vr-txt'); if (t) t.textContent = (volShown > 0 ? '+' : volShown < 0 ? '−' : '') + Math.abs(volShown);
  $('#vol-ring')?.classList.toggle('turning', true);
  clearTimeout(volShowTimer);
  volShowTimer = setTimeout(() => { volShown = 0; const t2 = $('#vr-txt'); if (t2) t2.textContent = 'Lautstärke'; $('#vol-ring')?.classList.remove('turning'); }, 1200);
  if (navigator.vibrate) try { navigator.vibrate(8); } catch {}
}
function volStep(step) { volQueue += step; volFeedback(step); volPump(); }
document.addEventListener('pointerdown', (e) => {
  const ringEl = e.target.closest?.('#vol-ring');
  if (!ringEl || e.target.closest('.vr-mute') || e.button > 0) return;
  e.preventDefault();
  busy = true;
  const r = ringEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const ang = (ev) => Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI;
  let last = ang(e), acc = 0;
  const move = (ev) => {
    const a = ang(ev); let dlt = a - last; last = a;
    if (dlt > 180) dlt -= 360; if (dlt < -180) dlt += 360;
    acc += dlt; volAngle += dlt;
    const knob = $('#vr-knob'); if (knob) knob.style.transform = `rotate(${volAngle}deg)`;
    while (acc >= VOL_STEP) { acc -= VOL_STEP; volStep(1); }   // im Uhrzeigersinn = lauter
    while (acc <= -VOL_STEP) { acc += VOL_STEP; volStep(-1); }
  };
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
});
document.addEventListener('keydown', (e) => {
  if (e.target.id !== 'vol-ring') return;
  if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { volStep(1); volAngle += VOL_STEP; e.preventDefault(); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { volStep(-1); volAngle -= VOL_STEP; e.preventDefault(); }
  const knob = $('#vr-knob'); if (knob) knob.style.transform = `rotate(${volAngle}deg)`;
});
// Schmale Zeile „Alle Lampen“ für die Szenen-Ansicht: Schalter + Regler (die grosse Karte bleibt in „Licht“)
function allLightsRow(d) {
  const dim = d.onLights.filter(l => l.bri != null);
  const avg = dim.length ? Math.round(dim.reduce((a, l) => a + (typeof l.id === 'number' ? l.bri : pct(l.bri)), 0) / dim.length) : 0;
  return `<div class="card all-row ${d.onLights.length ? 'on' : ''}">
    <span class="nm">Alle Lampen</span>
    <input type="range" min="1" max="100" value="${avg || 50}" data-action="lights/all" aria-label="Alle Lampen dimmen">
    <span class="all-pct">${d.onLights.length ? (avg || 100) + ' %' : 'aus'}</span>
    ${sw(d.onLights.length > 0, 'lights/all', 'orange', false, 'Alle Lampen an oder aus')}
  </div>`;
}
function renderSzenen(d) {
  const acts = d.har.activities || [];
  const last = S.lastScene;
  const sceneGrid = (r) => `<div class="scene-grid">${(d.hue.scenes || []).filter(s => s.group === r.id)
    .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    .map(s => {
      const st = sceneStyle(s.name), on = last?.id === s.id && r.anyOn;
      return `<button class="scene-tile ${on ? 'on' : ''}" data-scene="${esc(s.id)}" ${on ? 'aria-current="true"' : ''}>
        <span class="scene-dot" style="background:${st.bg}">${on ? I.check : ''}</span><span class="scene-nm">${esc(s.name)}</span></button>`;
    }).join('')}</div>`;
  const activeName = (r) => { const s = r.anyOn && last && (d.hue.scenes || []).find(x => x.id === last.id && x.group === r.id); return s ? ' · aktiv: ' + esc(s.name) : ''; };
  return `<div class="view-head"><h2>Szenen</h2><span class="muted">${(d.hue.scenes || []).length} Hue-Szenen</span></div>
  ${allLightsRow(d)}
  ${d.rooms.map(r => `<div class="card row-card" style="margin-bottom:14px"><div class="row-top"><div><div class="nm">${esc(r.name)}</div><div class="sub">${(d.hue.scenes || []).filter(s => s.group === r.id).length} Szenen${activeName(r)}</div></div></div>
    ${sceneGrid(r)}</div>`).join('')}
  <div class="card row-card" style="margin-bottom:14px">
    <div class="row-top"><div><div class="sub">Harmony – läuft gerade</div><div class="nm" style="font-size:20px">${esc(d.actLabel)}</div></div>
      <button class="chip danger" data-harmony-off ${d.actOn && d.har.ok ? '' : 'disabled'}>Alles aus</button></div>
    ${acts.length ? `<div class="chips">${acts.map(a => `<button class="chip ${a.id === d.actId ? 'active' : ''}" data-activity="${esc(a.id)}" ${d.har.ok ? '' : 'disabled'}>${esc(a.label)}</button>`).join('')}</div>` : ''}
    ${d.har.ok ? '' : '<div class="muted">Harmony Hub nicht erreichbar.</div>'}
  </div>
  ${remoteCard(d)}`;
}

// ---------- Tokens (Claude-Tokenverbrauch der Worklog-Mod) ----------
function renderTokens() {
  return `<div class="card tokens-card">
    <div class="row-top"><div><div class="nm" style="font-size:20px">Claude-Tokenverbrauch</div>
      <div class="sub" id="tokens-info">Wird geladen …</div></div>
      <button class="chip" id="tokens-reload" type="button">Neu laden</button></div>
    <iframe id="tokens-frame" title="Claude-Tokenverbrauch"></iframe>
  </div>`;
}
async function ladeTokens() {
  const frame = $('#tokens-frame'), info = $('#tokens-info');
  if (!frame) return;
  info.textContent = 'Wird geladen …';
  try {
    const r = await fetch(SH.apiBase + '/api/tokens', { headers: await SH.authHeaders(), cache: 'no-store' });
    const text = await r.text();
    if (!r.ok) { info.textContent = text || 'Nicht verfügbar (' + r.status + ')'; frame.srcdoc = ''; return; }
    frame.srcdoc = text;
    info.textContent = 'Wird von Claude alle 15 Minuten aktualisiert, solange Claude läuft';
  } catch (e) {
    info.textContent = 'Nicht erreichbar: ' + e.message;
  }
}
document.addEventListener('click', (e) => { if (e.target.closest('#tokens-reload')) ladeTokens(); });

// ---------- Rendern ----------
function render() {
  if (!S) return;
  if (typeof renderKalender !== 'function') return; // layouts2.js noch nicht geladen (erste Live-Meldung kann vorher eintreffen)
  const d = derive();
  renderFrame(d);
  // Tokens: eingebettete Seite nur einmal laden, nicht bei jedem Live-Update neu zeichnen
  if (view === 'tokens') {
    if (!$('#tokens-frame')) { $('#view').innerHTML = renderTokens(); ladeTokens(); }
    return;
  }
  const home = HOMES[layout] || renderHome; // Startseite je nach gewähltem Layout (layouts.js)
  const v = { home, licht: renderLicht, rollos: renderRollos, sauger: renderSauger, szenen: renderSzenen, musik: renderMusik, kalender: renderKalender, layouts: renderLayouts }[view] || home;
  $('#view').innerHTML = v(d);
  bindVSlider(d);
  if (typeof afterRender === 'function') afterRender(d);
}

// ---------- Vertikaler Regler ----------
function bindVSlider(d) {
  const el = $('#vslider'); if (!el || !d.room) return;
  const fill = $('.fill', el), knob = $('.knob', el), out = $('#vs-pct');
  let val = d.room.anyOn ? d.roomPct : 0;
  const set = (p) => { val = Math.max(0, Math.min(100, Math.round(p))); fill.style.height = val + '%'; knob.style.bottom = val + '%'; out.textContent = val + ' %'; };
  const fromEvent = (e) => { const r = el.getBoundingClientRect(); set((r.bottom - e.clientY) / r.height * 100); };
  const commit = () => { busy = false; api(`hue/room/${d.room.id}`, val === 0 ? { on: false } : { bri: toBri(val) }); };
  el.addEventListener('pointerdown', (e) => { busy = true; el.setPointerCapture(e.pointerId); fromEvent(e); });
  el.addEventListener('pointermove', (e) => { if (el.hasPointerCapture(e.pointerId)) fromEvent(e); });
  el.addEventListener('pointerup', (e) => { el.releasePointerCapture(e.pointerId); commit(); });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { set(val + 5); commit(); e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { set(val - 5); commit(); e.preventDefault(); }
  });
}

// ---------- Bedienung ----------
let dialTimer = null, dialTarget = null;
function blindsAll(pos) { (S.ikea.blinds || []).filter(x => x.reachable).forEach(x => api('ikea/blind/' + x.id, { position: pos })); }
// Standard-Aktivität für den TV-Schalter und den Filmabend: „Sunrise TV“, sonst die erste mit „TV“, sonst die erste
function tvDefault(d) {
  const acts = d.har.activities || [];
  return acts.find(a => a.label === 'Sunrise TV') || acts.find(a => /\btv\b/i.test(a.label)) || acts[0];
}
function toggleTv(d) {
  if (d.actOn) { api('harmony/off'); toast('Schalte alles aus …'); return; }
  const a = tvDefault(d);
  if (!a) { toast('Noch keine Harmony-Szene bekannt.'); return; }
  api('harmony/activity/' + a.id); toast('Starte „' + a.label + '“ …');
}
function toggleIkeaLamp(d, on) { const l = d.ikea.lights?.[0]; if (l?.reachable) api('ikea/light/' + l.id, { on: on ?? !l.on }); }

document.addEventListener('change', (e) => {
  const el = e.target, a = el.dataset.action;
  if (!a || !S) return;
  const d = derive();
  if (a.startsWith('tile/')) {
    const k = a.slice(5), on = el.checked;
    if (k === 'light' && d.room) api(`hue/room/${d.room.id}`, { on });
    if (k === 'blinds') blindsAll(on ? 0 : 100);
    if (k === 'tv') toggleTv(d);
    if (k === 'ikealamp') toggleIkeaLamp(d, on);
    if (k === 'music') api('spotify/cmd/' + (d.sp.playing ? 'pause' : 'play'));
    return;
  }
  // Schalter aus den Geräte-Listen (layouts2.js): Rollo auf/zu, Saugroboter start/Station
  if (a.startsWith('blindtoggle/')) { api('ikea/blind/' + a.slice(12), { position: el.checked ? 0 : 100 }); return; }
  if (a === 'vac/toggle') { api('vacuum/cmd/' + (el.checked ? 'start' : 'dock')); return; }
  if (el.type === 'checkbox') api(a, { on: el.checked });
  if (el.type === 'range') {
    busy = false;
    const n = Number(el.value);
    api(a, a.startsWith('ikea/blind') ? { position: n } : a === 'spotify/volume' ? { volume: n } : a === 'lights/all' ? { pct: n } : { bri: n });
  }
});
// Regler mit Füllfarbe (Layouts): Füllstand beim Ziehen mitführen
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.classList?.contains('fill-range')) el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min) * 100) + '%');
});
document.addEventListener('pointerdown', (e) => { if (e.target.type === 'range') busy = true; });
// Fernbedienung: schon beim Antippen senden (nicht erst beim Loslassen) und solange der Finger drauf ist nicht neu zeichnen
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest?.('[data-hkey]'); if (!b || e.button > 0) return;
  busy = true;
  b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 180);
  if (navigator.vibrate) try { navigator.vibrate(15); } catch {}
  api('harmony/key/' + b.dataset.hkey);
});
document.addEventListener('pointerup', () => { if (busy && !$('#vslider')?.matches(':active')) setTimeout(() => { busy = false; render(); }, 500); });
function vacToggleRoom(id) { if (!S?.vacuum?.ok) return; vacSel.has(id) ? vacSel.delete(id) : vacSel.add(id); render(); }
document.addEventListener('keydown', (e) => {
  const g = e.target.closest?.('[data-vacmap]');
  if (g && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault(); const id = g.dataset.vacmap; vacToggleRoom(Number(id));
    $(`[data-vacmap="${id}"]`)?.focus();
  }
});
document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-vacmap]'); if (g) return vacToggleRoom(Number(g.dataset.vacmap));
  const seek = e.target.closest('[data-spseek]');
  if (seek && S?.spotify?.duration) {
    const r = seek.getBoundingClientRect(), f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    return api('spotify/seek', { ms: Math.round(f * S.spotify.duration) });
  }
  const b = e.target.closest('button'); if (!b || !S) return;
  const d = derive();
  if (b.dataset.alllights) { api('lights/all', { on: b.dataset.alllights === 'on' }); toast(b.dataset.alllights === 'on' ? 'Alle Lampen an' : 'Alle Lampen aus'); }
  else if (b.dataset.allpct) { api('lights/all', { pct: Number(b.dataset.allpct) }); toast(`Alle Lampen ${b.dataset.allpct} %`); }
  else if (b.dataset.layout) { setLayout(b.dataset.layout); render(); }
  else if (b.dataset.sp) api('spotify/cmd/' + b.dataset.sp);
  else if (b.dataset.spdev) { api('spotify/device', { id: b.dataset.spdev }); toast('Wechsle das Gerät …'); }
  else if (b.dataset.lampnav) { lampIdx += Number(b.dataset.lampnav); render(); }
  else if (b.dataset.view) { view = b.dataset.view; try { localStorage.setItem('sh.view', view); } catch {} render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  else if (b.dataset.goto) { view = b.dataset.goto; try { localStorage.setItem('sh.view', view); } catch {} render(); window.scrollTo({ top: 0 }); }
  else if (b.dataset.room) { roomId = b.dataset.room; render(); }
  else if ('roomToggle' in b.dataset && d.room) api(`hue/room/${d.room.id}`, { on: !d.room.anyOn });
  else if (b.dataset.dial && d.room) {
    const base = dialTarget ?? (d.room.anyOn ? d.roomPct : 0);
    dialTarget = Math.max(0, Math.min(100, base + Number(b.dataset.dial)));
    const dv = $('.dial-val'); if (dv) dv.innerHTML = `${dialTarget}<small> %</small>`; // nur im Standard-Layout vorhanden
    toast(`Helligkeit ${dialTarget} %`);
    clearTimeout(dialTimer);
    dialTimer = setTimeout(() => { api(`hue/room/${d.room.id}`, dialTarget === 0 ? { on: false } : { bri: toBri(dialTarget) }); dialTarget = null; }, 350);
  }
  else if (b.dataset.node) {
    const k = b.dataset.node;
    if (k === 'light' && d.room) api(`hue/room/${d.room.id}`, { on: !d.room.anyOn });
    if (k === 'blinds') blindsAll(d.reachBlinds.some(x => (x.position ?? 100) < 98) ? 100 : 0);
    if (k === 'tv') toggleTv(d);
    if (k === 'ikealamp') toggleIkeaLamp(d);
  }
  else if (b.dataset.scene) { api('hue/scene/' + b.dataset.scene); toast('Szene „' + b.textContent.trim() + '“'); }
  else if (b.dataset.blind) api('ikea/blind/' + b.dataset.blind, b.dataset.stop ? { stop: true } : { position: Number(b.dataset.pos) });
  else if (b.dataset.allblinds) blindsAll(Number(b.dataset.allblinds));
  else if (b.dataset.activity) { api('harmony/activity/' + b.dataset.activity); toast('Starte „' + b.textContent.trim() + '“ …'); }
  else if ('harmonyOff' in b.dataset) { api('harmony/off'); toast('Schalte alles aus …'); }
  else if (b.dataset.rpanel) { remotePanel = remotePanel === b.dataset.rpanel ? null : b.dataset.rpanel; render(); }
  else if (b.dataset.hkey && e.detail === 0) api('harmony/key/' + b.dataset.hkey); // nur Tastatur (Enter/Leertaste); Maus/Finger: pointerdown unten
  else if (b.dataset.vac) {
    const names = { start: 'Reinigung startet …', pause: 'Pause', resume: 'Reinigung geht weiter …', stop: 'Gestoppt', dock: 'Fährt zur Station …', locate: 'Roboter meldet sich …', dust: 'Absaugen …', wash: 'Mopp waschen …', dry: 'Mopp trocknen …' };
    api('vacuum/cmd/' + b.dataset.vac); toast(names[b.dataset.vac] || 'Gesendet');
  }
  else if (b.dataset.vacset) api('vacuum/set', { [b.dataset.vacset]: Number(b.dataset.val) });
  else if (b.dataset.vacroom) vacToggleRoom(Number(b.dataset.vacroom));
  else if ('vacclear' in b.dataset) { vacSel.clear(); render(); }
  else if ('vacrooms' in b.dataset && vacSel.size) {
    const names = d.vac.rooms.filter(r => vacSel.has(r.id)).map(r => r.name);
    api('vacuum/rooms', { ids: [...vacSel] }); toast('Reinige ' + names.join(', ') + ' …'); vacSel.clear(); render();
  }
});
setInterval(() => { if (!busy && !held() && view === 'home') render(); }, 30000); // Uhrzeit aktualisieren
// Fernmodus: Klick auf den Benutzer meldet ab
if (SH.remote) {
  const u = $('.user'); u.title = 'Abmelden'; u.style.cursor = 'pointer';
  u.addEventListener('click', () => { if (confirm('Abmelden?')) SH.logout(); });
  const sub = $('.user-sub'); if (sub) sub.textContent = 'Unterwegs';
}
SH.ready.then(ok => { if (ok) connect(); });
