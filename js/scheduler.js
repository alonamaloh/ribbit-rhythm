// Band scheduling and the per-frame update
'use strict';

// ---------- scheduler ----------
function schedule() {
  const end = G.total * 2;
  while (G.nextHalf < end && G.songStart + G.nextHalf * G.spb / 2 < AC.currentTime + 0.12) {
    const h = G.nextHalf++, b = h / 2, at = G.songStart + b * G.spb;
    if (at < AC.currentTime - 0.01) continue;
    const isBeat = h % 2 === 0, inBar = ((b % G.beats) + G.beats) % G.beats;
    const counting = b < startBeat();
    if (isBeat && settings.cricket) SND.cricket(at, inBar === 0, false);
    // the intro bar (counting) uses the chord just before the measure we start on, so it leads right in
    const m = Math.floor(b / G.beats), ch = chordFor(m), nextCh = chordFor(m + 1);
    const band = bandSize(), spb = G.spb, waltz = G.beats === 3;
    // 🥁 drums: rock beat in 4/4 (kick 1 & 3 + a pickup, snare 2 & 4); boom-chick-chick in 3/4
    if (band >= 1) {
      if (waltz) { if (isBeat && inBar === 0) SND.kick(at); if (isBeat && inBar > 0) SND.snare(at, 0.16); }
      else {
        if (inBar === 0 || inBar === 2 || (inBar === 2.5 && band >= 3)) SND.kick(at, inBar === 2.5 ? 0.4 : 0.55);
        if (inBar === 1 || inBar === 3) SND.snare(at);
      }
    }
    // 🎸 bass line: root, root, fifth, octave, and a walk-up into the next chord (none in the last bar: nothing comes next)
    if (band >= 2) {
      const r = ch[0], pat = band === 2 ? [[0, r, 1.8], [2, r + 7, 1.8]] : waltz ? [[0, r, 0.9], [1, r + 7, 0.45], [2, r + 12, 0.45]]
        : [[0, r, 0.9], [1.5, r, 0.4], [2, r + 7, 0.9], [3, r + 12, 0.45]].concat(m === G.measures - 1 ? [] : [[3.5, nextCh[0] + (nextCh[0] > r ? -1 : 1), 0.4]]);
      for (const [pos, note, d] of pat) if (Math.abs(inBar - pos) < 1e-6) SND.bassNote(at, note, d * spb);
    }
    // 🎤 choir: a chord for the whole measure, "ooh" and "aah" taking turns every 4 bars
    if (band >= 3 && isBeat && inBar === 0) SND.choir(at, choirVoicing(ch), G.beats * spb * 0.97, Math.floor(m / 4) % 2 ? 'ah' : 'oo');
    // ✨ hi-hats on every eighth, off-beats a little louder
    if (band >= 4) SND.hat(at, isBeat ? 0.04 : 0.065);
  }
}

function demoDrive(t) {
  for (let p = 0; p < G.nparts; p++) {
    const n = G.events.find(e => e.part === p && e.type === 'note' && !e.judged);
    if (n && t >= evT0(n)) {
      hit(n, 'demo', t); G.demoHeld[p] = true;
      G.demoRelease[p] = evT0(n) + (n.dur >= 2 ? n.dur * G.spb - 0.12 : Math.min(0.15, n.dur * G.spb * 0.4));
    }
    if (G.demoHeld[p] && t > G.demoRelease[p]) G.demoHeld[p] = false;
  }
}

function update(t) {
  if (!G || mode !== 'play') return;
  if (G.state === 'play') {
    schedule();
    if (G.demo) demoDrive(t);
    else {
      for (const e of G.events) {
        if (e.beat < startBeat() - 1e-9) continue;
        if (e.type === 'note' && !e.judged && t > evT0(e) + winLate(e)) {
          failNow('splash', e, partHeld(e.part) ? 'Tap again for each new note (another key works too)! 💦' : (G.nparts > 1 ? `The ${e.part ? 'bottom' : 'top'} frog missed a pad! (${e.part ? 'left hand: F' : 'right hand: J'}) 💦` : 'Oops! You missed a lily pad. 💦')); return;
        }
        if (e.type === 'rest' && !e.flagged && [...G.keys.values()].some(k => k.p === e.part && k.t < evT0(e)) && t > evT0(e) + Math.max(0.3, 0.5 * G.spb) && t < evT1(e) - GOOD) {
          failNow('fish', e, 'Let go when the note ends. A rest means the fish is coming! 🐟'); return;
        }
      }
    }
    if (t > G.songStart + G.total * G.spb + 0.25) finish();
  } else if (G.state === 'fail' && t - G.fail.t > 2.8) {
    startFrom(G.fail.measure);
  }
}
