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
    if (habitatOf(G.L).band === 'folk') { folkBand(at, b, h, inBar, m, ch, nextCh, band, spb, waltz); continue; }
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

// Banjo rolls (Scruggs style): eight picks per bar, one per eighth note. Numbers are banjo strings:
// 1 = highest fretted string ... 4 = lowest, 5 = the short high drone string (always open G).
const BANJO_ROLLS = {
  forwardReverse:   [3, 2, 1, 5, 1, 2, 3, 1],   // thumb-index-middle, then back down
  forward:          [3, 2, 1, 5, 2, 1, 5, 1],
  alternatingThumb: [3, 2, 5, 1, 4, 2, 5, 1],   // the thumb alternates between strings 3/4 and 5
  backward:         [1, 2, 3, 1, 2, 3, 1, 2],
};
const ROLL_ORDER = ['forwardReverse', 'forward', 'alternatingThumb', 'forwardReverse'];   // one per bar, repeating
const WALTZ_ROLL = [3, 2, 1, 5, 2, 1];   // 3/4: six picks per bar
// Open-G tuning, strings 1-4 (D4 B3 G3 D3); each string plays the nearest chord note at or above it.
const BANJO_OPEN = { 1: 62, 2: 59, 3: 55, 4: 50 }, BANJO_DRONE = 67;
function banjoShape(ch) {
  const shape = { 5: BANJO_DRONE };
  for (const s of [1, 2, 3, 4]) { let m = BANJO_OPEN[s]; while (!isTone(m, ch)) m++; shape[s] = m; }
  return shape;
}

// Marsh Band (folk): foot stomp, plucked upright bass ("boom"), banjo rolls and a washboard
function folkBand(at, b, h, inBar, m, ch, nextCh, band, spb, waltz) {
  const isBeat = h % 2 === 0, last = m === G.measures - 1, r = ch[0];
  // 🥾 stomp on the strong beats, a lighter one in between
  if (band >= 1 && isBeat) {
    SND.stomp(at, inBar === 0 || (!waltz && inBar === 2) ? 0.5 : 0.22);
  }
  // 🎻 upright bass: root and fifth, "boom" on the strong beats, a step into the next chord (not in the last bar)
  if (band >= 2) {
    // [position in the bar, note, length in beats]
    const pat = waltz ? [[0, r, 2.8]] : [[0, r, 1.9], [2, r + 7, 1.4]].concat(last ? [] : [[3.5, nextCh[0] + (nextCh[0] > r ? -1 : 1), 0.45]]);
    for (const [pos, note, d] of pat) if (Math.abs(inBar - pos) < 1e-6) SND.upright(at, note - 12, d * spb, pos === 3.5 ? 0.18 : 0.26);
  }
  // 🪕 banjo: a roll on every eighth note; the last bar ends with a "pinch" (strings 5, 3 and 1 together)
  if (band >= 3) {
    const shape = banjoShape(ch), k = Math.round(inBar * 2);
    if (last) { if (k === 0) for (const s of [5, 3, 1]) SND.pluck(at, shape[s], 0.1, 0.85); }
    else {
      const roll = waltz ? WALTZ_ROLL : BANJO_ROLLS[ROLL_ORDER[((m % 4) + 4) % 4]];
      SND.pluck(at, shape[roll[k]], isBeat ? 0.1 : 0.075, 0.85);   // picks on the beat a little stronger
    }
  }
  // 🧺 washboard on every eighth, off-beats a little louder
  if (band >= 4) SND.washboard(at, isBeat ? 0.035 : 0.06);
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
