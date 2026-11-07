// Menus, overlays, settings, input wiring
'use strict';

// =====================================================================
//  UI / overlays
// =====================================================================
const $ = id => document.getElementById(id);
const overlays = ['menu', 'intro', 'results', 'settings', 'world', 'shop', 'home', 'codes'];
const isTouch = () => (navigator.maxTouchPoints || 0) > 0 || matchMedia('(pointer: coarse)').matches;
function show(name) {
  overlays.forEach(o => $(o).classList.toggle('show', o === name));
  $('quit').classList.toggle('show', name === null);
  // big on-screen tap pads for phones and tablets (tapping anywhere still works)
  const duet = !!(G && G.nparts > 1), touchPlay = name === null && isTouch();
  $('tapR').classList.toggle('show', touchPlay);
  $('tapL').classList.toggle('show', touchPlay && duet);
  $('tapR').innerHTML = duet ? '<b>R</b><span>top line</span>' : '<b>TAP</b><span>hold for long notes</span>';
}
function starStr(n) { return '★'.repeat(n) + '☆'.repeat(3 - n); }
const fogLabel = f => ['☀️ Clear', '🌫️ Foggy', '🌙 Night'][f];

// ---------- pond map (level select) ----------
const PAD_POS = [[112, 208], [322, 194], [532, 212], [742, 198], [962, 212], [972, 372], [762, 360], [552, 374], [342, 360], [132, 372], [122, 532], [332, 540], [542, 528], [752, 538], [962, 528]];
const SVGNS = 'http://www.w3.org/2000/svg';
function S(tag, attrs, parent, text) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (text != null) el.textContent = text;
  if (parent) parent.appendChild(el);
  return el;
}
function padPath(cx, cy, r, notchAng) {
  const a1 = notchAng - 0.22, a2 = notchAng + 0.22;
  return `M${cx},${cy} L${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)} A${r},${r} 0 1 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`;
}
function svgFrog(parent, o = {}) {
  const g = S('g', { class: o.cls || 'mapFrog' }, parent);
  if (o.transform) g.setAttribute('transform', o.transform);
  S('ellipse', { cx: -16, cy: 8, rx: 12, ry: 8, fill: '#5cb84a' }, g); S('ellipse', { cx: 16, cy: 8, rx: 12, ry: 8, fill: '#5cb84a' }, g);
  S('ellipse', { cx: 0, cy: -4, rx: 24, ry: 19, fill: '#7fd45e' }, g);
  S('ellipse', { cx: 0, cy: 2, rx: 14, ry: 10, fill: '#dcf7bf' }, g);
  for (const dx of [-11, 11]) {
    S('circle', { cx: dx, cy: -20, r: 9.5, fill: '#7fd45e' }, g); S('circle', { cx: dx, cy: -21, r: 6.5, fill: '#fff' }, g);
    S('circle', { cx: dx + 1.5, cy: -21, r: 3.4, fill: '#1f2a22' }, g);
  }
  S('ellipse', { cx: -16, cy: -7, rx: 4.5, ry: 3, fill: '#ff8fa3', opacity: 0.6 }, g); S('ellipse', { cx: 16, cy: -7, rx: 4.5, ry: 3, fill: '#ff8fa3', opacity: 0.6 }, g);
  S('path', { d: 'M-5,-9 Q0,-4 5,-9', stroke: '#2b3a2e', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, g);
  if (o.glasses) {   // Grandpa Frog: round reading glasses and a white moustache, same as in the game
    for (const dx of [-11, 11]) S('circle', { cx: dx, cy: -21, r: 8, fill: 'none', stroke: '#6b4b2a', 'stroke-width': 2 }, g);
    S('line', { x1: -3, y1: -21, x2: 3, y2: -21, stroke: '#6b4b2a', 'stroke-width': 2 }, g);
    S('ellipse', { cx: -5, cy: -5.5, rx: 6, ry: 2.6, fill: '#f4f4f4' }, g); S('ellipse', { cx: 5, cy: -5.5, rx: 6, ry: 2.6, fill: '#f4f4f4' }, g);
  }
  return g;
}
// A drawn frog for HTML screens (instead of the 🐸 emoji, which doesn't match the game's frogs)
function frogBadge(size, glasses) {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '-34 -36 68 58'); svg.setAttribute('width', size); svg.setAttribute('height', size * 58 / 68);
  svgFrog(svg, { glasses, cls: 'badgeFrog' });
  return svg;
}
let mapFrogAt = 0, mapBusy = false;

// A music symbol drawn on a short line, like on the notation card (for level intros)
function symbolSVG(sym) {
  const svg = document.createElementNS(SVGNS, 'svg'), wide = sym === 'ee';
  svg.setAttribute('viewBox', `0 0 ${wide ? 100 : 80} 90`); svg.setAttribute('width', wide ? 100 : 80); svg.setAttribute('height', 90); svg.style.flex = 'none';
  const ink = '#2b3a2e', y = 58, x = wide ? 36 : 36;
  if (sym !== '34') S('line', { x1: 4, y1: y, x2: wide ? 96 : 76, y2: y, stroke: '#9aa49c', 'stroke-width': 2 }, svg);
  const head = (hx, filled, whole) => S('ellipse', { cx: hx, cy: y, rx: whole ? 11 : 9.5, ry: whole ? 7.5 : 6.8, transform: whole ? '' : `rotate(-20 ${hx} ${y})`,
    fill: filled ? ink : '#fff8ea', stroke: ink, 'stroke-width': whole ? 3.4 : 2.8 }, svg);
  const stem = hx => S('line', { x1: hx + 8.5, y1: y - 2, x2: hx + 8.5, y2: y - 46, stroke: ink, 'stroke-width': 2.8, 'stroke-linecap': 'round' }, svg);
  if (sym === 'q') { head(x, true); stem(x); }
  else if (sym === 'h') { head(x, false); stem(x); }
  else if (sym === 'w') head(x + 4, false, true);
  else if (sym === 'ee') { head(26, true); stem(26); head(66, true); stem(66); S('rect', { x: 33, y: y - 48, width: 43, height: 8, fill: ink }, svg); }
  else if (sym === 'qr') S('path', { d: `M${x},${y - 26} L${x + 9},${y - 15} L${x + 1},${y - 5} L${x + 9},${y + 6} Q${x - 4},${y + 1} ${x + 3},${y + 16}`,
    fill: 'none', stroke: ink, 'stroke-width': 3.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  else if (sym === 'hr') S('rect', { x: x - 8, y: y - 9, width: 24, height: 9, fill: ink }, svg);    // sits on the line
  else if (sym === 'wr') S('rect', { x: x - 8, y, width: 24, height: 9, fill: ink }, svg);           // hangs from the line
  else if (sym === '34') for (const [t, ty] of [['3', 40], ['4', 82]]) S('text', { x: 40, y: ty, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 900, 'font-family': 'Georgia, serif', fill: ink }, svg, t);
  return svg;
}
// where level i sits on its habitat's pond map
const padXY = i => PAD_POS[Math.max(0, habitatOf(LEVELS[i]).levels.indexOf(LEVELS[i].id))];
// level number as kids see it: its place in its habitat (1, 2, 3...)
const levelNumber = i => habitatOf(LEVELS[i]).levels.indexOf(LEVELS[i].id) + 1;
function buildMenu() {
  const hab = currentHabitat(), th = themeOf(hab), ids = hab.levels;
  if (!ids.includes(LEVELS[mapFrogAt].id)) mapFrogAt = levelIndex(ids[0]);
  const svg = $('pondmap'); svg.innerHTML = '';
  const defs = S('defs', {}, svg);
  const wg = S('radialGradient', { id: 'water', cx: '50%', cy: '45%', r: '75%' }, defs);
  S('stop', { offset: '0%', 'stop-color': th.map[0] }, wg); S('stop', { offset: '100%', 'stop-color': th.map[1] }, wg);
  const blur = S('filter', { id: 'mist' }, defs); S('feGaussianBlur', { stdDeviation: 7 }, blur);
  S('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#water)' }, svg);
  // ripples, tiny decorative pads, reeds
  [[90, 120, 40], [980, 560, 50], [420, 600, 34], [700, 140, 28], [1030, 330, 30], [60, 330, 26]].forEach(([x, y, r]) =>
    S('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.45, fill: 'none', stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 3 }, svg));
  [[60, 470, 22, 2.2], [1040, 180, 18, 0.5], [390, 320, 14, 4], [700, 470, 16, 1.2], [980, 470, 13, 3.5]].forEach(([x, y, r, a]) =>
    S('path', { d: padPath(x, y, r, a), fill: '#6fbf5a', opacity: 0.85 }, svg));
  S('circle', { cx: 395, cy: 316, r: 5, fill: '#ff9fb8' }, svg); S('circle', { cx: 395, cy: 316, r: 2, fill: '#ffe066' }, svg);
  for (const [x, flip] of [[24, 1], [1080, -1]]) for (let i = 0; i < 4; i++) {
    const bx = x + flip * i * 9, h = 70 + (i % 2) * 35;
    S('path', { d: `M${bx},${H} Q${bx},${H - h / 2} ${bx + flip * 8},${H - h}`, stroke: '#5a9e48', 'stroke-width': 3, fill: 'none' }, svg);
    S('ellipse', { cx: bx + flip * 7, cy: H - h + 12, rx: 4.5, ry: 12, fill: '#8a5a35' }, svg);
  }
  // title on a wooden sign
  const sign = S('g', {}, svg);
  S('rect', { x: 290, y: 12, width: 480, height: 86, rx: 20, fill: '#b98552', stroke: '#6b4520', 'stroke-width': 5 }, sign);
  S('rect', { x: 300, y: 22, width: 460, height: 66, rx: 14, fill: 'none', stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 3 }, sign);
  svgFrog(sign, { cls: 'signFrog', transform: 'translate(352 52) scale(0.85)' });
  S('text', { x: 553, y: 56, 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 900, fill: '#fff8ea', stroke: '#6b4520', 'stroke-width': 1.5 }, sign, hab.name);
  S('text', { x: 530, y: 82, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fde9c8' }, sign, 'Pick a lily pad to start hopping!');
  // stepping-stone trail through the pads (Catmull-Rom → Bézier)
  const P = PAD_POS.slice(0, ids.length);
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  S('path', { d, fill: 'none', stroke: 'rgba(255,255,255,0.75)', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '1 22' }, svg);
  // the pads
  ids.forEach((id, k) => {
    const i = levelIndex(id), L = LEVELS[i];
    const [cx, cy] = PAD_POS[k], best = progress.best[L.id] || 0;
    const g = S('g', { class: 'pad', tabindex: 0, role: 'button', 'aria-label': `Level ${k + 1}: ${L.name}` }, svg);
    const body = S('g', { class: 'padBody' }, g);
    S('ellipse', { cx, cy: cy + 6, rx: 50, ry: 36, fill: 'rgba(20,70,80,0.25)' }, body);
    const padCol = L.fog === 2 ? '#4f8f7c' : '#62b950', edge = L.fog === 2 ? '#2f6050' : '#3d8a3a';
    S('path', { d: padPath(cx, cy, 46, -0.9 + k * 0.7), fill: padCol, stroke: edge, 'stroke-width': 3,
      transform: `translate(${cx} ${cy}) scale(1 0.8) translate(${-cx} ${-cy})` }, body);   // slightly flattened circle
    for (let v = 0; v < 5; v++) {
      const a = v * 1.25 + k;
      S('line', { x1: cx, y1: cy, x2: cx + Math.cos(a) * 34, y2: cy + Math.sin(a) * 26, stroke: 'rgba(255,255,255,0.18)', 'stroke-width': 2 }, body);
    }
    if (L.fog === 1) { S('ellipse', { cx: cx + 16, cy: cy - 4, rx: 38, ry: 17, fill: 'rgba(255,255,255,0.75)', filter: 'url(#mist)' }, body); }
    if (L.fog === 2) S('text', { x: cx + 32, y: cy - 16, 'font-size': 19, 'text-anchor': 'middle' }, body, '🌙');
    S('circle', { cx, cy, r: 18, fill: '#fff8ea', stroke: '#2b3a2e', 'stroke-width': 3 }, body);
    S('text', { x: cx, y: cy + 7.5, 'text-anchor': 'middle', 'font-size': 21, 'font-weight': 900, fill: '#2f7a3a' }, body, String(k + 1));
    // stars as little flowers above the pad
    for (let k = 0; k < 3; k++)
      S('text', { x: cx - 22 + k * 22, y: cy - 42 - (k === 1 ? 5 : 0), 'text-anchor': 'middle', 'font-size': 20, fill: k < best ? '#ffcf33' : 'rgba(255,255,255,0.55)', stroke: k < best ? '#b8860b' : 'none', 'stroke-width': 1 }, g, '★');
    // name tag
    S('rect', { x: cx - 76, y: cy + 40, width: 152, height: 40, rx: 13, fill: 'rgba(255,248,234,0.93)', stroke: '#2b3a2e', 'stroke-width': 2.5 }, g);
    S('text', { x: cx, y: cy + 57, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#2b3a2e' }, g, L.name);
    S('text', { x: cx, y: cy + 73, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5d6b5f' }, g, `${isDuetLevel(L) ? '👐' : L.plants ? '🌾' : ['☀️', '🌫️', '🌙'][L.fog]} ${L.concept}`);
    const go = () => pickPad(i);
    g.addEventListener('click', go);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  const frog = svgFrog(svg);
  placeMapFrog(frog, mapFrogAt, 0, 0);
  const w = $('menuWallet'); w.innerHTML = ''; w.append(walletEl(hab.id));
  $('btnShop').hidden = !hab.shop;
}
function placeMapFrog(frog, i, dx, lift) {
  const [x, y] = padXY(i);
  frog.setAttribute('transform', `translate(${x + 30 + dx} ${y - 8 - lift})`);
}
function pickPad(i) {
  if (mapBusy) return;
  const frog = document.querySelector('#pondmap .mapFrog');
  if (i === mapFrogAt || !frog) { openIntro(i); return; }
  mapBusy = true;
  const [x0, y0] = padXY(mapFrogAt), [x1, y1] = padXY(i), t0 = performance.now();
  const dist = Math.hypot(x1 - x0, y1 - y0), dur = 300 + Math.min(300, dist * 0.4);
  const step = now => {
    const p = Math.min(1, (now - t0) / dur), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - Math.sin(Math.PI * p) * (50 + dist * 0.15);
    frog.setAttribute('transform', `translate(${x + 30} ${y - 8})`);
    if (p < 1) requestAnimationFrame(step);
    else { mapFrogAt = i; mapBusy = false; setTimeout(() => openIntro(i), 120); }
  };
  try { ensureAudio(); SND.hop(AC.currentTime); } catch (e) {}
  requestAnimationFrame(step);
}
function goMenu() { G = null; mode = 'menu'; buildMenu(); show('menu'); }

function openIntro(i, keepRhythm) {
  selected = i; mapFrogAt = i;
  const L = LEVELS[i];
  if (progress.habitat !== habitatOf(L).id) { progress.habitat = habitatOf(L).id; saveProgress(); }
  if (!keepRhythm || !pendingRhythm) pendingRhythm = L.genParts ? L.genParts.map(g => generate(g, L.beats || 4)) : L.gen ? generate(L.gen, L.beats || 4) : (L.parts || L.rhythm);
  G = makeRun(i, false, pendingRhythm); camB = -G.beats + 0.6;
  mode = 'intro';
  $('introName').textContent = `${levelNumber(i)}. ${L.name}`;
  $('introMeta').textContent = `${L.concept} · ${fogLabel(L.fog)} · ${GUIDE_INFO[guideOf(L)]} · ${Math.round(L.bpm * settings.speed)} bpm`;
  const learn = $('introLearn'); learn.innerHTML = '';
  for (const [sym, text] of L.learn || []) {
    const card = document.createElement('div'); card.className = 'learn';
    const p = document.createElement('span'); p.textContent = text;
    card.append(symbolSVG(sym), p); learn.append(card);
  }
  $('introTip').textContent = L.tip + (isTouch() ? (isDuetLevel(L) ? ' On a touch screen, tap the blue L pad (bottom line) and the green R pad (top line).' : ' On a touch screen, tap the big lily pad in the corner (or anywhere).') : '');
  show('intro');
}
function startPlay(demo) {
  ensureAudio();
  if (document.activeElement) document.activeElement.blur();
  G = makeRun(selected, demo, pendingRhythm);
  startFrom(0); camB = beatAt(tp());
  mode = 'play'; show(null);
  $('quit').style.top = (CARD.y + cardHeightFor(G.L) + 12) + 'px';
}
$('btnPlay').onclick = () => startPlay(false);
$('btnListen').onclick = () => startPlay(true);
$('btnBack').onclick = goMenu;
$('quit').onclick = () => { openIntro(selected, true); };

function timingLog() {
  const g = G;
  return [
    'Ribbit Rhythm timing log v1',
    `level ${g.L.id} "${g.L.name}"  bpm ${g.bpm.toFixed(1)}  sec/beat ${g.spb.toFixed(4)}  beats/measure ${g.beats}  guide ${guideOf(g.L)}`,
    `audio latency ${(hwLatency() * 1000).toFixed(0)} ms  windows early ${EARLY_WIN}s late ${LATE_WIN}s perfect ${PERFECT}s`,
    `browser ${navigator.userAgent}`,
    `rhythm  ${g.rhythmStr}`,
    'times are seconds after beat 1 of measure 1 (as heard), D = key down, U = key up, ! = would have failed',
    ...g.log,
  ].join('\n');
}
function showResults() {
  if (!G || mode !== 'play') return;
  mode = 'results';
  const btns = $('resButtons'); btns.innerHTML = '';
  document.querySelectorAll('#results .earned').forEach(e => e.remove());
  const add = (label, cls, fn) => { const b = document.createElement('button'); b.className = cls; b.textContent = label; b.onclick = fn; btns.appendChild(b); };
  $('results').querySelector('.panel').style.maxWidth = settings.practice && !G.demo ? '760px' : '';
  if (G.demo) {
    $('resTitle').textContent = 'That’s how it goes. Your turn!';
    $('resStars').textContent = ''; $('resStars').appendChild(frogBadge(110, true));
    $('resStats').innerHTML = '';
    add('▶ Play!', 'go', () => startPlay(false));
    add('👂 Listen again', 'listen', () => startPlay(true));
    add('← Levels', 'soft', goMenu);
  } else if (settings.practice) {
    const notes = G.events.filter(e => e.type === 'note');
    $('resTitle').textContent = 'Practice run recorded';
    $('resStars').textContent = '📝';
    $('resStats').innerHTML = `<span>✅ Notes landed: <b>${notes.filter(e => e.judged && e.judged !== 'miss').length}/${notes.length}</b></span><span>⚠️ Would have failed: <b>${G.practiceFlags}</b></span>`;
    const text = timingLog();
    const ta = document.createElement('textarea'); ta.value = text; ta.readOnly = true;
    ta.style.cssText = 'width:100%;height:120px;font:12px monospace;margin:4px 0 8px;border-radius:10px;border:2px solid #2b3a2e;padding:6px;';
    btns.appendChild(ta);
    add('📋 Copy timing log', 'listen', ev => {
      const b = ev.target;
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
        .then(() => { b.textContent = '✅ Copied!'; })
        .catch(() => { ta.focus(); ta.select(); b.textContent = 'Press Ctrl/Cmd+C to copy'; });
    });
    add('🔁 Again', 'soft', () => startPlay(false));
    add('← Levels', 'soft', goMenu);
  } else {
    const notes = G.events.filter(e => e.type === 'note');
    const perfect = notes.filter(e => e.judged === 'perfect').length, good = notes.length - perfect;
    const stars = G.fails === 0 ? (perfect / notes.length >= 0.5 ? 3 : 2) : (G.fails === 1 ? 2 : 1);
    const won = awardRun(G.L, stars, perfect);
    $('resTitle').textContent = resultTitle(G.L, stars);
    $('resStars').textContent = starStr(stars);
    $('resStats').innerHTML = `<span>✨ Perfect: <b>${perfect}</b></span><span>👍 Good: <b>${good}</b></span><span>🐟 Oopsies: <b>${G.fails}</b></span>`;
    // what this run earned
    const earn = document.createElement('div'); earn.className = 'earned';
    const fl = document.createElement('span'); fl.append(flowerIcon(26), ` +${won.flowers} ${won.hab.name} flowers`); earn.append(fl);
    if (won.newStars) { const st = document.createElement('span'); st.innerHTML = `<b class="star">★</b> +${won.newStars} new star${won.newStars > 1 ? 's' : ''}!`; earn.append(st); }
    $('resStats').after(earn);
    add('🔁 Again', 'soft', () => startPlay(false));
    if (G.L.gen || G.L.genParts) add('🎲 New rhythm', 'listen', () => { pendingRhythm = G.L.genParts ? G.L.genParts.map(g => generate(g, G.beats)) : generate(G.L.gen, G.beats); startPlay(false); });
    const ids = habitatOf(G.L).levels, nextId = ids[ids.indexOf(G.L.id) + 1];
    if (nextId) add('Next level →', 'go', () => openIntro(levelIndex(nextId)));
    add('← Levels', 'soft', goMenu);
  }
  show('results');
}

// settings
function syncSettingsUI() {
  $('setPractice').checked = settings.practice; $('setCounts').checked = settings.counts; $('setCricket').checked = settings.cricket;
  $('setSpeed').value = String(settings.speed); $('setGuide').value = settings.guide;
}
$('btnSettings').onclick = () => { syncSettingsUI(); mode = 'settings'; show('settings'); };
$('setCounts').onchange = e => { settings.counts = e.target.checked; saveJSON('lilyRhythm.settings', settings); };
$('setCricket').onchange = e => { settings.cricket = e.target.checked; saveJSON('lilyRhythm.settings', settings); };
$('setSpeed').onchange = e => { settings.speed = parseFloat(e.target.value); saveJSON('lilyRhythm.settings', settings); };
$('setPractice').onchange = e => { settings.practice = e.target.checked; saveJSON('lilyRhythm.settings', settings); };
$('setGuide').onchange = e => { settings.guide = e.target.value; saveJSON('lilyRhythm.settings', settings); };
$('btnSetDone').onclick = goMenu;

// input wiring: any letter, number, Space, Enter or arrow key hops
const isHopKey = e => !e.ctrlKey && !e.metaKey && !e.altKey &&
  (e.key.length === 1 || e.key === 'Enter' || e.key.startsWith('Arrow'));
addEventListener('keydown', e => {
  if (e.code === 'Escape' && mode === 'play') { openIntro(selected, true); return; }
  if (!isHopKey(e)) return;
  if (mode === 'play') { e.preventDefault(); if (!e.repeat) press('k:' + e.code, partForCode(e.code)); }
  else if (mode === 'intro' && e.code === 'Space') { e.preventDefault(); if (!e.repeat) startPlay(false); }
});
addEventListener('keyup', e => { if (mode === 'play') { if (isHopKey(e)) e.preventDefault(); release('k:' + e.code); } });
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('button, select, input')) return;
  if (mode === 'play') {
    e.preventDefault();
    const zone = e.target.closest('.tapzone');
    if (zone) { zone.classList.add('down'); zoneOf.set(e.pointerId, zone); }
    const r = stage.getBoundingClientRect();   // duets: left half of the screen = left hand (bottom line)
    const part = zone ? +zone.dataset.part : (e.clientX - r.left < r.width / 2 ? 1 : 0);
    press('p:' + e.pointerId, part);
  }
});
const zoneOf = new Map();
const up = e => { const z = zoneOf.get(e.pointerId); if (z) { z.classList.remove('down'); zoneOf.delete(e.pointerId); } release('p:' + e.pointerId); };
addEventListener('pointerup', up); addEventListener('pointercancel', up);
addEventListener('blur', () => { if (G && G.keys) G.keys.clear(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') openIntro(selected, true); });
