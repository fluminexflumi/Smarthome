// Smarthome-Dashboard – weitere Startseiten-Layouts:
//   nach Vorlagen:  villa (Haus bei Nacht), iso (3D-Grundriss), neo (Neumorph), violett (Geräte-Tabelle)
//   eigene:         terminal (Textbefehle), morgen (Routinen + Agenda, hell), bauhaus (Riesenknöpfe + Bildschirmschoner)
// Dazu: Kalender-Karte (Google über iCal), Routinen, Tagesverlauf-Diagramme.
// Nutzt app.js (I, esc, sw, pct, toBri, api, toast, derive, render, blindsAll, roomSvg, arcPath, VAC_*, vacText, vacOn …)
// und layouts.js (LAYOUTS, HOMES, LAYOUT_PREVIEW, musicCard, fillRange, roomTabs, liveBadge, wxIcon, wmo, spPos, setLayout).

LAYOUTS.push(
  { id: 'villa', name: 'Villa', desc: 'Dunkelblau: Haus bei Nacht (Fenster leuchten mit), Kennzahlen, Räume, Verlauf, Termine.' },
  { id: 'iso', name: 'Grundriss 3D', desc: 'Die Wohnung als 3D-Plan: Räume antippen und reinigen, Listen mit „alle aus“.' },
  { id: 'neo', name: 'Neumorph', desc: 'Weiche Schatten mit Cyan: grosser Helligkeitsbalken, Geräte-Raster, Saugroboter-Rad.' },
  { id: 'violett', name: 'Violett', desc: 'Geräte-Tabelle mit Status und Schaltern, Aussenklima, Verlaufskurven, Termine.' },
  { id: 'terminal', name: 'Terminal', desc: 'Eigenes: alles per Textbefehl steuern, z. B. „licht 40“ oder „rollo alle runter“.' },
  { id: 'morgen', name: 'Morgen', desc: 'Eigenes, hell: Routinen auf einen Tipp, Tagesagenda aus dem Kalender, Zustand in Sätzen.' },
  { id: 'bauhaus', name: 'Bauhaus', desc: 'Eigenes, fürs Wandtablet: riesige farbige Knöpfe und Bildschirmschoner mit Uhr.' }
);
Object.assign(LAYOUT_PREVIEW, {
  villa: ['a', 'a', 'b', 'c', 'c', 'b', 'd', 'e', 'f'],
  iso: ['a', 'b', 'b', 'a', 'b', 'b', 'a', 'c', 'c'],
  neo: ['a', 'b', 'c', 'a', 'b', 'd', 'e', 'e', 'd'],
  violett: ['a', 'a', 'b', 'c', 'c', 'd', 'c', 'c', 'e'],
  terminal: ['a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b'],
  morgen: ['a', 'a', 'b', 'c', 'd', 'b', 'e', 'f', 'b'],
  bauhaus: ['a', 'b', 'c', 'd', 'e', 'c', 'f', 'g', 'h']
});
// gespeichertes Layout erst jetzt prüfen (layouts.js kannte die neuen Namen noch nicht)
try { const s = localStorage.getItem('sh.layout'); if (LAYOUTS.some(l => l.id === s)) { layout = s; document.body.dataset.layout = s; } } catch {}

Object.assign(I, {
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4" stroke-linecap="round"/></svg>',
  thermo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.6L19 9.5l-5.2 1.9L12 17l-1.8-5.6L5 9.5l5.2-1.9zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
  door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6v18h8M14 3l5 2v14l-5 2z"/><path d="M11 12h.01"/></svg>',
  term: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/></svg>'
});

// ---------- gemeinsame Daten ----------
const lightPct = (l) => !l.on || l.reachable === false ? 0 : l.bri == null ? 100 : typeof l.id === 'number' ? l.bri : pct(l.bri);
const allLightsOff = () => api('lights/all', { on: false }); // alle Hue- und IKEA-Lampen
const sceneByName = (d, ...names) => (d.hue.scenes || []).find(s => names.some(n => s.name.toLowerCase() === n.toLowerCase()))
  || (d.hue.scenes || []).find(s => names.some(n => s.name.toLowerCase().includes(n.toLowerCase())));
// alle Geräte einheitlich (Villa-Liste, Violett-Tabelle, Terminal-Status)
function deviceList(d) {
  const out = [];
  for (const l of Object.values(d.hue.lights || {})) out.push({ group: 'Licht', icon: I.bulb, name: l.name, type: 'Hue-Lampe', reach: l.reachable, on: l.on && l.reachable, value: l.reachable ? (l.on ? (l.bri == null ? 'An' : pct(l.bri) + ' %') : 'Aus') : 'offline', action: `hue/light/${l.id}` });
  for (const l of d.ikea.lights || []) out.push({ group: 'Licht', icon: I.lamp, name: l.name, type: 'IKEA-Lampe', reach: l.reachable, on: l.on && l.reachable, value: l.reachable ? (l.on ? (l.bri ?? '–') + ' %' : 'Aus') : 'offline', action: `ikea/light/${l.id}` });
  for (const b of d.blinds) out.push({ group: 'Rollos', icon: I.blind, name: b.name, type: 'Rollo', reach: b.reachable, on: b.reachable && (b.position ?? 100) < 98, value: b.reachable ? blindText(b.position) : 'offline', extra: b.battery != null ? `Batterie ${b.battery} %` : '', action: `blindtoggle/${b.id}` });
  out.push({ group: 'Medien', icon: I.tv, name: 'Harmony', type: 'TV/Fernbedienung', reach: d.har.ok, on: d.actOn, value: d.actLabel, action: 'tile/tv' });
  if (d.sp.configured && d.sp.linked) out.push({ group: 'Medien', icon: I.music, name: 'Spotify', type: d.sp.device?.name || 'Musik', reach: d.sp.ok, on: !!d.sp.playing, value: d.sp.playing ? (d.sp.track || 'spielt') : 'Pause', action: 'tile/music' });
  if (d.vac.configured) out.push({ group: 'Haushalt', icon: I.robot, name: 'Saugroboter', type: 'Xiaomi X20 Max', reach: d.vac.ok, on: vacOn(d.vac), value: vacText(d.vac), extra: d.vac.ok ? `Akku ${d.vac.battery ?? '–'} %` : '', action: 'vac/toggle' });
  return out;
}
function systems(d) {
  return [['Hue', d.hue.ok], ['IKEA', d.ikea.ok], ['Harmony', d.har.ok], ...(d.vac.configured ? [['Sauger', d.vac.ok]] : []),
    ...(d.sp.configured ? [['Spotify', d.sp.ok]] : []), ...(S.calendar?.configured ? [['Kalender', S.calendar.ok]] : []), ['Live', live]];
}
function hints(d) {
  const h = [...d.lowBatt.map(b => `${b.name}: Batterie nur noch ${b.battery} % – bald wechseln.`), ...d.blinds.filter(b => !b.reachable).map(b => `${b.name} ist nicht erreichbar.`)];
  if (d.vac.ok && d.vac.mop != null && d.vac.mop < 10) h.push(`Saugroboter: Mopp ersetzen (${d.vac.mop} %).`);
  if (!d.har.ok) h.push('Harmony Hub ist noch nicht eingerichtet.');
  return h;
}

// ---------- Routinen (mehrere Befehle auf einen Tipp) ----------
function routines(d) {
  const film = sceneByName(d, 'dunkel', 'Gedimmt', 'Entspannen'), morning = sceneByName(d, 'Aktivieren', 'Hell', 'Konzentration');
  const act = tvDefault(d);
  return [
    { id: 'morgen', name: 'Guten Morgen', icon: I.sun, color: '#f3b23c', steps: [
      ['Rollos hoch', () => blindsAll(0)],
      [morning ? `Licht „${morning.name}“` : 'Licht 80 %', () => morning ? api('hue/scene/' + morning.id) : d.room && api(`hue/room/${d.room.id}`, { bri: toBri(80) })]] },
    { id: 'weg', name: 'Ausser Haus', icon: I.door, color: '#4c8dff', steps: [
      ['Alle Lichter aus', allLightsOff],
      ...(d.sp.playing ? [['Musik pausieren', () => api('spotify/cmd/pause')]] : []),
      ...(d.vac.ok ? [['Saugroboter starten', () => api('vacuum/cmd/start')]] : [])] },
    { id: 'film', name: 'Filmabend', icon: I.film, color: '#8d7cf8', steps: [
      ['Rollos runter', () => blindsAll(100)],
      [film ? `Licht „${film.name}“` : 'Licht 15 %', () => film ? api('hue/scene/' + film.id) : d.room && api(`hue/room/${d.room.id}`, { bri: toBri(15) })],
      ...(act && d.har.ok ? [[`TV „${act.label}“`, () => api('harmony/activity/' + act.id)]] : [])] },
    { id: 'nacht', name: 'Gute Nacht', icon: I.moon, color: '#2fbf8f', steps: [
      ['Rollos runter', () => blindsAll(100)],
      ['Alle Lichter aus', allLightsOff],
      ...(d.sp.playing ? [['Musik pausieren', () => api('spotify/cmd/pause')]] : []),
      ...(d.actOn ? [['TV aus', () => api('harmony/off')]] : [])] }
  ];
}
function runRoutine(id) {
  const r = routines(derive()).find(x => x.id === id); if (!r) return false;
  r.steps.forEach(([, fn], i) => setTimeout(fn, i * 400));
  toast(`${r.name}: ${r.steps.map(s => s[0]).join(' · ')}`);
  return r;
}

// ---------- Kalender ----------
const DAYMS = 86400000;
const startOfDay = (t) => { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); };
function dayLabel(t) {
  const diff = Math.round((startOfDay(t) - startOfDay(Date.now())) / DAYMS);
  if (diff === 0) return 'Heute'; if (diff === 1) return 'Morgen'; if (diff === -1) return 'Gestern';
  return new Date(t).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' });
}
const hhmm = (t) => new Date(t).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
const evTime = (e) => e.allDay ? 'ganztags' : `${hhmm(e.start)}–${hhmm(e.end)}`;
const upcoming = (days = 14) => (S.calendar?.events || []).filter(e => e.end > Date.now() && e.start < Date.now() + days * DAYMS);
// Ausgeklappt: die nächsten 10 Termine, egal wie weit weg (Server liefert 120 Tage). Gilt für alle Kalender-Karten.
let calOpen = false;
try { calOpen = localStorage.getItem('sh.calopen') === '1'; } catch {}
const CAL_OPEN_N = 10;
function calendarBody(max = 6, days = 14) {
  const c = S.calendar;
  if (!c?.configured) return `<p class="muted cal-empty">Google-Kalender noch nicht verbunden. Die private iCal-Adresse gehört in <code>config.local.json</code> (siehe Projekt-Notizen).</p>`;
  if (!c.ok && !c.events.length) return `<p class="muted cal-empty">${esc(c.error || 'Kalender wird geladen …')}</p>`;
  const ev = calOpen ? upcoming(400).slice(0, CAL_OPEN_N) : upcoming(days).slice(0, max);
  if (!ev.length) return `<p class="muted cal-empty">Keine Termine in den nächsten ${calOpen ? 120 : days} Tagen.</p>`;
  let last = '', h = '';
  for (const e of ev) {
    const dl = dayLabel(e.start < Date.now() ? Date.now() : e.start);
    if (dl !== last) { h += `<div class="cal-day">${esc(dl)}</div>`; last = dl; }
    const now = e.start <= Date.now() && e.end > Date.now();
    h += `<div class="cal-ev ${now ? 'now' : ''} ${e.allDay ? 'all' : ''}"><span class="cal-t">${esc(evTime(e))}</span><span class="cal-x"><b>${esc(e.title)}</b>${e.location ? `<small>${esc(e.location)}</small>` : ''}</span></div>`;
  }
  return h;
}
const calToggle = (cls = 'cal-more') => S.calendar?.configured
  ? `<button class="${cls}" data-calmore aria-expanded="${calOpen}">${calOpen ? 'Weniger anzeigen' : `Nächste ${CAL_OPEN_N} Termine`}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${calOpen ? 180 : 0}deg)"><path d="m6 9 6 6 6-6"/></svg></button>` : '';
function calendarCard(cls = '', max = 6, days = 14) {
  return `<section class="card cal-card ${cls} ${calOpen ? 'open' : ''}">
    <div class="card-title">${I.cal}<div><h3>Termine</h3><div class="sub">${esc(S.calendar?.name || 'Google-Kalender')}${calOpen ? ` · nächste ${CAL_OPEN_N}` : ''}</div></div></div>
    <div class="cal-list">${calendarBody(max, days)}</div>${calToggle()}</section>`;
}

// ---------- Verlauf (Server sammelt alle 15 min) ----------
function historyChart(key, { h = 90, color = 'currentColor', max = null, fill = true } = {}) {
  const pts = (S.history || []).slice(-96);
  if (pts.length < 2) return `<div class="hist-empty muted">Verlauf entsteht, sobald der Server eine Weile läuft (alle 15 min ein Messpunkt).</div>`;
  const W = 300, vals = pts.map(p => p[key] ?? 0), top = max ?? Math.max(1, ...vals);
  const xy = vals.map((v, i) => [i / (vals.length - 1) * W, h - 6 - v / top * (h - 14)]);
  const line = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const t0 = hhmm(pts[0].t), t1 = hhmm(pts[pts.length - 1].t);
  return `<svg class="hist" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" style="color:${color}" aria-hidden="true">
      ${fill ? `<path d="${line} L${W} ${h} L0 ${h}Z" fill="currentColor" opacity=".18"/>` : ''}
      <path d="${line}" fill="none" stroke="currentColor" stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>
    <div class="hist-axis"><span>${t0}</span><span>${t1}</span></div>`;
}

// =====================================================================
// Villa (Vorlage 1)
// =====================================================================
function houseSvg(d) {
  const glow = d.room?.anyOn ? Math.max(.3, d.roomPct / 100) : 0;
  const bl = d.blinds.slice(0, 3);
  const shade = (i) => Math.min(100, bl[i]?.position ?? 0) / 100;
  const night = (() => { const h = new Date().getHours(); return h < 7 || h >= 18; })();
  const win = (x, y, w, hh, g, s = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${g ? `rgba(255,${190 + 30 * g | 0},${110 + 60 * g | 0},${.25 + .7 * g})` : night ? '#1a2333' : '#5b7896'}"/>
      ${s ? `<rect x="${x}" y="${y}" width="${w}" height="${(hh * s).toFixed(1)}" fill="url(#vslat)"/>` : ''}
      <rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="none" stroke="#0b0f17" stroke-width="3"/>`;
  return `<svg class="house" viewBox="0 0 600 330" aria-hidden="true">
    <defs>
      <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">${night ? '<stop offset="0" stop-color="#0b1426"/><stop offset="1" stop-color="#1c2a45"/>' : '<stop offset="0" stop-color="#5d8fc8"/><stop offset="1" stop-color="#b9d3ec"/>'}</linearGradient>
      <pattern id="vslat" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#c9ccd2"/><rect y="4.5" width="6" height="1.5" fill="#8f939b"/></pattern>
      <radialGradient id="vglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc77a" stop-opacity=".55"/><stop offset="1" stop-color="#ffc77a" stop-opacity="0"/></radialGradient>
      <linearGradient id="vpool" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2d7fb8"/><stop offset="1" stop-color="#173a5c"/></linearGradient>
    </defs>
    <rect width="600" height="330" fill="url(#vsky)"/>
    ${night ? '<g fill="#fff" opacity=".7"><circle cx="60" cy="40" r="1.3"/><circle cx="140" cy="22" r="1"/><circle cx="470" cy="34" r="1.4"/><circle cx="540" cy="70" r="1"/><circle cx="330" cy="18" r="1"/></g><circle cx="520" cy="46" r="16" fill="#f3e6c4" opacity=".9"/>' : '<circle cx="520" cy="50" r="22" fill="#ffd27a"/>'}
    <path d="M0 250 Q120 228 240 246 T600 238 V330 H0z" fill="${night ? '#0f1a12' : '#3f6b3c'}"/>
    <!-- Bäume -->
    <g fill="${night ? '#14261a' : '#2f5a34'}"><ellipse cx="60" cy="205" rx="34" ry="52"/><ellipse cx="555" cy="210" rx="30" ry="46"/></g>
    <rect x="58" y="240" width="5" height="22" fill="#2b1d12"/><rect x="553" y="240" width="5" height="22" fill="#2b1d12"/>
    ${glow ? `<ellipse cx="260" cy="230" rx="${170 + 60 * glow}" ry="${70 + 30 * glow}" fill="url(#vglow)" opacity="${glow.toFixed(2)}"/>` : ''}
    <!-- Erdgeschoss -->
    <rect x="110" y="170" width="300" height="86" fill="#2a2f38"/>
    ${win(124, 182, 120, 66, glow)}${win(250, 182, 70, 66, glow * .8)}
    <rect x="330" y="182" width="66" height="66" fill="${d.actOn ? '#3d63b8' : '#141a24'}" stroke="#0b0f17" stroke-width="3"/>
    ${d.actOn ? '<rect x="344" y="200" width="38" height="24" fill="#8fb4ff" opacity=".8"/>' : ''}
    <!-- Obergeschoss, auskragend -->
    <rect x="160" y="104" width="300" height="66" fill="#e9e6df"/>
    <rect x="150" y="98" width="320" height="8" fill="#cfcac0"/>
    ${win(176, 116, 80, 44, glow * .5, shade(0))}${win(270, 116, 80, 44, glow * .4, shade(1))}${win(364, 116, 80, 44, glow * .3, shade(2))}
    <rect x="100" y="164" width="320" height="8" fill="#cfcac0"/>
    <!-- Garage -->
    <rect x="410" y="196" width="90" height="60" fill="#3a3f47"/><rect x="420" y="206" width="70" height="50" fill="#20252c"/>
    <g stroke="#2c3138" stroke-width="2">${[216, 226, 236, 246].map(y => `<path d="M420 ${y}h70"/>`).join('')}</g>
    ${d.vac.ok && vacOn(d.vac) ? '<circle cx="455" cy="250" r="6" fill="#5fd8cc"/>' : ''}
    <!-- Pool -->
    <path d="M150 266 h260 l20 20 h-300z" fill="url(#vpool)"/>
    ${glow ? `<path d="M170 272 h120 l8 8 h-136z" fill="#ffd8a0" opacity="${(.25 * glow).toFixed(2)}"/>` : ''}
  </svg>`;
}
function renderHomeVilla(d) {
  const w = S.weather, h = new Date().getHours();
  const hello = h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend';
  const stat = (icon, label, val, sub = '') => `<div class="v-stat"><span class="v-stat-ic">${icon}</span><div><small>${esc(label)}</small><b>${val}</b>${sub ? `<em>${esc(sub)}</em>` : ''}</div></div>`;
  const devs = deviceList(d).filter(x => x.group !== 'Licht' || x.type === 'IKEA-Lampe');
  const roomRow = (icon, name, sub, action, on, dis) => `<div class="v-room ${on ? 'on' : ''}"><span class="v-room-ic">${icon}</span><div><b>${esc(name)}</b><small>${esc(sub)}</small></div>${sw(on, action, 'villa', dis, name)}</div>`;
  const sc = (d.hue.scenes || []).filter(s => s.group === d.room?.id).slice(0, 6);
  const hint = hints(d)[0];
  const v = d.room?.anyOn ? d.roomPct : 0, A0 = 135, A1 = 405, a = A0 + (A1 - A0) * v / 100;
  return `<div class="villa">
    <div class="v-hello"><h2>${hello}, Toni</h2><p class="muted">${esc(new Date().toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }))} · ${d.onLights.length ? `${d.onLights.length} Lampen an` : 'alles ruhig'}</p></div>
    <div class="v-stats">
      ${stat(I.thermo, 'Aussen', w ? Math.round(w.temp) + '°' : '–', w ? wmo(w.code, w.day)[0] : 'kein Wetter')}
      ${stat(I.drop, 'Feuchte', w ? Math.round(w.humidity) + ' %' : '–')}
      ${stat(I.bulb, 'Lampen', `${d.onLights.length}/${d.allLights.length}`, 'an')}
      ${stat(I.sun, 'Helligkeit', v + ' %', d.room?.name || '')}
      ${stat(I.blind, 'Rollos', `${d.openBlinds.length}/${d.blinds.length}`, 'offen')}
      ${d.vac.configured ? stat(I.battery, 'Sauger', d.vac.ok ? (d.vac.battery ?? '–') + ' %' : '–', vacText(d.vac)) : ''}
    </div>
    <section class="card v-house"><div class="v-house-head"><div><h3>Mein Zuhause</h3><div class="sub">${devs.length + d.roomLights.length} Geräte</div></div>${liveBadge()}</div>${houseSvg(d)}</section>
    <section class="card v-rooms"><div class="card-head"><h3>Räume &amp; Geräte</h3></div>
      ${d.rooms.map(r => roomRow(I.home, r.name, `${r.lights.length} Lampen · ${r.anyOn ? 'an' : 'aus'}`, `hue/room/${r.id}`, r.anyOn, false)).join('')}
      ${devs.map(x => roomRow(x.icon, x.name, x.value, x.action, x.on, !x.reach)).join('')}
    </section>
    <section class="card v-energy"><div class="card-head"><div><h3>Helligkeit heute</h3><div class="sub">Ø aller Lampen, alle 15 min</div></div><b class="v-big">${v}<small>%</small></b></div>${historyChart('bri', { color: '#5aa2ff', max: 100 })}</section>
    <section class="card v-gauge"><div class="card-head"><div><h3>Licht</h3><div class="sub">${esc(d.room?.name || '')}</div></div>${sw(!!d.room?.anyOn, 'tile/light', 'villa', !d.room, 'Licht')}</div>
      <div class="v-dial"><svg viewBox="0 0 240 200" aria-hidden="true"><defs><linearGradient id="vdg" x1="0" x2="1"><stop offset="0" stop-color="#3a7bff"/><stop offset="1" stop-color="#6fe0ff"/></linearGradient></defs>
        <path d="${arcPath(120, 110, 80, A0, A1)}" stroke="rgba(255,255,255,.1)" stroke-width="16" fill="none" stroke-linecap="round"/>
        ${v ? `<path d="${arcPath(120, 110, 80, A0, Math.max(a, A0 + .5))}" stroke="url(#vdg)" stroke-width="16" fill="none" stroke-linecap="round"/>` : ''}</svg>
        <div class="v-dial-c"><b>${v}<small>%</small></b><span>${d.roomLights.filter(l => l.on && l.reachable).length} an</span></div>
        <button class="round v-minus" data-dial="-10" aria-label="Dunkler">${I.minus}</button><button class="round v-plus" data-dial="10" aria-label="Heller">${I.plus}</button></div></section>
    <section class="card v-sec"><div class="card-head"><div><h3>Systemstatus</h3><div class="sub">${systems(d).every(s => s[1]) ? 'Alles verbunden' : 'Nicht alles verbunden'}</div></div><span class="v-shield ${systems(d).every(s => s[1]) ? 'ok' : ''}">${I.shield}</span></div>
      <div class="v-sys">${systems(d).map(([n, ok]) => `<span class="${ok ? 'ok' : 'down'}"><i></i>${esc(n)}</span>`).join('')}</div></section>
    <section class="card v-scenes"><div class="card-head"><h3>Szenen</h3><button class="chip-tag outline btn" data-goto="szenen">Alle</button></div>
      <div class="v-scene-grid">${sc.map(s => `<button class="v-scene" data-scene="${esc(s.id)}">${I.spark}<span>${esc(s.name)}</span></button>`).join('') || '<p class="muted">Keine Szenen.</p>'}</div></section>
    ${calendarCard('v-cal', 5)}
    ${musicCard(d, 'v-music')}
    ${hint ? `<section class="card v-tip"><span class="v-tip-ic">${I.spark}</span><div><b>Hinweis</b><span>${esc(hint)}</span></div></section>` : ''}
  </div>`;
}

// =====================================================================
// Grundriss 3D (Vorlage 2) – isometrisch aus VAC_MAP
// =====================================================================
let isoTab = 'alles';
const ISO = { c: Math.cos(Math.PI / 6), s: Math.sin(Math.PI / 6), k: .62 };
const isoP = (x, y, z = 0) => [(x - y) * ISO.c * ISO.k, (x + y) * ISO.s * ISO.k - z];
function isoMap(d) {
  const v = d.vac, rooms = (v.rooms?.length ? v.rooms : Object.keys(VAC_MAP).map(id => ({ id: +id, name: '' }))).filter(r => VAC_MAP[r.id]);
  const H = 34, glow = d.room?.anyOn ? Math.max(.35, d.roomPct / 100) : 0;
  const LIVING = 16; // Wohnzimmer (Hue-Raum)
  const polys = rooms.map(r => ({ r, pts: VAC_MAP[r.id].p.split(' ').map(s => s.split(',').map(Number)) }));
  const all = polys.flatMap(p => p.pts.flatMap(([x, y]) => [isoP(x, y), isoP(x, y, H)]));
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const minX = Math.min(...xs) - 20, minY = Math.min(...ys) - 20, W = Math.max(...xs) - minX + 20, Hh = Math.max(...ys) - minY + 20;
  const pts = (arr, z = 0) => arr.map(([x, y]) => isoP(x, y, z).map(n => n.toFixed(1)).join(',')).join(' ');
  const floors = polys.map(({ r, pts: p }) => {
    const sel = vacSel.has(r.id), lit = r.id === LIVING && glow;
    const [lx, ly] = isoP(...VAC_MAP[r.id].l);
    return `<g class="iso-room ${sel ? 'sel' : ''} ${lit ? 'lit' : ''}" data-vacmap="${r.id}" role="button" tabindex="0" aria-label="${esc(r.name)} ${sel ? 'abwählen' : 'auswählen'}" style="--g:${lit ? glow.toFixed(2) : 0}">
      <polygon class="iso-floor" points="${pts(p)}"/><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}">${esc(r.name)}</text></g>`;
  }).join('');
  // Wände: alle Kanten hochziehen, von hinten nach vorne zeichnen
  const edges = polys.flatMap(({ pts: p }) => p.map((a, i) => [a, p[(i + 1) % p.length]]))
    .sort((e1, e2) => (e1[0][0] + e1[0][1] + e1[1][0] + e1[1][1]) - (e2[0][0] + e2[0][1] + e2[1][0] + e2[1][1]));
  const walls = edges.map(([a, b]) => `<polygon points="${pts([a, b])} ${pts([b, a], H)}"/>`).join('');
  const [sx, sy] = isoP(...VAC_STATION);
  const docked = v.ok && (VAC_DOCKED.has(v.status) || v.charging === 1);
  return `<svg class="iso" viewBox="${minX.toFixed(0)} ${minY.toFixed(0)} ${W.toFixed(0)} ${Hh.toFixed(0)}" role="group" aria-label="3D-Grundriss, Räume antippen zum Auswählen">
    <defs><radialGradient id="isoglow"><stop offset="0" stop-color="#ffc77a" stop-opacity=".9"/><stop offset="1" stop-color="#ffc77a" stop-opacity="0"/></radialGradient></defs>
    ${floors}<g class="iso-walls">${walls}</g>
    <g class="iso-station" transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})"><rect x="-10" y="-14" width="20" height="16" rx="3"/>${docked ? '<ellipse cx="0" cy="6" rx="12" ry="7" class="iso-bot"/>' : ''}</g>
  </svg>`;
}
function renderHomeIso(d) {
  const tabs = [['alles', 'Alles'], ['licht', 'Licht'], ['rollos', 'Rollos'], ['sauger', 'Sauger']];
  const row = (title, sub, btn) => `<div class="iso-row"><div><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>${btn}</div>`;
  const onRooms = d.rooms.filter(r => r.anyOn);
  const rows = [];
  if (isoTab === 'alles' || isoTab === 'licht') {
    rows.push(row(`${I.bulb.replace('<svg', '<svg class="iso-ic"')} ${onRooms.length ? `${d.onLights.length} Lampen an` : 'Alle Lampen aus'}`, `in ${onRooms.length} von ${d.rooms.length} Räumen`, `<button class="iso-btn" data-iso="lightsoff" ${d.onLights.length ? '' : 'disabled'}>alle aus</button>`));
    if (isoTab === 'licht') for (const l of [...d.roomLights, ...(d.ikea.lights || [])]) rows.push(row(esc(l.name), l.reachable === false ? 'offline' : l.on ? lightPct(l) + ' %' : 'aus', sw(l.on && l.reachable !== false, typeof l.id === 'number' ? `ikea/light/${l.id}` : `hue/light/${l.id}`, 'iso', l.reachable === false, l.name)));
  }
  if (isoTab === 'alles' || isoTab === 'rollos') {
    rows.push(row(`${I.blind.replace('<svg', '<svg class="iso-ic"')} ${d.openBlinds.length} Rollos offen`, `${d.blinds.length} Rollos insgesamt`, `<span class="iso-pair"><button class="iso-btn" data-allblinds="0">alle auf</button><button class="iso-btn" data-allblinds="100">alle zu</button></span>`));
    if (isoTab === 'rollos') for (const b of d.blinds) rows.push(row(esc(b.name), b.reachable ? blindText(b.position) : 'offline', `<span class="iso-pair"><button class="iso-btn" data-blind="${b.id}" data-pos="0" ${b.reachable ? '' : 'disabled'}>auf</button><button class="iso-btn" data-blind="${b.id}" data-pos="100" ${b.reachable ? '' : 'disabled'}>zu</button></span>`));
  }
  if ((isoTab === 'alles' || isoTab === 'sauger') && d.vac.configured) {
    rows.push(row(`${I.robot.replace('<svg', '<svg class="iso-ic"')} Saugroboter: ${esc(vacText(d.vac))}`, d.vac.ok ? `Akku ${d.vac.battery ?? '–'} %` : '', vacOn(d.vac) ? `<button class="iso-btn" data-vac="dock">zur Station</button>` : `<button class="iso-btn" data-vac="start" ${d.vac.ok ? '' : 'disabled'}>alles reinigen</button>`));
    rows.push(row(vacSel.size ? `${vacSel.size} ${vacSel.size === 1 ? 'Raum' : 'Räume'} gewählt` : 'Raum im Plan antippen', vacSel.size ? d.vac.rooms.filter(r => vacSel.has(r.id)).map(r => esc(r.name)).join(', ') : 'dann hier reinigen', `<button class="iso-btn accent" data-vacrooms ${vacSel.size && d.vac.ok ? '' : 'disabled'}>reinigen</button>`));
  }
  if (isoTab === 'alles') rows.push(row(`${I.tv.replace('<svg', '<svg class="iso-ic"')} Harmony: ${esc(d.actLabel)}`, '', `<button class="iso-btn" data-harmony-off ${d.actOn ? '' : 'disabled'}>aus</button>`));
  return `<div class="isov">
    <section class="card iso-panel">
      <h2>3D-Wohnungsplan</h2>
      <div class="iso-tabs">${tabs.map(([k, n]) => `<button class="iso-tab ${isoTab === k ? 'active' : ''}" data-isotab="${k}">${n}</button>`).join('')}</div>
      <div class="iso-list">${rows.join('')}</div>
    </section>
    <section class="card iso-stage">${isoMap(d)}
      <div class="iso-legend">${liveBadge()}<span class="glass"><i class="iso-sw lit"></i>Licht an</span><span class="glass"><i class="iso-sw sel"></i>zum Reinigen gewählt</span></div>
      <div class="iso-quick">${(d.hue.scenes || []).filter(s => s.group === d.room?.id).slice(0, 3).map(s => `<button class="glass" data-scene="${esc(s.id)}">${I.spark}${esc(s.name)}</button>`).join('')}</div>
    </section>
    ${calendarCard('wide', 4)}
  </div>`;
}

// =====================================================================
// Neumorph (Vorlage 3)
// =====================================================================
function renderHomeNeo(d) {
  const r = d.room, on = !!r?.anyOn, v = on ? d.roomPct : 0;
  const lights = [...d.roomLights, ...(d.ikea.lights || [])];
  const tile = (icon, name, sub, action, checked, dis) => `<div class="n-dev ${checked ? 'on' : ''} ${dis ? 'off' : ''}"><div class="n-dev-top"><span class="n-ic">${icon}</span>${sw(checked, action, 'neo', dis, name)}</div><b>${esc(name)}</b><small>${esc(sub)}</small></div>`;
  const vac = d.vac, batt = vac.ok ? vac.battery ?? 0 : 0, C = 2 * Math.PI * 70;
  const h = new Date().getHours();
  return `<div class="neo">
    <section class="card n-welcome">
      <small class="muted">${h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'}, Toni</small><h2>${esc(r?.name || 'Zuhause')}</h2>
      <div class="n-thumb">${roomSvg(d)}</div>
      <div class="n-rooms">${d.rooms.map(x => `<button class="n-room ${x.id === r?.id ? 'active' : ''}" data-room="${x.id}">${I.home}<b>${esc(x.name)}</b><small>${x.lights.length} Geräte</small></button>`).join('')}
        <button class="n-room" data-goto="rollos">${I.blind}<b>Rollos</b><small>${d.openBlinds.length} offen</small></button>
        <button class="n-room" data-goto="sauger">${I.robot}<b>Sauger</b><small>${esc(vacText(vac))}</small></button></div>
    </section>
    <section class="card n-bright">
      <div class="n-bar" id="vslider" role="slider" aria-label="Helligkeit ${esc(r?.name || '')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" tabindex="0"><div class="fill" style="height:${v}%"></div><div class="knob" style="bottom:${v}%"></div></div>
      <div class="n-pct" id="vs-pct">${v} %</div><small class="muted">Helligkeit</small>
      <button class="n-power ${on ? 'on' : ''}" data-room-toggle aria-label="Licht ein/aus">${I.power}</button>
    </section>
    <section class="card n-devs"><div class="card-head"><h3>Geräte</h3><small class="muted">${d.onLights.length} aktiv</small></div>
      <div class="n-grid">
        ${tile(I.bulb, 'Licht', on ? `${d.roomLights.filter(l => l.on).length} an` : 'aus', 'tile/light', on, !r)}
        ${tile(I.blind, 'Rollos', `${d.openBlinds.length} offen`, 'tile/blinds', d.reachBlinds.some(b => (b.position ?? 100) < 98), !d.reachBlinds.length)}
        ${tile(I.tv, 'Smart TV', d.actLabel, 'tile/tv', d.actOn, !d.har.ok)}
        ${tile(I.music, 'Musik', d.sp.device?.name || 'Spotify', 'tile/music', !!d.sp.playing, !(d.sp.linked && d.sp.ok))}
      </div></section>
    ${vac.configured ? `<section class="card n-vac">
      <div class="card-head"><h3>Saugroboter</h3><small class="muted">${esc(vacText(vac))}</small></div>
      <div class="n-ring"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="70" class="n-ring-bg"/><circle cx="90" cy="90" r="70" class="n-ring-fg" stroke-dasharray="${(C * batt / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 90 90)"/></svg>
        <div class="n-ring-c"><b>${vac.ok ? batt : '–'}<small>%</small></b><span>Akku</span></div></div>
      <div class="n-chips">${VAC_POWER.map(([val, n]) => `<button class="n-chip ${vac.power === val ? 'active' : ''}" data-vacset="power" data-val="${val}" ${vac.ok ? '' : 'disabled'}>${esc(n)}</button>`).join('')}</div>
      <div class="n-actions">${vacButtons(vac)}</div></section>` : ''}
    <section class="card n-list"><div class="card-head"><h3>Lampen</h3></div>
      ${lights.map(l => `<div class="n-row"><span class="n-ic sm">${I.bulb}</span><div><b>${esc(l.name)}</b><small>${l.reachable === false ? 'offline' : l.on ? lightPct(l) + ' %' : 'aus'}</small></div>${sw(l.on && l.reachable !== false, typeof l.id === 'number' ? `ikea/light/${l.id}` : `hue/light/${l.id}`, 'neo', l.reachable === false, l.name)}</div>`).join('')}</section>
    ${musicCard(d, 'n-music')}
    ${calendarCard('wide', 4)}
  </div>`;
}

// =====================================================================
// Violett (Vorlage 4)
// =====================================================================
function renderHomeViolett(d) {
  const w = S.weather, v = d.room?.anyOn ? d.roomPct : 0;
  const devs = deviceList(d);
  const t = w ? Math.round(w.temp) : null, A0 = 150, A1 = 390, tp = t == null ? 0 : Math.max(0, Math.min(1, (t + 10) / 45)), a = A0 + (A1 - A0) * tp;
  const allOk = systems(d).every(s => s[1]);
  return `<div class="violett"><div class="vi-main">
    <section class="card vi-hero">${roomSvg(d)}
      <div class="vi-hero-top"><div><h2>Guten ${new Date().getHours() < 11 ? 'Morgen' : new Date().getHours() < 18 ? 'Tag' : 'Abend'}, Toni</h2><p>So sieht es gerade zu Hause aus.</p></div>${liveBadge()}</div>
      <div class="vi-hero-bottom"><h3>${esc(d.room?.name || 'Zuhause')}</h3>
        <div class="vi-chips"><span>${I.thermo}${t == null ? '–' : t + '°C'}</span><span>${I.bulb}${d.onLights.length} an</span><span>${I.sun}${v} %</span><span>${I.blind}${d.openBlinds.length} offen</span><span class="${allOk ? 'good' : 'warn'}">${I.shield}${allOk ? 'Alles gut' : 'Prüfen'}</span></div></div>
    </section>
    <section class="card vi-table"><div class="card-head"><div><h3>Geräteübersicht</h3><div class="sub">${devs.filter(x => x.on).length} von ${devs.length} aktiv</div></div><span class="chip-tag outline">${esc(new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' }))}</span></div>
      <div class="vi-scroll"><table>
        <thead><tr><th>Gerät</th><th>Status</th><th>Wert</th><th class="vi-hide">Info</th><th>Steuerung</th></tr></thead>
        <tbody>${devs.map(x => `<tr class="${x.reach ? '' : 'off'}"><td><span class="vi-dev">${x.icon}<span><b>${esc(x.name)}</b><small>${esc(x.type)}</small></span></span></td>
          <td><span class="vi-st ${!x.reach ? 'down' : x.on ? 'on' : ''}"><i></i>${!x.reach ? 'Offline' : x.on ? 'Aktiv' : 'Aus'}</span></td>
          <td>${esc(x.value)}</td><td class="vi-hide muted">${esc(x.extra || '')}</td><td>${sw(x.on, x.action, 'violett', !x.reach, x.name)}</td></tr>`).join('')}</tbody></table></div>
    </section>
    ${musicCard(d, 'vi-music')}</div><div class="vi-side">
    <section class="card vi-climate"><div class="card-head"><div><h3>Aussenklima</h3><div class="sub">${w ? esc(w.place || 'Wetter') : 'kein Wetter'}</div></div>${w ? wxIcon(wmo(w.code, w.day)[1]) : ''}</div>
      <div class="vi-gauge"><svg viewBox="0 0 240 190" aria-hidden="true"><defs><linearGradient id="vig" x1="0" x2="1"><stop offset="0" stop-color="#5aa2ff"/><stop offset=".5" stop-color="#9b7bff"/><stop offset="1" stop-color="#ff7a59"/></linearGradient></defs>
        <path d="${arcPath(120, 112, 84, A0, A1)}" stroke="rgba(255,255,255,.1)" stroke-width="12" fill="none" stroke-linecap="round"/>
        ${t != null ? `<path d="${arcPath(120, 112, 84, A0, Math.max(a, A0 + .5))}" stroke="url(#vig)" stroke-width="12" fill="none" stroke-linecap="round"/>` : ''}</svg>
        <div class="vi-gauge-c"><b>${t == null ? '–' : t + '°'}</b><span>${w ? esc(wmo(w.code, w.day)[0]) : ''}</span></div></div>
      <div class="vi-mini"><span>${I.drop}${w ? Math.round(w.humidity) + ' %' : '–'}</span><span>${I.wind}${w ? Math.round(w.wind) + ' km/h' : '–'}</span></div></section>
    <section class="card vi-spark"><div class="card-head"><div><h3>Helligkeit</h3><div class="sub">heute, Ø in %</div></div><b class="vi-big">${v}<small>%</small></b></div>${historyChart('bri', { color: '#a98bff', max: 100, h: 70 })}</section>
    <section class="card vi-spark"><div class="card-head"><div><h3>Lampen an</h3><div class="sub">heute</div></div><b class="vi-big">${d.onLights.length}</b></div>${historyChart('on', { color: '#5ad1ff', h: 70 })}</section>
    ${calendarCard('vi-cal', 4)}
    <section class="card vi-lights"><div class="card-head"><h3>Lichter</h3>${sw(!!d.room?.anyOn, 'tile/light', 'violett', !d.room, 'Alle Lichter')}</div>
      <div class="vi-lchips">${(d.hue.scenes || []).filter(s => s.group === d.room?.id).slice(0, 3).map(s => `<button class="vi-lchip" data-scene="${esc(s.id)}">${I.spark}<span>${esc(s.name)}</span></button>`).join('')}</div></section>
  </div></div>`;
}

// =====================================================================
// Terminal (eigenes Layout): Steuerung per Textbefehl
// =====================================================================
const term = { log: [], hist: [], idx: -1, draft: '', focused: false };
const tOut = (text, type = 'out') => { term.log.push({ type, text }); if (term.log.length > 200) term.log.splice(0, term.log.length - 200); };
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const findByName = (list, q, key = 'name') => { const n = norm(q); return list.find(x => norm(x[key]) === n) || list.find(x => norm(x[key]).startsWith(n)) || list.find(x => norm(x[key]).includes(n)); };
const pad = (s, n) => String(s).slice(0, n).padEnd(n);
const TERM_CMDS = ['hilfe', 'status', 'licht an', 'licht aus', 'licht 50', 'alle an', 'alle aus', 'alle 50', 'szenen', 'szene ', 'rollo alle hoch', 'rollo alle runter', 'rollo 1 50', 'sauger start', 'sauger station', 'sauger räume', 'sauger raum ', 'musik play', 'musik pause', 'musik weiter', 'musik geräte', 'musik gerät ', 'musik 40', 'tv aus', 'kalender', 'wetter', 'routinen', 'routine ', 'layouts', 'layout ', 'clear'];
function termStatus(d) {
  const lines = ['GERÄT                 STATUS        WERT', '────────────────────  ────────────  ─────────────────'];
  for (const x of deviceList(d)) lines.push(`${pad(x.name, 20)}  ${pad(!x.reach ? 'offline' : x.on ? 'AKTIV' : 'aus', 12)}  ${x.value}${x.extra ? ' · ' + x.extra : ''}`);
  return lines.join('\n');
}
function termRun(line) {
  const d = derive(), raw = line.trim(); if (!raw) return;
  tOut(raw, 'in'); term.hist.push(raw); term.idx = -1;
  const [cmd, ...rest] = raw.split(/\s+/); const c = norm(cmd), args = rest.join(' '), a0 = norm(rest[0] || '');
  const num = (s) => /^\d{1,3}%?$/.test(s) ? Math.max(0, Math.min(100, parseInt(s, 10))) : null;
  const err = (t) => tOut(t, 'err');
  switch (c) {
    case 'hilfe': case 'help': case '?':
      tOut(['Befehle:', '  status                      alle Geräte', '  licht an|aus|0-100          Raum ' + (d.room?.name || ''), '  licht <lampe> an|aus|0-100  einzelne Lampe', '  alle an|aus|1-100           alle Lampen auf einmal', '  szenen · szene <name>       Hue-Szenen', '  rollo [1-3|alle] hoch|runter|stopp|0-100   (0 = offen)', '  sauger start|pause|weiter|stopp|station|finden', '  sauger räume · sauger raum <name>[, <name>]', '  musik play|pause|weiter|zurück|lauter|leiser|0-100', '  musik geräte · musik gerät <name>', '  tv aus · tv <aktivität>', '  kalender [heute|morgen|woche|10] · wetter', '  routinen · routine <name>', '  layouts · layout <name> · clear', 'Tipp: Tab ergänzt, ↑/↓ blättert im Verlauf.'].join('\n')); break;
    case 'status': tOut(termStatus(d)); break;
    case 'clear': case 'cls': term.log = []; break;
    case 'licht': {
      if (!d.room) return err('Kein Hue-Raum gefunden.');
      const n = num(a0);
      if (a0 === 'an' || a0 === 'ein') { api(`hue/room/${d.room.id}`, { on: true }); tOut(`Licht ${d.room.name}: an`); }
      else if (a0 === 'aus') { allLightsOff(); tOut('Alle Lichter: aus'); }
      else if (n != null) { api(`hue/room/${d.room.id}`, n === 0 ? { on: false } : { bri: toBri(n) }); tOut(`Licht ${d.room.name}: ${n} %`); }
      else {
        const parts = rest.slice(), last = norm(parts[parts.length - 1] || ''); const val = num(last);
        const what = (last === 'an' || last === 'aus' || val != null) ? parts.slice(0, -1).join(' ') : parts.join(' ');
        const l = findByName([...Object.values(d.hue.lights), ...(d.ikea.lights || [])], what);
        if (!l) return err(`Lampe „${what}“ nicht gefunden. Lampen: ${[...Object.values(d.hue.lights), ...(d.ikea.lights || [])].map(x => x.name).join(', ')}`);
        const base = typeof l.id === 'number' ? 'ikea/light/' : 'hue/light/', max = typeof l.id === 'number' ? 100 : 254;
        if (last === 'an' || last === 'aus' || !last) api(base + l.id, { on: last !== 'aus' });
        else api(base + l.id, val === 0 ? { on: false } : { bri: Math.max(1, Math.round(val / 100 * max)) });
        tOut(`${l.name}: ${val != null ? val + ' %' : last === 'aus' ? 'aus' : 'an'}`);
      }
      break;
    }
    case 'alle': {
      const n = num(a0);
      if (a0 === 'an' || a0 === 'ein') { api('lights/all', { on: true }); tOut('Alle Lampen: an'); }
      else if (a0 === 'aus') { api('lights/all', { on: false }); tOut('Alle Lampen: aus'); }
      else if (n != null && n > 0) { api('lights/all', { pct: n }); tOut(`Alle Lampen: ${n} %`); }
      else err('Beispiel: alle an, alle aus, alle 40');
      break;
    }
    case 'szenen': tOut((d.hue.scenes || []).map(s => '  ' + s.name).join('\n') || 'Keine Szenen.'); break;
    case 'szene': { const s = findByName(d.hue.scenes || [], args); if (!s) return err(`Szene „${args}“ nicht gefunden. „szenen“ zeigt alle.`); api('hue/scene/' + s.id); tOut(`Szene „${s.name}“`); break; }
    case 'rollo': case 'rollos': {
      const which = /^\d$/.test(a0) ? d.blinds[+a0 - 1] ? [d.blinds[+a0 - 1]] : null : a0 === 'alle' || !a0 ? d.reachBlinds : null;
      const act = norm(/^\d$|^alle$/.test(a0) ? rest[1] || '' : rest[0] || '');
      if (!which) return err('Rollo nicht gefunden. Beispiel: rollo 1 hoch, rollo alle runter.');
      const pos = act === 'hoch' || act === 'auf' ? 0 : act === 'runter' || act === 'zu' ? 100 : num(act);
      if (act === 'stopp' || act === 'stop') { which.forEach(b => api('ikea/blind/' + b.id, { stop: true })); tOut('Rollos: gestoppt'); }
      else if (pos == null) tOut(d.blinds.map((b, i) => `  ${i + 1}  ${pad(b.name, 10)} ${b.reachable ? blindText(b.position) : 'offline'}${b.battery != null ? ' · Batterie ' + b.battery + ' %' : ''}`).join('\n'));
      else { which.filter(b => b.reachable).forEach(b => api('ikea/blind/' + b.id, { position: pos })); tOut(`${which.length === 1 ? which[0].name : 'Rollos'}: ${pos === 0 ? 'hoch' : pos === 100 ? 'runter' : pos + ' % zu'}`); }
      break;
    }
    case 'sauger': {
      if (!d.vac.configured) return err('Kein Saugroboter eingerichtet.');
      const map = { start: 'start', pause: 'pause', weiter: 'resume', stopp: 'stop', stop: 'stop', station: 'dock', heim: 'dock', finden: 'locate' };
      if (map[a0]) { api('vacuum/cmd/' + map[a0]); tOut('Saugroboter: ' + a0); }
      else if (a0 === 'raume' || a0 === 'räume') tOut(d.vac.rooms.map(r => '  ' + r.name).join('\n'));
      else if (a0 === 'raum') {
        const names = rest.slice(1).join(' ').split(',').map(s => s.trim()).filter(Boolean);
        const ids = names.map(n => findByName(d.vac.rooms, n)).filter(Boolean);
        if (!ids.length) return err('Raum nicht gefunden. „sauger räume“ zeigt alle.');
        api('vacuum/rooms', { ids: ids.map(r => r.id) }); tOut('Saugroboter reinigt: ' + ids.map(r => r.name).join(', '));
      } else tOut(`Saugroboter: ${vacText(d.vac)}${d.vac.ok ? ` · Akku ${d.vac.battery} % · Mopp ${d.vac.mop ?? '–'} %` : ''}`);
      break;
    }
    case 'musik': case 'spotify': {
      const sp = d.sp; if (!sp.configured || !sp.linked) return err('Spotify ist nicht verbunden.');
      const map = { play: 'play', start: 'play', pause: 'pause', stopp: 'pause', weiter: 'next', next: 'next', 'nachster': 'next', zuruck: 'previous', zurueck: 'previous' };
      const n = num(a0), vol = sp.device?.volume ?? 50;
      if (map[a0]) { api('spotify/cmd/' + map[a0]); tOut('Musik: ' + a0); }
      else if (a0 === 'lauter' || a0 === 'leiser') { const nv = Math.max(0, Math.min(100, vol + (a0 === 'lauter' ? 10 : -10))); api('spotify/volume', { volume: nv }); tOut('Lautstärke ' + nv + ' %'); }
      else if (n != null) { api('spotify/volume', { volume: n }); tOut('Lautstärke ' + n + ' %'); }
      else if (a0 === 'gerate' || a0 === 'geraete') tOut(sp.devices.map(x => `  ${x.active ? '▶' : ' '} ${x.name} (${x.type})`).join('\n') || 'Keine Geräte.');
      else if (a0 === 'gerat' || a0 === 'geraet') { const dv = findByName(sp.devices, rest.slice(1).join(' ')); if (!dv) return err('Gerät nicht gefunden. „musik geräte“ zeigt alle.'); api('spotify/device', { id: dv.id }); tOut('Spiele auf ' + dv.name); }
      else tOut(sp.track ? `${sp.playing ? '▶' : '❚❚'} ${sp.track} – ${sp.artists} · ${sp.device?.name || ''} · ${vol} %` : 'Gerade läuft nichts.');
      break;
    }
    case 'tv': {
      if (!d.har.ok) return err('Harmony ist nicht verbunden.');
      if (a0 === 'aus') { api('harmony/off'); tOut('TV: aus'); break; }
      const a = findByName(d.har.activities || [], args, 'label'); if (!a) return err('Aktivität nicht gefunden: ' + (d.har.activities || []).map(x => x.label).join(', '));
      api('harmony/activity/' + a.id); tOut('TV: ' + a.label); break;
    }
    case 'kalender': case 'termine': {
      if (!S.calendar?.configured) return err('Kalender ist nicht verbunden.');
      const days = a0 === 'heute' ? 1 : a0 === 'morgen' ? 2 : a0 === '10' || a0 === 'alle' ? 400 : 7;
      let ev = upcoming(days); if (a0 === 'morgen') ev = ev.filter(e => dayLabel(e.start) === 'Morgen');
      if (days === 400) ev = ev.slice(0, CAL_OPEN_N);
      tOut(ev.length ? ev.map(e => `  ${pad(dayLabel(e.start), 22)} ${pad(evTime(e), 12)} ${e.title}${e.location ? ' @ ' + e.location : ''}`).join('\n') : 'Keine Termine.'); break;
    }
    case 'wetter': { const w = S.weather; if (!w) return err('Kein Wetter (Ort fehlt).'); tOut(`${w.place}: ${Math.round(w.temp)}°C, ${wmo(w.code, w.day)[0]}, Feuchte ${Math.round(w.humidity)} %, Wind ${Math.round(w.wind)} km/h\n` + (w.days || []).slice(1, 5).map(x => `  ${pad(new Date(x.date).toLocaleDateString('de-CH', { weekday: 'short' }), 4)} ${pad(wmo(x.code)[0], 16)} ${Math.round(x.max)}° / ${Math.round(x.min)}°`).join('\n')); break; }
    case 'routinen': tOut(routines(d).map(r => `  ${pad(r.name, 14)} ${r.steps.map(s => s[0]).join(' · ')}`).join('\n')); break;
    case 'routine': { const r = findByName(routines(d), args); if (!r) return err('Routine nicht gefunden. „routinen“ zeigt alle.'); runRoutine(r.id); tOut(`Routine „${r.name}“ läuft.`); break; }
    case 'layouts': tOut(LAYOUTS.map(l => `  ${l.id === layout ? '▶' : ' '} ${pad(l.id, 10)} ${l.name}`).join('\n')); break;
    case 'layout': { const l = findByName(LAYOUTS, args, 'id') || findByName(LAYOUTS, args); if (!l) return err('Layout nicht gefunden. „layouts“ zeigt alle.'); setLayout(l.id); break; }
    default: err(`Unbekannter Befehl „${cmd}“. „hilfe“ zeigt alle Befehle.`);
  }
}
function renderHomeTerminal(d) {
  if (!term.log.length) { tOut(`Smarthome-Terminal · ${new Date().toLocaleString('de-CH')}\n„hilfe“ zeigt alle Befehle.`, 'sys'); }
  const now = new Date();
  const bar = (p) => '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
  return `<div class="termv">
    <section class="term-win">
      <div class="term-bar"><i></i><i></i><i></i><span>toni@smarthome: ~</span><span class="term-clock">${now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="term-top"><pre>${esc([
        `LICHT  ${bar(d.room?.anyOn ? d.roomPct : 0)} ${String(d.room?.anyOn ? d.roomPct : 0).padStart(3)} %   ${d.onLights.length}/${d.allLights.length} Lampen an`,
        `ROLLOS ${d.blinds.map(b => b.reachable ? (b.position <= 2 ? '▢' : b.position >= 98 ? '▤' : '◧') : '·').join(' ')}           ${d.openBlinds.length} offen`,
        `SAUGER ${d.vac.configured ? `${pad(vacText(d.vac), 18)} Akku ${d.vac.battery ?? '–'} %` : '–'}`,
        `MUSIK  ${d.sp.linked ? (d.sp.track ? `${d.sp.playing ? '▶' : '❚❚'} ${d.sp.track} – ${d.sp.artists}`.slice(0, 60) : 'still') : 'nicht verbunden'}`,
        `WETTER ${S.weather ? `${Math.round(S.weather.temp)}°C ${wmo(S.weather.code, S.weather.day)[0]}` : '–'}    TERMIN ${upcoming(2)[0] ? `${dayLabel(upcoming(2)[0].start)} ${evTime(upcoming(2)[0])} ${upcoming(2)[0].title}`.slice(0, 50) : '–'}`
      ].join('\n'))}</pre></div>
      <div class="term-out" id="term-out">${term.log.map(l => `<pre class="t-${l.type}">${l.type === 'in' ? '<span class="t-ps">$</span> ' : ''}${esc(l.text)}</pre>`).join('')}</div>
      <label class="term-in"><span class="t-ps">toni@smarthome:~$</span><input id="term-in" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Befehl eingeben" value="${esc(term.draft)}"></label>
      <div class="term-sugg">${['status', 'licht an', 'licht aus', 'rollo alle hoch', 'rollo alle runter', 'sauger start', 'musik pause', 'kalender', 'wetter', 'hilfe'].map(s => `<button class="t-sugg" data-term="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    </section>
    ${calendarCard('wide term-cal', 4)}
  </div>`;
}
function termAfter() {
  const out = $('#term-out'); if (out) out.scrollTop = out.scrollHeight;
  const inp = $('#term-in'); if (inp && term.focused) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
}
document.addEventListener('focusin', (e) => { if (e.target.id === 'term-in') term.focused = true; });
// Fokus nur aufgeben, wenn der Nutzer wirklich woanders hin tippt (nicht beim Neuzeichnen)
document.addEventListener('pointerdown', (e) => { if (!e.target.closest?.('.term-in')) term.focused = false; });
document.addEventListener('input', (e) => { if (e.target.id === 'term-in') term.draft = e.target.value; });
document.addEventListener('keydown', (e) => {
  const inp = e.target; if (inp.id !== 'term-in') return;
  if (e.key === 'Enter') { e.preventDefault(); const v = inp.value; term.draft = ''; termRun(v); term.focused = true; render(); }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault(); if (!term.hist.length) return;
    term.idx = e.key === 'ArrowUp' ? (term.idx < 0 ? term.hist.length - 1 : Math.max(0, term.idx - 1)) : (term.idx < 0 ? -1 : term.idx + 1);
    if (term.idx >= term.hist.length) term.idx = -1;
    inp.value = term.draft = term.idx < 0 ? '' : term.hist[term.idx];
  } else if (e.key === 'Tab') {
    e.preventDefault(); const v = norm(inp.value); if (!v) return;
    const m = TERM_CMDS.filter(x => norm(x).startsWith(v));
    if (m.length === 1) inp.value = term.draft = m[0];
    else if (m.length > 1) { tOut(m.join('   '), 'sys'); term.focused = true; render(); }
  }
});

// =====================================================================
// Morgen (eigenes Layout, hell): Routinen, Agenda, Zustand in Sätzen
// =====================================================================
function summary(d) {
  const s = [];
  const on = d.onLights;
  s.push(on.length ? `Es ${on.length === 1 ? 'brennt eine Lampe' : `brennen ${on.length} Lampen`}${d.room?.anyOn ? `, das ${d.room.name} ist auf ${d.roomPct} % gedimmt` : ''}.` : 'Alle Lampen sind aus.');
  const open = d.openBlinds.length, n = d.blinds.length;
  s.push(open === 0 ? 'Die Rollos sind unten.' : open === n ? 'Alle Rollos sind oben.' : `${open} von ${n} Rollos sind offen.`);
  if (d.vac.configured) s.push(d.vac.ok ? `Der Saugroboter ${vacOn(d.vac) ? 'ist unterwegs' : (VAC_DOCKED.has(d.vac.status) || d.vac.charging === 1) ? 'steht an der Station' : 'wartet'} (Akku ${d.vac.battery} %).` : 'Der Saugroboter antwortet gerade nicht.');
  if (d.sp.playing && d.sp.track) s.push(`Auf ${d.sp.device?.name || 'Spotify'} läuft „${d.sp.track}“.`);
  if (d.actOn) s.push(`Der TV läuft (${d.actLabel}).`);
  return s.join(' ');
}
function agenda() {
  const today = startOfDay(Date.now());
  const ev = (S.calendar?.events || []).filter(e => e.end > Date.now() && e.start < today + 2 * DAYMS);
  const acts = (S.activity || []).filter(a => a.t >= today).slice(0, 6).map(a => ({ start: a.t, title: a.title, text: a.text, past: true }));
  const items = [...ev.map(e => ({ ...e, cal: true })), ...acts].sort((a, b) => a.start - b.start);
  if (!items.length) return `<p class="m-empty">${S.calendar?.configured ? 'Heute und morgen stehen keine Termine an.' : 'Der Kalender ist noch nicht verbunden.'}</p>`;
  let last = '';
  return items.map(e => {
    const dl = e.past ? 'Heute' : dayLabel(Math.max(e.start, Date.now()));
    const head = dl !== last ? `<div class="m-dayhead">${esc(dl)}</div>` : ''; last = dl;
    return head + `<div class="m-item ${e.cal ? 'cal' : 'act'} ${!e.cal || e.end < Date.now() ? '' : e.start <= Date.now() ? 'now' : ''}">
      <span class="m-time">${e.cal ? (e.allDay ? 'ganztags' : hhmm(e.start)) : hhmm(e.start)}</span>
      <span class="m-dot"></span>
      <span class="m-what"><b>${esc(e.title)}</b><small>${esc(e.cal ? [e.allDay ? '' : evTime(e), e.location].filter(Boolean).join(' · ') : e.text)}</small></span></div>`;
  }).join('');
}
function renderHomeMorgen(d) {
  const now = new Date(), w = S.weather, h = now.getHours();
  const hello = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 14 ? 'Mahlzeit' : h < 18 ? 'Guten Nachmittag' : h < 22 ? 'Guten Abend' : 'Gute Nacht';
  return `<div class="morgen">
    <header class="m-head">
      <div class="m-date">${esc(now.toLocaleDateString('de-CH', { weekday: 'long' }))}<span>${esc(now.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }))}</span></div>
      <h1>${hello}, Toni.</h1>
      <p class="m-sum">${esc(summary(d))}</p>
      <div class="m-wx">${w ? `${wxIcon(wmo(w.code, w.day)[1])}<b>${Math.round(w.temp)}°</b><span>${esc(wmo(w.code, w.day)[0])} in ${esc(w.place)} · ${(w.days || []).slice(0, 1).map(x => `${Math.round(x.max)}° / ${Math.round(x.min)}°`).join('')}</span>` : '<span>Kein Wetter</span>'}<b class="m-clock">${now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</b></div>
    </header>
    <section class="m-routines"><h2>Routinen</h2><div class="m-rgrid">${routines(d).map(r => `<button class="m-routine" data-routine="${r.id}" style="--c:${r.color}">
      <span class="m-r-ic">${r.icon}</span><b>${esc(r.name)}</b><ol>${r.steps.map(s => `<li>${esc(s[0])}</li>`).join('')}</ol><span class="m-go">Los →</span></button>`).join('')}</div></section>
    <section class="m-agenda"><h2>Agenda</h2><div class="m-line">${agenda()}</div>
      ${calOpen ? `<h2 class="m-next-h">Nächste ${CAL_OPEN_N} Termine</h2><div class="cal-list m-next">${calendarBody()}</div>` : ''}
      ${calToggle('m-btn m-more')}</section>
    <section class="m-quick"><h2>Schnell</h2>
      <div class="m-qrow"><span>Licht ${esc(d.room?.name || '')}</span>${fillRange('m-range', 1, 254, d.room?.anyOn ? d.room.bri ?? 254 : 1, `hue/room/${d.room?.id}`, 'Helligkeit', !d.room)}${sw(!!d.room?.anyOn, 'tile/light', 'morgen', !d.room, 'Licht')}</div>
      <div class="m-qrow"><span>Rollos</span><span class="m-pair"><button class="m-btn" data-allblinds="0">hoch</button><button class="m-btn" data-allblinds="100">runter</button></span></div>
      ${d.sp.linked ? `<div class="m-qrow"><span>Musik${d.sp.track ? ` · ${esc(d.sp.track)}` : ''}</span><span class="m-pair"><button class="m-btn" data-sp="${d.sp.playing ? 'pause' : 'play'}">${d.sp.playing ? 'Pause' : 'Play'}</button><button class="m-btn" data-sp="next">weiter</button></span></div>` : ''}
      ${d.vac.configured ? `<div class="m-qrow"><span>Saugroboter · ${esc(vacText(d.vac))}</span><span class="m-pair"><button class="m-btn" data-vac="start" ${d.vac.ok ? '' : 'disabled'}>start</button><button class="m-btn" data-vac="dock" ${d.vac.ok ? '' : 'disabled'}>Station</button></span></div>` : ''}
    </section>
  </div>`;
}

// =====================================================================
// Bauhaus (eigenes Layout): Riesenknöpfe + Bildschirmschoner
// =====================================================================
let bhScene = -1;
function renderHomeBauhaus(d) {
  const on = !!d.room?.anyOn, v = on ? d.roomPct : 0, now = new Date();
  const sc = (d.hue.scenes || []).filter(s => s.group === d.room?.id);
  const cur = bhScene >= 0 ? sc[bhScene % sc.length] : null;
  const anyOpen = d.reachBlinds.some(b => (b.position ?? 100) < 98);
  return `<div class="bauhaus">
    <button class="bh bh-light ${on ? 'on' : ''}" data-room-toggle aria-label="Licht ${on ? 'aus' : 'ein'}schalten"><span class="bh-shape circle"></span><span class="bh-k">Licht</span><span class="bh-v">${on ? v + ' %' : 'Aus'}</span></button>
    <div class="bh bh-dim"><button class="bh-half" data-dial="10" aria-label="Heller">+</button><button class="bh-half" data-dial="-10" aria-label="Dunkler">−</button></div>
    <div class="bh bh-clock"><span class="bh-time">${now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</span><span class="bh-date">${esc(now.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }))}</span>${S.weather ? `<span class="bh-wx">${Math.round(S.weather.temp)}° ${esc(wmo(S.weather.code, S.weather.day)[0])}</span>` : ''}</div>
    <div class="bh bh-blinds ${anyOpen ? 'on' : ''}"><span class="bh-shape tri"></span><span class="bh-k">Rollos</span><span class="bh-v">${d.openBlinds.length} offen</span>
      <div class="bh-pair"><button data-allblinds="0" aria-label="Alle Rollos hoch">▲</button><button data-allblinds="100" aria-label="Alle Rollos runter">▼</button></div></div>
    <button class="bh bh-scene" data-bhscene ${sc.length ? '' : 'disabled'}><span class="bh-shape square"></span><span class="bh-k">Szene</span><span class="bh-v">${esc(cur?.name || 'Tippen')}</span><small>${sc.length} Szenen · tippen = nächste</small></button>
    ${d.sp.linked ? `<div class="bh bh-music ${d.sp.playing ? 'on' : ''}"><span class="bh-k">Musik</span><span class="bh-v sm">${esc(d.sp.track || 'still')}</span>
      <div class="bh-pair"><button data-sp="${d.sp.playing ? 'pause' : 'play'}" aria-label="${d.sp.playing ? 'Pause' : 'Abspielen'}">${d.sp.playing ? '❚❚' : '▶'}</button><button data-sp="next" aria-label="Nächster Titel">▶▶</button></div></div>` : '<div class="bh bh-music"><span class="bh-k">Musik</span><span class="bh-v sm">nicht verbunden</span></div>'}
    ${d.vac.configured ? `<div class="bh bh-vac ${vacOn(d.vac) ? 'on' : ''}"><span class="bh-k">Sauger</span><span class="bh-v sm">${esc(vacText(d.vac))} · ${d.vac.ok ? d.vac.battery + ' %' : '–'}</span>
      <div class="bh-pair"><button data-vac="${vacOn(d.vac) ? 'pause' : 'start'}" ${d.vac.ok ? '' : 'disabled'}>${vacOn(d.vac) ? '❚❚' : '▶'}</button><button data-vac="dock" ${d.vac.ok ? '' : 'disabled'} aria-label="Zur Station">⌂</button></div></div>` : ''}
    <button class="bh bh-night" data-routine="nacht"><span class="bh-shape moon"></span><span class="bh-k">Gute Nacht</span><span class="bh-v sm">alles aus, Rollos zu</span></button>
    <div class="bh bh-cal"><span class="bh-k">Termine</span><div class="cal-list">${calendarBody(4, 30)}</div>${calToggle('bh-more')}</div>
  </div>`;
}
// Bildschirmschoner: nach 90 s ohne Berührung (nur Bauhaus, Startseite)
let bhIdle = Date.now();
['pointerdown', 'keydown', 'wheel'].forEach(ev => document.addEventListener(ev, () => { bhIdle = Date.now(); const s = $('#saver'); if (s && !s.hidden) { s.hidden = true; } }, true));
setInterval(() => {
  const want = layout === 'bauhaus' && view === 'home' && Date.now() - bhIdle > 90000;
  let s = $('#saver');
  if (!want) { if (s) s.hidden = true; return; }
  if (!s) { s = document.createElement('div'); s.id = 'saver'; s.className = 'saver'; document.body.appendChild(s); }
  const d = S ? derive() : null, now = new Date();
  s.innerHTML = `<div class="sv-time">${now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</div>
    <div class="sv-date">${esc(now.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }))}</div>
    ${d ? `<div class="sv-info">${S.weather ? `${Math.round(S.weather.temp)}° · ` : ''}${d.onLights.length} Lampen an · ${d.openBlinds.length} Rollos offen${upcoming(1)[0] ? ` · ${evTime(upcoming(1)[0])} ${esc(upcoming(1)[0].title)}` : ''}</div>` : ''}
    <div class="sv-hint">Tippen zum Aufwecken</div>`;
  s.style.setProperty('--x', (Math.sin(now.getMinutes() / 3) * 8).toFixed(1) + 'vw'); // leichtes Wandern gegen Einbrennen
  s.hidden = false;
}, 5000);

// =====================================================================
// Menüpunkt „Kalender“: Monatsansicht + Terminliste (für alle Layouts)
// =====================================================================
let kalMonth = (() => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), 1); })();
let kalDay = null; // 'JJJJ-MM-TT' oder null = alle kommenden
const dayKey = (t) => { const x = new Date(t); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
// Termin über mehrere Tage (z. B. ganztags 2 Tage) an jedem Tag zählen
function eventsByDay() {
  const map = new Map();
  for (const e of S.calendar?.events || []) {
    const last = e.allDay ? e.end - 1 : Math.max(e.start, e.end - 1);
    for (let t = startOfDay(e.start); t <= last; t += DAYMS) {
      const k = dayKey(t + 3600000); // +1 h gegen Sommerzeit-Sprung
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    }
  }
  return map;
}
function renderKalender() {
  const c = S.calendar;
  const head = `<div class="view-head"><h2>Kalender</h2><span class="muted">${esc(c?.name || 'Google-Kalender')}${c?.updated ? ' · aktualisiert ' + hhmm(c.updated) : ''}</span></div>`;
  if (!c?.configured) return head + `<div class="card row-card">${calendarBody()}</div>`;
  const byDay = eventsByDay(), today = dayKey(Date.now());
  const y = kalMonth.getFullYear(), m = kalMonth.getMonth();
  const first = new Date(y, m, 1), offset = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push('<span class="kal-cell empty"></span>');
  for (let dd = 1; dd <= days; dd++) {
    const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(dd).padStart(2, '0')}`, n = byDay.get(k)?.length || 0;
    const past = k < today;
    cells.push(`<button class="kal-cell ${k === today ? 'today' : ''} ${k === kalDay ? 'sel' : ''} ${n ? 'has' : ''} ${past ? 'past' : ''}" data-kalday="${k}" aria-label="${dd}. ${n ? n + ' Termine' : 'keine Termine'}" aria-pressed="${k === kalDay}">
      <span>${dd}</span>${n ? `<i>${'<b></b>'.repeat(Math.min(n, 3))}</i>` : ''}</button>`);
  }
  const monthName = first.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
  const maxMs = Date.now() + 120 * DAYMS;
  // Liste: gewählter Tag oder alle kommenden (gruppiert)
  let list;
  if (kalDay) {
    const ev = byDay.get(kalDay) || [];
    const label = dayLabel(new Date(kalDay + 'T12:00').getTime());
    list = `<div class="kal-list-head"><h3>${esc(label)}</h3><button class="chip-tag outline btn" data-kalday="">Alle kommenden</button></div>`
      + (ev.length ? ev.map(e => `<div class="cal-ev ${e.allDay ? 'all' : ''}"><span class="cal-t">${esc(evTime(e))}</span><span class="cal-x"><b>${esc(e.title)}</b>${e.location ? `<small>${esc(e.location)}</small>` : ''}</span></div>`).join('')
        : `<p class="muted">${new Date(kalDay).getTime() > maxMs ? 'So weit voraus lädt das Dashboard keine Termine (120 Tage).' : 'Keine Termine an diesem Tag.'}</p>`);
  } else {
    const ev = upcoming(400);
    let last = '';
    list = `<div class="kal-list-head"><h3>Kommende Termine</h3><span class="muted">${ev.length} in 120 Tagen</span></div>` + (ev.length ? ev.map(e => {
      const dl = dayLabel(Math.max(e.start, Date.now()));
      const h = dl !== last ? `<div class="cal-day">${esc(dl)}</div>` : ''; last = dl;
      return h + `<div class="cal-ev ${e.allDay ? 'all' : ''} ${e.start <= Date.now() && e.end > Date.now() ? 'now' : ''}"><span class="cal-t">${esc(evTime(e))}</span><span class="cal-x"><b>${esc(e.title)}</b>${e.location ? `<small>${esc(e.location)}</small>` : ''}</span></div>`;
    }).join('') : '<p class="muted">Keine Termine in den nächsten 120 Tagen.</p>');
  }
  return head + `<div class="kal">
    <section class="card kal-month">
      <div class="kal-nav"><button class="round" data-kalmonth="-1" aria-label="Vorheriger Monat">${I.chevL}</button><h3>${esc(monthName)}</h3><button class="round" data-kalmonth="1" aria-label="Nächster Monat">${I.chevR}</button></div>
      <div class="kal-grid">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(w => `<span class="kal-wd">${w}</span>`).join('')}${cells.join('')}</div>
      <div class="kal-foot"><button class="chip" data-kaltoday>Heute</button>${c.ok ? '' : `<span class="chip-tag warn">${esc(c.error || 'nicht erreichbar')}</span>`}</div>
    </section>
    <section class="card kal-list">${list}</section>
  </div>`;
}

// ---------- Bedienung der neuen Layouts ----------
document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || !S) return;
  if (b.dataset.kalmonth) { kalMonth = new Date(kalMonth.getFullYear(), kalMonth.getMonth() + Number(b.dataset.kalmonth), 1); render(); }
  else if ('kalday' in b.dataset) { kalDay = b.dataset.kalday || null; if (kalDay) { const x = new Date(kalDay + 'T12:00'); kalMonth = new Date(x.getFullYear(), x.getMonth(), 1); } render(); }
  else if ('kaltoday' in b.dataset) { const t = new Date(); kalMonth = new Date(t.getFullYear(), t.getMonth(), 1); kalDay = dayKey(Date.now()); render(); }
  else if ('calmore' in b.dataset) { calOpen = !calOpen; try { localStorage.setItem('sh.calopen', calOpen ? '1' : '0'); } catch {} render(); }
  else if (b.dataset.isotab) { isoTab = b.dataset.isotab; render(); }
  else if (b.dataset.iso === 'lightsoff') { allLightsOff(); toast('Alle Lichter aus'); }
  else if (b.dataset.routine) runRoutine(b.dataset.routine);
  else if (b.dataset.term) { termRun(b.dataset.term); render(); }
  else if ('bhscene' in b.dataset) {
    const d = derive(), sc = (d.hue.scenes || []).filter(s => s.group === d.room?.id); if (!sc.length) return;
    bhScene = (bhScene + 1) % sc.length; api('hue/scene/' + sc[bhScene].id); toast('Szene „' + sc[bhScene].name + '“'); render();
  }
});

Object.assign(HOMES, { villa: renderHomeVilla, iso: renderHomeIso, neo: renderHomeNeo, violett: renderHomeViolett, terminal: renderHomeTerminal, morgen: renderHomeMorgen, bauhaus: renderHomeBauhaus });
// nach jedem Zeichnen (app.js ruft afterRender auf)
function afterRender() { if (layout === 'terminal' && view === 'home') termAfter(); }
// Während im Terminal getippt wird, Live-Updates nicht neu zeichnen (sonst springt die Handy-Tastatur zu)
function holdRender() { return layout === 'terminal' && view === 'home' && term.focused; }
