// The world map: every habitat as an island, plus the player's home.
'use strict';

const ISLANDS = {   // where each habitat sits on the world map
  sunny: [200, 215], marsh: [450, 165], bayou: [705, 190], mountain: [930, 280], lagoon: [835, 480], moonlit: [575, 455],
};
const HOME_XY = [250, 460];
// grass colour of each island (night for Moonlit Lake, dusk for the Bayou...)
const ISLAND_GRASS = { bayou: '#79a85e', mountain: '#a6d68a', lagoon: '#a8e09a', moonlit: '#3f6f78' };

function habStars(hab) { return hab.levels.reduce((a, id) => a + (progress.best[id] || 0), 0); }

// a small picture for each habitat, drawn around (0, 0)
function islandArt(id, g) {
  const line = { stroke: '#2b3a2e', 'stroke-width': 2.5 };
  if (id === 'sunny') {
    S('circle', { cx: 46, cy: -40, r: 20, fill: '#ffe27a', ...line }, g);
    for (const [x, y, r] of [[-38, 6, 22], [8, 16, 18], [-6, -14, 14]]) S('path', { d: padPath(x, y, r, 0.6 + x), fill: '#62b950', ...line, 'stroke-width': 2 }, g);
    S('circle', { cx: 6, cy: 14, r: 4, fill: '#ff9fb8' }, g);
  } else if (id === 'marsh') {
    for (let i = 0; i < 7; i++) { const x = -50 + i * 16, h = 46 + (i % 3) * 14;
      S('path', { d: `M${x},20 Q${x - 3},${20 - h / 2} ${x + 4},${20 - h}`, stroke: '#5a8a3a', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, g);
      S('ellipse', { cx: x + 3, cy: 20 - h + 12, rx: 4.5, ry: 11, fill: '#8a5a35' }, g); }
  } else if (id === 'bayou') {
    S('path', { d: 'M-10,22 Q-14,-20 0,-38 Q14,-20 10,22 Z', fill: '#6b5a3a', ...line }, g);
    S('ellipse', { cx: 0, cy: -42, rx: 50, ry: 26, fill: '#4f7a4a', ...line }, g);
    for (let i = 0; i < 6; i++) S('path', { d: `M${-40 + i * 16},-30 q-3,30 2,52`, stroke: '#4f7a4a', 'stroke-width': 3, fill: 'none' }, g);
    for (const [x, y] of [[-48, 0], [40, -6], [26, 18], [-24, 22], [54, 20]]) { S('circle', { cx: x, cy: y, r: 7, fill: '#fff3a0', opacity: 0.45 }, g); S('circle', { cx: x, cy: y, r: 3, fill: '#ffe066' }, g); }
  } else if (id === 'mountain') {
    S('path', { d: 'M-70,24 L-20,-50 L10,-10 L36,-44 L80,24 Z', fill: '#a8b4c0', ...line }, g);
    S('path', { d: 'M-34,-30 L-20,-50 L-6,-30 L-14,-34 L-20,-28 L-27,-34 Z M26,-30 L36,-44 L46,-30 L40,-33 L35,-28 Z', fill: '#fff' }, g);
    S('path', { d: 'M8,24 Q0,4 14,-8 Q22,8 18,24 Z', fill: '#7fd0e8', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
  } else if (id === 'lagoon') {
    S('path', { d: 'M4,24 Q0,-8 12,-36', stroke: '#8a5a35', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
    for (const a of [-2.6, -1.9, -1.2, -0.5, 0.2]) S('path', { d: `M12,-36 q${Math.cos(a) * 26},${Math.sin(a) * 26 - 6} ${Math.cos(a) * 44},${Math.sin(a) * 30 + 10}`, stroke: '#3f9a4a', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
    S('circle', { cx: 10, cy: -30, r: 4.5, fill: '#6b4520' }, g); S('circle', { cx: 18, cy: -29, r: 4.5, fill: '#6b4520' }, g);
  } else if (id === 'moonlit') {
    S('path', { d: 'M28,-58 A26,26 0 1 0 54,-14 A21,21 0 1 1 28,-58 Z', fill: '#fff6d5', ...line }, g);   // crescent moon
    for (const [x, y] of [[-50, -36], [-24, -50], [-8, -24], [60, 4]]) S('path', { d: `M${x},${y - 6} L${x + 2},${y - 2} L${x + 6},${y} L${x + 2},${y + 2} L${x},${y + 6} L${x - 2},${y + 2} L${x - 6},${y} L${x - 2},${y - 2} Z`, fill: '#ffe9a0' }, g);
    S('path', { d: padPath(-26, 12, 18, 1), fill: '#4f8f7c', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
  }
}

// the cottage, drawn around (0, 0) = middle of the ground line (used here and in the garden)
function cottage(g, s = 1) {
  const c = S('g', { transform: `scale(${s})` }, g), line = { stroke: '#2b3a2e', 'stroke-width': 3, 'stroke-linejoin': 'round' };
  S('rect', { x: -70, y: -92, width: 140, height: 92, rx: 10, fill: '#fff3dc', ...line }, c);
  S('path', { d: 'M-88,-84 Q-80,-150 0,-162 Q80,-150 88,-84 Z', fill: '#e0574f', ...line }, c);
  for (const [x, y, r] of [[-44, -112, 9], [-8, -138, 8], [32, -120, 10], [58, -98, 6], [8, -104, 5]]) S('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.8, fill: '#fff8ea' }, c);
  S('rect', { x: -16, y: -56, width: 32, height: 56, rx: 15, fill: '#8a5a35', ...line }, c);
  S('circle', { cx: 9, cy: -28, r: 3, fill: '#ffe066' }, c);
  for (const x of [-50, 50]) { S('circle', { cx: x, cy: -52, r: 14, fill: '#9fdcff', ...line }, c);
    S('line', { x1: x - 14, y1: -52, x2: x + 14, y2: -52, stroke: '#2b3a2e', 'stroke-width': 2 }, c); S('line', { x1: x, y1: -66, x2: x, y2: -38, stroke: '#2b3a2e', 'stroke-width': 2 }, c); }
  S('rect', { x: 34, y: -170, width: 16, height: 30, fill: '#b98552', ...line }, c);
  return c;
}

function buildWorld() {
  const svg = $('worldmap'); svg.innerHTML = '';
  const defs = S('defs', {}, svg);
  const wg = S('radialGradient', { id: 'sea', cx: '50%', cy: '50%', r: '75%' }, defs);
  S('stop', { offset: '0%', 'stop-color': '#a8e4e0' }, wg); S('stop', { offset: '100%', 'stop-color': '#5ab0c0' }, wg);
  S('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#sea)' }, svg);
  for (const [x, y, r] of [[80, 90, 40], [1010, 100, 46], [380, 330, 30], [1040, 560, 40], [70, 580, 34], [700, 330, 26]])
    S('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.45, fill: 'none', stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 3 }, svg);
  // dotted path: home, then the habitats in order
  const pts = [HOME_XY, ...HABITATS.map(h => ISLANDS[h.id])];
  S('path', { d: 'M' + pts.map(p => p.join(',')).join(' L'), fill: 'none', stroke: 'rgba(255,255,255,0.8)', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '1 22' }, svg);
  // title sign
  const sign = S('g', {}, svg);
  S('rect', { x: 400, y: 14, width: 300, height: 58, rx: 18, fill: '#b98552', stroke: '#6b4520', 'stroke-width': 5 }, sign);
  S('text', { x: 550, y: 53, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 900, fill: '#fff8ea', stroke: '#6b4520', 'stroke-width': 1.2 }, sign, 'Frog World');

  HABITATS.forEach(hab => {
    const [cx, cy] = ISLANDS[hab.id], open = hab.levels.length > 0, th = themeOf(hab);
    const g = S('g', { class: open ? 'island' : 'island closed', tabindex: open ? 0 : -1, role: 'button', 'aria-label': hab.name }, svg);
    const body = S('g', { class: 'padBody' }, g);
    S('ellipse', { cx, cy: cy + 10, rx: 118, ry: 60, fill: 'rgba(20,70,80,0.22)' }, body);
    S('ellipse', { cx, cy, rx: 112, ry: 56, fill: '#f3dfae', stroke: '#2b3a2e', 'stroke-width': 3 }, body);
    S('ellipse', { cx, cy: cy - 6, rx: 100, ry: 46, fill: ISLAND_GRASS[hab.id] || th.grass }, body);
    const art = S('g', { transform: `translate(${cx} ${cy - 8})` }, body); islandArt(hab.id, art);
    // name plate
    S('rect', { x: cx - 92, y: cy + 40, width: 184, height: open ? 48 : 40, rx: 14, fill: 'rgba(255,248,234,0.95)', stroke: '#2b3a2e', 'stroke-width': 2.5 }, g);
    S('text', { x: cx, y: cy + 60, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 900, fill: '#2b3a2e' }, g, hab.name);
    if (open) {
      const got = habStars(hab), max = hab.levels.length * 3;
      S('text', { x: cx, y: cy + 80, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: '#5d6b5f' }, g,
        `★ ${got}/${max}   ✿ ${flowersIn(hab.id)}${hab.shop ? '' : '   (shop soon)'}`);
      const go = () => { progress.habitat = hab.id; saveProgress(); mapFrogAt = levelIndex(hab.levels[0]); goMenu(); };
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    } else S('text', { x: cx, y: cy + 74, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#5d6b5f' }, g, 'Coming soon!');
  });

  // home
  const [hx, hy] = HOME_XY;
  const hg = S('g', { class: 'island', tabindex: 0, role: 'button', 'aria-label': 'My home' }, svg);
  const hb = S('g', { class: 'padBody' }, hg);
  S('ellipse', { cx: hx, cy: hy + 10, rx: 110, ry: 54, fill: 'rgba(20,70,80,0.22)' }, hb);
  S('ellipse', { cx: hx, cy: hy, rx: 104, ry: 50, fill: '#f3dfae', stroke: '#2b3a2e', 'stroke-width': 3 }, hb);
  S('ellipse', { cx: hx, cy: hy - 6, rx: 94, ry: 40, fill: '#8fd468' }, hb);
  cottage(S('g', { transform: `translate(${hx} ${hy + 4})` }, hb), 0.5);
  S('rect', { x: hx - 60, y: hy + 36, width: 120, height: 34, rx: 12, fill: 'rgba(255,248,234,0.95)', stroke: '#2b3a2e', 'stroke-width': 2.5 }, hg);
  S('text', { x: hx, y: hy + 59, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 900, fill: '#2b3a2e' }, hg, 'My Home');
  const goHome = () => openHome();
  hg.addEventListener('click', goHome);
  hg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); } });

  // the frog waits on the habitat it was last in
  const [fx, fy] = ISLANDS[currentHabitat().id];
  svgFrog(svg, { transform: `translate(${fx + 70} ${fy - 30})` });
}
function openWorld() { G = null; mode = 'world'; buildWorld(); show('world'); }
$('btnWorld').onclick = openWorld;
$('btnWorldBack').onclick = goMenu;
