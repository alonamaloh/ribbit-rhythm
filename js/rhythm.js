// Reading rhythm strings and making random rhythms
'use strict';

// =====================================================================
//  Rhythm parsing & generation
// =====================================================================
function parse(str, beats) {
  const events = [];
  const measures = str.split('|').map(s => s.trim()).filter(Boolean);
  measures.forEach((ms, mi) => {
    let pos = 0;
    ms.split(/\s+/).forEach(tok => {
      const d = DUR[tok];
      if (d == null) throw new Error('Unknown symbol ' + tok);
      events.push({ sym: tok, type: tok.endsWith('r') ? 'rest' : 'note', dur: d, beat: mi * beats + pos, measure: mi, judged: null });
      pos += d;
    });
    if (Math.abs(pos - beats) > 1e-6) console.warn('Measure', mi + 1, 'has', pos, 'beats');
  });
  for (let i = 0; i < events.length - 1; i++) {
    const a = events[i], b = events[i + 1];
    if (!a.beamed && a.sym === 'e' && b.sym === 'e' && Math.abs(a.beat % 1) < 1e-6 && Math.abs(b.beat - a.beat - 0.5) < 1e-6) {
      a.beamTo = b; a.beamed = b.beamed = true;
    }
  }
  return { events, measures: measures.length, total: measures.length * beats };
}

function generate(gen, beats) {
  const dur = s => (s === 'ee' ? 1 : DUR[s]);
  const out = [];
  for (let m = 0; m < gen.measures; m++) {
    const last = m === gen.measures - 1;
    const target = last ? beats - 2 : beats;
    let toks = null;
    for (let tries = 0; tries < 200 && !toks; tries++) {
      const t = []; let pos = 0, rests = 0, onsets = 0;
      while (pos < target - 1e-9) {
        const opts = gen.vocab.filter(s => {
          if (pos + dur(s) > target + 1e-9) return false;
          if ((s === 'h' || s === 'hr') && pos % 2 !== 0) return false;
          if (s.endsWith('r') && (rests >= 1 || (m === 0 && pos === 0))) return false;
          return true;
        });
        if (!opts.length) break;
        const s = opts[Math.floor(Math.random() * opts.length)];
        t.push(s); pos += dur(s);
        if (s.endsWith('r')) rests++; else onsets++;
      }
      if (Math.abs(pos - target) > 1e-9) continue;
      if (last) { t.push('h'); onsets++; }
      if (onsets < 2) continue;
      toks = t;
    }
    out.push(toks.map(s => (s === 'ee' ? 'e e' : s)).join(' '));
  }
  return out.join(' | ');
}
