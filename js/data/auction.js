// 拍卖会：拍品池与刷新间隔
const AUCTION_REFRESH_MS = 20 * 60 * 1000; // 20 分钟刷新

/** v3.4 传说装备 · 仅拍卖会 / 特殊事件，钻石高价 */
const AUCTION_LEGENDARY_ITEMS = [
  { sourceId: 'w11', diamondPrice: 120, minLevel: 12 },
  { sourceId: 'w14', diamondPrice: 100, minLevel: 10 },
  { sourceId: 'a12', diamondPrice: 90, minLevel: 8 },
];

const AUCTION_DIAMOND_ITEMS = [
  { id: 'dia_w9', name: '青锋剑·拍品', slot: 'weapon', stats: { atk: 26, spAtk: 5, critRate: 0.05 }, rarity: 'epic', desc: '拍卖会稀世兵器', diamondPrice: 15 },
  { id: 'dia_a6', name: '锐眼符·珍藏', slot: 'accessory', stats: { critRate: 0.05, atk: 3 }, rarity: 'rare', desc: '拍卖会限量', diamondPrice: 8 },
  { id: 'dia_m6', name: '独孤九剑残页', type: 'manual', stats: { atk: 14, spAtk: 10, critRate: 0.06 }, rarity: 'epic', desc: '拍卖会秘籍', diamondPrice: 20 },
  { id: 'dia_kz_feet', name: '狂战靴·极品', slot: 'feet', setId: 'kuangzhan', stats: { atk: 4, speed: 3 }, rarity: 'rare', desc: '拍卖会套装件', diamondPrice: 10 },
];

const AUCTION_PET_PRICES = {
  common: { gold: 680, diamond: 14 },
  rare: { gold: 1280, diamond: 24 },
  epic: { gold: 2200, diamond: 38 },
};

function findCatalogItem(id) {
  return WEAPONS.find(w => w.id === id)
    || ACCESSORIES.find(a => a.id === id)
    || null;
}

function isLegendaryCatalogItem(item) {
  return item?.rarity === 'legendary' || item?.auctionOnly || item?.eventOnly;
}

function playerOwnsItemId(st, itemId) {
  if (!itemId) return false;
  if (Object.values(st.equip || {}).some(i => i?.id === itemId)) return true;
  return (st.bag || []).some(i => i.id === itemId);
}

function pickAuctionGoldItem(st) {
  const lv = st.level;
  const pool = [];
  const shopWeapon = w => isShopItem(w) && w.rarity !== 'legendary';
  if (lv >= 1) pool.push(...WEAPONS.filter(w => shopWeapon(w) && w.price <= 200));
  if (lv >= 3) pool.push(...WEAPONS.filter(w => shopWeapon(w) && w.price > 200 && w.price <= 500));
  if (lv >= 5) pool.push(...SET_ITEMS.slice(0, 8), ...GEAR_ITEMS);
  if (lv >= 6) pool.push(...ACCESSORIES.filter(isShopItem));
  if (lv >= 8) pool.push(...WEAPONS.filter(w => shopWeapon(w) && w.price > 500));
  if (lv >= 4) pool.push(...MANUALS.filter(m => isShopItem(m) && m.price <= 300));
  if (!pool.length) pool.push(...WEAPONS.filter(shopWeapon).slice(0, 3));
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  const discount = 0.82 + Math.random() * 0.13;
  return {
    item: { ...tpl, uid: 'auc_' + Date.now() + Math.random() },
    currency: 'gold',
    price: Math.max(10, Math.floor(tpl.price * discount)),
    lotTag: '金币区',
  };
}

function pickAuctionDiamondItem(st, excludeIds = []) {
  const pool = AUCTION_DIAMOND_ITEMS.filter(i => {
    if (excludeIds.includes(i.id)) return false;
    if (i.type === 'manual') {
      return !st.skills.some(s => s.id === i.id) && !st.bag.some(b => b.id === i.id && b.type === 'manual');
    }
    return !playerOwnsItemId(st, i.id);
  });
  if (!pool.length) return null;
  const tpl = pool[Math.floor(Math.random() * pool.length)];
  return {
    item: { ...tpl, uid: 'auc_d_' + Date.now() + Math.random() },
    currency: 'diamond',
    price: tpl.diamondPrice,
    lotTag: '钻石区',
  };
}

function pickAuctionLegendaryItem(st) {
  const pool = AUCTION_LEGENDARY_ITEMS.filter(entry => {
    if (st.level < (entry.minLevel || 1)) return false;
    if (playerOwnsItemId(st, entry.sourceId)) return false;
    return !!findCatalogItem(entry.sourceId);
  });
  if (!pool.length) return null;
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const tpl = findCatalogItem(entry.sourceId);
  return {
    item: { ...tpl, uid: 'auc_leg_' + Date.now() + Math.random() },
    currency: 'diamond',
    price: entry.diamondPrice,
    lotTag: '传说',
  };
}

function pickAuctionPet(st) {
  const pool = PETS.filter(p => !(st.pets || []).includes(p.id));
  if (!pool.length) return null;
  const pet = pool[Math.floor(Math.random() * pool.length)];
  const prices = AUCTION_PET_PRICES[pet.rarity] || AUCTION_PET_PRICES.common;
  const useDiamond = pet.rarity !== 'common' ? Math.random() < 0.55 : Math.random() < 0.25;
  return {
    item: {
      type: 'pet',
      petId: pet.id,
      name: pet.name,
      icon: pet.icon,
      rarity: pet.rarity,
      desc: pet.desc,
      petType: pet.type,
    },
    currency: useDiamond ? 'diamond' : 'gold',
    price: useDiamond ? prices.diamond : prices.gold,
    lotTag: '宠物',
  };
}

function generateAuctionLots(st) {
  const lots = [];
  const now = Date.now();
  let seq = 0;
  const push = (lot) => {
    if (!lot) return;
    lots.push({ id: `lot_${now}_${seq++}`, ...lot, sold: false });
  };

  push(pickAuctionLegendaryItem(st));
  push(pickAuctionPet(st));

  const diaIds = [];
  for (let i = 0; i < 2; i++) {
    const d = pickAuctionDiamondItem(st, diaIds);
    if (d) {
      diaIds.push(d.item.id);
      push(d);
    }
  }

  while (lots.length < 6) push(pickAuctionGoldItem(st));
  return lots.slice(0, 6);
}
