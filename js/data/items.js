const SET_DEFS = {
  qingfeng: {
    name: '清风套装', desc: '四件套：速度+10，特防+6，暴击率+5%',
    bonus: { stats: { speed: 10, spDef: 6 }, critRate: 0.05 },
  },
  kuangzhan: {
    name: '狂战套装', desc: '四件套：物攻+12，暴击率+8%，爆伤+15%',
    bonus: { stats: { atk: 12 }, critRate: 0.08, critDmg: 0.15 },
  },
  tiebi: {
    name: '铁壁套装', desc: '四件套：物防+14，HP+50',
    bonus: { stats: { def: 14, hp: 50 } },
  },
};

const WEAPONS = [
  { id: 'w1', name: '木剑', slot: 'weapon', stats: { atk: 3, speed: 1 }, price: 20, rarity: 'common', desc: '新手练手' },
  { id: 'w3', name: '铁剑', slot: 'weapon', stats: { atk: 8 }, price: 60, rarity: 'common', desc: '铁匠常备' },
  { id: 'w5', name: '钢剑', slot: 'weapon', stats: { atk: 14, speed: 1 }, price: 180, rarity: 'rare', desc: '百炼精钢' },
  { id: 'w7', name: '双刀', slot: 'weapon', stats: { atk: 18, speed: 3, critRate: 0.03 }, price: 260, rarity: 'rare', desc: '快攻双持，暴击+3%' },
  { id: 'w9', name: '青锋剑', slot: 'weapon', stats: { atk: 24, spAtk: 4, critRate: 0.05 }, price: 450, rarity: 'epic', desc: '名剑，暴击+5%' },
  { id: 'w10', name: '倚天剑', slot: 'weapon', stats: { atk: 32, spAtk: 6, hp: 20, critDmg: 0.10 }, price: 900, rarity: 'epic', desc: '绝世神兵，爆伤+10%' },
];

const ACCESSORIES = [
  { id: 'a4', name: '铜戒', slot: 'accessory', stats: { atk: 2, def: 2, spAtk: 2, hp: 10 }, price: 120, rarity: 'common', desc: '小幅提升' },
  { id: 'a5', name: '玉佩', slot: 'accessory', stats: { spDef: 6, def: 3, hp: 20 }, price: 200, rarity: 'rare', desc: '温润护体' },
  { id: 'a6', name: '锐眼符', slot: 'accessory', stats: { critRate: 0.04, atk: 2 }, price: 280, rarity: 'rare', desc: '暴击率+4%' },
];

function makeSetPiece(setId, slot, name, stats, price, rarity) {
  return { id: `${setId}_${slot}`, name, slot, setId, stats, price, rarity, desc: `${SET_DEFS[setId].name}部件` };
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

const SHOP = [...WEAPONS, ...ACCESSORIES, ...SET_ITEMS, ...MANUALS];
