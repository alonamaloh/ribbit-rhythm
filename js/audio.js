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
const tp = () => AC.currentTime - hwLatency() - settings.calib;   // "perceived" time
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
  // "rib-bit": two buzzy syllables (a rattling vocal-sac sound) with a falling pitch
  ribbit(t, mul = 1, v = 0.32) {
    for (const [st, d, f] of [[0, 0.09, 1], [0.15, 0.14, 0.82]]) {
      const at = t + st, o = AC.createOscillator(), bp = AC.createBiquadFilter(), g = AC.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(230 * mul * f, at); o.frequency.exponentialRampToValueAtTime(150 * mul * f, at + d);
      bp.type = 'bandpass'; bp.frequency.value = 950 * mul; bp.Q.value = 2.2;
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(v, at + 0.012); g.gain.setValueAtTime(v, at + d - 0.03); g.gain.linearRampToValueAtTime(0.0001, at + d);
      const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.type = 'square'; lfo.frequency.value = 42; lg.gain.value = v * 0.8;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(bp); bp.connect(g); g.connect(master);
      o.start(at); lfo.start(at); o.stop(at + d + 0.02); lfo.stop(at + d + 0.02);
    }
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
};
