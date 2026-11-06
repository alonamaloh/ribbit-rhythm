// Game state: a run, plants, frog positions
'use strict';

// =====================================================================
//  Game state
// =====================================================================
let mode = 'menu';      // menu | intro | play | results | settings | calib
let G = null;           // current run / preview
let selected = 0, pendingRhythm = null;
let camB = 0;           // smoothed camera beat

// Hiding plants: clumps of grass, cattails and ferns in front of the pads. Irregular on purpose:
// sometimes a pad peeks through a gap, sometimes several in a row are hidden.
function makeClumps(L, total, np) {
  let seed = 0; for (const c of L.id) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rows = [];
  for (let p = 0; p < np; p++) {
    const list = [];
    for (let b = 0.4; b < total; b += 0.25) {
      if (rnd() > L.plants * 0.62) continue;
      list.push({ beat: b + rnd() * 0.25, kind: ['grass', 'grass', 'cattail', 'fern'][Math.floor(rnd() * 4)],
        h: 55 + rnd() * 55 * (0.6 + L.plants), w: 46 + rnd() * 44, seed: rnd() * 10, tint: rnd() });
    }
    rows.push(list);
  }
  return rows;
}
function drawClump(c, x, base, nowS, part, frogX) {
  // the frog parts the plants it's standing in, and plants it has passed fade back
  const near = Math.abs(x - frogX) < 46, passed = x < frogX - 46;
  const bend = near ? (x < frogX ? -18 : 18) : 0, sway = Math.sin(nowS * 1.6 + c.seed) * 3;
  ctx.globalAlpha = near ? 0.35 : passed ? 0.55 : 1;
  const greens = ['#4f9f45', '#5fb252', '#3f8a3a', '#6cbf5c'];
  // a leafy mound at the waterline: this is what actually covers the flat pads
  for (let i = 0; i < 5; i++) {
    const mx = x - c.w / 2 + (i + 0.5) * c.w / 5 + bend * 0.3, my = base - 10 - (i % 2) * 5;
    ell(mx, my, c.w / 5 + 10, 13 + (i % 3) * 3, greens[(i + Math.floor(c.tint * 4)) % 4]);
  }
  if (c.kind === 'grass' || c.kind === 'cattail') {
    const n = c.kind === 'grass' ? 7 : 4;
    for (let i = 0; i < n; i++) {
      const bx = x - c.w / 2 + (i + 0.5) * c.w / n, h = c.h * (0.7 + 0.3 * Math.sin(c.seed + i * 1.7) ** 2);
      const lean = (i - n / 2) * 4 + bend + sway, tx = bx + lean, ty = base - h;
      ctx.fillStyle = greens[(i + Math.floor(c.tint * 4)) % 4];
      ctx.beginPath(); ctx.moveTo(bx - 3.5, base);
      ctx.quadraticCurveTo(bx - 1, base - h * 0.6, tx, ty); ctx.quadraticCurveTo(bx + 1, base - h * 0.55, bx + 3.5, base); ctx.fill();
      if (c.kind === 'cattail' && i % 2 === 0) ell(tx - lean * 0.1, ty + 16, 4.5, 13, '#8a5a35', lean * 0.01);
    }
  } else {   // fern: arching fronds
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.42 + (bend + sway) * 0.012, len = c.h * (0.75 + 0.1 * (i % 2));
      ctx.strokeStyle = greens[(i + 1) % 4]; ctx.lineWidth = 3; ctx.lineCap = 'round';
      const ex = x + Math.cos(a) * len, ey = base + Math.sin(a) * len * 0.9;
      ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.4, base - len * 0.75, ex, ey); ctx.stroke();
      for (let k = 1; k <= 5; k++) {
        const q = k / 6, px = x + (ex - x) * q, py = base + (ey - base) * q - Math.sin(q * Math.PI) * len * 0.25;
        ell(px - 6, py, 7, 3, greens[(i + k) % 4], -0.5); ell(px + 6, py, 7, 3, greens[(i + k) % 4], 0.5);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function makeRun(idx, demo, rhythmStr) {
  const L = LEVELS[idx];
  const beats = L.beats || 4;
  const strs = Array.isArray(rhythmStr) ? rhythmStr : [rhythmStr];
  const parsed = strs.map(str => parse(str, beats));
  const events = [];
  parsed.forEach((pp, part) => pp.events.forEach(e => { e.part = part; events.push(e); }));
  events.sort((a, b) => a.beat - b.beat || a.part - b.part);
  const np = strs.length;
  const bpm = L.bpm * settings.speed;
  return {
    L, idx, demo, beats, rhythmStr: strs.join('  ||  '), events, measures: parsed[0].measures, total: parsed[0].total, nparts: np,
    bpm, spb: 60 / bpm, ppb: L.ppb || 120,
    songStart: 0, startMeasure: 0, state: 'preview', log: [], practiceFlags: 0, keys: new Map(),
    noteKeys: Array(np).fill(null), demoHeld: Array(np).fill(false), demoRelease: Array(np).fill(0),
    frogs: Array.from({ length: np }, () => ({ on: null, hopStart: null, squashT: -9, wobT: -9 })), fails: 0, combo: 0, maxCombo: 0,
    clumps: L.plants ? makeClumps(L, parsed[0].total, np) : null,
    pops: [], parts: [], fail: null, nextHalf: 0, melLast: [72, 55], melDir: [1, 1], doneT: 0,
  };
}
const evT0 = e => G.songStart + e.beat * G.spb;
const evT1 = e => G.songStart + (e.beat + e.dur) * G.spb;
const beatAt = t => (t - G.songStart) / G.spb;
const landX = e => e.beat + Math.min(OFF, e.dur * 0.5);
const standEnd = e => (e.dur >= 2 ? e.beat + e.dur - 0.32 : landX(e));
const startBeat = () => G.startMeasure * G.beats;

function startFrom(m) {
  const B = G.beats;
  G.startMeasure = m;
  G.songStart = AC.currentTime + 0.3 + B * G.spb - m * B * G.spb;
  G.nextHalf = (m * B - B) * 2;
  const prev = Array(G.nparts).fill(null);
  for (const e of G.events) {
    if (e.beat >= m * B - 1e-9) { e.judged = null; e.landT = null; e.flagged = false; }
    else if (e.type === 'note') prev[e.part] = e;
  }
  G.frogs = prev.map(on => ({ on, hopStart: null, squashT: -9, wobT: -9 }));
  G.keys.clear(); G.noteKeys.fill(null); G.demoHeld.fill(false); G.combo = 0; G.fail = null; G.state = 'play';
}

function frogPos(t, b, part = 0) {
  const f = G.frogs[part];
  const baseOf = e => (!e ? WATER_Y - 22 : e.shore ? WATER_Y - 24 : WATER_Y - 3);
  if (f.hopStart != null) {
    const p = (t - f.hopStart) / f.hopDur;
    if (p >= 0 && p < 1) {
      const e = p < 0.5 ? p * p * 2 : 1 - Math.pow(-2 * p + 2, 2) / 2;
      return { x: f.fromX + (f.toX - f.fromX) * e, y: f.fromY + (baseOf(f.on) - f.fromY) * p - Math.sin(Math.PI * p) * f.hopH, air: true };
    }
  }
  if (f.on) {
    const e = f.on;
    const x = e.dur >= 2 ? Math.max(landX(e), Math.min(standEnd(e), b)) : landX(e);
    return { x, y: baseOf(e) };
  }
  return { x: -0.6, y: baseOf(null) };
}
