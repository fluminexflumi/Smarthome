// Smarthome-Dashboard – zusätzliche Startseiten-Layouts (Glas, Gold, Panorama), Musik (Spotify)
// und die Layout-Auswahl. Nutzt Hilfen aus app.js (I, esc, sw, pct, roomSvg, blindsCard, vacCard, chartCard, …).
// Das gewählte Layout gilt pro Gerät (localStorage sh.layout) und färbt über body[data-layout] das ganze Dashboard ein.

const LAYOUTS = [
  { id: 'standard', name: 'Standard', desc: 'Dunkel mit Orange: Raumansicht mit Knoten, Rollos, Helligkeitsring und Kacheln.' },
  { id: 'glas', name: 'Glas', desc: 'Milchglas über dem Wohnzimmer: grosser Lichtschalter, Szene, Harmony und Musik.' },
  { id: 'gold', name: 'Gold', desc: 'Schlicht dunkel mit Gelb: Zeitleiste, Lampe zum Durchblättern, Helligkeitsbogen, Saugroboter.' },
  { id: 'panorama', name: 'Panorama', desc: 'Helles Glas: Wetter, Helligkeitsrad mit Skala, Schnellschalter und Lampen-Diagramm.' }
];
let layout = 'standard';
try { layout = localStorage.getItem('sh.layout') || 'standard'; } catch {}
if (!LAYOUTS.some(l => l.id === layout)) layout = 'standard';
document.body.dataset.layout = layout;
let lampIdx = 0; // Gold: welche Lampe im Raum gezeigt wird

Object.assign(I, {
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 10h18M10 10v11"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2.5v14H6zM20 5v14L9.5 12z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 5H18v14h-2.5zM4 5l10.5 7L4 19z"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="14" r="4"/><path d="M12 6h.01"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
  computer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>',
  volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
  cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><circle cx="12" cy="12" r="7"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  bulbBig: '<svg viewBox="0 0 64 64" aria-hidden="true"><path class="bb-glass" d="M32 6a20 20 0 0 0-12 36c2.4 1.9 4 4.4 4 7.3V51h16v-1.7c0-2.9 1.6-5.4 4-7.3A20 20 0 0 0 32 6z"/><path class="bb-fil" d="M26 34l3-6 3 6 3-6 3 6" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><rect class="bb-base" x="24" y="52" width="16" height="4" rx="2"/><rect class="bb-base" x="26" y="57.5" width="12" height="3.5" rx="1.75"/></svg>',
  drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>',
  wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>'
});

// ---------- gemeinsame Bausteine ----------
const liveBadge = (cls = '') => `<span class="glass ${live ? 'ok' : ''} ${cls}"><i class="live"></i>${live ? 'Live' : 'Getrennt'}</span>`;
function roomTabs(d, cls) {
  return `<nav class="rtabs ${cls}" aria-label="Räume">${d.rooms.map(r => `<button class="rtab ${r.id === d.room?.id ? 'active' : ''}" data-room="${r.id}">${esc(r.name)}</button>`).join('')}
    <button class="rtab" data-goto="rollos">Rollos</button><button class="rtab" data-goto="sauger">Sauger</button><button class="rtab" data-goto="musik">Musik</button></nav>`;
}
const fillRange = (cls, min, max, value, action, label, disabled = false) => {
  const p = Math.round((value - min) / (max - min) * 100);
  return `<input type="range" class="fill-range ${cls}" min="${min}" max="${max}" value="${value}" style="--p:${p}%" data-action="${action}" aria-label="${esc(label)}" ${disabled ? 'disabled' : ''}>`;
};
const roomScenes = (d) => (d.hue.scenes || []).filter(s => s.group === d.room?.id);

// ---------- Spotify ----------
const spPos = (sp) => sp.playing ? Math.min(sp.duration || 0, sp.progress + (Date.now() - sp.at)) : sp.progress || 0;
const mmss = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const devIcon = (t = '') => /smartphone/i.test(t) ? I.phone : /computer/i.test(t) ? I.computer : /tv|cast/i.test(t) ? I.tv : I.speaker;
const DEV_TYPES = { Computer: 'Computer', Smartphone: 'Handy', Speaker: 'Lautsprecher', TV: 'TV', CastVideo: 'Chromecast', CastAudio: 'Chromecast Audio', AVR: 'Verstärker', STB: 'TV-Box', AudioDongle: 'Audio-Adapter', GameConsole: 'Spielkonsole', Tablet: 'Tablet', Automobile: 'Auto' };
const cover = (sp, cls = '') => sp.image
  ? `<img class="mc-cover ${cls}" src="${esc(sp.image)}" alt="" referrerpolicy="no-referrer">`
  : `<div class="mc-cover ${cls} empty">${I.music}</div>`;
function spProgress(sp) {
  const dur = sp.duration || 0, pos = spPos(sp);
  return `<div class="mc-prog" data-spseek role="slider" aria-label="Position im Titel" aria-valuemin="0" aria-valuemax="${Math.round(dur / 1000)}" aria-valuenow="${Math.round(pos / 1000)}" tabindex="0">
      <span data-sp-bar style="width:${dur ? (pos / dur * 100).toFixed(2) : 0}%"></span></div>
    <div class="mc-times"><span data-sp-pos>${mmss(pos)}</span><span>${dur ? '−' + mmss(dur - pos) : '0:00'}</span></div>`;
}
function musicCard(d, cls = '') {
  const sp = d.sp;
  if (!sp.configured || !sp.linked) return `<section class="card music-card ${cls}">
    <div class="card-title">${I.music}<div><h3>Musik</h3><div class="sub">Spotify</div></div></div>
    <p class="muted" style="margin:12px 0">${!sp.configured ? 'Spotify ist noch nicht eingerichtet.' : 'Spotify ist noch nicht mit deinem Konto verbunden.'}</p>
    <button class="chip" data-goto="musik">So geht's</button></section>`;
  const dis = sp.ok ? '' : 'disabled';
  return `<section class="card music-card ${cls} ${sp.playing ? 'on' : ''}">
    <div class="mc-top">${cover(sp)}
      <div class="mc-meta"><div class="mc-title">${esc(sp.track || 'Gerade läuft nichts')}</div>
        <div class="mc-artist">${esc(sp.track ? sp.artists : sp.ok ? (sp.device ? 'Auf Play drücken' : 'Gerät wählen und abspielen') : sp.error || 'Nicht erreichbar')}</div></div>
      <button class="mc-brand" data-goto="musik"><i></i>Spotify</button></div>
    ${spProgress(sp)}
    <div class="mc-ctrl">
      <button class="mc-btn" data-sp="previous" aria-label="Vorheriger Titel" ${dis}>${I.prev}</button>
      <button class="mc-btn main" data-sp="${sp.playing ? 'pause' : 'play'}" aria-label="${sp.playing ? 'Pause' : 'Abspielen'}" ${dis}>${sp.playing ? I.pause : I.play}</button>
      <button class="mc-btn" data-sp="next" aria-label="Nächster Titel" ${dis}>${I.next}</button>
      <button class="mc-dev" data-goto="musik" title="Gerät wechseln">${devIcon(sp.device?.type)}<span>${esc(sp.device?.name || 'Gerät wählen')}</span></button>
    </div></section>`;
}
function renderMusik(d) {
  const sp = d.sp;
  const head = `<div class="view-head"><h2>Musik</h2><span class="muted">Spotify Connect · im WLAN auf ein Gerät spielen</span></div>`;
  if (!sp.configured) return head + `<div class="card row-card setup-card">
    <div class="nm">Spotify einrichten (einmalig, am PC)</div>
    <ol class="steps">
      <li>Auf <b>developer.spotify.com/dashboard</b> mit deinem Spotify-Konto anmelden und <b>Create app</b> wählen.</li>
      <li>Name z. B. „Smarthome“, bei <b>Redirect URI</b> genau <code>http://127.0.0.1:8080/spotify/callback</code> eintragen, bei den APIs <b>Web API</b> ankreuzen, speichern.</li>
      <li>Die <b>Client ID</b> kopieren und Claude geben. Sie ist kein Geheimnis. Das Client Secret wird nicht gebraucht.</li>
      <li>Danach am PC <code>http://127.0.0.1:8080/spotify/login</code> öffnen und Zugriff erlauben.</li>
    </ol>
    <div class="muted">Steuern (Play, Pause, Lautstärke, Gerät wechseln) geht nur mit Spotify Premium.</div></div>`;
  if (!sp.linked) {
    const onPc = ['localhost', '127.0.0.1'].includes(location.hostname);
    return head + `<div class="card row-card setup-card"><div class="nm">Spotify-Konto verbinden</div>
      <p class="muted">Einmalig direkt am PC (nicht am Handy): Seite öffnen, bei Spotify anmelden, Zugriff erlauben.</p>
      ${onPc ? '<a class="chip accent" href="http://127.0.0.1:8080/spotify/login">Mit Spotify verbinden</a>' : '<code>http://127.0.0.1:8080/spotify/login</code>'}</div>`;
  }
  const dis = sp.ok ? '' : 'disabled';
  const vol = sp.device?.volume ?? 0;
  const devs = sp.devices || [];
  return head + `<div class="music-view">
    <section class="card music-hero ${sp.playing ? 'on' : ''}">
      ${cover(sp, 'big')}
      <div class="mh-body">
        <div class="mc-title big">${esc(sp.track || 'Gerade läuft nichts')}</div>
        <div class="mc-artist">${esc(sp.track ? [sp.artists, sp.album].filter(Boolean).join(' · ') : sp.ok ? 'Gerät wählen und abspielen' : sp.error || 'Nicht erreichbar')}</div>
        ${spProgress(sp)}
        <div class="mc-ctrl big">
          <button class="mc-btn ${sp.shuffle ? 'act' : ''}" data-sp="shuffle" aria-label="Zufall" aria-pressed="${sp.shuffle}" ${dis}>${I.shuffle}</button>
          <button class="mc-btn" data-sp="previous" aria-label="Vorheriger Titel" ${dis}>${I.prev}</button>
          <button class="mc-btn main" data-sp="${sp.playing ? 'pause' : 'play'}" aria-label="${sp.playing ? 'Pause' : 'Abspielen'}" ${dis}>${sp.playing ? I.pause : I.play}</button>
          <button class="mc-btn" data-sp="next" aria-label="Nächster Titel" ${dis}>${I.next}</button>
          <button class="mc-btn ${sp.repeat !== 'off' ? 'act' : ''}" data-sp="repeat" aria-label="Wiederholen: ${sp.repeat === 'track' ? 'Titel' : sp.repeat === 'context' ? 'alle' : 'aus'}" ${dis}>${I.repeat}${sp.repeat === 'track' ? '<small>1</small>' : ''}</button>
        </div>
        <div class="mh-vol">${I.volume}${fillRange('sp-range', 0, 100, vol, 'spotify/volume', 'Lautstärke', !sp.device?.canVolume || !sp.ok)}<b>${sp.device ? vol + ' %' : '–'}</b></div>
        ${sp.error ? `<div class="chip-tag warn" style="align-self:flex-start">${esc(sp.error)}</div>` : ''}
      </div>
    </section>
    <section class="card dev-card">
      <div class="card-title">${I.speaker}<div><h3>Geräte</h3><div class="sub">Tippen, um dort weiterzuspielen</div></div></div>
      <div class="dev-list">${devs.map(x => `<button class="dev ${x.active ? 'active' : ''}" data-spdev="${esc(x.id)}" ${x.restricted || !sp.ok ? 'disabled' : ''}>
          <span class="dev-ic">${devIcon(x.type)}</span><span class="dev-txt"><b>${esc(x.name)}</b><small>${esc(DEV_TYPES[x.type] || x.type)}${x.active ? ' · spielt hier' : ''}</small></span>${x.active ? I.check : ''}</button>`).join('')
        || '<p class="muted">Kein Gerät gefunden. Öffne Spotify auf dem Gerät (Handy, PC, Lautsprecher, TV), dann erscheint es hier.</p>'}</div>
      <div class="muted">Die Liste aktualisiert sich alle 15 Sekunden.</div>
    </section></div>`;
}
// Fortschritt flüssig weiterzählen, ohne alles neu zu zeichnen
setInterval(() => {
  const sp = S?.spotify; if (!sp?.playing) return;
  const pos = spPos(sp), dur = sp.duration || 0;
  document.querySelectorAll('[data-sp-bar]').forEach(e => { e.style.width = (dur ? pos / dur * 100 : 0).toFixed(2) + '%'; });
  document.querySelectorAll('[data-sp-pos]').forEach(e => { e.textContent = mmss(pos); e.nextElementSibling.textContent = '−' + mmss(dur - pos); });
}, 1000);

// ---------- Layout-Auswahl ----------
const LAYOUT_PREVIEW = {
  standard: ['a', 'b', 'b', 'c', 'b', 'b', 'd', 'e', 'f'],
  glas: ['a', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'e'],
  gold: ['a', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'g'],
  panorama: ['a', 'b', 'b', 'c', 'd', 'e', 'c', 'f', 'f']
};
// 9 Felder → drei Zeilen für grid-template-areas, z. B. 'a b b' 'c b b' 'd e f'
const previewAreas = (cells) => [0, 3, 6].map(i => `'${cells.slice(i, i + 3).join(' ')}'`).join(' ');
function renderLayouts() {
  return `<div class="view-head"><h2>Layouts</h2><span class="muted">Ändert die Startseite und die Farben. Gilt auf diesem Gerät.</span></div>
  <div class="layout-grid">${LAYOUTS.map(l => `<button class="layout-opt ${l.id === layout ? 'active' : ''}" data-layout="${l.id}" aria-pressed="${l.id === layout}">
      <div class="lp lp-${l.id}" aria-hidden="true" style="grid-template-areas:${previewAreas(LAYOUT_PREVIEW[l.id])}">${[...new Set(LAYOUT_PREVIEW[l.id])].map(c => `<i class="c-${c}" style="grid-area:${c}"></i>`).join('')}</div>
      <div class="lo-name">${esc(l.name)}${l.id === layout ? `<span class="chip-tag green">${I.check.replace('<svg', '<svg width="12" height="12" style="display:inline;vertical-align:-2px"')} Aktiv</span>` : ''}</div>
      <div class="muted">${esc(l.desc)}</div></button>`).join('')}</div>`;
}
function setLayout(id) {
  if (!LAYOUTS.some(l => l.id === id)) return;
  layout = id; document.body.dataset.layout = id;
  try { localStorage.setItem('sh.layout', id); } catch {}
  toast('Layout „' + LAYOUTS.find(l => l.id === id).name + '“');
}

// ---------- Layout „Glas“ ----------
function renderHomeGlas(d) {
  const r = d.room, on = !!r?.anyOn, v = on ? d.roomPct : 0;
  const sc = roomScenes(d)[0];
  const anyOpen = d.reachBlinds.some(b => (b.position ?? 100) < 98);
  const gtile = (cls, icon, state, name, sub, action, checked, disabled = false) => `<section class="card g-tile ${cls} ${checked ? 'on' : ''}">
      <div class="g-tile-top"><span class="g-ic">${icon}</span><span class="g-state">${esc(state)}</span></div>
      <div class="g-tile-name">${esc(name)}</div><div class="sub">${esc(sub)}</div>
      ${sw(checked, action, 'glas', disabled, name)}</section>`;
  return `<div class="glas">
    ${roomTabs(d, 'g-tabs')}
    <div class="g-panel">
      <section class="card g-room">${roomSvg(d)}${liveBadge('g-live')}<div class="g-cap"><b>Raumansicht</b><span>${esc(r?.name || '')}</span></div></section>
      <section class="card g-power ${on ? 'on' : ''}">
        <div class="g-head"><div><h3>Licht</h3><div class="sub">${esc(r?.name || '')}</div></div><button class="g-ic btn" data-goto="licht" aria-label="Alle Lampen einzeln">${I.sliders}</button></div>
        <button class="g-lamp ${on ? 'on' : ''}" data-room-toggle aria-label="Licht ${on ? 'aus' : 'ein'}schalten" aria-pressed="${on}" style="--p:${v}"><span class="g-lamp-core">${I.bulbBig}</span></button>
        <div class="g-val"><b>${on ? v + ' %' : 'Aus'}</b><span>${on ? `${d.roomLights.filter(l => l.on).length} von ${d.roomLights.length} Lampen an` : 'Antippen zum Einschalten'}</span></div>
      </section>
      <section class="card g-scene">
        <span class="g-ic">${I.sun}</span><div class="g-scene-txt"><b>${esc(sc?.name || 'Keine Szene')}</b><span>Szene</span></div>
        ${sc ? `<button class="g-play" data-scene="${esc(sc.id)}" aria-label="Szene ${esc(sc.name)} starten">${I.play}</button>` : ''}</section>
      ${gtile('g-tv', I.tv, d.har.ok ? (d.actOn ? 'An' : 'Aus') : 'Offline', 'Harmony', d.actLabel, 'tile/tv', d.actOn, !d.har.ok)}
      ${gtile('g-blinds', I.blind, anyOpen ? 'Offen' : 'Zu', 'Rollos', `${d.openBlinds.length} von ${d.blinds.length} offen`, 'tile/blinds', anyOpen, !d.reachBlinds.length)}
      <section class="card g-bright"><span class="g-ic">${I.sun}</span>${fillRange('g-range', 1, 254, on ? (r?.bri ?? 254) : 1, `hue/room/${r?.id}`, 'Helligkeit', !r)}<b>${v} %</b></section>
      ${musicCard(d, 'g-music')}
      ${vacCard(d)}
      ${calendarCard('wide', 4)}
    </div>
  </div>`;
}

// ---------- Layout „Gold“ ----------
function pendantSvg(p) {
  const g = p / 100;
  return `<svg class="pendant" viewBox="0 0 220 170" aria-hidden="true">
    <defs><radialGradient id="pglow" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ffd27a" stop-opacity="${(.85 * g).toFixed(2)}"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <linearGradient id="pdome" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2b2b2b"/><stop offset="1" stop-color="#0c0c0c"/></linearGradient>
      <linearGradient id="pin" x1="0" x2="1"><stop offset="0" stop-color="#7a5a22"/><stop offset=".5" stop-color="${g ? '#f6c45a' : '#9a7a3a'}"/><stop offset="1" stop-color="#7a5a22"/></linearGradient></defs>
    <path d="M110 0v58" stroke="#111" stroke-width="2"/>
    ${g ? `<ellipse cx="110" cy="132" rx="${70 + 40 * g}" ry="${34 + 14 * g}" fill="url(#pglow)"/>` : ''}
    <path d="M30 128c0-40 36-70 80-70s80 30 80 70z" fill="url(#pdome)"/>
    <ellipse cx="110" cy="128" rx="80" ry="12" fill="url(#pin)"/>
    ${g ? `<ellipse cx="110" cy="130" rx="22" ry="5" fill="#fff3d0" opacity="${(.5 + .5 * g).toFixed(2)}"/>` : ''}
  </svg>`;
}
function botSvg(on) {
  return `<svg class="bot" viewBox="0 0 220 120" aria-hidden="true">
    <ellipse cx="110" cy="108" rx="88" ry="9" fill="#000" opacity=".45"/>
    <path d="M24 70c0-14 38-24 86-24s86 10 86 24v18c0 10-38 18-86 18S24 98 24 88z" fill="#e9e9e6"/>
    <ellipse cx="110" cy="70" rx="86" ry="22" fill="#f6f6f3"/>
    <rect x="88" y="44" width="44" height="18" rx="7" fill="#dcdcd8"/><ellipse cx="110" cy="44" rx="22" ry="7" fill="#efefec"/>
    <rect x="60" y="80" width="60" height="10" rx="3" fill="#2b2b2b"/>
    <circle cx="72" cy="85" r="2" fill="${on ? '#f6c845' : '#666'}"/><circle cx="80" cy="85" r="2" fill="#666"/>
    <path d="M30 96c10 8 40 12 80 12s70-4 80-12" stroke="#bdbdb8" stroke-width="3" fill="none"/>
  </svg>`;
}
function activityCard() {
  const items = (S.activity || []).slice(0, 8);
  return `<div class="card-head"><div><h3>Aktivität</h3><div class="sub">${new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })}</div></div></div>
    <div class="o-tl">${items.length ? items.map((a, i) => `<div class="o-ev ${i === 0 ? 'first' : ''}">
        <div class="o-time">${new Date(a.t).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="o-box"><b>${esc(a.title)}</b><span>${esc(a.text)}</span></div></div>`).join('')
      : '<p class="muted">Noch nichts passiert seit dem Serverstart. Was du im Dashboard schaltest und was der Saugroboter macht, erscheint hier.</p>'}</div>`;
}
function renderHomeGold(d) {
  const r = d.room, on = !!r?.anyOn, v = on ? d.roomPct : 0;
  const lamps = d.roomLights;
  lampIdx = lamps.length ? ((lampIdx % lamps.length) + lamps.length) % lamps.length : 0;
  const L = lamps[lampIdx];
  const lp = L?.on && L.reachable ? (L.bri == null ? 100 : pct(L.bri)) : 0;
  const stat = (icon, text, label) => `<span class="o-stat" title="${esc(label)}">${icon}${esc(text)}</span>`;
  const A0 = 135, A1 = 405, a = A0 + (A1 - A0) * v / 100;
  const sc = roomScenes(d)[0];
  const vac = d.vac;
  return `<div class="gold">
    ${roomTabs(d, 'o-tabs')}
    <section class="card o-hero">${roomSvg(d)}${liveBadge('o-live')}
      <div class="o-stats">${stat(I.bulb, `${d.onLights.length}/${d.allLights.length}`, 'Lampen an')}${stat(I.blind, `${d.openBlinds.length} offen`, 'Rollos')}${stat(I.sun, `${v} %`, 'Helligkeit')}${vac.configured ? stat(I.battery, `${vac.ok ? vac.battery ?? '–' : '–'} %`, 'Akku Saugroboter') : ''}</div></section>
    <section class="card o-act">${activityCard()}</section>
    <section class="card o-lamp ${lp ? 'on' : ''}">
      <div class="card-head"><div><h3>${esc(L?.name || 'Lampe')}</h3><div class="sub">${lamps.length} Lampen · ${esc(r?.name || '')}</div></div>${L ? sw(L.on, `hue/light/${L.id}`, 'gold', !L.reachable, L.name) : ''}</div>
      <div class="o-lampview">
        <button class="o-arrow" data-lampnav="-1" aria-label="Vorherige Lampe" ${lamps.length > 1 ? '' : 'disabled'}>${I.chevL}</button>
        ${pendantSvg(lp)}
        <button class="o-arrow" data-lampnav="1" aria-label="Nächste Lampe" ${lamps.length > 1 ? '' : 'disabled'}>${I.chevR}</button></div>
      ${L?.dimmable ? `<div class="o-bri">${fillRange('o-range', 1, 254, L.on ? L.bri ?? 1 : 1, `hue/light/${L.id}`, 'Helligkeit ' + L.name, !L.reachable)}<span class="o-bri-ic">${I.sun}</span><b>${lp} %</b></div>`
        : `<div class="o-bri static"><span class="o-bri-ic">${I.sun}</span><b>${L ? (L.on ? 'An' : 'Aus') + ' · nicht dimmbar' : '–'}</b></div>`}
    </section>
    <section class="card o-dial">
      <div class="card-head"><div><h3>Helligkeit</h3><div class="sub">${esc(r?.name || '')}</div></div>${sw(on, 'tile/light', 'gold', !r, 'Licht ' + (r?.name || ''))}</div>
      <div class="o-gauge">
        <svg viewBox="0 0 240 200" aria-hidden="true">
          <path d="${arcPath(120, 110, 82, A0, A1)}" stroke="#3a3a3a" stroke-width="30" fill="none" stroke-linecap="round"/>
          ${v > 0 ? `<path d="${arcPath(120, 110, 82, A0, Math.max(a, A0 + .5))}" stroke="#f4f4f0" stroke-width="30" fill="none" stroke-linecap="round"/>` : ''}
        </svg>
        <div class="o-gauge-val">${v}<small>%</small></div>
        <span class="o-min">0</span><span class="o-max">100</span>
        <button class="round o-minus" data-dial="-10" aria-label="Dunkler">${I.minus}</button><button class="round o-plus" data-dial="10" aria-label="Heller">${I.plus}</button>
      </div>
      <div class="o-foot">
        <div><span class="o-foot-ic">${I.sun}</span><div><b>${esc(sc?.name || '–')}</b><small>Szene</small></div></div>
        <div><span class="o-foot-ic">${I.bulb}</span><div><b>${d.roomLights.filter(l => l.on && l.reachable).length} an</b><small>von ${d.roomLights.length} Lampen</small></div></div>
      </div>
    </section>
    ${vac.configured ? `<section class="card o-vac ${vacOn(vac) ? 'on' : ''}">
      <div class="card-head"><div><h3>Saugroboter</h3><div class="sub">${esc(vacText(vac))}</div></div>
        <div class="o-vac-btns">${vacButtons(vac)}</div></div>
      <div class="o-botwrap">
        <div class="o-call l"><b>${vac.ok ? (vac.mop ?? '–') + ' %' : '–'}</b><small>Mopp</small></div>
        ${botSvg(vacOn(vac))}
        <div class="o-call r"><b>${esc(VAC_POWER.find(m => m[0] === vac.power)?.[1] || '–')}</b><small>Saugstärke</small></div>
      </div>
      <div class="o-vstats">
        <div>${I.robot}<div><b>${esc(VAC_MODES.find(m => m[0] === vac.mode)?.[1] || '–')}</b><small>Reinigungsart</small></div></div>
        <div>${I.grid}<div><b>${vac.rooms?.length || 0}</b><small>Räume</small></div></div>
        <div>${I.battery}<div><b>${vac.ok ? (vac.battery ?? '–') + ' %' : '–'}</b><small>Akku</small></div></div>
      </div></section>` : ''}
    ${blindsCard(d)}
    ${musicCard(d, 'o-music')}
    ${calendarCard('wide', 4)}
  </div>`;
}

// ---------- Layout „Panorama“ ----------
// WMO-Wettercodes (Open-Meteo)
function wmo(code, day = true) {
  if (code === 0) return ['Klar', day ? 'sun' : 'moon'];
  if (code <= 2) return ['Leicht bewölkt', 'suncloud'];
  if (code === 3) return ['Bedeckt', 'cloud'];
  if (code === 45 || code === 48) return ['Nebel', 'fog'];
  if (code >= 51 && code <= 67) return [code >= 61 ? 'Regen' : 'Nieselregen', 'rain'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['Schnee', 'snow'];
  if (code >= 80 && code <= 82) return ['Regenschauer', 'rain'];
  if (code >= 95) return ['Gewitter', 'storm'];
  return ['–', 'cloud'];
}
function wxIcon(k) {
  const sun = '<circle cx="24" cy="22" r="9" fill="#ffc24a"/><g stroke="#ffc24a" stroke-width="3" stroke-linecap="round"><path d="M24 4v4M24 36v4M6 22h4M38 22h4M11 9l3 3M37 9l-3 3"/></g>';
  const cloud = (x = 0, c = '#eef3fb') => `<path transform="translate(${x} 0)" d="M18 46h26a9 9 0 0 0 0-18 12 12 0 0 0-23 3 7.5 7.5 0 0 0-3 15z" fill="${c}"/>`;
  const body = {
    sun, moon: '<path d="M30 8a16 16 0 1 0 12 26A18 18 0 0 1 30 8z" fill="#ffd48a"/>',
    suncloud: sun + cloud(6), cloud: cloud(0, '#dfe6f0') + cloud(8),
    fog: cloud(4, '#dfe6f0') + '<g stroke="#cfd6e0" stroke-width="3" stroke-linecap="round"><path d="M14 52h32M18 58h24"/></g>',
    rain: cloud(4) + '<g stroke="#7fb6ff" stroke-width="3" stroke-linecap="round"><path d="M22 52l-3 6M32 52l-3 6M42 52l-3 6"/></g>',
    snow: cloud(4) + '<g fill="#fff"><circle cx="22" cy="55" r="2.4"/><circle cx="32" cy="58" r="2.4"/><circle cx="42" cy="55" r="2.4"/></g>',
    storm: cloud(4, '#c7cfdb') + '<path d="M32 48l-6 9h6l-4 8 10-12h-6l4-5z" fill="#ffc24a"/>'
  }[k] || cloud();
  return `<svg class="wx" viewBox="0 0 60 64" aria-hidden="true">${body}</svg>`;
}
function weatherCard(d) {
  const w = S.weather, now = new Date();
  const dayName = now.toLocaleDateString('de-CH', { weekday: 'long' });
  const date = now.toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' });
  if (!w) return `<section class="card p-weather">
    <div class="p-wx-top"><div class="p-temp">${now.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</div><div class="p-day"><b>${esc(dayName)}</b><span>${esc(date)}</span></div></div>
    <div class="p-wx-row"><div class="p-mini">${I.bulb}<div><b>${d.onLights.length} an</b><small>Lampen</small></div></div><div class="p-mini">${I.blind}<div><b>${d.openBlinds.length} offen</b><small>Rollos</small></div></div></div>
    <div class="muted">Für das Wetter fehlt noch der Ort (settings.json → wetter).</div></section>`;
  const [txt, ic] = wmo(w.code, w.day);
  const days = (w.days || []).slice(1, 5);
  return `<section class="card p-weather">
    <div class="p-wx-top">${wxIcon(ic)}<div class="p-temp">${Math.round(w.temp)}<small>°C</small></div><div class="p-day"><b>${esc(dayName)}</b><span>${esc(date)}</span></div></div>
    <div class="muted">${esc(txt)}${w.place ? ' · ' + esc(w.place) : ''}</div>
    <div class="p-wx-row"><div class="p-mini">${I.drop}<div><b>${Math.round(w.humidity)} %</b><small>Feuchtigkeit</small></div></div><div class="p-mini">${I.wind}<div><b>${Math.round(w.wind)} km/h</b><small>Wind</small></div></div></div>
    <div class="p-days">${days.map(x => { const [t, k] = wmo(x.code); return `<div class="p-dd" title="${esc(t)}"><b>${esc(new Date(x.date).toLocaleDateString('de-CH', { weekday: 'short' }))}</b>${wxIcon(k)}<span>${Math.round(x.max)}° | ${Math.round(x.min)}°</span></div>`; }).join('')}</div>
  </section>`;
}
function tickDial(v) {
  const N = 48, A0 = 135, A1 = 405, out = [];
  for (let i = 0; i <= N; i++) {
    const a = (A0 + (A1 - A0) * i / N) * Math.PI / 180, on = i / N * 100 <= v && v > 0;
    const r0 = 92, r1 = i % 6 === 0 ? 78 : 84;
    out.push(`<line x1="${(120 + r0 * Math.cos(a)).toFixed(1)}" y1="${(120 + r0 * Math.sin(a)).toFixed(1)}" x2="${(120 + r1 * Math.cos(a)).toFixed(1)}" y2="${(120 + r1 * Math.sin(a)).toFixed(1)}" class="${on ? 'on' : ''}"/>`);
  }
  const a = (A0 + (A1 - A0) * v / 100) * Math.PI / 180;
  return `<svg class="p-ticks" viewBox="0 0 240 240" aria-hidden="true"><g>${out.join('')}</g>
    <circle cx="120" cy="120" r="66" class="p-face"/>
    <circle cx="${(120 + 104 * Math.cos(a)).toFixed(1)}" cy="${(120 + 104 * Math.sin(a)).toFixed(1)}" r="6" class="p-dot"/></svg>`;
}
function renderHomePanorama(d) {
  const r = d.room, on = !!r?.anyOn, v = on ? d.roomPct : 0;
  const sc = roomScenes(d).slice(0, 3);
  const anyOpen = d.reachBlinds.some(b => (b.position ?? 100) < 98);
  const sp = d.sp, spOk = sp.configured && sp.linked && sp.ok;
  const ptile = (icon, name, sub, action, checked, disabled) => `<div class="p-tile ${checked ? 'on' : ''} ${disabled ? 'unreach' : ''}">
      <div class="p-tile-top"><span class="p-tile-ic">${icon}</span>${sw(checked, action, 'pano', disabled, name)}</div>
      <b>${esc(name)}</b><small>${esc(sub)}</small></div>`;
  return `<div class="pano">
    ${weatherCard(d)}
    <section class="card p-hero">${roomSvg(d)}
      ${roomTabs(d, 'p-tabs')}
      <div class="p-hero-bottom">${liveBadge()}<div class="scene-strip">${sc.map(s => `<button class="glass" data-scene="${esc(s.id)}">${I.play}${esc(s.name)}</button>`).join('')}<button class="glass" data-goto="szenen">${I.grid}Szenen</button></div></div>
    </section>
    <section class="card p-dial">
      <div class="card-head"><div><h3>Helligkeit</h3><div class="sub">${esc(r?.name || '')}</div></div>${sw(on, 'tile/light', 'pano', !r, 'Licht')}</div>
      <div class="p-dialwrap">${tickDial(v)}
        <div class="p-dial-c"><small>${on ? 'Eingeschaltet' : 'Aus'}</small><b>${v}<span>%</span></b><small>${d.roomLights.filter(l => l.on && l.reachable).length} von ${d.roomLights.length} an</small></div>
        <button class="round p-minus" data-dial="-10" aria-label="Dunkler">${I.minus}</button><button class="round p-plus" data-dial="10" aria-label="Heller">${I.plus}</button>
      </div>
      <div class="p-scenes"><button class="p-pill ${on ? '' : 'act'}" data-room-toggle>${on ? 'Ausschalten' : 'Einschalten'}</button>
        ${sc.slice(0, 2).map(s => `<button class="p-pill" data-scene="${esc(s.id)}">${esc(s.name)}</button>`).join('')}</div>
    </section>
    <section class="p-tiles">
      ${ptile(I.bulb, 'Licht', 'Philips Hue', 'tile/light', on, !r)}
      ${ptile(I.blind, 'Rollos', `${d.openBlinds.length} von ${d.blinds.length} offen`, 'tile/blinds', anyOpen, !d.reachBlinds.length)}
      ${ptile(I.tv, 'Harmony', d.actLabel, 'tile/tv', d.actOn, !d.har.ok)}
      ${ptile(I.music, 'Musik', spOk ? (sp.device?.name || 'Spotify') : 'Spotify', 'tile/music', !!sp.playing, !spOk)}
    </section>
    ${chartCard(d)}
    ${musicCard(d, 'p-music')}
    ${vacCard(d)}
    ${calendarCard('wide', 4)}
  </div>`;
}

const HOMES = { glas: renderHomeGlas, gold: renderHomeGold, panorama: renderHomePanorama };
