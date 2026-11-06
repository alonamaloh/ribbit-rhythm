// The note each hop plays
'use strict';

// ---- Melody for each hop ----
// Every note plays a tone of the bar's chord, except one pattern: a weak note squeezed between
// two stronger ones (strong-weak-strong, e.g. q q q, e e q, or h q h in 3/4) may be a passing
// note that steps along the scale from one chord tone to the next. The final note goes home (C).
const SCALE = [0, 2, 4, 5, 7, 9, 11];   // C major
const pc = m => ((m % 12) + 12) % 12;
const inScale = m => SCALE.includes(pc(m));
const isTone = (m, chord) => chord.some(c => pc(m - c) === 0);
function nearestOf(list, ref, avoid, exact = false) {
  const l = list.filter(m => m !== avoid);
  const pool = (l.length ? l : list).slice().sort((a, b) => Math.abs(a - ref) - Math.abs(b - ref));
  // a little variety: usually the closest, sometimes the second closest
  return pool[!exact && pool.length > 1 && Math.random() < 0.3 ? 1 : 0];
}
// How strong a spot in the bar is: 3 = beat 1, 2 = beat 3 in 4/4, 1 = other beats, 0 = "&"s
function strength(beat) {
  const inBar = ((beat % G.beats) + G.beats) % G.beats;
  if (Math.abs(inBar % 1) > 1e-6) return 0;
  if (inBar === 0) return 3;
  return G.beats === 4 && inBar === 2 ? 2 : 1;
}
// the event right before / after n in its own line (a note or a rest)
function neighbour(n, dir) {
  for (let i = G.events.indexOf(n) + dir; i >= 0 && i < G.events.length; i += dir) if (G.events[i].part === n.part) return G.events[i];
  return null;
}
const scaleStep = (m, dir) => { let s = m + dir; while (!inScale(s)) s += dir; return s; };

function pickMelody(n, p) {
  const [lo, hi] = p === 1 ? [50, 64] : [62, 81];   // bottom line plays lower
  const last = G.melLast[p];
  const range = []; for (let m = lo; m <= hi; m++) range.push(m);
  const tones = c => range.filter(m => isTone(m, c));
  const home = range.filter(m => pc(m) === 0);
  const prev = neighbour(n, -1), next = neighbour(n, 1);
  const isLast = !G.events.some(e => e.part === p && e.type === 'note' && e.beat > n.beat);
  const targetsOf = e => (G.events.some(x => x.part === p && x.type === 'note' && x.beat > e.beat) ? tones(chordFor(e.measure)) : home);

  // this note finishes a passing note: land on the chord tone it was heading for
  if (G.melPass[p] && G.melPass[p].note === n && G.melNote[p] === prev) return G.melPass[p].pitch;
  // final note of the piece: home (the tonic, C)
  if (isLast) return nearestOf(home, last, null, true);

  // strong-weak-strong: notes right before and after (no rest between), both on stronger spots,
  // and the note before is the one we just played
  const s = strength(n.beat);
  if (prev && next && prev.type === 'note' && next.type === 'note' && G.melNote[p] === prev &&
      strength(prev.beat) > s && strength(next.beat) > s && Math.random() < 0.75) {
    // a passing note is one scale step from the last note, with the next chord tone one more step on
    const targets = targetsOf(next);
    const ways = [1, -1].map(d => ({ pass: scaleStep(last, d), to: scaleStep(scaleStep(last, d), d) }))
      .filter(w => w.pass >= lo && w.pass <= hi && targets.includes(w.to));
    if (ways.length) {
      const w = ways[Math.floor(Math.random() * ways.length)];
      G.melPass[p] = { note: next, pitch: w.to };
      return w.pass;
    }
  }
  return nearestOf(tones(chordFor(n.measure)), last, last);
}
