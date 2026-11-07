// Sounds (Web Audio, all synthesized)
'use strict';

// =====================================================================
//  Audio (Web Audio, all sounds synthesized)
// =====================================================================
let AC = null, master = null, noiseBuf = null;
function ensureAudio() {
  if (!AC) {
    AC = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    const comp = AC.createDynamicsCompressor();
    master = AC.createGain(); master.gain.value = 0.85;
    master.connect(comp); comp.connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (AC.state !== 'running') AC.resume().catch(() => {});
}
const hwLatency = () => (AC.outputLatency || 0) + (AC.baseLatency || 0);
const tp = () => AC.currentTime - hwLatency();   // "perceived" time (when the sound reaches the ears)
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

function tone(type, f0, t, dur, peak, { a = 0.005, f1 = null, glide = 0.05, dest = master, q = null } = {}) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + glide);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur);
  let node = o;
  if (q) { const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = q; o.connect(fl); node = fl; }
  node.connect(g); g.connect(dest);
  o.start(t); o.stop(t + a + dur + 0.05);
}
function noise(t, dur, peak, type, f0, f1) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf;
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f0, t);
  if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
}
// A frog croak is a fast train of little clicks from the vocal sac, each one ringing briefly
// (that's the rattle). "bit" is a fifth higher than "rib" (BIT_UP, try 1.33 for a fourth).
// "rib" fades as the lips close on the "b"; "bit" stops short on the "t". mul < 1 = bigger, lower frog.
const BIT_UP = 1.5;
// how much higher than a big bullfrog: 4 = two octaves; CROAK_CLICKS speeds up the rattle (1 = slow, croaky)
const CROAK_PITCH = 4, CROAK_CLICKS = 1;
function croakSamples(sr, mul = 1, pitch = CROAK_PITCH, clicks = CROAK_CLICKS) {
  const out = new Float32Array(Math.ceil(sr * 0.34));
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // [start s, length s, click rate from -> to (per second), ring pitch from -> to (Hz), fade-out part]
  const syllables = [[0, 0.12, 58, 62, 500, 470, 0.35], [0.15, 0.15, 70, 74, 500 * BIT_UP, 480 * BIT_UP, 0.1]];
  for (const [st, d, r0, r1, f0, f1, fade] of syllables) {
    let t = 0;
    while (t < d) {
      const x = t / d, rate = (r0 + (r1 - r0) * x) * Math.sqrt(mul) * clicks, f = (f0 + (f1 - f0) * x) * mul * pitch;
      // loudness: quick start, a little swell, then fade out
      const env = Math.min(1, x / 0.1) * (x > 1 - fade ? (1 - x) / fade : 1) * (0.85 + 0.3 * Math.sin(Math.PI * x));
      const amp = env * (0.8 + 0.4 * rnd());   // clicks aren't all the same size: sounds alive
      const i0 = Math.round((st + t) * sr), len = Math.round(0.016 / clicks * sr);
      for (let k = 0; k < len && i0 + k < out.length; k++) {
        const u = k / sr, ring = Math.exp(-u / (0.0042 / clicks));
        out[i0 + k] += amp * ring * (Math.sin(2 * Math.PI * f * u) + 0.5 * Math.sin(2 * Math.PI * f * 2.3 * u + 1) +
          0.6 * Math.sin(2 * Math.PI * f * 0.5 * u)) + amp * 0.25 * (rnd() * 2 - 1) * Math.exp(-u / (0.0008 / clicks));
      }
      t += (1 / rate) * (0.93 + 0.14 * rnd());   // slightly uneven, like a real throat
    }
  }
  let peak = 0; for (const s of out) peak = Math.max(peak, Math.abs(s));
  for (let i = 0; i < out.length; i++) out[i] /= peak || 1;
  return out;
}
const SND = {
  cricket(t, accent, loud) {
    const v = (accent ? 0.2 : 0.13) * (loud ? 1 : 0.8), f = accent ? 4400 : 3700;
    tone('triangle', f, t, 0.022, v); tone('triangle', f, t + 0.04, 0.022, v * 0.8);
  },
  marimba(t, midi, v = 0.32) { const f = mtof(midi); tone('sine', f, t, 0.55, v); tone('sine', f * 4, t, 0.07, v * 0.22); },
  hop(t) { tone('sine', 260, t, 0.09, 0.12, { f1: 620, glide: 0.08 }); },
  bass(t, midi) { const f = mtof(midi); tone('triangle', f * 1.5, t, 0.28, 0.32, { f1: f, glide: 0.06 }); },
  pad(t, notes, dur) { notes.forEach(n => { tone('sine', mtof(n), t, dur, 0.05, { a: 0.25 }); tone('triangle', mtof(n) * 1.003, t, dur, 0.02, { a: 0.3 }); }); },
  shaker(t) { noise(t, 0.05, 0.07, 'highpass', 6500); },
  splash(t) {
    // 1) the "plop": a bubble whose pitch rises quickly
    tone('sine', 170, t, 0.16, 0.45, { f1: 720, glide: 0.07 });
    tone('sine', 320, t + 0.012, 0.08, 0.18, { f1: 1100, glide: 0.05 });
    // 2) the splash body: bright noise that dulls as the water falls back
    const s = AC.createBufferSource(); s.buffer = noiseBuf;
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(3200, t); bp.frequency.exponentialRampToValueAtTime(700, t + 0.45);
    const g = AC.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + 0.6);
    noise(t, 0.25, 0.18, 'lowpass', 600, 150);              // low "whump"
    // 3) droplets falling back: tiny rising blips
    for (let i = 0; i < 7; i++) {
      const dt = 0.1 + Math.random() * 0.45, f = 1100 + Math.random() * 1700;
      tone('sine', f, t + dt, 0.045, 0.05 + Math.random() * 0.06, { f1: f * 1.6, glide: 0.03 });
    }
  },
  gulp(t) { tone('sine', 520, t, 0.25, 0.35, { f1: 80, glide: 0.25 }); },
  bleh(t) { tone('sawtooth', 240, t, 0.25, 0.12, { f1: 150, glide: 0.25, q: 1200 }); },
  slip(t) { tone('sine', 700, t, 0.4, 0.15, { f1: 140, glide: 0.4 }); },
  oops(t) { tone('square', 330, t, 0.06, 0.05, { q: 1500 }); },
  // "rib-bit": two croaks, played from a sound made once in code (see croakSamples)
  ribbit(t, mul = 1, v = 0.32) {
    const key = 'croak' + mul;
    if (!SND[key]) { const d = croakSamples(AC.sampleRate, mul); SND[key] = AC.createBuffer(1, d.length, AC.sampleRate); SND[key].getChannelData(0).set(d); }
    const s = AC.createBufferSource(), g = AC.createGain();
    s.buffer = SND[key]; g.gain.value = v * 1.1;
    s.connect(g); g.connect(master); s.start(t);
  },
  // ---- Pond Band instruments ----
  kick(t, v = 0.55) {
    tone('sine', 150, t, 0.3, v, { f1: 42, glide: 0.12, a: 0.002 });
    noise(t, 0.015, 0.12, 'highpass', 3000);
  },
  snare(t, v = 0.34) {
    noise(t, 0.17, v, 'bandpass', 1900);
    noise(t, 0.08, v * 0.5, 'highpass', 5000);
    tone('triangle', 210, t, 0.07, v * 0.6, { f1: 160, glide: 0.07 });
  },
  hat(t, v = 0.055) { noise(t, 0.035, v, 'highpass', 8000); },
  bassNote(t, midi, dur, v = 0.2) {
    // plucky electric bass: saw + square through a lowpass that closes after the attack
    const f = mtof(midi), g = AC.createGain(), lp = AC.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 4;
    lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006);
    g.gain.setTargetAtTime(v * 0.45, t + 0.02, 0.12); g.gain.setTargetAtTime(0.0001, t + dur * 0.9, 0.04);
    for (const [type, mul, lvl] of [['sawtooth', 1, 0.7], ['square', 0.5, 0.5]]) {
      const o = AC.createOscillator(), og = AC.createGain(); o.type = type; o.frequency.value = f * mul; og.gain.value = lvl;
      o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.3);
    }
    lp.connect(g); g.connect(master);
  },
  choir(t, midis, dur, vowel = 'oo', v = 0.13) {
    if (vowel === 'ah') v *= 1.6;   // the 'ah' formants pass less energy
    // "ooh"/"aah" backing vocals: buzzy voices shaped by two vowel formants, with gentle vibrato
    const F = { oo: [330, 880], ah: [720, 1180] }[vowel];
    const out = AC.createGain();
    out.gain.setValueAtTime(0.0001, t); out.gain.linearRampToValueAtTime(v, t + 0.14);
    out.gain.setValueAtTime(v, t + dur - 0.15); out.gain.linearRampToValueAtTime(0.0001, t + dur + 0.1);
    const f1 = AC.createBiquadFilter(), f2 = AC.createBiquadFilter(), g2 = AC.createGain();
    f1.type = f2.type = 'bandpass'; f1.frequency.value = F[0]; f2.frequency.value = F[1]; f1.Q.value = 5; f2.Q.value = 7; g2.gain.value = 0.6;
    f1.connect(out); f2.connect(g2); g2.connect(out); out.connect(master);
    midis.forEach((m, i) => {
      for (const det of [-6, 6]) {   // two singers per note, slightly apart
        const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
        const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 5.2 + i * 0.3 + det * 0.02; lg.gain.value = 9;
        lfo.connect(lg); lg.connect(o.detune);
        const og = AC.createGain(); og.gain.value = 0.5;
        o.connect(og); og.connect(f1); og.connect(f2);
        o.start(t); lfo.start(t); o.stop(t + dur + 0.2); lfo.stop(t + dur + 0.2);
      }
    });
  },
  fanfare(t) { [72, 76, 79, 84].forEach((m, i) => SND.marimba(t + i * 0.12, m, 0.3)); SND.pad(t + 0.36, [60, 64, 67, 72], 1.2); },

  // ---- Marsh Band (folk) instruments ----
  // a plucked string (banjo, upright bass): a burst of noise that rings through a short delay loop
  pluck(t, midi, v = 0.25, bright = 0.5) {
    const key = 'pl' + midi + '_' + bright;
    if (!plucks[key]) plucks[key] = pluckBuffer(midi, bright);
    const s = AC.createBufferSource(), g = AC.createGain();
    s.buffer = plucks[key]; g.gain.value = v;
    s.connect(g); g.connect(master); s.start(t);
  },
  // upright bass: a soft finger thump, then a round low note (a few gentle overtones so small
  // speakers can still hear it) that fades quickly, like a plucked bass string
  upright(t, midi, dur, v = 0.26) {
    const f = mtof(midi), out = AC.createGain(), lp = AC.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 0.7;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(320, t + 0.12);
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(v, t + 0.008);
    out.gain.setTargetAtTime(v * 0.4, t + 0.03, 0.12); out.gain.setTargetAtTime(0.0001, t + Math.max(0.1, dur * 0.85), 0.06);
    for (const [mul, lvl, fade] of [[1, 1, 0], [2, 0.45, 0.25], [3, 0.18, 0.12]]) {
      const o = AC.createOscillator(), og = AC.createGain(); o.type = 'sine'; o.frequency.value = f * mul;
      og.gain.setValueAtTime(lvl, t); if (fade) og.gain.setTargetAtTime(lvl * 0.3, t, fade);   // overtones die away first
      o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.4);
    }
    lp.connect(out); out.connect(master);
    noise(t, 0.03, v * 0.25, 'bandpass', 220);   // the finger on the string
  },
  stomp(t, v = 0.5) {   // a foot on a wooden box
    tone('sine', 120, t, 0.16, v, { f1: 48, glide: 0.08, a: 0.002 });
    noise(t, 0.04, v * 0.35, 'bandpass', 420);
  },
  washboard(t, v = 0.07) {   // a spoon scraping the ridges: two quick scratches
    noise(t, 0.035, v, 'bandpass', 3600); noise(t + 0.025, 0.03, v * 0.7, 'bandpass', 4300);
  },
  // the hop melody in the marsh: a fiddle with a quick bow start (so the beat stays clear) and a little vibrato
  fiddle(t, midi, v = 0.32) {
    const f = mtof(midi), o = AC.createOscillator(), lp = AC.createBiquadFilter(), bp = AC.createBiquadFilter(), g = AC.createGain();
    o.type = 'sawtooth'; o.frequency.value = f;
    const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 5.6;
    lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(14, t + 0.25); lfo.connect(lg); lg.connect(o.detune);
    lp.type = 'lowpass'; lp.frequency.value = 2600; bp.type = 'peaking'; bp.frequency.value = 1100; bp.gain.value = 6; bp.Q.value = 1.2;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.55, t + 0.012);
    g.gain.setTargetAtTime(v * 0.32, t + 0.03, 0.08); g.gain.setTargetAtTime(0.0001, t + 0.32, 0.09);
    o.connect(lp); lp.connect(bp); bp.connect(g); g.connect(master);
    o.start(t); lfo.start(t); o.stop(t + 0.9); lfo.stop(t + 0.9);
    SND.pluck(t, midi, v * 0.35, 0.9);   // a touch of pluck on top makes each note start crisply
  },
};
// the instrument that plays the hop melody in each band style
const LEAD = { pop: (t, m, v) => SND.marimba(t, m, v), folk: (t, m, v) => SND.fiddle(t, m, v) };

const plucks = {};
// Karplus-Strong: noise in a delay line one period long, averaged a little each time round (it dulls and fades like a real string)
function pluckBuffer(midi, bright) {
  const sr = AC.sampleRate, f = mtof(midi), n = Math.max(2, Math.round(sr / f));
  const len = Math.round(sr * (midi < 48 ? 1.4 : 1.0)), out = new Float32Array(len), line = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) { const r = Math.random() * 2 - 1; prev = prev + bright * (r - prev); line[i] = prev; }   // softer noise = warmer string
  const keep = midi < 48 ? 0.998 : 0.994;
  for (let i = 0, k = 0; i < len; i++, k = (k + 1) % n) {
    const nx = line[(k + 1) % n]; out[i] = line[k];
    line[k] = keep * 0.5 * (line[k] + nx);
  }
  let peak = 0; for (let i = 0; i < Math.min(len, n * 4); i++) peak = Math.max(peak, Math.abs(out[i]));
  for (let i = 0; i < len; i++) out[i] /= peak || 1;
  const b = AC.createBuffer(1, len, sr); b.getChannelData(0).set(out);
  return b;
}
