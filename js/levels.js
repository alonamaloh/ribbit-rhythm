// Constants, timing rules and level data
'use strict';

// =====================================================================
//  Constants & level data
// =====================================================================
const W = 1100, H = 620;
const CARD = { x: 14, y: 10, w: W - 28, h: 148 };
const LINE_Y = CARD.y + 74;
const WATER_Y = 445;
const ANCHOR = 400;          // screen x of the playhead
const OFF = 0.28;            // where inside its beat a note is drawn
// ---- Timing leniency (set generously for kids; tighten once student logs come in) ----
const PERFECT = 0.09, GOOD = 0.16;
const EARLY_WIN = 0.3, LATE_WIN = 0.35;   // how far off a tap may be and still land
// Windows shrink only when notes are packed close together (eighths), so two notes never overlap.
function winEarly(n) {
  const prev = prevInPart(n);
  return prev ? Math.min(EARLY_WIN, 0.5 * (n.beat - prev.beat) * G.spb) : EARLY_WIN;
}
function prevInPart(n) {
  for (let i = G.events.indexOf(n) - 1; i >= 0; i--) if (G.events[i].part === n.part) return G.events[i];
  return null;
}
const winLate = n => Math.min(LATE_WIN, 0.55 * n.dur * G.spb);
const HOLD_NEEDED = 0.55;   // fraction of a long note that must be held
const GUIDE_INFO = { full: '👀 Follow the line', scroll: '🎵 No line: count the beats', page: '👂 Ears only: read line by line' };
const guideOf = L => { const g = settings.guide === 'full' ? 'full' : settings.guide === 'ears' ? 'page' : (L.guide || 'full'); return g; };
// Duets: which hand plays a key. Left side of the keyboard (and Space) = bottom line (part 1), everything else = top line (part 0).
const LEFT_KEYS = /^(Key[QWERTASDFGZXCVB]|Digit[1-5]|Backquote|Tab|CapsLock|ShiftLeft|ControlLeft|Space)$/;
const partForCode = code => (LEFT_KEYS.test(code) ? 1 : 0);
const DUET_DY = 88;   // the bottom line's pads sit this much lower (closer to the viewer)
const rowDY = p => (G && G.nparts > 1 && p === 1 ? DUET_DY : 0);
const FROG_TINT = [null, { color: '#7cc8f2', dark: '#4f9fd1' }];
const DUR = { w: 4, h: 2, q: 1, e: 0.5, wr: 4, hr: 2, qr: 1 };
const CHORDS = [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]]; // C Am F G
// Pond Band: the whole band (drums, bass, choir, hi-hats) plays from the one-bar intro to the end.
const bandSize = () => (G ? (G.L.band === 'light' ? 2 : 4) : 0);   // light = drums + bass only
// Chord for a measure: C Am F G over and over, but every level ends with a cadence (… G | C).
function chordFor(m) {
  if (G && m === G.measures - 1) return CHORDS[0];
  if (G && m === G.measures - 2) return CHORDS[3];
  return CHORDS[((m % 4) + 4) % 4];
}
const choirVoicing = ch => ch.map(c => { let m = c; while (m < 60) m += 12; return m; }).sort((a, b) => a - b);

const LEVELS = [
  { id: 'l1', name: 'First Hops', concept: 'Quarter notes', bpm: 72, fog: 0, guide: 'full', band: 'light',
    rhythm: 'q q q q | q q q q | q q q q | q q q q',
    tip: 'Every note is a lily pad. Tap once for each note, right on the beat!' },
  { id: 'l2', name: 'Fishy Gaps', concept: 'Quarter rests', bpm: 76, fog: 0, guide: 'full', band: 'light',
    rhythm: 'q q q qr | q q qr q | q qr q q | qr q q q | q q qr q | q qr q qr | q q q q | q q q qr',
    tip: 'A rest means a fish jumps by. Don’t tap. Just wait for it to pass!' },
  { id: 'l3', name: 'Long Lilies', concept: 'Half & whole notes', bpm: 76, fog: 0, guide: 'full', band: 'light',
    rhythm: 'h q q | q q h | h h | q qr h | w | q q q q | h h | w',
    tip: 'Long notes are long pads. Tap and HOLD while the pad lights up, then lift your finger so you’re ready for the next note.' },
  { id: 'l4', name: 'Misty Morning', concept: 'Fog: read ahead', bpm: 80, fog: 1, guide: 'scroll',
    rhythm: 'q q h | q qr q q | h qr q | q q q qr | h h | q qr h | q q q q | w',
    tip: 'Fog! You can only see one pad ahead. Read the notes at the top.' },
  { id: 'l5', name: 'Big Fish', concept: 'Half rests', bpm: 80, fog: 1, guide: 'scroll',
    rhythm: 'q q hr | q q q q | hr q q | h hr | q qr q qr | hr h | q q q q | w',
    tip: 'A half rest is a BIG fish. Wait for two whole beats.' },
  { id: 'm1', name: 'Reed Maze', concept: 'Plants hide the pads', bpm: 78, fog: 0, guide: 'scroll', plants: 0.45,
    rhythm: 'q q h | q qr q q | hr q q | q q q qr | h q q | q qr hr | q q q q | w',
    tip: 'Reeds and grass hide some of the pads. Keep your eyes on the notes, not the plants!' },
  { id: 'l6', name: 'Night Pond', concept: 'Sight-reading', bpm: 80, fog: 2, guide: 'page',
    gen: { vocab: ['q', 'q', 'q', 'qr', 'h', 'hr'], measures: 8 },
    tip: 'It’s dark! Pads only appear when you land on them. Trust the notes. You get a new rhythm every time.' },
  { id: 'l7', name: 'Firefly Hops', concept: 'Eighth notes', bpm: 70, fog: 0, guide: 'full', ppb: 150,
    rhythm: 'q q e e q | e e e e q q | q e e h | e e q e e q | q q e e e e | h e e q | e e e e e e e e | w',
    tip: 'Two eighth notes share one beat: hop-hop! Count “1 &”.' },
  { id: 'l8', name: 'Lily Waltz', concept: '3/4 time', bpm: 96, fog: 1, guide: 'scroll', beats: 3,
    rhythm: 'q q q | h q | q qr q | h qr | q q q | q h | q qr qr | h qr',
    tip: '3/4 time has 3 beats in each measure. Count 1-2-3, 1-2-3 and waltz!' },
  { id: 'm2', name: 'Tall Grass', concept: 'Plants + eighths', bpm: 72, fog: 0, guide: 'scroll', ppb: 150, plants: 0.8,
    gen: { vocab: ['q', 'q', 'qr', 'h', 'ee', 'ee'], measures: 8 },
    tip: 'The grass is tall here: most pads are hidden. Read the notes and count! A new rhythm every time.' },
  { id: 'l9', name: 'Moonlight Mix', concept: 'Sight-reading', bpm: 72, fog: 2, guide: 'page', ppb: 150,
    gen: { vocab: ['q', 'q', 'qr', 'h', 'ee', 'ee'], measures: 8 },
    tip: 'Night pond with eighth notes. A brand-new rhythm every time!' },
  // ---- Duets: two lines, two hands ----
  { id: 'd1', name: 'Ping Pong', concept: 'Two lines: take turns', bpm: 72, fog: 0, guide: 'full',
    parts: ['q qr q qr | q qr q qr | q q qr qr | q q qr qr | h hr | q qr q qr | q q q qr | h hr',
            'qr q qr q | qr q qr q | qr qr q q | qr qr q q | hr h | qr q qr q | qr qr qr q | hr h'],
    tip: 'Two frogs, two lines! Top line: right hand (J). Bottom line: left hand (F). They take turns.' },
  { id: 'd2', name: 'Steady Bass', concept: 'Two lines together', bpm: 66, fog: 0, guide: 'full',
    parts: ['q q q q | q q h | e e q e e q | h h | q q q q | e e e e h | q qr q qr | w',
            'h h | h h | h h | w | h h | h h | h h | w'],
    tip: 'Hold the long notes with your left hand (F) while your right hand (J) hops along the top line.' },
  { id: 'd3', name: 'Frog Chorus', concept: 'Two lines: mixed', bpm: 72, fog: 0, guide: 'scroll',
    parts: ['q q h | qr q q q | h q qr | e e e e q q | q qr h | e e q h | q q q q | w',
            'h q q | h h | q q q q | h qr q | q q h | h q qr | qr q qr q | w'],
    tip: 'Both frogs are busy now! Right hand (J) plays the top line, left hand (F) plays the bottom line.' },
  { id: 'd4', name: 'Duet Reading', concept: 'Duet sight-reading', bpm: 66, fog: 0, guide: 'page',
    genParts: [{ vocab: ['q', 'q', 'qr', 'h', 'hr'], measures: 8 }, { vocab: ['h', 'h', 'q', 'qr', 'hr'], measures: 8 }],
    tip: 'Read both lines, line by line, with no guide. Right hand (J) top, left hand (F) bottom. A new duet every time!' },
];
