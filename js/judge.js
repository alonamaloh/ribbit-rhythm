// Judging hits and misses, finishing a level
'use strict';

function hit(n, q, t, dt = 0) {
  n.judged = q;
  if (G.log) G.log.push(`   hit    note at beat ${n.beat} (${n.sym}) ${q}, ${dt >= 0 ? '+' : ''}${(dt * 1000).toFixed(0)} ms`);
  const p = n.part, fp = frogPos(t, beatAt(t), p), f = G.frogs[p];
  const dist = Math.max(0.2, landX(n) - fp.x);
  Object.assign(f, { fromX: fp.x, fromY: fp.y, toX: landX(n), hopStart: t, on: n,
    hopDur: Math.min(0.18 + 0.05 * dist, Math.max(0.12, n.dur * G.spb * 0.6)), hopH: 26 + 20 * Math.min(dist, 3), landFx: G.demo ? 'demo' : q });
  f.landT = t + f.hopDur;
  G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo);

  const now = AC.currentTime;
  SND.hop(now);
  const pick = n.pitch;   // chosen when the run was set up, so a retry plays the same notes
  (LEAD[habitatOf(G.L).band] || LEAD.pop)(now, pick, p === 1 ? 0.36 : 0.32);
  if (G.log && settings.practice) G.log.push(`   note   ${pick}`);   // plays exactly when the player taps
  // Coaching: coming in early right after a long note usually means the long note was cut short.
  const prevE = prevInPart(n);
  if (dt < -0.09 && prevE && prevE.type === 'note' && prevE.dur >= 2 && !G.demo)
    addPop('count the long note all the way!', prevE.beat + prevE.dur / 2, '#d9822b', WATER_Y - 135, 19, p);
  if (G.demo) {   // Grandpa Frog doesn't praise himself: he says the count of each note instead
    const inBar = ((n.beat % G.beats) + G.beats) % G.beats;
    addPop(Math.abs(inBar % 1) < 1e-6 ? String(inBar + 1) : '&', landX(n), '#5d6b5f', WATER_Y - 95, G.nparts > 1 ? 20 : 26, p);
  } else addPop(q === 'perfect' ? 'Perfect!' : (dt < 0 ? 'Good · early' : 'Good · late'), landX(n), q === 'perfect' ? '#e09a00' : '#3a9d4a', WATER_Y - 95, G.nparts > 1 ? 20 : 26, p);
}

function failNow(type, e, msg) {
  const t = tp(), fp = frogPos(t, beatAt(t), e.part);
  if (settings.practice && !G.demo) {   // practice/recording mode: never fail, just note it and carry on
    G.log.push(`!  ${type.padEnd(6)} ${(t - G.songStart).toFixed(3)}s | beat ${beatAt(t).toFixed(2)} | ${e.type} at beat ${e.beat}`);
    G.practiceFlags++;
    if (type === 'splash') e.judged = 'miss';
    if (type === 'fish') e.flagged = true;
    addPop({ fish: '🐟 rest!', splash: '💦 missed', slip: '🪷 held too short' }[type], fp.x, '#c0563f', WATER_Y - 120, 22, e.part);
    SND.oops(AC.currentTime);
    return;
  }
  G.state = 'fail'; G.fails++; G.combo = 0; G.keys.clear(); G.noteKeys.fill(null);
  G.fail = { type, t, msg, part: e.part, x: fp.x, y: fp.y, measure: e.measure, beatFrozen: beatAt(t), splashed: false };
  const now = AC.currentTime;
  if (type === 'fish') { SND.gulp(now + 0.25); SND.bleh(now + 1.1); }
  else { if (type === 'slip') SND.slip(now); SND.splash(now + 0.35); }
}

const SHORE_X = () => G.total + 1.0;   // where the frogs land on the far bank
function finish() {
  G.state = 'done'; G.doneT = tp();
  const t = G.doneT;   // (the hop onto the shore gets sparkles even in the demo: everyone made it!)
  G.frogs.forEach((f, p) => {
    const fp = frogPos(t, beatAt(t), p), dest = { shore: true, beat: SHORE_X() + p * 0.35, dur: 0, part: p };
    Object.assign(f, { fromX: fp.x, fromY: fp.y, toX: dest.beat, hopStart: t + 0.1 + p * 0.12, hopDur: 0.5, hopH: 75, on: dest, landFx: 'perfect' });
    f.landT = f.hopStart + f.hopDur;
  });
  SND.hop(AC.currentTime + 0.1); if (G.nparts > 1) SND.hop(AC.currentTime + 0.22);
  // celebrate on land: each frog croaks twice ("rib-bit, rib-bit"); the blue bottom frog a little lower
  G.croaks = [];
  G.frogs.forEach((f, p) => [0.75, 1.3].forEach(d => {
    const when = d + p * 0.28;
    SND.ribbit(AC.currentTime + when, p ? 0.8 : 1);
    G.croaks.push({ p, t: t + when });
    G.pops.push({ text: 'Ribbit!', beatX: f.toX, color: p ? '#3f8fc0' : '#2f7a3a', y: WATER_Y - 70 + rowDY(p), size: 22, t: t + when });
  }));
  SND.fanfare(AC.currentTime + 0.05);
  setTimeout(showResults, 900);
}

function addPop(text, beatX, color, y = WATER_Y - 95, size = 26, part = 0) {
  G.pops.push({ text, beatX, color, y: y + rowDY(part), size, t: tp() });
}
