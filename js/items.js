// Things to buy for the home: what they cost, where they go, and how each is drawn.
'use strict';

// shop: the habitat whose flowers buy it, or 'star' (paid in stars, sold in every shop)
// slot: the kind of spot it snaps into. Inside: 'wall', 'floor', 'rug'. Outside: 'lawn', 'tree', 'pond'.
// Each item is drawn around (0, 0): the middle of its bottom edge (wall items and rugs: their middle;
// pond items: where they meet the water).
// IMPORTANT for save codes: only ever ADD items at the end of this list; never reorder or remove.
const LN = { stroke: '#2b3a2e', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
const ITEMS = [
  // ---- Sunny Pond shop ----
  { id: 'daisyPot', name: 'Daisy pot', shop: 'sunny', price: 10, slot: 'lawn', draw: g => {
    for (const [a, h] of [[-0.35, 62], [0, 74], [0.35, 58]]) {
      const x = Math.sin(a) * h, y = -26 - Math.cos(a) * h;
      S('path', { d: `M0,-26 Q${x * 0.3},${(y - 26) / 2} ${x},${y}`, stroke: '#4f9f45', 'stroke-width': 4, fill: 'none' }, g);
      for (let i = 0; i < 8; i++) { const b = i * Math.PI / 4; S('ellipse', { cx: x + Math.cos(b) * 9, cy: y + Math.sin(b) * 9, rx: 7, ry: 4, transform: `rotate(${b * 57.3} ${x + Math.cos(b) * 9} ${y + Math.sin(b) * 9})`, fill: '#fff', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g); }
      S('circle', { cx: x, cy: y, r: 6, fill: '#ffd23f', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
    }
    S('path', { d: 'M-30,-34 L30,-34 L22,0 L-22,0 Z', fill: '#e08a5a', ...LN }, g);
    S('rect', { x: -34, y: -40, width: 68, height: 12, rx: 4, fill: '#ef9d6c', ...LN }, g);
  } },
  { id: 'stool', name: 'Wooden stool', shop: 'sunny', price: 12, slot: 'floor', draw: g => {
    for (const x of [-26, 26]) S('path', { d: `M${x * 0.7},-40 L${x},0`, stroke: '#8a5a35', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    S('line', { x1: -20, y1: -18, x2: 20, y2: -18, stroke: '#8a5a35', 'stroke-width': 5 }, g);
    S('ellipse', { cx: 0, cy: -46, rx: 36, ry: 11, fill: '#c98f55', ...LN }, g);
  } },
  { id: 'sunPainting', name: 'Sun painting', shop: 'sunny', price: 18, slot: 'wall', draw: g => {
    S('rect', { x: -52, y: -40, width: 104, height: 80, rx: 6, fill: '#c98f55', ...LN }, g);
    S('rect', { x: -42, y: -30, width: 84, height: 60, fill: '#bfe8ff', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    S('circle', { cx: 18, cy: -10, r: 11, fill: '#ffd23f' }, g);
    S('path', { d: 'M-42,30 L-42,14 Q-20,-2 0,14 Q20,2 42,16 L42,30 Z', fill: '#8fd468' }, g);
  } },
  { id: 'sunflower', name: 'Sunflower', shop: 'sunny', price: 15, slot: 'lawn', draw: g => {
    S('path', { d: 'M0,0 Q-6,-60 0,-118', stroke: '#4f9f45', 'stroke-width': 6, fill: 'none' }, g);
    S('path', { d: 'M-2,-50 Q-30,-66 -38,-48 Q-20,-40 -2,-50 Z M0,-74 Q28,-92 36,-72 Q18,-64 0,-74 Z', fill: '#6fbf4f', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    for (let i = 0; i < 12; i++) { const b = i * Math.PI / 6, x = Math.cos(b) * 20, y = -124 + Math.sin(b) * 20;
      S('ellipse', { cx: x, cy: y, rx: 12, ry: 6, transform: `rotate(${b * 57.3} ${x} ${y})`, fill: '#ffcf33', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g); }
    S('circle', { cx: 0, cy: -124, r: 14, fill: '#8a5a35', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
  } },
  { id: 'lilyLamp', name: 'Lily lamp', shop: 'sunny', price: 22, slot: 'floor', draw: g => {
    S('ellipse', { cx: 0, cy: -4, rx: 24, ry: 7, fill: '#7a6a5a', ...LN }, g);
    S('line', { x1: 0, y1: -8, x2: 0, y2: -104, stroke: '#7a6a5a', 'stroke-width': 6 }, g);
    S('circle', { cx: 0, cy: -100, r: 22, fill: '#fff3a0', opacity: 0.5 }, g);
    S('path', { d: 'M-36,-104 Q0,-150 36,-104 Q0,-94 -36,-104 Z', fill: '#69c457', ...LN }, g);
    S('circle', { cx: 0, cy: -132, r: 5, fill: '#ff9fb8', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
  } },
  { id: 'stripedRug', name: 'Striped rug', shop: 'sunny', price: 25, slot: 'rug', draw: g => {
    S('ellipse', { cx: 0, cy: 0, rx: 120, ry: 34, fill: '#ffe9a8', ...LN }, g);
    for (const [r, c] of [[94, '#ff9fb8'], [68, '#9fdcff'], [42, '#b7e68a'], [16, '#ffe066']]) S('ellipse', { cx: 0, cy: 0, rx: r, ry: r * 0.28, fill: c }, g);
  } },
  { id: 'mailbox', name: 'Frog mailbox', shop: 'sunny', price: 30, slot: 'lawn', draw: g => {
    S('rect', { x: -5, y: -70, width: 10, height: 70, fill: '#8a5a35', ...LN }, g);
    S('path', { d: 'M-30,-70 L-30,-100 Q-30,-118 0,-118 Q30,-118 30,-100 L30,-70 Z', fill: '#7fd45e', ...LN }, g);
    for (const x of [-12, 12]) { S('circle', { cx: x, cy: -118, r: 8, fill: '#7fd45e', ...LN, 'stroke-width': 2 }, g); S('circle', { cx: x + 1, cy: -119, r: 3, fill: '#1f2a22' }, g); }
    S('line', { x1: 30, y1: -96, x2: 30, y2: -124, stroke: '#2b3a2e', 'stroke-width': 3 }, g);
    S('path', { d: 'M30,-124 L48,-118 L30,-112 Z', fill: '#e0457b', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
  } },
  // ---- Reed Marsh shop ----
  { id: 'cattailVase', name: 'Cattail vase', shop: 'marsh', price: 20, slot: 'floor', draw: g => {
    for (const [x, h] of [[-14, 96], [0, 116], [14, 90]]) {
      S('path', { d: `M0,-40 Q${x * 0.4},${-40 - h / 2} ${x},${-40 - h}`, stroke: '#5a8a3a', 'stroke-width': 4, fill: 'none' }, g);
      S('ellipse', { cx: x * 0.95, cy: -40 - h + 16, rx: 6, ry: 15, fill: '#8a5a35', stroke: '#2b3a2e', 'stroke-width': 2 }, g); }
    S('path', { d: 'M-18,-46 Q-34,-20 -20,0 L20,0 Q34,-20 18,-46 Z', fill: '#7fb3c9', ...LN }, g);
  } },
  { id: 'reedBasket', name: 'Reed basket', shop: 'marsh', price: 25, slot: 'floor', draw: g => {
    S('path', { d: 'M-40,-48 L40,-48 L32,0 L-32,0 Z', fill: '#d9b277', ...LN }, g);
    for (const y of [-36, -24, -12]) S('line', { x1: -38 + (48 + y) * 0.03, y1: y, x2: 38 - (48 + y) * 0.03, y2: y, stroke: '#a8743f', 'stroke-width': 3 }, g);
    S('path', { d: 'M-30,-48 Q0,-90 30,-48', stroke: '#a8743f', 'stroke-width': 6, fill: 'none' }, g);
    S('circle', { cx: -14, cy: -54, r: 9, fill: '#e0574f', ...LN, 'stroke-width': 2 }, g); S('circle', { cx: 8, cy: -56, r: 9, fill: '#ffcf33', ...LN, 'stroke-width': 2 }, g);
  } },
  { id: 'rushRug', name: 'Rush rug', shop: 'marsh', price: 30, slot: 'rug', draw: g => {
    S('rect', { x: -120, y: -30, width: 240, height: 60, rx: 26, fill: '#c9b27a', ...LN }, g);
    for (let x = -100; x <= 100; x += 20) S('line', { x1: x, y1: -22, x2: x, y2: 22, stroke: '#a89058', 'stroke-width': 4 }, g);
    S('rect', { x: -120, y: -30, width: 240, height: 60, rx: 26, fill: 'none', stroke: '#6f8f4f', 'stroke-width': 6 }, g);
  } },
  { id: 'dragonflyPainting', name: 'Dragonfly painting', shop: 'marsh', price: 35, slot: 'wall', draw: g => {
    S('rect', { x: -48, y: -48, width: 96, height: 96, rx: 48, fill: '#8a6a45', ...LN }, g);
    S('circle', { cx: 0, cy: 0, r: 38, fill: '#d6efe0', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    for (const s of [-1, 1]) for (const dy of [-6, 6]) S('ellipse', { cx: s * 16, cy: dy - 4, rx: 17, ry: 6, transform: `rotate(${s * dy * 1.5} ${s * 16} ${dy - 4})`, fill: '#a8dcf0', stroke: '#2b3a2e', 'stroke-width': 1.5, opacity: 0.9 }, g);
    S('rect', { x: -3.5, y: -16, width: 7, height: 40, rx: 3.5, fill: '#3f9ab8', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
    S('circle', { cx: 0, cy: -18, r: 6, fill: '#3f9ab8', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
  } },
  { id: 'heron', name: 'Heron statue', shop: 'marsh', price: 40, slot: 'lawn', draw: g => {
    S('rect', { x: -26, y: -16, width: 52, height: 16, rx: 4, fill: '#b6c0c3', ...LN }, g);
    for (const x of [-6, 6]) S('line', { x1: x, y1: -16, x2: x * 0.6, y2: -58, stroke: '#9aa4a8', 'stroke-width': 4 }, g);
    S('ellipse', { cx: -4, cy: -74, rx: 26, ry: 18, fill: '#dfe6e8', ...LN }, g);
    S('path', { d: 'M12,-82 Q24,-112 12,-128', stroke: '#dfe6e8', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, g);
    S('path', { d: 'M12,-82 Q24,-112 12,-128', stroke: '#2b3a2e', 'stroke-width': 1, fill: 'none', opacity: 0.4 }, g);
    S('circle', { cx: 12, cy: -130, r: 9, fill: '#dfe6e8', ...LN, 'stroke-width': 2 }, g);
    S('path', { d: 'M19,-132 L44,-128 L19,-125 Z', fill: '#e8b13a', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
    S('circle', { cx: 14, cy: -132, r: 2, fill: '#1f2a22' }, g);
  } },
  { id: 'willow', name: 'Willow tree', shop: 'marsh', price: 50, slot: 'tree', draw: g => {
    S('path', { d: 'M-14,0 Q-8,-80 -4,-150 L8,-150 Q10,-80 16,0 Z', fill: '#8a6a45', ...LN }, g);
    S('ellipse', { cx: 0, cy: -170, rx: 92, ry: 56, fill: '#7fb35a', ...LN }, g);
    for (let i = 0; i < 9; i++) { const x = -80 + i * 20; S('path', { d: `M${x},-160 Q${x - 6},-110 ${x + 2},-${70 + (i % 3) * 14}`, stroke: '#6f9f4a', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g); }
  } },
  // ---- Star items (any shop, paid with stars) ----
  { id: 'goldFrog', name: 'Golden frog statue', shop: 'star', price: 10, slot: 'lawn', draw: g => {
    S('rect', { x: -32, y: -22, width: 64, height: 22, rx: 5, fill: '#b6c0c3', ...LN }, g);
    const f = S('g', { transform: 'translate(0 -46) scale(1.2)' }, g);
    S('ellipse', { cx: 0, cy: 0, rx: 24, ry: 18, fill: '#ffcf33', ...LN, 'stroke-width': 2.5 }, f);
    for (const x of [-11, 11]) { S('circle', { cx: x, cy: -16, r: 8, fill: '#ffcf33', ...LN, 'stroke-width': 2.5 }, f); S('circle', { cx: x + 1, cy: -17, r: 3, fill: '#8a6a10' }, f); }
    S('path', { d: 'M-6,-4 Q0,2 6,-4', stroke: '#8a6a10', 'stroke-width': 2, fill: 'none' }, f);
    S('path', { d: 'M18,-30 l3,6 6,1 -4,4 1,6 -6,-3 -6,3 1,-6 -4,-4 6,-1 Z', fill: '#fff8c0' }, f);
  } },
  { id: 'fountain', name: 'Fountain', shop: 'star', price: 20, slot: 'lawn', draw: g => {
    S('ellipse', { cx: 0, cy: -12, rx: 56, ry: 16, fill: '#b6c0c3', ...LN }, g);
    S('path', { d: 'M-56,-12 L-56,0 Q0,16 56,0 L56,-12', fill: '#9aa4a8', ...LN }, g);
    S('ellipse', { cx: 0, cy: -14, rx: 46, ry: 11, fill: '#7fd0e8' }, g);
    S('rect', { x: -7, y: -70, width: 14, height: 58, fill: '#b6c0c3', ...LN }, g);
    S('ellipse', { cx: 0, cy: -70, rx: 26, ry: 8, fill: '#b6c0c3', ...LN }, g);
    for (const s of [-1, 1]) S('path', { d: `M0,-80 Q${s * 30},-110 ${s * 36},-24`, stroke: '#9fe0f0', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
    S('path', { d: 'M0,-74 L0,-104', stroke: '#9fe0f0', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
  } },
  { id: 'piano', name: 'Grand piano', shop: 'star', price: 30, slot: 'floor', draw: g => {
    for (const x of [-48, 30]) S('rect', { x, y: -44, width: 10, height: 44, fill: '#2b2b33', ...LN, 'stroke-width': 2 }, g);
    S('path', { d: 'M-60,-44 L-60,-74 L20,-74 Q70,-74 70,-56 L70,-44 Z', fill: '#34343e', ...LN }, g);
    S('path', { d: 'M-56,-74 L-40,-120 L10,-84', fill: '#3e3e4a', ...LN }, g);
    S('rect', { x: -60, y: -52, width: 64, height: 10, fill: '#fff', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    for (let i = 0; i < 7; i++) S('rect', { x: -56 + i * 9, y: -52, width: 4, height: 6, fill: '#1f1f25' }, g);
    S('text', { x: 40, y: -86, 'font-size': 22, fill: '#7a4fc9' }, g, '♪');
  } },
  // ---- Pond items (they float) ----
  { id: 'waterLily', name: 'Water lily', shop: 'sunny', price: 10, slot: 'pond', draw: g => {
    S('path', { d: padPath(0, -2, 40, 1.2), transform: 'translate(0 -2) scale(1 0.42) translate(0 2)', fill: '#62b950', ...LN }, g);
    for (let k = 0; k < 2; k++) for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + k * 0.5, r = k ? 7 : 11;
      S('ellipse', { cx: Math.cos(a) * r, cy: -14 + Math.sin(a) * r * 0.5 - k * 6, rx: k ? 6 : 8, ry: k ? 9 : 11, transform: `rotate(${a * 57.3 + 90} ${Math.cos(a) * r} ${-14 + Math.sin(a) * r * 0.5 - k * 6})`, fill: k ? '#ffc4d4' : '#ff9fb8', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g); }
    S('circle', { cx: 0, cy: -20, r: 4.5, fill: '#ffe066', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
  } },
  { id: 'duck', name: 'Little duck', shop: 'sunny', price: 20, slot: 'pond', draw: g => {
    S('ellipse', { cx: 0, cy: 2, rx: 38, ry: 7, fill: 'rgba(255,255,255,0.5)' }, g);
    S('path', { d: 'M-30,0 Q-34,-26 -6,-26 L18,-24 Q32,-24 30,-6 Q26,4 0,4 Q-26,4 -30,0 Z', fill: '#ffe066', ...LN }, g);
    S('path', { d: 'M-30,-6 Q-40,-18 -30,-24', fill: '#ffe066', ...LN, 'stroke-width': 2.5 }, g);
    S('circle', { cx: 14, cy: -40, r: 15, fill: '#ffe066', ...LN }, g);
    S('path', { d: 'M27,-40 Q40,-40 38,-34 Q30,-31 26,-35 Z', fill: '#f39c3a', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    S('circle', { cx: 18, cy: -44, r: 2.6, fill: '#1f2a22' }, g);
    S('path', { d: 'M-12,-16 Q0,-6 10,-14', fill: 'none', stroke: '#e0b830', 'stroke-width': 3 }, g);
  } },
  { id: 'cattailIsland', name: 'Cattail island', shop: 'marsh', price: 25, slot: 'pond', draw: g => {
    for (const [x, h] of [[-18, 70], [-4, 92], [10, 76], [22, 60]]) {
      S('path', { d: `M${x},-6 Q${x - 2},${-6 - h / 2} ${x + 4},${-6 - h}`, stroke: '#5a8a3a', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      S('ellipse', { cx: x + 3.5, cy: -6 - h + 13, rx: 5, ry: 12, fill: '#8a5a35', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g); }
    S('path', { d: 'M-44,2 Q-40,-16 0,-16 Q40,-16 44,2 Q0,10 -44,2 Z', fill: '#8a6a45', ...LN }, g);
    S('path', { d: 'M-36,-6 Q0,-20 36,-6', stroke: '#6fbf4f', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
  } },
  { id: 'rowboat', name: 'Rowboat', shop: 'marsh', price: 35, slot: 'pond', draw: g => {
    S('line', { x1: -56, y1: -2, x2: -20, y2: -28, stroke: '#8a5a35', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    S('ellipse', { cx: -58, cy: 0, rx: 9, ry: 4, fill: '#a8743f', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
    S('path', { d: 'M-50,-30 L50,-30 Q44,6 0,6 Q-44,6 -50,-30 Z', fill: '#c98f55', ...LN }, g);
    S('path', { d: 'M-48,-22 L48,-22', stroke: '#e0574f', 'stroke-width': 5 }, g);
    S('rect', { x: -8, y: -36, width: 16, height: 8, rx: 2, fill: '#a8743f', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    S('line', { x1: 44, y1: -2, x2: 16, y2: -28, stroke: '#8a5a35', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
  } },
  { id: 'swanBoat', name: 'Swan boat', shop: 'star', price: 15, slot: 'pond', draw: g => {
    S('path', { d: 'M-50,-22 Q-58,4 0,4 Q48,4 50,-24 Q30,-14 -50,-22 Z', fill: '#fff', ...LN }, g);
    S('path', { d: 'M-46,-24 Q-30,-46 -6,-26 Q-20,-34 -46,-24 Z', fill: '#f1f1f6', stroke: '#2b3a2e', 'stroke-width': 2 }, g);
    S('path', { d: 'M40,-22 Q30,-60 44,-80 Q58,-94 64,-78', fill: 'none', stroke: '#2b3a2e', 'stroke-width': 13, 'stroke-linecap': 'round' }, g);
    S('path', { d: 'M40,-22 Q30,-60 44,-80 Q58,-94 64,-78', fill: 'none', stroke: '#fff', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    S('path', { d: 'M63,-80 L78,-74 L63,-71 Z', fill: '#f39c3a', stroke: '#2b3a2e', 'stroke-width': 1.5 }, g);
    S('circle', { cx: 56, cy: -82, r: 2.2, fill: '#1f2a22' }, g);
    S('path', { d: 'M-20,-8 L20,-8', stroke: '#ffcf33', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  } },
];
const itemById = id => ITEMS.find(it => it.id === id);

// an item drawn on its own little SVG, for shop cards and the item picker
function itemPreview(item, size = 110) {
  const svg = document.createElementNS(SVGNS, 'svg');
  const box = { wall: '-60 -55 120 110', rug: '-130 -60 260 120', tree: '-110 -240 220 250', pond: '-70 -96 150 104', lawn: '-60 -140 120 150', floor: '-75 -130 150 140' }[item.slot];
  svg.setAttribute('viewBox', box); svg.setAttribute('width', size); svg.setAttribute('height', size);
  item.draw(S('g', {}, svg));
  return svg;
}
