// A habitat's shop: its own items (paid with its flowers) plus the star items.
'use strict';

const WHERE = { wall: 'for a wall', floor: 'for inside', rug: 'for the floor', lawn: 'for the garden', tree: 'for the garden' };

function canAfford(item) { return item.shop === 'star' ? starsLeft() >= item.price : flowersIn(item.shop) >= item.price; }
function buy(item) {
  if (progress.owned[item.id] || !canAfford(item)) return false;
  if (item.shop === 'star') progress.starsSpent = (progress.starsSpent || 0) + item.price;
  else progress.flowers[item.shop] -= item.price;
  progress.owned[item.id] = true; saveProgress();
  try { ensureAudio(); SND.fanfare(AC.currentTime + 0.02); } catch (e) {}
  return true;
}

function priceEl(item) {
  const p = document.createElement('span'); p.className = 'price';
  if (item.shop === 'star') p.innerHTML = `<b class="star">★</b> ${item.price}`;
  else p.append(flowerIcon(22), ` ${item.price}`);
  return p;
}

function buildShop(note) {
  const hab = currentHabitat();
  $('shopTitle').textContent = `${hab.name} Shop`;
  const w = $('shopWallet'); w.innerHTML = ''; w.append(walletEl(hab.id));
  $('shopNote').textContent = note || 'Spend your flowers here. Star items are sold in every shop!';
  const grid = $('shopGrid'); grid.innerHTML = '';
  for (const item of ITEMS.filter(it => it.shop === hab.id || it.shop === 'star')) {
    const card = document.createElement('div'); card.className = 'card' + (item.shop === 'star' ? ' starItem' : '');
    const name = document.createElement('div'); name.className = 'name'; name.textContent = item.name;
    const where = document.createElement('div'); where.className = 'small'; where.textContent = WHERE[item.slot];
    const btn = document.createElement('button');
    if (progress.owned[item.id]) { btn.textContent = '✓ In your home'; btn.className = 'soft'; btn.disabled = true; }
    else if (canAfford(item)) {
      btn.className = 'go'; btn.append('Buy ', priceEl(item));
      btn.onclick = () => { if (buy(item)) buildShop(`Yay! The ${item.name.toLowerCase()} is waiting for you at home.`); };
    } else {
      const need = item.price - (item.shop === 'star' ? starsLeft() : flowersIn(item.shop));
      btn.className = 'soft'; btn.disabled = true; btn.append(priceEl(item), ` (${need} more)`);
    }
    card.append(itemPreview(item, 86), name, where, btn);
    grid.append(card);
  }
}
function openShop() { G = null; mode = 'shop'; buildShop(); show('shop'); }
$('btnShop').onclick = openShop;
$('btnShopBack').onclick = goMenu;
$('btnShopHome').onclick = () => openHome();
