// Save codes: all progress packed into a short code, to move a pond to another device. No server.
'use strict';

// The order of these lists is part of the code format: only ever ADD to the end.
const CODE_LEVELS = ['l1', 'l2', 'l3', 'l4', 'l5', 'm1', 'l6', 'l7', 'l8', 'm2', 'l9', 'd1', 'd2', 'd3', 'd4',
  's1', 's2', 's3', 'r1', 'r2', 'r3', 'r4'];
const CODE_HABITATS = ['sunny', 'marsh', 'bayou', 'mountain', 'lagoon', 'moonlit'];
// version 2 stores how many items and spots it holds, so adding items or spots never breaks old codes.
// Version 1 codes (before the pond items) had 16 items and 15 spots.
const CODE_VERSION = 2, V1_ITEMS = 16, V1_SLOTS = 15;
// letters and digits that are hard to mix up (no I, L, O, U)
const ABC = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
for (const L of LEVELS) if (!CODE_LEVELS.includes(L.id)) console.warn(`Level ${L.id} is missing from CODE_LEVELS: its stars won't be in save codes`);

// numbers of any size go in 4-bit chunks, each with a "more follows" bit (small numbers stay short)
function bitsWriter() {
  const bits = [];
  return { bits, put(v, n) { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); },
    num(v) { v = Math.max(0, Math.floor(v)); do { const more = v > 15 ? 1 : 0; this.put(more, 1); this.put(v & 15, 4); v >>= 4; } while (v); } };
}
function bitsReader(bits) {
  let p = 0;
  return { get(n) { let v = 0; for (let i = 0; i < n; i++) v = v * 2 + (bits[p++] || 0); return v; },
    num() { let v = 0, sh = 0, more; do { more = this.get(1); v += this.get(4) * 2 ** sh; sh += 4; } while (more && sh < 40); return v; } };
}
const check = s => { let h = s.length; for (const c of s) h = (h * 33 + ABC.indexOf(c)) % 1021; return ABC[h >> 5] + ABC[h & 31]; };

function makeSaveCode() {
  const w = bitsWriter();
  w.put(CODE_VERSION, 3);
  w.put(Math.max(0, CODE_HABITATS.indexOf(progress.habitat)), 3);
  for (const id of CODE_LEVELS) w.put(progress.best[id] || 0, 2);
  for (const id of CODE_HABITATS) w.num(flowersIn(id));
  w.num(progress.starsSpent || 0);
  w.num(ITEMS.length); for (const it of ITEMS) w.put(progress.owned[it.id] ? 1 : 0, 1);
  w.num(SLOTS.length); for (const s of SLOTS) { const k = ITEMS.findIndex(it => it.id === progress.placed[s.id]); w.put(k < 0 ? 0 : 1, 1); if (k >= 0) w.num(k); }
  while (w.bits.length % 5) w.bits.push(0);
  let body = '';
  for (let i = 0; i < w.bits.length; i += 5) body += ABC[parseInt(w.bits.slice(i, i + 5).join(''), 2)];
  body = body.replace(/0+$/, '');   // trailing zeros carry nothing
  const all = check(body) + body;
  return all.match(/.{1,4}/g).join('-');
}

// returns a new progress object, or null if the code is mistyped
function readSaveCode(text) {
  const s = text.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (s.length < 3 || [...s].some(c => !ABC.includes(c))) return null;
  const body = s.slice(2);
  if (check(body) !== s.slice(0, 2)) return null;
  const bits = []; for (const c of body) { const v = ABC.indexOf(c); for (let i = 4; i >= 0; i--) bits.push((v >> i) & 1); }
  const r = bitsReader(bits);
  const ver = r.get(3);
  if (ver !== 1 && ver !== 2) return null;
  const p = { best: {}, flowers: {}, starsSpent: 0, owned: {}, placed: {}, habitat: CODE_HABITATS[r.get(3)] || 'sunny' };
  for (const id of CODE_LEVELS) { const v = r.get(2); if (v) p.best[id] = v; }
  for (const id of CODE_HABITATS) { const v = r.num(); if (v) p.flowers[id] = v; }
  p.starsSpent = r.num();
  const nItems = ver === 1 ? V1_ITEMS : r.num();
  for (let k = 0; k < nItems; k++) if (r.get(1) && ITEMS[k]) p.owned[ITEMS[k].id] = true;
  const nSlots = ver === 1 ? V1_SLOTS : r.num();
  for (let k = 0; k < nSlots; k++) if (r.get(1)) { const it = ITEMS[r.num()]; if (it && SLOTS[k]) p.placed[SLOTS[k].id] = it.id; }
  return p;
}

// ---- the Save code screen ----
let codeReturn = goMenu, pendingLoad = null;
function openCodes(back) {
  codeReturn = back || goMenu; pendingLoad = null;
  mode = 'codes'; $('myCode').textContent = makeSaveCode();
  $('codeIn').value = ''; $('codeMsg').textContent = ''; $('btnCodeLoad').textContent = 'Load this code';
  show('codes');
}
$('btnCodeCopy').onclick = () => {
  const code = $('myCode').textContent;
  (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject())
    .then(() => { $('codeMsg').textContent = 'Copied! Keep it somewhere safe.'; })
    .catch(() => { $('codeMsg').textContent = 'Write the code down and keep it somewhere safe.'; });
};
$('btnCodeLoad').onclick = () => {
  const p = readSaveCode($('codeIn').value);
  if (!p) { pendingLoad = null; $('btnCodeLoad').textContent = 'Load this code'; $('codeMsg').textContent = 'Hmm, that code doesn’t look right. Check each letter and try again!'; return; }
  if (!pendingLoad) {   // ask once before replacing what's on this device
    pendingLoad = p; $('btnCodeLoad').textContent = 'Yes, load it';
    const stars = Object.values(p.best).reduce((a, b) => a + b, 0), items = Object.keys(p.owned).length;
    $('codeMsg').textContent = `This code has ${stars} star${stars === 1 ? '' : 's'} and ${items} item${items === 1 ? '' : 's'}. It will replace the pond on this device. Load it?`;
    return;
  }
  Object.assign(progress, pendingLoad); saveProgress(); pendingLoad = null;
  $('btnCodeLoad').textContent = 'Load this code'; $('codeIn').value = '';
  $('myCode').textContent = makeSaveCode(); $('codeMsg').textContent = 'Welcome back! Your pond is here.';
};
$('codeIn').oninput = () => { pendingLoad = null; $('btnCodeLoad').textContent = 'Load this code'; $('codeMsg').textContent = ''; };
$('btnCodeDone').onclick = () => codeReturn();
$('btnSetCode').onclick = () => openCodes(() => { syncSettingsUI(); mode = 'settings'; show('settings'); });
$('btnHomeCode').onclick = () => openCodes(openHome);
