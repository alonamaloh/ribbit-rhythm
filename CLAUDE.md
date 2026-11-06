# Ribbit Rhythm

A cute web game that teaches elementary students to read rhythm notation. A frog hops across
lily pads (one pad per note) in time with the music; on a rest, a fish leaps past and the player
must not tap. Designed with a music teacher; she makes the teaching decisions.

The full design plan (habitats, home, shops, rewards, saving progress, build phases) lives in a
shared doc: "Ribbit Rhythm: Game Design Plan" on claude.ai. Ask the user for the link if needed.

## Files

- `index.html` - the page: HTML for the canvas and overlays, then loads the files below in order.
  No build step, no dependencies, no image or audio files. Open it in a browser to play (works
  straight from the file, no server needed).
- `css/style.css` - all styles.
- `js/` - the game, as plain `<script>` files that share one global scope (not ES modules, so
  `file://` still works and the tests can reach `G`, `press`, `failNow`... directly). Load order
  matters only for code that runs at load time; keep `main.js` last.
  - `levels.js` constants, timing rules, chords, `LEVELS` · `storage.js` settings/progress
  - `rhythm.js` parsing and random rhythms · `audio.js` Web Audio and `SND`
  - `state.js` the run `G`, plants, `startFrom`, frog positions · `input.js` `press`/`release`
  - `melody.js` `pickMelody` · `judge.js` `hit`, `failNow`, `finish` · `scheduler.js` `schedule`, `update`
  - `scene.js` canvas setup, pond, pads, frogs, fish, plants · `notation.js` the notation card
  - `render.js` band and `render()` · `menus.js` overlays, pond map, settings, key/touch wiring
  - `main.js` starts the frame loop and builds the menu
- `tests/` - automated "players" that drive the game in a headless browser (Playwright) and
  report failures. See Testing below.

## How the code is organised

- **Constants and levels** (top of the script): `LEVELS` array. A level has `id`, `name`,
  `concept`, `bpm`, `fog` (0 clear, 1 fog, 2 night), `guide` ('full' line, 'scroll' no line,
  'page' two-line sliding view), optional `beats` (3 for 3/4), `ppb` (pixels per beat),
  `plants` (0..1 density of hiding plants), `band: 'light'` (drums + bass only), and one of:
  `rhythm` (string), `parts` (array of 2 strings for duets), `gen` / `genParts` (random rhythm).
- **Rhythm strings**: tokens `w h q e` (notes) and `wr hr qr` (rests), measures split by `|`.
  Example: `'q q h | q qr q q | w'`. Two `e` on one beat are beamed automatically.
- **Timing rules** (search "Timing leniency"): `EARLY_WIN 0.30 s`, `LATE_WIN 0.35 s`,
  `PERFECT 0.09 s`, `HOLD_NEEDED 0.55` (fraction of a long note that must be held). Windows
  shrink only so neighbouring notes never overlap (`winEarly`, `winLate`). Tuned from the
  teacher's practice logs; deliberately generous for kids until student logs come in.
- **State**: one run object `G` (events, per-part frogs, keys held, combo, fails, log...).
  `startFrom(m)` restarts from measure m after a one-bar band intro.
- **Input**: `press(id, part)` / `release(id)`. Every key and finger is tracked separately so
  players can play legato with two keys. In duets, left side of the keyboard (and Space) or the
  left tap pad = bottom line (part 1); everything else = top line (part 0).
- **Audio**: Web Audio, all synthesized (`SND` object). `schedule()` plays the band in
  half-beat steps ahead of time; `chordFor(m)` gives C Am F G and a G -> C cadence at the end.
  `pickMelody()` makes the note each hop plays: chord tones, except that a weak note between two
  stronger notes (strong-weak-strong, e.g. `q q q`, `e e q`, `h q h` in 3/4) is often a passing
  note stepping from one chord tone to the next. The last note is C. No approach notes for now.
  The bass walk-up into the next bar is left out of the last bar.
- **Rendering**: canvas 1100x620 scaled to fit. `render()` draws background, a row of pads per
  part, frogs, fish, plants, fog, band, then the notation card (`drawNotation`, `drawPageLines`).
- **Menus**: level map is an SVG pond (`buildMenu`), with HTML overlays for intro/results/settings.
- **Practice mode** (Settings): never fails, records every key down/up against the beat, and
  offers "Copy timing log". Used to tune timing from real players.
- **Saving**: localStorage only (`lilyRhythm.settings`, `lilyRhythm.progress`). Keep these key
  names so players don't lose progress.

## Decisions already made (don't undo without asking)

- The hop melody note plays exactly when the player taps (not snapped to the beat).
- The full band plays from a one-bar intro; levels 1-3 use the lighter band.
- "Listen first" (Grandpa Frog demo) shows counts (1, 2, &) instead of praise, and no combo.
- Long notes: releasing before 55% of the note fails; 55-62% shows a gentle hint.
- Flowers can only be spent in the habitat where they were earned; some items cost stars.
- Replaying easy levels must still earn something (reduced, never zero).
- Bayou habitat: mix of straight and swung eighth pads; some levels repeat "Now let's do it
  with a swing!" after reaching land.
- Art stays in the current code-drawn style (rounded shapes, pastel colours, dark outlines).
- Touch screens show big tap pads (TAP, or L and R in duets); tapping anywhere also works.

## Testing

```
pip install playwright
playwright install chromium
python tests/human.py 2 34000     # level index 2, run 34 s: one-key player with human-like timing
python tests/legato.py 5 9        # two-key legato player on levels 5 and 9 (real key events)
python tests/duet.py 11 34000     # two-hand player on a duet level
python tests/touch.py             # phone/tablet emulation: taps and the L/R pads
```

Each prints `fails` per run; anything above 0 means a timing or input regression. Level indices
follow the `LEVELS` array order (0-based). After any change to timing, input or audio
scheduling, run at least human.py, legato.py and duet.py.

## Style and conventions

- Kids are the players: everything must stay forgiving, cute and readable on an iPad.
- No external assets or network requests; everything is drawn and synthesized in code.
- Keep comments short and in plain language; the teacher may read the code.
