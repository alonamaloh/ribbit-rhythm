// Saving settings and progress (localStorage)
'use strict';

// =====================================================================
//  Storage (best-effort)
// =====================================================================
function loadJSON(k, d) { try { const v = localStorage.getItem(k); return v ? Object.assign(d, JSON.parse(v)) : d; } catch (e) { return d; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
const settings = loadJSON('lilyRhythm.settings', { counts: true, cricket: true, speed: 1, guide: 'auto', practice: false });
// best: stars per level id · flowers: per habitat id · starsSpent: stars used in shops
// owned: items bought · placed: which item sits in each home slot · habitat: the one last visited
const progress = loadJSON('lilyRhythm.progress', { best: {}, flowers: {}, starsSpent: 0, owned: {}, placed: {}, habitat: 'sunny' });
