// Flowers and stars: what a finished level earns, and what's in the wallet.
'use strict';

// Starting numbers from the design plan, to tune once kids play:
// - flowers: 1 per Perfect the first time a level is cleared, then 1 per 2 Perfects (rounded up)
// - plus a level bonus: +5 for a habitat's first level, rising to +20 for its last
//   (so replaying an easy level always earns something, never zero)
// - stars: only new stars count (beating your best on a level)
const BONUS_FIRST = 5, BONUS_LAST = 20;

const totalStars = () => Object.values(progress.best).reduce((a, b) => a + b, 0);
const starsLeft = () => Math.max(0, totalStars() - (progress.starsSpent || 0));
const flowersIn = habId => (progress.flowers && progress.flowers[habId]) || 0;
const saveProgress = () => saveJSON('lilyRhythm.progress', progress);

function awardRun(L, stars, perfect) {
  const hab = habitatOf(L), list = hab.levels, pos = Math.max(0, list.indexOf(L.id));
  const prev = progress.best[L.id] || 0, first = prev === 0;
  const fromNotes = first ? perfect : Math.ceil(perfect / 2);
  const bonus = Math.round(BONUS_FIRST + (BONUS_LAST - BONUS_FIRST) * (list.length > 1 ? pos / (list.length - 1) : 0));
  const flowers = fromNotes + bonus;
  progress.flowers = progress.flowers || {};
  progress.flowers[hab.id] = flowersIn(hab.id) + flowers;
  const newStars = Math.max(0, stars - prev);
  if (stars > prev) progress.best[L.id] = stars;
  saveProgress();
  return { flowers, newStars, hab };
}

// a little flower drawn in SVG, the same one as on the pads (for wallets and price tags)
function flowerIcon(size = 22, petal = '#ff9fb8') {
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '-12 -12 24 24'); svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.classList.add('icon');
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    S('ellipse', { cx: Math.cos(a) * 6, cy: Math.sin(a) * 6, rx: 5, ry: 3.6, transform: `rotate(${a * 180 / Math.PI} ${Math.cos(a) * 6} ${Math.sin(a) * 6})`, fill: petal, stroke: '#2b3a2e', 'stroke-width': 1.2 }, svg); }
  S('circle', { cx: 0, cy: 0, r: 3.6, fill: '#ffe066', stroke: '#2b3a2e', 'stroke-width': 1.2 }, svg);
  return svg;
}
// "🌸 12  ⭐ 4" as HTML, for one habitat's flowers (or none) and the stars
function walletEl(habId) {
  const w = document.createElement('div'); w.className = 'wallet';
  if (habId) { const f = document.createElement('span'); f.append(flowerIcon(24), ` ${flowersIn(habId)}`); f.title = `${habitatById(habId).name} flowers`; w.append(f); }
  const s = document.createElement('span'); s.innerHTML = `<b class="star">★</b> ${starsLeft()}`; s.title = 'Stars to spend'; w.append(s);
  return w;
}
