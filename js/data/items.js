const SET_DEFS = {
  qingfeng: {
    name: '清风套装', desc: '四件套：速度+10，特防+6，暴击率+5%',
    bonus: { stats: { speed: 10, spDef: 6 }, critRate: 0.05 },
    pieceCount: 4,
  },
  kuangzhan: {
    name: '狂战套装', desc: '四件套：物攻+12，暴击率+8%，暴击伤害+15%',
    bonus: { stats: { atk: 12 }, critRate: 0.08, critDmg: 0.15 },
    pieceCount: 4,
  },
  tiebi: {
    name: '铁壁套装', desc: '四件套：物防+14，HP+50',
    bonus: { stats: { def: 14, hp: 50 } },
    pieceCount: 4,
  },
  qinglan: {
    name: '青岚套装', desc: '四件套：特攻+10，特防+8，暴击率+5%',
    bonus: { stats: { spAtk: 10, spDef: 8 }, critRate: 0.05 },
    pieceCount: 4,
  },
  shujin: {
    name: '曙烬暮华', desc: '二件套：物攻+10，暴击率+6%',
    bonus: { stats: { atk: 10 }, critRate: 0.06 },
    pieceCount: 2,
  },
  youmu: {
    name: '幽暮冥烬', desc: '二件套：物防+10，特防+6，HP+30',
    bonus: { stats: { def: 10, spDef: 6, hp: 30 } },
    pieceCount: 2,
  },
};

const WEAPONS = [
  { id: 'w1', name: '木剑', slot: 'weapon', stats: { atk: 3, speed: 1 }, price: 20, rarity: 'common', desc: '新手练手' },
  { id: 'w3', name: '铁剑', slot: 'weapon', stats: { atk: 8 }, price: 60, rarity: 'fine', desc: '铁匠常备' },
  { id: 'w5', name: '钢剑', slot: 'weapon', stats: { atk: 14, speed: 1 }, price: 180, rarity: 'rare', desc: '百炼精钢' },
  { id: 'w7', name: '双刀', slot: 'weapon', stats: { atk: 18, speed: 3, critRate: 0.03 }, price: 260, rarity: 'rare', desc: '快攻双持，暴击+3%' },
  { id: 'w9', name: '青锋剑', slot: 'weapon', stats: { atk: 24, spAtk: 4, critRate: 0.05 }, price: 450, rarity: 'epic', desc: '名剑，暴击+5%' },
  { id: 'w10', name: '倚天剑', slot: 'weapon', stats: { atk: 32, spAtk: 6, hp: 20, critDmg: 0.10 }, price: 900, rarity: 'epic', desc: '绝世神兵，暴击伤害+10%' },
  { id: 'w11', name: '不朽魅影', slot: 'weapon', stats: { spAtk: 60, critDmg: 0.20, critRate: 0.10 }, rarity: 'legendary', desc: '黄河鬼棺所制之邪兵', lore: '由黄河鬼棺的棺木制作而成，使用者无不癫狂。', auctionOnly: true },
  { id: 'w12', name: '断峰残刃', slot: 'weapon', stats: { atk: 26, spAtk: 5, speed: 2, critRate: 0.04 }, price: 520, rarity: 'epic', desc: '断峰剑意所铸，快稳兼备', lore: '苍岚峰试炼中断裂的名剑重铸而成，剑身留有云纹断痕，挥动时有细微剑鸣。' },
  { id: 'w13', name: '血月长刀', slot: 'weapon', stats: { atk: 20, hp: 15, critRate: 0.04 }, price: 300, rarity: 'rare', desc: '血月之下锻成，愈战愈烈', lore: '幽暗森林猎户从狼王巢穴旁拾得，刀背浸染血月之色，持之血气翻涌。' },
  { id: 'w14', name: '青岚焰杖', slot: 'weapon', stats: { spAtk: 48, spDef: 6, critRate: 0.08 }, rarity: 'legendary', desc: '青岚焰火种所化法杖', lore: '墨翁残魂于古代遗迹点化的一缕青岚焰凝为杖芯，不灼肉身，只焚邪念。', auctionOnly: true },
  { id: 'w16', name: '镇岳重锏', slot: 'weapon', stats: { atk: 22, def: 8, hp: 35 }, price: 750, rarity: 'epic', desc: '沉如岳镇，以守代攻', lore: '乌石村铁匠为守村所铸，一锏可镇群妖，代价是挥动缓慢，唯厚甲者可久持。' },
];

const ACCESSORIES = [
  { id: 'a4', name: '铜戒', slot: 'accessory', stats: { atk: 2, def: 2, spAtk: 2, hp: 10 }, price: 120, rarity: 'common', desc: '小幅提升', lore: '乌石村铁匠随手打造的铜戒，略增血气。' },
  { id: 'a5', name: '玉佩', slot: 'accessory', stats: { spDef: 6, def: 3, hp: 20 }, price: 200, rarity: 'rare', desc: '温润护体', lore: '古玉温润，可安神定气，护住丹田。' },
  { id: 'a6', name: '锐眼符', slot: 'accessory', stats: { critRate: 0.04, atk: 2 }, price: 280, rarity: 'rare', desc: '暴击率+4%', lore: '符师所绘，贴于眉心，目力如炬。' },
  { id: 'a7', name: '日月吊坠', slot: 'accessory', stats: {}, price: 420, rarity: 'epic',
    desc: '物防随生命、暴击随物攻而变',
    lore: '日精月华凝于一线。体魄越厚，护体越坚；锋芒越利，杀机越盛。',
    dynamic: [
      { from: 'maxHp', to: 'def', rate: 0.01, label: '物防 +最大HP×1%' },
      { from: 'atk', to: 'critRate', rate: 0.05, label: '暴击率 +物攻×5%' },
    ],
  },
  { id: 'a8', name: '风吟铃', slot: 'accessory', stats: { speed: 3, spDef: 2 }, price: 150, rarity: 'common', desc: '轻铃随风，步履更捷', lore: '苍岚峰脚道观信物，铃响三声可驱邪风，常赠给初登峰的试炼者。' },
  { id: 'a9', name: '铁心护符', slot: 'accessory', stats: { atk: 4, def: 4, hp: 25 }, price: 340, rarity: 'rare', desc: '铁骨护心，攻守兼备', lore: '古代遗迹散落的护符，内刻「铁心」二字，据说是青岚剑宗外门弟子护身之物。' },
  { id: 'a10', name: '断峰戒', slot: 'accessory', stats: { spAtk: 4, critDmg: 0.08 }, price: 580, rarity: 'epic', desc: '断峰剑意凝于戒面', lore: '苍岚峰试炼失败者所留，戒面云纹与断峰残刃同源，暴击时似有剑鸣相随。' },
  { id: 'a11', name: '疾风眼罩', slot: 'accessory', stats: { speed: 4 }, price: 650, rarity: 'epic',
    desc: '身法越快，目力越锐',
    lore: '血煞帮斥候所用，以薄革遮眼练感，疾行之中反而更易捕捉破绽。',
    dynamic: [
      { from: 'speed', to: 'critRate', rate: 0.02, label: '暴击率 +速度×2%' },
    ],
  },
  { id: 'a12', name: '血月狼牙', slot: 'accessory', stats: { def: 5, spDef: 10, hp: 30 }, rarity: 'legendary', desc: '狼王獠牙所制，血气护体', lore: '幽暗森林狼王死后所留獠牙，经血月浸染不腐，佩戴者血气如狼，难被一击击溃。', auctionOnly: true },
];

function makeSetPiece(setId, slot, name, stats, price, rarity) {
  return { id: `${setId}_${slot}`, name, slot, setId, stats, price, rarity, desc: `${SET_DEFS[setId].name}部件` };
}

function makeGearPiece(id, slot, name, stats, price, rarity, desc, lore) {
  return { id, name, slot, stats, price, rarity, desc, lore: lore || desc };
}

const SET_ITEMS = [
  makeSetPiece('qingfeng', 'head', '清风冠', { def: 2, speed: 2 }, 70, 'common'),
  makeSetPiece('qingfeng', 'body', '清风衫', { def: 4, spDef: 3 }, 90, 'common'),
  makeSetPiece('qingfeng', 'legs', '清风护腿', { def: 3, speed: 2 }, 75, 'common'),
  makeSetPiece('qingfeng', 'feet', '清风靴', { speed: 4, def: 1 }, 65, 'common'),
  makeSetPiece('kuangzhan', 'head', '狂战盔', { atk: 3, def: 2 }, 100, 'rare'),
  makeSetPiece('kuangzhan', 'body', '狂战甲', { atk: 5, def: 4 }, 130, 'rare'),
  makeSetPiece('kuangzhan', 'legs', '狂战护腿', { atk: 4, def: 3 }, 110, 'rare'),
  makeSetPiece('kuangzhan', 'feet', '狂战靴', { atk: 2, speed: 2 }, 95, 'rare'),
  makeSetPiece('tiebi', 'head', '铁壁冠', { def: 5, hp: 10 }, 85, 'common'),
  makeSetPiece('tiebi', 'body', '铁壁甲', { def: 8, hp: 20 }, 120, 'common'),
  makeSetPiece('tiebi', 'legs', '铁壁护腿', { def: 6, hp: 15 }, 100, 'common'),
  makeSetPiece('tiebi', 'feet', '铁壁靴', { def: 4, hp: 10 }, 80, 'common'),
  makeSetPiece('qinglan', 'head', '青岚冠', { def: 3, spDef: 5 }, 420, 'epic'),
  makeSetPiece('qinglan', 'body', '青岚袍', { spAtk: 6, spDef: 5, hp: 18 }, 480, 'epic'),
  makeSetPiece('qinglan', 'legs', '青岚护腿', { def: 5, spDef: 2, speed: 2 }, 440, 'epic'),
  makeSetPiece('qinglan', 'feet', '青岚履', { speed: 4, spAtk: 3 }, 400, 'epic'),
  { id: 'shujin_body', name: '曙烬长衣', slot: 'body', setId: 'shujin', stats: { atk: 5, critRate: 0.03 }, price: 520, rarity: 'epic', desc: '曙烬暮华部件' },
  { id: 'shujin_acc', name: '暮华坠', slot: 'accessory', setId: 'shujin', stats: { atk: 3, spAtk: 2 }, price: 480, rarity: 'epic', desc: '曙烬暮华部件' },
  { id: 'youmu_body', name: '冥烬暗甲', slot: 'body', setId: 'youmu', stats: { def: 6, hp: 18 }, price: 520, rarity: 'epic', desc: '幽暮冥烬部件' },
  { id: 'youmu_acc', name: '幽暮骨链', slot: 'accessory', setId: 'youmu', stats: { def: 3, spDef: 4 }, price: 480, rarity: 'epic', desc: '幽暮冥烬部件' },
];

/** 散装防具（头饰 / 衣甲 / 护腿 / 战靴，无套装） */
const GEAR_ITEMS = [
  makeGearPiece('g1', 'head', '粗布头巾', { def: 1, hp: 10 }, 40, 'common', '乌石村常见头巾', '乌石村妇孺日常所戴，略挡风尘，聊胜于无。'),
  makeGearPiece('g2', 'body', '猎户皮甲', { def: 7, hp: 22 }, 240, 'rare', '幽暗森林猎户所穿', '以野狼皮缝缀，轻便耐穿，猎户入林必备。'),
  makeGearPiece('g3', 'feet', '草编便鞋', { speed: 2, def: 1 }, 55, 'common', '草编鞋底，行路轻快', '村头老妪手工编织，鞋底软韧，走远路也不磨脚。'),
];

const MANUALS = [
  { id: 'm1', name: '基础剑诀', type: 'manual', stats: { atk: 3 }, price: 100, rarity: 'common', desc: '入门剑法' },
  { id: 'm2', name: '铁布衫', type: 'manual', stats: { def: 5, hp: 15 }, price: 130, rarity: 'common', desc: '硬气功' },
  { id: 'm4', name: '凌波微步', type: 'manual', stats: { speed: 8, spDef: 3 }, price: 250, rarity: 'rare', desc: '轻功' },
  { id: 'm6', name: '独孤九剑', type: 'manual', stats: { atk: 12, spAtk: 8, critRate: 0.05 }, price: 700, rarity: 'epic', desc: '剑法极致，暴击+5%' },
];

const MATERIALS = [
  { id: 'mat1', name: '史莱姆凝胶', type: 'material', rarity: 'common', desc: '炼金材料' },
  { id: 'mat2', name: '哥布林牙齿', type: 'material', rarity: 'common', desc: '粗糙实用' },
  { id: 'mat3', name: '野狼皮毛', type: 'material', rarity: 'common', desc: '制甲材料' },
  { id: 'mat4', name: '骷髅碎片', type: 'material', rarity: 'rare', desc: '亡灵残骸' },
  { id: 'mat5', name: '毒囊', type: 'material', rarity: 'rare', desc: '含毒生物' },
  { id: 'mat6', name: '精铁矿石', type: 'material', rarity: 'rare', desc: '锻造材料' },
];

const DROP_WEAPONS = [
  { id: 'dw1', name: '生锈铁剑', slot: 'weapon', stats: { atk: 4 }, rarity: 'common', desc: '掉落', sellPrice: 12 },
  { id: 'dw3', name: '山贼朴刀', slot: 'weapon', stats: { atk: 10, def: 1 }, rarity: 'rare', desc: '掉落', sellPrice: 35 },
  { id: 'w15', name: '骨鸣短弓', slot: 'weapon', stats: { atk: 16, speed: 5, critRate: 0.03 }, rarity: 'rare', desc: '骨制短弓，拉弦如鸣', lore: '古代遗迹散落的弓匠遗作，弓臂以骷髅碎片粘合，箭出之前先有骨鸣。', sellPrice: 40 },
];

const DROP_SET = [
  makeSetPiece('tiebi', 'head', '破损铁盔', { def: 2, hp: 5 }, 0, 'common'),
  makeSetPiece('qingfeng', 'feet', '旧布靴', { speed: 1, def: 1 }, 0, 'common'),
].map(i => ({ ...i, desc: '打怪稀有掉落', sellPrice: 25 }));

const MONSTER_DROPS = {
  '史莱姆': ['mat1'], '哥布林': ['mat2'], '野狼': ['mat3'],
  '骷髅': ['mat4'], '蝙蝠': ['mat1'], '山贼': ['mat6'], '毒蜘蛛': ['mat5'],
};

const MONSTER_SPEED_MOD = {
  '史莱姆': -2, '哥布林': 0, '野狼': 4, '骷髅': -4, '蝙蝠': 6, '山贼': 1, '毒蜘蛛': 3,
};

function isShopItem(item) {
  if (!item || item.type === 'material') return false;
  if (item.unobtainable || item.auctionOnly || item.eventOnly) return false;
  if (item.rarity === 'legendary') return false;
  return typeof item.price === 'number' && item.price > 0;
}

/** v3.6.3 商店装备售价 +30%（武功阁学费不在此列） */
const SHOP_PRICE_MULT = 1.3;

function getShopPrice(item) {
  if (!item || typeof item.price !== 'number') return 0;
  return Math.max(1, Math.floor(item.price * SHOP_PRICE_MULT));
}

function ownsShopEquipId(id, st = state) {
  if (!id) return false;
  const eq = st.equip || {};
  if (Object.values(eq).some(i => i && i.id === id)) return true;
  return (st.bag || []).some(i => i.id === id && i.slot);
}

/** 普通装备可重复购买；精良及以上同 id 已拥有则不可再买 */
function canBuyShopEquip(item, st = state) {
  if (!isShopItem(item) || item.type === 'manual') return false;
  if ((item.rarity || 'common') === 'common') return true;
  return !ownsShopEquipId(item.id, st);
}

const SHOP = [
  ...WEAPONS.filter(isShopItem),
  ...ACCESSORIES.filter(isShopItem),
  ...SET_ITEMS.filter(isShopItem),
  ...GEAR_ITEMS.filter(isShopItem),
];
