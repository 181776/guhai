const GAME_VERSION = '3.2';

const STAT_LABELS = { hp: 'HP', atk: '物攻', def: '物防', spAtk: '特攻', spDef: '特防', speed: '速度' };
const SLOT_NAMES = { weapon: '武器', head: '头饰', body: '衣甲', legs: '护腿', feet: '战靴', accessory: '饰品' };
const SET_SLOTS = ['head', 'body', 'legs', 'feet'];
const ALL_SLOTS = ['weapon', ...SET_SLOTS, 'accessory'];
const LEVEL_GROWTH = { hp: 8, atk: 2, def: 2, spAtk: 2, spDef: 2, speed: 1 };
const BASE_CRIT = { rate: 0.05, dmg: 0.30 };
const MATERIAL_SELL = { mat1: 6, mat2: 6, mat3: 8, mat4: 12, mat5: 14, mat6: 16, mat_wood: 5, mat_fish: 7, mat_ore: 9 };

/** v3.0 战斗常量（元系统见 js/data/meta.js） */
const COMBAT = {
  battleInterval: 900,
  eliteHpMult: 1.45,
  eliteGoldMult: 1.35,
};
