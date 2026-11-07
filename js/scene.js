// Drawing the pond, pads, frogs, fish and plants
'use strict';

// =====================================================================
//  Rendering
// =====================================================================
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
let RS = 1;
const stage = document.getElementById('stage');
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(${(innerWidth - W * s) / 2}px, ${(innerHeight - H * s) / 2}px) scale(${s})`;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * s * dpr); cv.height = Math.round(H * s * dpr);
  RS = cv.width / W;
}
addEventListener('resize', fit); fit();

const lerp = (a, b, p) => a + (b - a) * p;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function ell(x, y, rx, ry, fill, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

let PPB = 130, VIEW_B = 0;
const sx = beat => ANCHOR + (beat - (VIEW_B + OFF)) * PPB;

function drawBackground(fog, nowS) {
  const night = fog === 2, T = theme();   // T: the habitat's colours (night looks the same everywhere)
  const sky = ctx.createLinearGradient(0, 0, 0, WATER_Y);
  if (night) { sky.addColorStop(0, '#141c46'); sky.addColorStop(1, '#3d4c8c'); }
  else { const c = fog === 1 ? T.fogSky : T.sky; sky.addColorStop(0, c[0]); sky.addColorStop(1, c[1]); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, WATER_Y + 2);
  const camPx = (VIEW_B + OFF) * PPB;
  if (night) {
    for (let i = 0; i < 40; i++) {
      const x = ((i * 137.5) % W), y = 175 + ((i * 71) % 190);
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(nowS * 2 + i); ell(x, y, 1.6, 1.6, '#fff'); }
    ctx.globalAlpha = 1;
    ell(960, 225, 34, 34, '#fff6d5'); ell(975, 215, 30, 30, '#3a4886');
  } else {
    ell(965, 225, 38, 38, fog ? '#fff3c4' : T.sun);
    for (let i = 0; i < 5; i++) {
      const x = ((i * 300 - camPx * 0.08) % 1500 + 1500) % 1500 - 200, y = 190 + (i % 3) * 30;
      ctx.globalAlpha = fog ? 0.6 : 0.9;
      ell(x, y, 46, 18, '#fff'); ell(x + 30, y - 10, 30, 18, '#fff'); ell(x - 26, y - 4, 26, 14, '#fff');
    }
    ctx.globalAlpha = 1;
  }
  // hills
  const hillCols = night ? ['#26405a', '#2d5a52'] : T.hills;
  [[0.15, 380, 260, 80, 520], [0.3, 410, 200, 60, 380]].forEach(([par, y, rx, ry, step], li) => {
    const off = ((camPx * par) % step + step) % step;
    for (let x = -step; x < W + step; x += step) ell(x - off, y + 30, rx, ry, hillCols[li]);
  });
  // water
  const wg = ctx.createLinearGradient(0, WATER_Y, 0, H);
  if (night) { wg.addColorStop(0, '#22406a'); wg.addColorStop(1, '#0e1d3a'); }
  else { wg.addColorStop(0, T.water[0]); wg.addColorStop(1, T.water[1]); }
  ctx.fillStyle = wg; ctx.fillRect(0, WATER_Y, W, H - WATER_Y);
  ctx.strokeStyle = night ? 'rgba(180,200,255,0.18)' : 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  [[WATER_Y + 28, 0.9], [WATER_Y + 62, 1.0], [WATER_Y + 104, 1.1], [WATER_Y + 150, 1.2]].forEach(([y, sp], i) => {
    const step = 110, off = ((camPx * sp + i * 37) % step + step) % step;
    for (let x = -step; x < W + step; x += step) { ctx.beginPath(); ctx.moveTo(x - off, y); ctx.lineTo(x - off + 26 + i * 4, y); ctx.stroke(); }
  });
}

// The far bank: grass, flowers, a little mushroom house and a finish flag.
function drawShore(night) {
  const x0 = sx(G.total + 0.3);
  if (x0 > W + 20) return;
  const grass = night ? '#2f5a3f' : theme().grass, grassDark = night ? '#244a33' : theme().grassDark, dirt = night ? '#4a3a2c' : '#a8743f';
  const top = WATER_Y - 24;
  ctx.beginPath();
  ctx.moveTo(x0 - 10, H); ctx.lineTo(x0 - 10, WATER_Y + 40);
  ctx.quadraticCurveTo(x0 - 6, top + 4, x0 + 50, top); ctx.lineTo(W + 20, top - 6); ctx.lineTo(W + 20, H); ctx.closePath();
  ctx.fillStyle = grass; ctx.fill();
  ctx.fillStyle = dirt; ctx.beginPath(); ctx.moveTo(x0 - 10, H); ctx.lineTo(x0 - 10, WATER_Y + 40); ctx.quadraticCurveTo(x0 - 4, WATER_Y + 18, x0 + 14, WATER_Y + 8);
  ctx.lineTo(x0 + 14, H); ctx.closePath(); ctx.fill();
  ctx.fillStyle = grassDark;
  for (let i = 0; i < 18; i++) { const gx = x0 + 30 + i * 37, gy = top + 10 + (i % 3) * 30; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 4, gy - 10); ctx.lineTo(gx + 8, gy); ctx.fill(); }
  const fl = night ? ['#c9b8ff', '#9fd0ff'] : ['#ff9fb8', '#ffe066', '#ffffff'];
  for (let i = 0; i < 12; i++) { const fx = x0 + 60 + i * 53, fy = top + 22 + ((i * 37) % 70); ell(fx, fy, 4, 4, fl[i % fl.length]); ell(fx, fy, 1.6, 1.6, '#f0a800'); }
  // finish flag
  const fx = x0 + 16;
  ctx.strokeStyle = '#6b4520'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx, top + 4); ctx.lineTo(fx, top - 70); ctx.stroke();
  ctx.fillStyle = '#e0457b'; ctx.beginPath(); ctx.moveTo(fx + 2, top - 70); ctx.lineTo(fx + 40, top - 58); ctx.lineTo(fx + 2, top - 46); ctx.fill();
  // mushroom house
  const hx = x0 + 290, hy = top - 2;
  ctx.fillStyle = night ? '#d8ccb4' : '#fff3dc'; rr(hx - 26, hy - 46, 52, 46, 10); ctx.fill();
  ctx.fillStyle = night ? '#6b4a2c' : '#8a5a35'; rr(hx - 8, hy - 26, 16, 26, 7); ctx.fill();
  ell(hx + 14, hy - 30, 5, 5, night ? '#ffe9a0' : '#9fdcff');
  ctx.fillStyle = night ? '#a8443c' : '#e0574f'; ctx.beginPath(); ctx.ellipse(hx, hy - 46, 52, 34, 0, Math.PI, 0); ctx.fill();
  for (const [dx, dy, r] of [[-22, -60, 7], [6, -70, 6], [28, -56, 5], [-4, -52, 4]]) ell(hx + dx, hy + dy, r, r * 0.8, '#fff8ea');
}

function drawReeds(beatX, night, tall = 1) {
  const x = sx(beatX);
  if (x < -40 || x > W + 40) return;
  ctx.lineCap = 'round';
  [[-8, 80, -0.08], [3, 98, 0.03], [12, 70, 0.1]].forEach(([dx, h0, lean]) => {
    const h = h0 * tall;
    ctx.strokeStyle = night ? '#3f6b4a' : '#5a9e48'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + dx, WATER_Y + 4); ctx.quadraticCurveTo(x + dx, WATER_Y - h / 2, x + dx + lean * h, WATER_Y - h); ctx.stroke();
    ell(x + dx + lean * h * 0.92, WATER_Y - h + 14, 4.5, 12, night ? '#5b4636' : '#8a5a35', lean);
  });
}

function drawPad(e, nowT, alpha = 1) {
  const x0 = sx(e.beat + 0.06), x1 = sx(e.beat + e.dur - 0.1);
  if (x1 < -60 || x0 > W + 60) return;
  ctx.globalAlpha = alpha;
  const cx = (x0 + x1) / 2, rx = (x1 - x0) / 2, ry = 10 + Math.min(4, rx / 30), cy = WATER_Y + 2;
  ell(cx, cy + 6, rx + 4, ry, 'rgba(20,70,80,0.18)');
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI / 2 + 0.3, Math.PI / 2 - 0.3 + Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = e.judged === 'perfect' ? '#69c457' : '#5cb64d'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = '#3d8a3a'; ctx.stroke();
  ell(cx, cy - 2, rx * 0.8, ry * 0.55, 'rgba(255,255,255,0.12)');
  // hold glow on long pads
  if (e.dur >= 2 && G.frogs[e.part].on === e && G.state === 'play' && partHeld(e.part)) {
    const p = clamp((nowT - evT0(e)) / ((evT1(e) - evT0(e)) * 0.8), 0, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, cy - 20, (x1 - x0) * p, 40); ctx.clip();
    ell(cx, cy, rx, ry, 'rgba(255,240,140,0.55)'); ctx.restore();
  }
  // flower bloom on perfect
  if (e.judged === 'perfect' && e.landT != null) {
    const s = clamp((nowT - e.landT) / 0.25, 0, 1);
    const fx = x0 + Math.min(18, rx * 0.4), fy = cy - 6;
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; ell(fx + Math.cos(a) * 5 * s, fy + Math.sin(a) * 3 * s, 4.5 * s, 3 * s, '#ff9fb8'); }
    ell(fx, fy, 2.6 * s, 2 * s, '#ffe066');
  }
  ctx.globalAlpha = 1;
}

let frogTint = null;   // set while drawing the bottom line's (blue) frog
function drawFrog(x, y, o = {}) {
  const s = o.scale || 1, sq = o.squash || 0;
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.scale(s * (1 + sq * 0.3), s * (1 - sq * 0.3));
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  const tint = o.color ? null : frogTint;
  const body = o.color || (tint && tint.color) || '#7fd45e', dark = o.dark || (tint && tint.dark) || '#5cb84a';
  ell(-18, -6, 12, 8, dark); ell(18, -6, 12, 8, dark);
  ell(0, -20, 25, 20, body);
  ell(0, -14, 15, 11, '#dcf7bf');
  if (o.croak > 0) { const k = o.croak; ell(0, -13, 9 + 9 * k, 6 + 8 * k, '#f7f0c6'); ctx.strokeStyle = 'rgba(150,140,90,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, -13, 9 + 9 * k, 6 + 8 * k, 0, 0, Math.PI * 2); ctx.stroke(); }
  for (const dx of [-12, 12]) {
    ell(dx, -37, 10, 10, body); ell(dx, -38, 7, 7, '#fff');
    if (o.mood === 'dizzy') {
      ctx.strokeStyle = '#2b3a2e'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(dx - 3, -41); ctx.lineTo(dx + 3, -35); ctx.moveTo(dx + 3, -41); ctx.lineTo(dx - 3, -35); ctx.stroke();
    } else {
      ell(dx + (o.look || 1.5), -38, 3.6, 3.8, '#1f2a22'); ell(dx + (o.look || 1.5) + 1.2, -39.5, 1.2, 1.2, '#fff');
      if (o.mood === 'sad') { ctx.fillStyle = body; ctx.fillRect(dx - 8, -46, 16, 6); }
    }
  }
  ctx.globalAlpha = (o.alpha != null ? o.alpha : 1) * 0.55;
  ell(-17, -23, 4.5, 3, '#ff8fa3'); ell(17, -23, 4.5, 3, '#ff8fa3');
  ctx.globalAlpha = o.alpha != null ? o.alpha : 1;
  ctx.strokeStyle = '#2b3a2e'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  if (o.mood === 'sing') { ctx.stroke(); ell(0, -24, 4.5, 5.5, '#7a2a2a'); ctx.beginPath(); }
  else if (o.mood === 'sad' || o.mood === 'dizzy') ctx.arc(0, -19, 5, Math.PI * 1.2, Math.PI * 1.8);
  else ctx.arc(0, -26, 6, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();
  ell(-10, -1, 6, 3, dark); ell(10, -1, 6, 3, dark);
  if (o.glasses) {
    ctx.strokeStyle = '#6b4b2a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-12, -38, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(12, -38, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(4, -38); ctx.stroke();
    ctx.fillStyle = '#f4f4f4'; ell(-5, -22.5, 6, 2.6, '#f4f4f4'); ell(5, -22.5, 6, 2.6, '#f4f4f4');
  }
  if (o.extra) o.extra();
  ctx.restore();
}

function drawFish(x, y, ang, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); const s = o.scale || 1; ctx.scale(s * (o.flip ? -1 : 1), s);
  const c = '#ff8a65', b = '#ffd2bd';
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-46, -15); ctx.lineTo(-42, 0); ctx.lineTo(-46, 15); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, -16); ctx.lineTo(4, -31); ctx.lineTo(12, -15); ctx.closePath(); ctx.fill();
  ell(0, 0, o.full ? 34 : 31, o.full ? 24 : 19, c);
  ell(4, 7, 21, 9, b);
  ell(-10, -6, 3, 3, '#f06a45'); ell(-16, 3, 2.4, 2.4, '#f06a45');
  ell(15, -6, 6, 6, '#fff'); ell(16.5, -6, 3, 3.2, '#1f2a22');
  if (o.open) {
    ell(27, 4, 8, 8, '#7a2a2a');
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(22, -3); ctx.lineTo(25, 2); ctx.lineTo(28, -3); ctx.fill();
  } else if (o.full) {
    ell(27, -2, 4, 4, '#7fd45e'); ell(27, -2, 2.6, 2.6, '#fff'); ell(27.5, -2, 1.3, 1.3, '#1f2a22');
    ctx.strokeStyle = '#7a2a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(22, 6); ctx.lineTo(31, 5); ctx.stroke();
  } else {
    ctx.strokeStyle = '#7a2a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(24, 5, 5, 0.2, 1.6); ctx.stroke();
  }
  ctx.restore();
}

function ripple(x, y, p, night) {
  ctx.strokeStyle = night ? `rgba(200,220,255,${0.6 * (1 - p)})` : `rgba(255,255,255,${0.8 * (1 - p)})`;
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y, 10 + 40 * p, 3 + 9 * p, 0, 0, Math.PI * 2); ctx.stroke();
}

function fishArc(r, p) {
  const xA = r.beat + r.dur + 0.15, xB = r.beat + 0.05;
  const h = (95 + 25 * Math.min(r.dur, 2)) * (G.nparts > 1 ? 0.7 : 1);
  const at = q => ({ x: sx(lerp(xA, xB, q)), y: WATER_Y + 22 - Math.sin(Math.PI * q) * h });
  const a = at(p), b2 = at(Math.min(1, p + 0.02));
  return { x: a.x, y: a.y, ang: Math.atan2(b2.y - a.y, b2.x - a.x) + Math.PI, xA: sx(xA), xB: sx(xB) };
}
