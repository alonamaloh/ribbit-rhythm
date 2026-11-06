// Saving settings and progress (localStorage)
'use strict';

// =====================================================================
//  Storage (best-effort)
// =====================================================================
function loadJSON(k, d) { try { const v = localStorage.getItem(k); return v ? Object.assign(d, JSON.parse(v)) : d; } catch (e) { return d; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
const settings = loadJSON('lilyRhythm.settings', { counts: true, cricket: true, speed: 1, calib: 0, guide: 'auto', practice: false });
const progress = loadJSON('lilyRhythm.progress', { best: {} });
