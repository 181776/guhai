const GAME_VERSION = '3.6';

/** v3.5 货币名称 */
const CURRENCY_NAME = '古海币';
function formatCoin(amount) {
  const n = Math.max(0, Math.floor(amount || 0));
  return `${n} ${CURRENCY_NAME}`;
}

/** v3.4 传说装备获取渠道 */
const LEGENDARY_SOURCES = {
  auction: true,
  event: true,
};

/** 玩家反馈 · GitHub Issues */
const FEEDBACK = {
  issuesUrl: 'https://github.com/181776/guhai/issues/new',
  projectName: '古海大陆',
};

/** v3.6 精力 MP：Lv.1 为 0，每升 1 级 +5；战后回满 */
const MP = { perLevel: 5 };
function calcMaxMp(level) {
  return Math.max(0, (level - 1) * MP.perLevel);
}

const ECONOMY = {
  goldGainMult: 0.3,
  defeatGoldPct: 0.08,
  defeatGoldMin: 5,
  defeatXpPct: 0.06,
  defeatRetryHpPct: 0.2,
};

/** 品质标签 · 普通(白) 精良(绿) 稀有(蓝) 史诗(紫) 传说(橙) */
const RARITY_LABELS = {
  common: '普通',
  fine: '精良',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

function getItemRarityKey(item) {
  if (!item) return 'common';
  if (item.setId) return 'set';
  if (item.type === 'material') return 'material';
  if (item.type === 'manual') return 'manual';
  return item.rarity || 'common';
}

function getRarityLabel(item) {
  const key = getItemRarityKey(item);
  if (key === 'set') return '套装';
  if (key === 'material') return '材料';
  if (key === 'manual') return '秘籍';
  return RARITY_LABELS[key] || RARITY_LABELS.common;
}

function rarityClass(item) {
  return 'rarity-' + getItemRarityKey(item);
}

function badgeRarityClass(item) {
  return 'badge ' + getItemRarityKey(item);
}

function applyGoldGain(amount) {
  const mult = ECONOMY?.goldGainMult ?? 1;
  return Math.max(0, Math.floor(amount * mult));
}

const STAT_LABELS = { hp: 'HP', atk: '物攻', def: '物防', spAtk: '特攻', spDef: '特防', speed: '速度' };
const SLOT_NAMES = { weapon: '武器', head: '头饰', body: '衣甲', legs: '护腿', feet: '战靴', accessory: '饰品' };
const SET_SLOTS = ['head', 'body', 'legs', 'feet'];
const ALL_SLOTS = ['weapon', ...SET_SLOTS, 'accessory'];
const LEVEL_GROWTH = { hp: 8, atk: 2, def: 2, spAtk: 2, spDef: 2, speed: 1 };
const BASE_CRIT = { rate: 0.05, dmg: 0.30 };
const MATERIAL_SELL = { mat1: 6, mat2: 6, mat3: 8, mat4: 12, mat5: 14, mat6: 16, mat_wood: 5, mat_fish: 7, mat_ore: 9, mat_wood_b: 35, mat_fish_b: 42, mat_ore_b: 55, mat_pack1: 60 };

/** v3.0 战斗常量（元系统见 js/data/meta.js） */
const COMBAT = {
  battleInterval: 900,
  eliteHpMult: 1.45,
  eliteGoldMult: 1.35,
};
