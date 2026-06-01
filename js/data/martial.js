// v3.5 武功 · 被动技能
const MARTIAL_SLOT_LEVEL = 5;

const MARTIAL_ARTS = [
  { id: 'ma_xueqi', name: '血气诀', rarity: 'common', desc: '固本培元，HP+15', lore: '乌石村流传的基础吐纳，人人可练。',
    stats: { hp: 15 }, price: 180 },
  { id: 'ma_lingfeng', name: '凌风步', rarity: 'fine', desc: '身法轻灵，速度+3', lore: '青岚剑宗外门身法，步法如风。',
    stats: { speed: 3 }, price: 320 },
  { id: 'ma_jingang', name: '金刚体', rarity: 'rare', desc: '筋骨如铁，物防+5', lore: '硬气功入门，挨打更耐。',
    stats: { def: 5 }, price: 450 },
  { id: 'ma_benglei', name: '崩雷绝', rarity: 'epic', desc: '开战 25% 概率麻痹对手 3 回合', lore: '以雷意震敌神经，令对手短暂僵直。',
    effect: 'paralyzeStart', chance: 0.25, turns: 3, mpCost: 12, price: 880 },
  { id: 'ma_huoyan', name: '青焰护体', rarity: 'rare', desc: '特防+4，特攻+2', lore: '青岚焰余温护体，攻守兼备。',
    stats: { spDef: 4, spAtk: 2 }, price: 520 },
  { id: 'ma_pojia', name: '破甲诀', rarity: 'fine', desc: '物攻+4，暴击率+3%', lore: '专破重甲，锋锐更盛。',
    stats: { atk: 4, critRate: 0.03 }, price: 380 },
];

function getMartialMpCost(ma) {
  if (!ma?.effect) return 0;
  return ma.mpCost || 0;
}

function getMartialSlotCount(level = state.level) {
  if (level < MARTIAL_SLOT_LEVEL) return 0;
  return Math.floor(level / MARTIAL_SLOT_LEVEL);
}

function getMartialArt(id) {
  return MARTIAL_ARTS.find(m => m.id === id);
}

function hasLearnedMartial(id, st = state) {
  return (st.martialArts || []).includes(id);
}

function getMartialBonuses(st = state) {
  const bonus = emptyStats();
  let critRate = 0;
  for (const id of st.martialArts || []) {
    const ma = getMartialArt(id);
    if (!ma?.stats) continue;
    for (const k of Object.keys(bonus)) bonus[k] += ma.stats[k] || 0;
    critRate += ma.stats?.critRate || 0;
  }
  bonus.critRate = critRate;
  return bonus;
}
