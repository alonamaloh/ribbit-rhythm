// Drawing the band and the whole frame
'use strict';

// ---------- band ----------
function drawBand(b) {
  const y = H - 26, phase = ((b % 1) + 1) % 1, beatHit = Math.max(0, 1 - phase * 4);   // 1 right on the beat
  const n = bandSize(), grooving = G && G.state === 'play', folk = !!G && habitatOf(G.L).band === 'folk';
  // the log stage
  ell(165, y + 10, 160, 20, '#8a5a35'); ell(165, y + 4, 156, 14, '#a8743f');
  ell(10, y + 8, 12, 18, '#c99a63'); ell(10, y + 8, 7, 11, '#a8743f');
  ctx.globalAlpha = 0.9; ell(120, y - 4, 22, 6, '#6fbf5a'); ell(290, y - 4, 16, 5, '#6fbf5a'); ctx.globalAlpha = 1;
  const ghost = { color: 'rgba(255,255,255,0.35)', dark: 'rgba(255,255,255,0.25)', alpha: 0.5 };
  const bob = on => (on && grooving ? -Math.abs(Math.sin(phase * Math.PI)) * 5 : 0);
  // 🥁 drummer
  { const x = 52, on = n >= 1;
    drawFrog(x, y + bob(on), on ? { scale: 0.62, color: '#5aa84a', dark: '#3f8a35' } : { scale: 0.62, ...ghost });
    ctx.globalAlpha = on ? 1 : 0.4;
    if (folk) {   // a wooden stomp box (the frog taps it with a foot... well, a stick)
      ctx.fillStyle = '#b98552'; ctx.strokeStyle = '#6b4520'; ctx.lineWidth = 2; ctx.fillRect(x + 12, y - 20, 30, 20); ctx.strokeRect(x + 12, y - 20, 30, 20);
      ctx.beginPath(); ctx.moveTo(x + 12, y - 10); ctx.lineTo(x + 42, y - 10); ctx.stroke();
    } else { ctx.fillStyle = '#e0574f'; ctx.fillRect(x + 12, y - 22, 30, 22); ell(x + 27, y - 22, 15, 5, '#fff3e0'); ell(x + 27, y, 15, 5, '#c0453e'); }
    if (on) { const sa = -0.9 + beatHit * 0.9; ctx.strokeStyle = '#6b4520'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + 10, y - 26); ctx.lineTo(x + 10 + Math.cos(sa) * 20, y - 26 + Math.sin(sa) * 20); ctx.stroke(); }
    ctx.globalAlpha = 1; }
  // 🎸 bass player with an upright bass
  { const x = 125, on = n >= 2;
    ctx.globalAlpha = on ? 1 : 0.4;
    ctx.save(); ctx.translate(x + 20, y - 18); ctx.rotate(0.18 + (on ? Math.sin(phase * Math.PI * 2) * 0.04 : 0));
    ell(0, 6, 11, 15, '#a0522d'); ell(0, -10, 8, 10, '#a0522d'); ctx.fillStyle = '#5a2e12'; ctx.fillRect(-1.5, -38, 3, 34);
    ctx.restore(); ctx.globalAlpha = 1;
    drawFrog(x, y + bob(on), on ? { scale: 0.66, color: '#3f9a6a', dark: '#2c7a52' } : { scale: 0.66, ...ghost }); }
  // 🎤 two singing frogs
  for (let k = 0; k < 2 && n >= 3; k++) {   // (the lighter band of the first levels has no singers or hi-hat)
    const x = 196 + k * 34, on = n >= 3;
    if (folk) {   // a banjo frog and a fiddle frog instead of singers
      drawFrog(x, y + bob(on) * (k ? 0.6 : 1), { scale: 0.52, color: '#a8c45a', dark: '#87a03f' });
      ctx.save(); ctx.translate(x + 6, y - 14); ctx.rotate(k ? -0.5 : -0.9 + (on ? Math.sin(phase * Math.PI * 2) * 0.08 : 0));
      if (!k) { ctx.fillStyle = '#5a2e12'; ctx.fillRect(-1.5, -30, 3, 30); ell(0, 2, 10, 10, '#f3e6c8'); ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 2, 10, 0, Math.PI * 2); ctx.stroke(); }
      else { ell(0, 0, 6, 9, '#a0522d'); ctx.fillStyle = '#5a2e12'; ctx.fillRect(-1, -20, 2, 12);
        ctx.strokeStyle = '#6b4520'; ctx.lineWidth = 1.5; ctx.beginPath(); const bo = Math.sin(phase * Math.PI * 2) * 6; ctx.moveTo(-14 + bo, -8); ctx.lineTo(14 + bo, 6); ctx.stroke(); }
      ctx.restore(); continue;
    }
    drawFrog(x, y + bob(on) * (k ? 0.6 : 1), on ? { scale: 0.52, color: '#5ccfc0', dark: '#3aa597', mood: 'sing' } : { scale: 0.52, ...ghost });
    if (on) { ctx.fillStyle = '#7a4fc9'; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center';
      ctx.globalAlpha = 1 - ((phase + k * 0.5) % 1); ctx.fillText('♪', x + 8 + k * 6, y - 40 - ((phase + k * 0.5) % 1) * 16); ctx.globalAlpha = 1; }
  }
  // ✨ hi-hat frog
  if (n >= 4) { const x = 292, on = n >= 4;
    ctx.globalAlpha = on ? 1 : 0.4; ctx.strokeStyle = '#6b6b6b'; ctx.lineWidth = 2;
    if (folk) {   // a washboard and a spoon
      ctx.fillStyle = '#c9ccd0'; ctx.fillRect(x - 32, y - 36, 22, 30); ctx.strokeStyle = '#8a5a35'; ctx.lineWidth = 3; ctx.strokeRect(x - 32, y - 36, 22, 30);
      ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 31, y - 32 + i * 4.5); ctx.lineTo(x - 11, y - 32 + i * 4.5); ctx.stroke(); }
      ctx.strokeStyle = '#6b6b6b'; ctx.lineWidth = 2.5; const sp = (phase * 2 % 1) * 20; ctx.beginPath(); ctx.moveTo(x - 6, y - 34 + sp); ctx.lineTo(x - 22, y - 30 + sp); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(x - 20, y - 2); ctx.lineTo(x - 20, y - 34); ctx.stroke();
      ell(x - 20, y - 36 + (on ? beatHit * 2 : 0), 13, 3, '#e8c547'); ell(x - 20, y - 32, 13, 3, '#d4b23a');
    }
    ctx.globalAlpha = 1;
    drawFrog(x, y + bob(on), on ? { scale: 0.5, color: '#c6dc4f', dark: '#9db53a' } : { scale: 0.5, ...ghost }); }
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '800 12px ui-rounded, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(folk ? 'MARSH BAND' : 'POND BAND', 165, H - 4);
}

// ---------- main draw ----------
let lastFrame = performance.now();
function render() {
  const nowMs = performance.now(), dt = Math.min(0.05, (nowMs - lastFrame) / 1000); lastFrame = nowMs;
  ctx.setTransform(RS, 0, 0, RS, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.save(); rr(0, 0, W, H, 18); ctx.clip();

  if (!G) {   // idle menu scene
    CARD.h = 148;
    PPB = 130; VIEW_B = nowMs / 1000 * 0.4;
    drawBackground(0, nowMs / 1000);
    const every = 4 * theme().reedsEvery;
    for (let m = -4; m < 40 / theme().reedsEvery; m++) drawReeds(m * every + Math.floor(VIEW_B / 4) * 4, false, theme().reedsEvery < 1 && m % 2 ? 1.3 : 1);
    drawFrog(sx(VIEW_B + 0.28), WATER_Y - 3 - Math.abs(Math.sin(nowMs / 400)) * 10, {});
    ctx.restore(); return;
  }

  CARD.h = cardHeightFor(G.L);
  const playing = mode !== 'intro' && G.state !== 'preview';
  const t = playing && AC ? tp() : 0;
  if (playing) update(t);
  let target;
  if (!playing) target = -G.beats + 0.6;
  else if (G.state === 'fail') target = G.fail.beatFrozen;
  else target = Math.min(beatAt(t), G.total + 0.6);
  if (Math.abs(target - camB) > 0.6) camB += (target - camB) * Math.min(1, dt * 7); else camB = target;
  PPB = G.ppb; VIEW_B = camB;
  const b = playing ? beatAt(t) : target;
  const fog = G.L.fog, night = fog === 2;
  const nowS = nowMs / 1000;

  drawBackground(fog, nowS);
  // reeds at every bar line (in the Reed Marsh, also halfway through each bar, and taller)
  const re = theme().reedsEvery;
  for (let k = 0; k <= G.measures / re; k++) drawReeds(k * G.beats * re - 0.05, night, re < 1 && k % 2 ? 1.3 : 1);

  drawShore(night);

  // ---- each part gets its own row of pads (a duet's bottom line is the front row) ----
  let frogScreen = { x: sx(-0.6), y: WATER_Y - 22 };
  const fishDraws = [];
  for (let p = 0; p < G.nparts; p++) {
    const DY = rowDY(p);
    ctx.save(); ctx.translate(0, DY); frogTint = FROG_TINT[p];
    const fishPush = fn => fishDraws.push(() => { ctx.save(); ctx.translate(0, DY); fn(); ctx.restore(); });
    // bubble hints for upcoming rests
    if (fog !== 2) for (const r of G.events) {
      if (r.part !== p || r.type !== 'rest' || (playing && t >= evT0(r))) continue;
      const x = sx(r.beat + r.dur / 2 + 0.1);
      if (x < -20 || x > W + 20) continue;
      for (let i = 0; i < 3; i++) {
        const q = ((nowS * 0.8 + i / 3) % 1);
        ctx.globalAlpha = 0.7 * (1 - q); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x + Math.sin(q * 6 + i) * 5 + (i - 1) * 9, WATER_Y + 40 - q * 34, 2.5 + i, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // start rock
    const rx = sx(-0.6);
    ell(rx, WATER_Y + 4, 50, 22, night ? '#4c5470' : '#9aa4a8'); ell(rx - 6, WATER_Y - 2, 40, 15, night ? '#5d6684' : '#b6c0c3');
    // pads
    for (const e of G.events) {
      if (e.part !== p || e.type !== 'note') continue;
      if (e.judged && e.landT == null) e.landT = G.frogs[p].landT || t;
      if (fog === 2 && !e.judged) continue;
      drawPad(e, t);
    }
    // frog / fish
    if (G.state === 'fail' && G.fail.part === p) {
      const F = G.fail, a = t - F.t;
      const fx = sx(F.x), fy = F.y;
      if (p === 0) frogScreen = { x: fx, y: fy };
      if (F.type === 'fish') {
        const fishX = sx(F.x + 0.65);
        if (a < 0.3) {
          const q = a / 0.3;
          drawFrog(lerp(fx, fishX - 10, q), lerp(fy, WATER_Y - 80, q) - Math.sin(q * Math.PI) * 30, { squash: -0.3 });
          fishPush(() => drawFish(fishX, lerp(WATER_Y + 40, WATER_Y - 70, q), -0.4, { open: true, flip: true, scale: 1.15 }));
        } else if (a < 1.1) {
          fishPush(() => drawFish(fishX, WATER_Y - 70 + Math.sin(a * 9) * 4, Math.sin(a * 28) * 0.12, { full: true, flip: true, scale: 1.2 }));
          if (a < 1.0) { ctx.save(); ctx.fillStyle = '#c0563f'; ctx.font = '900 30px ui-rounded, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GULP!', fishX, WATER_Y - 120 - (a - 0.3) * 20); ctx.restore(); }
        } else if (a < 1.5) {
          const q = (a - 1.1) / 0.4;
          fishPush(() => drawFish(fishX, lerp(WATER_Y - 70, WATER_Y + 60, q), 0.6, { flip: true, scale: 1.2 }));
          drawFrog(lerp(fishX - 20, fx, q), lerp(WATER_Y - 80, fy, q) - Math.sin(q * Math.PI) * 60, { mood: 'dizzy', rot: q * Math.PI * 2 });
          if (a < 1.3) { ctx.fillStyle = '#7a2a2a'; ctx.font = '900 24px ui-rounded, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('bleh!', fishX - 30, WATER_Y - 110); }
        } else {
          drawFrog(fx, fy, { mood: 'dizzy', extra: () => {
            for (let i = 0; i < 3; i++) { const an = nowS * 4 + i * 2.1; ctx.fillStyle = '#ffd23f'; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('★', Math.cos(an) * 22, -56 + Math.sin(an) * 6); }
          } });
          if (a < 1.9) ripple(fishX, WATER_Y + 8, (a - 1.5) / 0.4, night);
        }
      } else {
        const wx = sx(F.x + 0.55);
        if (a < 0.45) {
          const q = a / 0.45;
          drawFrog(lerp(fx, wx, q), lerp(fy, WATER_Y + 40, q * q) - Math.sin(q * Math.PI) * 25, { rot: q * 0.8, alpha: 1 - Math.max(0, q - 0.7) * 3 });
        } else {
          if (!F.splashed) { F.splashed = true; for (let i = 0; i < 14; i++) G.parts.push({ x: wx, y: WATER_Y + DY, vx: (Math.random() - 0.5) * 220, vy: -150 - Math.random() * 200, life: 0.8, col: night ? '#a9c8ff' : '#e8fbff', r: 3 + Math.random() * 3 }); }
          if (a < 1.3) { ripple(wx, WATER_Y + 6, (a - 0.45) / 0.85, night); }
          else if (a < 1.65) { const q = (a - 1.3) / 0.35; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, WATER_Y + 4); ctx.clip(); drawFrog(wx, WATER_Y + 40 - q * 25, { mood: 'sad' }); ctx.restore(); }
          else if (a < 2.0) { const q = (a - 1.65) / 0.35; drawFrog(lerp(wx, fx, q), lerp(WATER_Y + 15, fy, q) - Math.sin(q * Math.PI) * 45, { mood: 'sad' }); }
          else drawFrog(fx, fy, { mood: 'sad', extra: () => { ell(14, -50, 3, 4.5, '#7cc6e8'); } });
        }
      }
    } else {
      const fp = playing ? frogPos(t, b, p) : { x: -0.6, y: WATER_Y - 22, air: false };
      const f = G.frogs[p];
      if (playing && f.landFx && t >= f.landT) {
        const lx = sx(f.toX);
        for (let i = 0; i < 6; i++) G.parts.push({ x: lx, y: WATER_Y + DY, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 80, life: 0.45, col: night ? '#a9c8ff' : '#ffffff', r: 2 + Math.random() * 2 });
        if (f.landFx === 'perfect') for (let i = 0; i < 5; i++) G.parts.push({ x: lx, y: WATER_Y - 40 + DY, vx: (Math.random() - 0.5) * 160, vy: -80 - Math.random() * 90, life: 0.6, col: '#ffd23f', r: 3, star: true });
        f.landFx = null; f.squashT = t;
      }
      let squash = Math.max(0, 1 - (t - f.squashT) / 0.16) * 0.55;
      if (fp.air) squash = -0.25;
      const wob = t - f.wobT < 0.4 ? Math.sin((t - f.wobT) * 40) * 0.2 * (1 - (t - f.wobT) / 0.4) : 0;
      let idleBob = 0;
      if (!playing || b < startBeat()) idleBob = -Math.abs(Math.sin(nowS * 2.2 + p)) * 3;
      if (p === 0) frogScreen = { x: sx(fp.x), y: fp.y };
      let croak = 0;
      if (G.croaks) for (const c of G.croaks) { const a = t - c.t; if (c.p === p && a > 0 && a < 0.32) croak = Math.max(croak, Math.sin(Math.PI * ((a < 0.13 ? a / 0.13 : (a - 0.15) / 0.17)))); }
      drawFrog(sx(fp.x), fp.y + idleBob, { squash, rot: wob, glasses: G.demo, look: fp.air ? 3 : 1.5, croak: Math.max(0, croak), mood: croak > 0.2 ? 'sing' : undefined });
      // fish leaping during this line's rests
      if (playing && G.state !== 'fail') for (const r of G.events) {
        if (r.part !== p || r.type !== 'rest' || r.beat < startBeat() - 1e-9) continue;
        const t0 = evT0(r), t1 = evT1(r);
        if (t < t0 - 0.05 || t > t1 + 0.4) continue;
        const q = (t - t0) / (t1 - t0);
        const arc = fishArc(r, clamp(q, 0, 1));
        if (q >= 0 && q <= 1) fishPush(() => drawFish(arc.x, arc.y, arc.ang, { flip: true, scale: (r.dur >= 2 ? 1.3 : 1) * (G.nparts > 1 ? 0.85 : 1), open: q > 0.35 && q < 0.65 }));
        if (q < 0.25) ripple(arc.xA, WATER_Y + 8, clamp(q / 0.25, 0, 1), night);
        if (q > 0.85) ripple(arc.xB, WATER_Y + 8, clamp((q - 0.85) / 0.55, 0, 1), night);
      }
    }
    if (G.clumps) {
      const fx = sx(frogPos(t, b, p).x);
      for (const c of G.clumps[p]) { const x = sx(c.beat); if (x > -80 && x < W + 80) drawClump(c, x, WATER_Y + 16, nowS, p, playing ? fx : -999); }
    }
    frogTint = null; ctx.restore();
  }

  // fog
  if (fog === 1) {
    const edge = ANCHOR + 1.3 * PPB;
    const fg = ctx.createLinearGradient(edge, 0, edge + 110, 0);
    fg.addColorStop(0, 'rgba(236,245,247,0)'); fg.addColorStop(1, 'rgba(236,245,247,0.97)');
    ctx.fillStyle = fg; ctx.fillRect(edge, CARD.y + CARD.h, W - edge, H);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < 9; i++) { const x = edge + 60 + ((i * 113 + nowS * 12) % (W - edge)); ell(x, 300 + (i % 4) * 50, 70, 26, null); ctx.fill(); }
  } else if (fog === 2) {
    const g = ctx.createRadialGradient(frogScreen.x + 30, WATER_Y - 20, 50, frogScreen.x + 30, WATER_Y - 20, 210);
    g.addColorStop(0, 'rgba(8,12,35,0)'); g.addColorStop(1, 'rgba(8,12,35,0.9)');
    ctx.fillStyle = g; ctx.fillRect(0, CARD.y + CARD.h, W, H);
  }
  fishDraws.forEach(fn => fn());
  if (fog === 2) {   // fireflies
    for (let i = 0; i < 14; i++) {
      const x = (i * 97 + Math.sin(nowS * 0.7 + i) * 40 + 2000) % W, y = 220 + ((i * 53) % 220) + Math.cos(nowS + i) * 12;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(nowS * 3 + i * 1.7);
      ell(x, y, 6, 6, 'rgba(255,240,120,0.25)'); ell(x, y, 2, 2, '#fff59a');
    }
    const lx = frogScreen.x + Math.cos(nowS * 2) * 34, ly = frogScreen.y - 55 + Math.sin(nowS * 3) * 8;
    ctx.globalAlpha = 1; ell(lx, ly, 10, 10, 'rgba(255,240,120,0.3)'); ell(lx, ly, 3, 3, '#fff59a');
  }

  // particles
  G.parts = G.parts.filter(p => (p.life -= dt) > 0);
  for (const p of G.parts) {
    p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    ctx.globalAlpha = Math.min(1, p.life * 3);
    if (p.star) { ctx.fillStyle = p.col; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('★', p.x, p.y); }
    else ell(p.x, p.y, p.r, p.r, p.col);
  }
  ctx.globalAlpha = 1;

  // pops
  if (playing) {
    G.pops = G.pops.filter(p => t - p.t < (p.screenX != null ? 1.6 : 0.9));
    for (const p of G.pops) {
      const a = (t - p.t) / (p.screenX != null ? 1.6 : 0.9);
      if (a < 0) continue;
      ctx.globalAlpha = 1 - a * a; ctx.fillStyle = p.color; ctx.textAlign = 'center';
      ctx.font = `900 ${p.size}px ui-rounded, "Trebuchet MS", sans-serif`;
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      const px = p.screenX != null ? p.screenX : sx(p.beatX);
      ctx.strokeText(p.text, px, p.y - a * 35); ctx.fillText(p.text, px, p.y - a * 35);
    }
    ctx.globalAlpha = 1;
  }

  // on touch screens the tap pads sit in the bottom corners: move the band and the counter out of their way
  const touchPads = mode === 'play' && isTouch();
  ctx.save(); if (touchPads && G.nparts > 1) ctx.translate(300, 0); drawBand(b); ctx.restore();

  // combo
  if (playing && G.combo >= 2 && G.state === 'play' && !G.demo) {
    ctx.textAlign = 'right'; ctx.font = '900 24px ui-rounded, sans-serif'; ctx.fillStyle = night ? '#fff59a' : '#2f7a3a';
    ctx.fillText(`${G.combo} in a row!`, W - 24, touchPads ? CARD.y + CARD.h + 95 : H - 22);
  }

  // count-in
  if (playing && G.state === 'play' && b < startBeat() && b >= startBeat() - G.beats) {
    const k = Math.floor(b - (startBeat() - G.beats)) + 1, fr = b - Math.floor(b);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `900 ${Math.round(90 - fr * 25)}px ui-rounded, "Trebuchet MS", sans-serif`;
    ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.fillStyle = '#e0457b';
    ctx.globalAlpha = 1 - fr * 0.6;
    const cy = CARD.y + CARD.h + 135; ctx.strokeText(String(k), W / 2, cy); ctx.fillText(String(k), W / 2, cy);
    ctx.globalAlpha = 1; ctx.font = '800 22px ui-rounded, sans-serif'; ctx.fillStyle = night ? '#fff' : '#2b3a2e';
    ctx.fillText(G.startMeasure > 0 ? `Try again from measure ${G.startMeasure + 1}…` : (G.demo ? 'Listen and watch…' : 'Get ready…'), W / 2, CARD.y + CARD.h + 70);
    ctx.textBaseline = 'alphabetic';
  }

  // fail message
  if (G.state === 'fail' && t - G.fail.t > 0.55) {
    const msg = G.fail.msg;
    ctx.font = '800 23px ui-rounded, "Trebuchet MS", sans-serif';
    const w = ctx.measureText(msg).width + 50;
    ctx.globalAlpha = clamp((t - G.fail.t - 0.55) * 4, 0, 1);
    const by = CARD.y + CARD.h + 30; rr(W / 2 - w / 2, by, w, 54, 27); ctx.fillStyle = '#fff8ea'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = '#2b3a2e'; ctx.stroke();
    ctx.fillStyle = '#2b3a2e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(msg, W / 2, by + 28);
    ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = 1;
  }

  drawNotation(t, b);
  ctx.restore();
}

function loop() { try { render(); } catch (err) { console.error(err); } requestAnimationFrame(loop); }
