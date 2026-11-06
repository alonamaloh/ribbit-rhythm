// The note each hop plays
'use strict';

// ---- Melody for each hop ----
// Strong beats get chord tones; weak beats and "&"s get passing/neighbour notes that step along
// the scale; the last note of a bar approaches the next bar's chord; the final note goes home.
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
function pickMelody(n, p) {
  const [lo, hi] = p === 1 ? [50, 64] : [62, 81];   // bottom line plays lower
  const last = G.melLast[p], B = G.beats, inBar = n.beat - n.measure * B;
  const ch = chordFor(n.measure), nextCh = chordFor(n.measure + 1);
  const range = []; for (let m = lo; m <= hi; m++) range.push(m);
  const tones = c => range.filter(m => isTone(m, c));
  const i = G.events.indexOf(n);
  let nextNote = null; for (let k = i + 1; k < G.events.length; k++) if (G.events[k].part === p && G.events[k].type === 'note') { nextNote = G.events[k]; break; }
  const onBeat = Math.abs(inBar % 1) < 1e-6;
  const strong = onBeat && (inBar === 0 || (B === 4 && inBar === 2));
  const lastInBar = !nextNote || nextNote.measure !== n.measure;
  // final note of the piece: home (the tonic, C)
  if (!nextNote) return nearestOf(range.filter(m => pc(m) === 0), last, null, true);
  // The rules below are tendencies, not laws, so melodies don't all sound alike.
  const roll = Math.random();
  // approach note into the next chord (not on beat 1), about half the time
  if (lastInBar && inBar > 0 && roll < 0.5) {
    const target = nearestOf(tones(nextCh), last, null);
    const below = target - 1;                                     // chromatic, from a half step below
    const above = range.find(m => m > target && inScale(m));      // diatonic, from a scale step above
    // diatonic step above most of the time; a chromatic half step below now and then (short notes only)
    let opts = [above].concat(n.dur < 1.5 && Math.random() < 0.4 ? [below] : []).filter(m => m != null && m >= lo && m <= hi);
    if (opts.length > 1) opts = opts.filter(m => m !== last);
    if (opts.length) return opts[Math.floor(Math.random() * opts.length)];
  }
  if (strong) {
    if (roll < 0.85) return nearestOf(tones(ch), last, last);
    const st = range.filter(m => inScale(m) && Math.abs(m - last) <= 2 && m !== last);   // the odd scale step on a strong beat
    if (st.length) return st[Math.floor(Math.random() * st.length)];
  }
  if (!strong) {
    if (roll < 0.22) return nearestOf(tones(ch).filter(m => Math.abs(m - last) >= 3 && Math.abs(m - last) <= 7), last, last)   // a small leap to a chord tone
      || nearestOf(tones(ch), last, last);
    if (roll < 0.3) return last;                                                                    // repeat the note
  }
  // weak beat or "&": step along the scale toward the nearest chord tone (passing / neighbour note)
  // keep moving the way we were going (a passing note continues until it lands on a chord tone),
  // but drift back toward the middle of the range near the edges
  const mid = (lo + hi) / 2, prevDir = G.melDir[p] || 1;
  let dir;
  if (last > hi - 4) dir = -1;
  else if (last < lo + 4) dir = 1;
  else if (!isTone(last, ch) || Math.random() < 0.7) dir = prevDir;
  else dir = last > mid ? -1 : 1;
  let step = last + dir; while (!inScale(step)) step += dir;
  if (step < lo || step > hi) { step = last - dir; while (!inScale(step)) step -= dir; }
  return clamp(step, lo, hi);
}
