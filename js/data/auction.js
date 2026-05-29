// 拍卖会：拍品池与刷新间隔
const AUCTION_REFRESH_MS = 20 * 60 * 1000; // 20 分钟刷新

const AUCTION_DIAMOND_ITEMS = [
  { id: 'dia_w9', name: '青锋剑·拍品', slot: 'weapon', stats: { atk: 26, spAtk: 5, critRate: 0.05 }, rarity: 'epic', desc: '拍卖会稀世兵器', diamondPrice: 15 },
  { id: 'dia_a6', name: '锐眼符·珍藏', slot: 'accessory', stats: { critRate: 0.05, atk: 3 }, rarity: 'rare', desc: '拍卖会限量', diamondPrice: 8 },
  { id: 'dia_m6', name: '独孤九剑残页', type: 'manual', stats: { atk: 14, spAtk: 10, critRate: 0.06 }, rarity: 'epic', desc: '拍卖会秘籍', diamondPrice: 20 },
  { id: 'dia_kz_feet', name: '狂战靴·极品', slot: 'feet', setId: 'kuangzhan', stats: { atk: 4, speed: 3 }, rarity: 'rare', desc: '拍卖会套装件', diamondPrice: 10 },
];

function pickAuctionGoldItem(st) {
  const lv = st.level;
  const pool = [];
  if (lv >= 1) pool.push(...WEAPONS.filter(w => w.price <= 200));
  if (lv >= 3) pool.push(...WEAPONS.filter(w => w.price > 200 && w.price <= 500));
  if (lv >= 5) pool.push(...SET_ITEMS.slice(0, 8));
  if (lv >= 6) pool.push(...ACCESSORIES);
  if (lv >= 8) pool.push(...WEAPONS.filter(w => w.price > 500));
  if (lv >= 4) pool.push(...MANUALS.filter(m => m.price <= 300));
  if (!pool.length) pool.push(...WEAPONS.slice(0, 3));
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  const discount = 0.82 + Math.random() * 0.13; // 82%~95%
  return {
    item: { ...tpl, uid: 'auc_' + Date.now() + Math.random() },
    currency: 'gold',
    price: Math.max(10, Math.floor(tpl.price * discount)),
  };
}

function pickAuctionDiamondItem(st) {
  const pool = AUCTION_DIAMOND_ITEMS.filter(i => {
    if (i.type === 'manual') {
      return !st.skills.some(s => s.id === i.id) && !st.bag.some(b => b.id === i.id && b.type === 'manual');
    }
    return true;
  });
  if (!pool.length) return null;
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return {
    item: { ...tpl, uid: 'auc_d_' + Date.now() + Math.random() },
    currency: 'diamond',
    price: tpl.diamondPrice,
  };
}

function generateAuctionLots(st) {
  const lots = [];
  const now = Date.now();
  const goldCount = 4;
  for (let i = 0; i < goldCount; i++) {
    const g = pickAuctionGoldItem(st);
    lots.push({ id: `lot_g_${now}_${i}`, ...g, sold: false });
  }
  const d = pickAuctionDiamondItem(st);
  if (d) lots.push({ id: `lot_d_${now}`, ...d, sold: false });
  const d2 = pickAuctionDiamondItem(st);
  if (d2 && d2.item.id !== d?.item.id) lots.push({ id: `lot_d2_${now}`, ...d2, sold: false });
  return lots.slice(0, 6);
}
