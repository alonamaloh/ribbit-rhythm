// Key and finger presses
'use strict';

// ---------- input ----------
function logKey(kind, id, t, part) {
  const hand = G.nparts > 1 ? (part ? ' [bottom]' : ' [top]   ') : '';
  G.log.push(`${kind === 'down' ? 'D' : 'U'}  ${id.padEnd(12)}${hand} ${(t - G.songStart).toFixed(3)}s | beat ${beatAt(t).toFixed(2)}`);
}
// Every key (and every finger) is tracked on its own, so kids can play legato:
// hold one key through a long note and hop to the next note with another key.
// In duets each key also belongs to a part (left hand = bottom line, right hand = top line).
const partHeld = p => [...G.keys.values()].some(k => k.p === p) || G.demoHeld[p];
function press(id, hint = 0) {
  if (mode !== 'play' || !G || G.state !== 'play' || G.demo || G.keys.has(id)) return;
  const p = G.nparts > 1 ? hint : 0;
  const t = tp(); G.keys.set(id, { t, p }); logKey('down', id, t, p);
  if (t < G.songStart + startBeat() * G.spb - EARLY_WIN) return; // count-in
  const n = G.events.find(e => e.part === p && e.type === 'note' && !e.judged && e.beat >= startBeat() - 1e-9);
  if (n) {
    const dt = t - evT0(n);
    if (dt >= -winEarly(n) && dt <= winLate(n)) { G.noteKeys[p] = id; hit(n, Math.abs(dt) <= PERFECT ? 'perfect' : 'good', t, dt); return; }
  }
  const r = G.events.find(e => e.part === p && e.type === 'rest' && e.beat >= startBeat() - 1e-9 && t >= evT0(e) - 0.02 && t <= evT1(e));
  if (r) { failNow('fish', r, G.nparts > 1 ? `That line has a rest! Use the ${p ? 'left' : 'right'} hand only when its line has a note. 🐟` : 'That was a rest! Wait while the fish goes by. 🐟'); return; }
  G.frogs[p].wobT = t; SND.oops(AC.currentTime);
  const early = n && t < evT0(n) && evT0(n) - t < 0.5;
  addPop(early ? 'too early, wait…' : 'extra tap!', frogPos(t, beatAt(t), p).x, '#c0563f', WATER_Y - 95, 22, p);
}
function release(id) {
  if (!G || G.demo || !G.keys.has(id)) return;
  const p = G.keys.get(id).p;
  G.keys.delete(id);
  if (mode === 'play' && G.state === 'play') logKey('up', id, tp(), p);
  if (mode !== 'play' || G.state !== 'play' || id !== G.noteKeys[p]) return;
  G.noteKeys[p] = null;
  const t = tp(), e = G.frogs[p].on;
  if (t < G.songStart + startBeat() * G.spb) return;
  if (e && e.dur >= 2 && e.judged && t >= evT0(e) - GOOD && t < evT1(e)) {
    const held = t - evT0(e), full = e.dur * G.spb;
    if (held < full * HOLD_NEEDED) failNow('slip', e, 'Long note! Keep holding while the pad glows. 🪷');
    else if (held < full * 0.62) addPop('hold a bit longer!', frogPos(t, beatAt(t), p).x, '#d9822b', WATER_Y - 130, 20, p);
  }
}
