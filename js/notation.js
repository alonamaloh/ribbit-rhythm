// Drawing the notation card
'use strict';

// ---------- notation ----------
function head(x, y, filled, whole) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(whole ? 0 : -0.35);
  ctx.beginPath(); ctx.ellipse(0, 0, whole ? 11 : 9, whole ? 7.5 : 6.6, 0, 0, Math.PI * 2);
  if (filled) ctx.fill(); else { ctx.lineWidth = whole ? 3.4 : 2.6; ctx.stroke(); }
  ctx.restore();
}
function drawSymbol(e, x, y, col) {
  ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const stem = (sx2) => { ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(sx2 + 8, y - 2); ctx.lineTo(sx2 + 8, y - 44); ctx.stroke(); };
  switch (e.sym) {
    case 'q': head(x, y, true); stem(x); break;
    case 'h': head(x, y, false); stem(x); break;
    case 'w': head(x, y, false, true); break;
    case 'e':
      head(x, y, true); stem(x);
      if (!e.beamed) { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 8, y - 44); ctx.quadraticCurveTo(x + 22, y - 30, x + 18, y - 18); ctx.stroke(); }
      if (e.beamTo) { const x2 = NX(e.beamTo.beat); ctx.fillRect(x + 6.7, y - 46, x2 - x + 2.6, 7); }
      break;
    case 'qr':
      ctx.lineWidth = 3.6; ctx.beginPath();
      ctx.moveTo(x - 4, y - 24); ctx.lineTo(x + 5, y - 13); ctx.lineTo(x - 3, y - 3); ctx.lineTo(x + 5, y + 8);
      ctx.quadraticCurveTo(x - 8, y + 3, x - 1, y + 18); ctx.stroke(); break;
    case 'hr': ctx.fillRect(x - 10, y - 8, 20, 8); ctx.fillRect(x - 15, y - 1.2, 30, 2.4); break;
    case 'wr': ctx.fillRect(x - 10, y, 20, 8); ctx.fillRect(x - 15, y - 1.2, 30, 2.4); break;
  }
}

let NX = beat => sx(beat + OFF);   // notation x for a beat (changes in page mode)
function drawNotation(nowT, b) {
  const guide = guideOf(G.L), live = G.state !== 'preview';
  ctx.save();
  rr(CARD.x, CARD.y, CARD.w, CARD.h, 20); ctx.fillStyle = '#fff8ea'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#2b3a2e'; ctx.stroke();
  rr(CARD.x + 2, CARD.y + 2, CARD.w - 4, CARD.h - 4, 18); ctx.clip();
  const y = LINE_Y, B = G.beats;
  ctx.font = '900 30px ui-rounded, "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#2b3a2e'; ctx.fillStyle = '#2b3a2e';

  // which measures are shown, and where
  let shown;   // list of measure indices to draw
  if (guide === 'page') { drawPageLines(b, live); ctx.restore(); drawCardLabel(); return; }
  const SY = staffYs();   // one staff per part
  {
    NX = beat => sx(beat + OFF);
    shown = null;
    if (guide === 'full' && live) for (let p = 0; p < G.nparts; p++) {
      const cur = G.events.find(e => e.part === p && b >= e.beat && b < e.beat + e.dur);
      if (cur) {
        ctx.fillStyle = cur.type === 'rest' ? 'rgba(255,138,101,0.22)' : 'rgba(127,212,94,0.28)';
        const hgt = G.nparts > 1 ? 76 : 104;
        rr(NX(cur.beat) - 18, SY[p] - (G.nparts > 1 ? 52 : 56), Math.max(36, cur.dur * PPB - 8), hgt, 12); ctx.fill();
      }
    }
    ctx.strokeStyle = '#2b3a2e'; ctx.fillStyle = '#2b3a2e'; ctx.lineWidth = 2;
    for (const yy of SY) { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Math.max(CARD.x, sx(-1.25)), yy); ctx.lineTo(sx(G.total), yy); ctx.stroke();
      const tsx = sx(-0.8); ctx.fillText(String(B), tsx, yy - 16); ctx.fillText('4', tsx, yy + 17); }
    const yTop = SY[0] - 30, yBot = SY[SY.length - 1] + 30;
    for (let m = 0; m <= G.measures; m++) {
      if (m === 0 && G.nparts === 1) continue;
      const x = m === 0 ? sx(-1.25) : sx(m * B) - 6;
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBot); ctx.stroke();
      if (m === G.measures) { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 7, yTop); ctx.lineTo(x + 7, yBot); ctx.stroke(); }
    }
  }
  const visible = e => !shown || shown.includes(e.measure);

  // notes
  for (const e of G.events) {
    if (!visible(e)) continue;
    const x = NX(e.beat);
    if (x < -40 || x > W + 40) continue;
    let col = '#2b3a2e';
    if (e.judged) col = e.judged === 'miss' ? '#d1495b' : '#3a9d4a';
    if (G.fail && G.state === 'fail' && e.measure === G.fail.measure && !e.judged) col = '#d1495b';
    drawSymbol(e, x, SY[e.part], col);
  }
  // counting numbers (only highlighted when the full guide is on)
  if (settings.counts) {
    ctx.textAlign = 'center';
    const curHalf = Math.floor(b * 2) / 2;
    for (let k = 0; k < G.total * 2; k++) {
      const bb = k / 2, m = Math.floor(bb / B);
      if (shown && !shown.includes(m)) continue;
      const x = NX(bb);
      if (x < -20 || x > W + 20) continue;
      const whole = k % 2 === 0;
      if (!whole && !G.events.some(e => Math.abs(e.beat - bb) < 1e-6)) continue;
      const active = guide === 'full' && live && Math.abs(bb - curHalf) < 1e-6;
      ctx.fillStyle = active ? '#e0457b' : '#8a978c';
      ctx.font = (active ? '900 21px ' : '700 17px ') + 'ui-rounded, "Trebuchet MS", sans-serif';
      ctx.fillText(whole ? String((bb % B) + 1) : '&', x, SY[SY.length - 1] + (G.nparts > 1 ? 42 : 46));
    }
  }
  // playhead only in the full guide
  if (guide === 'full') {
    ctx.strokeStyle = 'rgba(224,69,123,0.85)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(ANCHOR, CARD.y + 8); ctx.lineTo(ANCHOR, CARD.y + CARD.h - 8); ctx.stroke();
  }
  if (guide !== 'page') {
    const lg = ctx.createLinearGradient(CARD.x, 0, CARD.x + 120, 0);
    lg.addColorStop(0, 'rgba(255,248,234,1)'); lg.addColorStop(1, 'rgba(255,248,234,0)');
    ctx.fillStyle = lg; ctx.fillRect(CARD.x, CARD.y, 120, CARD.h);
  }
  if (G.nparts > 1) {   // hand badges, matching the frogs' colours
    [['R', 'J', '#7fd45e'], ['L', 'F', '#7cc8f2']].forEach(([hand, key, col], p) => {
      const yy = SY[p];
      ctx.fillStyle = col; ctx.strokeStyle = '#2b3a2e'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(CARD.x + 30, yy, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2b3a2e'; ctx.font = '900 17px ui-rounded, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(hand, CARD.x + 30, yy + 1);
      ctx.font = '800 12px ui-rounded, sans-serif'; ctx.fillText(key, CARD.x + 30, yy + 27);
    });
  }
  ctx.restore();
  drawCardLabel();
}
const DUET_CARD_H = 222;
function staffYs() { return G.nparts > 1 ? [CARD.y + 64, CARD.y + 150] : [LINE_Y]; }
const isDuetLevel = L => !!(L.parts || L.genParts);
function cardHeightFor(L) { return guideOf(L) === 'page' ? (isDuetLevel(L) ? DUET_PAGE_H : PAGE_CARD_H) : isDuetLevel(L) ? DUET_CARD_H : 148; }
function drawCardLabel() {
  const txt = G.L.name + (G.demo ? '  ·  👂 Grandpa Frog shows you how' : settings.practice ? '  ·  📝 Practice mode (no fails)' : '');
  ctx.font = '700 15px ui-rounded, "Trebuchet MS", sans-serif'; ctx.textBaseline = 'alphabetic';
  if (guideOf(G.L) === 'page' || G.nparts > 1) {   // tall card: put the label under it so it never covers notes
    ctx.textAlign = 'left'; ctx.fillStyle = G.L.fog === 2 ? '#dfe6ff' : '#2b3a2e';
    ctx.fillText(txt, CARD.x + 12, CARD.y + CARD.h + 24);
  } else {
    ctx.textAlign = 'right'; ctx.fillStyle = '#5d6b5f';
    ctx.fillText(txt, CARD.x + CARD.w - 18, CARD.y + 20);
  }
}

// "Ears only" view: real lines of music (2 measures per line), two lines visible.
// When the music reaches the next line, everything slides up, so the line you're
// playing is on top and the following line is revealed underneath. No beat cursor.
const PAGE_CARD_H = 244, LINE_GAP = 106, PER_LINE = 2, SLIDE_SEC = 0.4;
// Duets in the page view: each line is a two-staff system (right hand above, left hand below).
const DUET_PAGE_H = 330, DUET_LINE_GAP = 150, DUET_STAFF_GAP = 58;
function drawPageLines(b, live) {
  const B = G.beats, lb = PER_LINE * B, nLines = Math.ceil(G.measures / PER_LINE), duet = G.nparts > 1;
  const gapL = duet ? DUET_LINE_GAP : LINE_GAP, staffOff = duet ? [0, DUET_STAFF_GAP] : [0];
  // A line starts on the bottom row. As soon as the music reaches its second measure,
  // the sheet slides up one row: the current line moves to the top, the next line appears below.
  let scroll = 0;
  if (live) {
    const L = Math.floor(b / lb), slideAt = L * lb + B;
    const p = clamp((b - slideAt) / (SLIDE_SEC / G.spb), 0, 1);
    scroll = (L - 1) + p * p * (3 - 2 * p);
  }
  scroll = clamp(scroll, 0, Math.max(0, nLines - 1));
  const left = CARD.x + (duet ? 46 : 24);
  const X0 = CARD.x + (duet ? 100 : 86), X1 = CARD.x + CARD.w - 26, MW = (X1 - X0) / PER_LINE;
  const lineOf = m => Math.floor(m / PER_LINE);
  const rowY = l => CARD.y + (duet ? 62 : 64) + (l - scroll) * gapL;
  const measX = m => X0 + (m % PER_LINE) * MW;
  NX = beat => { const m = clamp(Math.floor(beat / B + 1e-9), 0, G.measures - 1); return measX(m) + 30 + (beat - m * B) / B * (MW - 50); };
  const cm = clamp(Math.floor(b / B), 0, G.measures - 1);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let l = Math.floor(scroll) - 1; l <= Math.floor(scroll) + 2; l++) {
    if (l < 0 || l >= nLines) continue;
    const y = rowY(l), yLast = y + staffOff[staffOff.length - 1];
    if (y < CARD.y - 120 || y > CARD.y + CARD.h + 60) continue;
    // fade lines that are sliding out of the top, and the one being revealed at the bottom
    ctx.globalAlpha = Math.min(clamp(1 - (scroll - l) * 1.4, 0.15, 1), clamp((2 - (l - scroll)) * 1.5, 0, 1));
    if (ctx.globalAlpha <= 0) continue;
    const mFirst = l * PER_LINE, mLast = Math.min(G.measures - 1, mFirst + PER_LINE - 1);
    ctx.strokeStyle = '#2b3a2e'; ctx.fillStyle = '#2b3a2e';
    for (const off of staffOff) { ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(left, y + off); ctx.lineTo(measX(mLast) + MW, y + off); ctx.stroke(); }
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(left, y - 30); ctx.lineTo(left, yLast + 30); ctx.stroke();
    if (l === 0) { ctx.font = '900 26px ui-rounded, "Trebuchet MS", sans-serif';
      for (const off of staffOff) { ctx.fillText(String(B), left + 28, y + off - 14); ctx.fillText('4', left + 28, y + off + 15); } }
    for (let m = mFirst; m <= mLast; m++) {
      const x = measX(m) + MW;
      ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x, yLast + 30); ctx.stroke();
      if (m === G.measures - 1) { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x + 6, y - 30); ctx.lineTo(x + 6, yLast + 30); ctx.stroke(); }
    }
    if (duet) {   // hand badges at the start of each line, coloured like the frogs
      [['R', '#7fd45e'], ['L', '#7cc8f2']].forEach(([hand, col], p) => {
        ctx.fillStyle = col; ctx.strokeStyle = '#2b3a2e'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(CARD.x + 26, y + staffOff[p], 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2b3a2e'; ctx.font = '900 13px ui-rounded, sans-serif'; ctx.fillText(hand, CARD.x + 26, y + staffOff[p] + 1);
      });
    }
    // which line is playing: a small marker at its left edge (measure-level only, no beat cursor)
    if (live && lineOf(cm) === l && b >= G.startMeasure * B) {
      ctx.fillStyle = '#e0457b';
      if (duet) { rr(CARD.x + 6, y - 22, 5, yLast - y + 44, 3); ctx.fill(); }
      else { ctx.font = '900 15px sans-serif'; ctx.fillText('▶', CARD.x + 14, y); }
    }
    for (const e of G.events) {
      if (e.measure < mFirst || e.measure > mLast) continue;
      let col = '#2b3a2e';
      if (e.judged) col = e.judged === 'miss' ? '#d1495b' : '#3a9d4a';
      if (G.fail && G.state === 'fail' && e.measure === G.fail.measure && !e.judged) col = '#d1495b';
      drawSymbol(e, NX(e.beat), y + staffOff[e.part || 0], col);
    }
    if (settings.counts) {
      ctx.fillStyle = '#8a978c'; ctx.font = '700 15px ui-rounded, "Trebuchet MS", sans-serif';
      for (let bb = mFirst * B; bb < (mLast + 1) * B; bb += 0.5) {
        const whole = Math.abs(bb % 1) < 1e-6;
        if (!whole && !G.events.some(e => Math.abs(e.beat - bb) < 1e-6)) continue;
        ctx.fillText(whole ? String((bb % B) + 1) : '&', NX(bb), yLast + (duet ? 38 : 40));
      }
    }
    ctx.globalAlpha = 1;
  }
}
