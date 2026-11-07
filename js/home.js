// The player's home: a garden outside and a room inside, each with spots that items snap into.
'use strict';

// Spots (slots). type must match an item's slot. x, y = where the item's (0, 0) goes.
// IMPORTANT for save codes: only ever ADD slots at the end of this list; never reorder or remove.
const SLOTS = [
  { id: 'tree1', scene: 'garden', type: 'tree', x: 120, y: 360 },
  { id: 'tree2', scene: 'garden', type: 'tree', x: 985, y: 360 },
  { id: 'lawn1', scene: 'garden', type: 'lawn', x: 305, y: 455 },
  { id: 'lawn2', scene: 'garden', type: 'lawn', x: 800, y: 455 },
  { id: 'lawn3', scene: 'garden', type: 'lawn', x: 430, y: 580 },
  { id: 'lawn4', scene: 'garden', type: 'lawn', x: 690, y: 580 },
  { id: 'lawn5', scene: 'garden', type: 'lawn', x: 935, y: 575 },
  { id: 'wall1', scene: 'room', type: 'wall', x: 230, y: 205 },
  { id: 'wall2', scene: 'room', type: 'wall', x: 550, y: 185 },
  { id: 'wall3', scene: 'room', type: 'wall', x: 870, y: 205 },
  { id: 'floor1', scene: 'room', type: 'floor', x: 150, y: 500 },
  { id: 'floor2', scene: 'room', type: 'floor', x: 345, y: 455 },
  { id: 'floor3', scene: 'room', type: 'floor', x: 755, y: 455 },
  { id: 'floor4', scene: 'room', type: 'floor', x: 950, y: 500 },
  { id: 'rug1', scene: 'room', type: 'rug', x: 550, y: 540 },
];
let homeScene = 'garden', pickingSlot = null;

function drawGarden(svg) {
  const sky = S('linearGradient', { id: 'hsky', x1: 0, y1: 0, x2: 0, y2: 1 }, S('defs', {}, svg));
  S('stop', { offset: '0%', 'stop-color': '#9fdcff' }, sky); S('stop', { offset: '100%', 'stop-color': '#ebfbff' }, sky);
  S('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#hsky)' }, svg);
  S('circle', { cx: 960, cy: 90, r: 40, fill: '#ffe27a' }, svg);
  for (const [x, y] of [[180, 90], [640, 70]]) { S('ellipse', { cx: x, cy: y, rx: 50, ry: 18, fill: '#fff' }, svg); S('ellipse', { cx: x + 30, cy: y - 10, rx: 30, ry: 18, fill: '#fff' }, svg); }
  S('ellipse', { cx: 250, cy: 380, rx: 420, ry: 110, fill: '#b2e2a4' }, svg); S('ellipse', { cx: 900, cy: 390, rx: 400, ry: 100, fill: '#a3da93' }, svg);
  S('rect', { x: 0, y: 360, width: W, height: H - 360, fill: '#8fd468' }, svg);
  // a little pond beside the house
  S('ellipse', { cx: 150, cy: 545, rx: 130, ry: 46, fill: '#6fc3cf', stroke: '#2b3a2e', 'stroke-width': 3 }, svg);
  S('path', { d: padPath(110, 545, 20, 0.5), fill: '#62b950', stroke: '#2b3a2e', 'stroke-width': 2 }, svg);
  S('path', { d: padPath(190, 532, 15, 2), fill: '#62b950', stroke: '#2b3a2e', 'stroke-width': 2 }, svg);
  // stepping-stone path from the door
  for (const [x, y, r] of [[550, 410, 22], [560, 452, 24], [545, 500, 26], [560, 552, 28], [548, 604, 30]]) S('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.42, fill: '#d8d0c0', stroke: '#2b3a2e', 'stroke-width': 2 }, svg);
  const house = cottage(S('g', { transform: 'translate(550 390)' }, svg), 1.35);
  const door = S('rect', { x: -18, y: -58, width: 36, height: 58, rx: 16, fill: 'transparent', class: 'doorHit', role: 'button', 'aria-label': 'Go inside' }, house);
  door.addEventListener('click', () => { homeScene = 'room'; buildHome(); });
  svgFrog(svg, { transform: 'translate(612 392) scale(0.9)' });
}

function drawRoom(svg) {
  S('rect', { x: 0, y: 0, width: W, height: 400, fill: '#fde7c8' }, svg);
  for (let x = 40; x < W; x += 80) for (let y = 40; y < 390; y += 80) S('circle', { cx: x + ((y / 80) % 2) * 40, cy: y, r: 4, fill: '#f7cfa0' }, svg);
  S('rect', { x: 0, y: 388, width: W, height: 14, fill: '#c98f55', stroke: '#2b3a2e', 'stroke-width': 3 }, svg);
  S('rect', { x: 0, y: 400, width: W, height: H - 400, fill: '#d9a86a' }, svg);
  for (let y = 430; y < H; y += 40) S('line', { x1: 0, y1: y, x2: W, y2: y, stroke: '#c49255', 'stroke-width': 2 }, svg);
  for (const x of [390, 710]) {
    S('rect', { x: x - 48, y: 150, width: 96, height: 110, rx: 46, fill: '#9fdcff', stroke: '#2b3a2e', 'stroke-width': 4 }, svg);
    S('path', { d: `M${x - 44},236 Q${x},214 ${x + 44},232 L${x + 44},252 L${x - 44},252 Z`, fill: '#8fd468' }, svg);
    S('line', { x1: x, y1: 152, x2: x, y2: 258, stroke: '#2b3a2e', 'stroke-width': 3 }, svg);
  }
  svgFrog(svg, { transform: 'translate(550 470) scale(1.1)' });
}

function drawSlot(svg, slot) {
  const itemId = progress.placed[slot.id], item = itemId && progress.owned[itemId] && itemById(itemId);
  const g = S('g', { class: 'slot' + (item ? ' full' : ''), role: 'button', tabindex: 0, 'aria-label': item ? item.name : 'Empty spot' }, svg);
  if (item) item.draw(S('g', { transform: `translate(${slot.x} ${slot.y})` }, g));
  else {
    const hint = { stroke: 'rgba(43,58,46,0.45)', 'stroke-width': 3, 'stroke-dasharray': '8 7', fill: 'rgba(255,255,255,0.35)' };
    if (slot.type === 'wall') S('rect', { x: slot.x - 44, y: slot.y - 36, width: 88, height: 72, rx: 14, ...hint }, g);
    else if (slot.type === 'rug') S('ellipse', { cx: slot.x, cy: slot.y, rx: 110, ry: 30, ...hint }, g);
    else S('ellipse', { cx: slot.x, cy: slot.y - 4, rx: slot.type === 'tree' ? 56 : 42, ry: 16, ...hint }, g);
    const cy = slot.type === 'wall' || slot.type === 'rug' ? slot.y : slot.y - 4;
    S('circle', { cx: slot.x, cy, r: 13, fill: '#fff8ea', stroke: '#2b3a2e', 'stroke-width': 2.5 }, g);
    S('text', { x: slot.x, y: cy + 6.5, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 900, fill: '#2f7a3a' }, g, '+');
  }
  const pick = () => openPicker(slot);
  g.addEventListener('click', pick);
  g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
}

function buildHome() {
  const svg = $('homeview'); svg.innerHTML = '';
  if (homeScene === 'garden') drawGarden(svg); else drawRoom(svg);
  // tall things further back are drawn first so nearer ones overlap them
  SLOTS.filter(s => s.scene === homeScene).sort((a, b) => a.y - b.y).forEach(s => drawSlot(svg, s));
  $('btnInOut').textContent = homeScene === 'garden' ? '🚪 Go inside' : '🌳 Go outside';
  $('homeTitle').textContent = homeScene === 'garden' ? 'My Garden' : 'My Room';
  closePicker();
}

function openPicker(slot) {
  pickingSlot = slot;
  const box = $('picker'), list = $('pickList'); list.innerHTML = '';
  const here = progress.placed[slot.id];
  const mine = ITEMS.filter(it => it.slot === slot.type && progress.owned[it.id]);
  $('pickTitle').textContent = mine.length ? 'What goes here?' : 'Nothing for this spot yet';
  for (const item of mine) {
    const b = document.createElement('button'); b.className = 'pickItem' + (item.id === here ? ' on' : '');
    const elsewhere = Object.keys(progress.placed).find(k => k !== slot.id && progress.placed[k] === item.id);
    b.append(itemPreview(item, 76), document.createElement('br'), item.name + (elsewhere ? ' (move here)' : ''));
    b.onclick = () => { if (elsewhere) delete progress.placed[elsewhere]; progress.placed[slot.id] = item.id; saveProgress(); buildHome(); };
    list.append(b);
  }
  if (!mine.length) {
    const p = document.createElement('div'); p.className = 'tip';
    const sold = ITEMS.filter(it => it.slot === slot.type).map(it => it.name.toLowerCase());
    p.textContent = `Shops sell things for this spot, like the ${sold.slice(0, 3).join(', ')}. Earn flowers by hopping, then visit a shop!`;
    list.append(p);
  }
  $('btnPutAway').hidden = !here;
  box.hidden = false;
}
function closePicker() { pickingSlot = null; $('picker').hidden = true; }
$('btnPutAway').onclick = () => { if (pickingSlot) { delete progress.placed[pickingSlot.id]; saveProgress(); buildHome(); } };
$('btnPickClose').onclick = closePicker;

function openHome() { G = null; mode = 'home'; buildHome(); show('home'); }
$('btnHome').onclick = () => { homeScene = 'garden'; openHome(); };
$('btnInOut').onclick = () => { homeScene = homeScene === 'garden' ? 'room' : 'garden'; buildHome(); };
$('btnHomeBack').onclick = goMenu;
$('btnHomeWorld').onclick = openWorld;
