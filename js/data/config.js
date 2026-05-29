const GAME_VERSION = '2.6';

const STAT_LABELS = { hp: 'HP', atk: '物攻', def: '物防', spAtk: '特攻', spDef: '特防', speed: '速度' };
const SLOT_NAMES = { weapon: '武器', head: '头饰', body: '衣甲', legs: '护腿', feet: '战靴', accessory: '饰品' };
const SET_SLOTS = ['head', 'body', 'legs', 'feet'];
const ALL_SLOTS = ['weapon', ...SET_SLOTS, 'accessory'];
const LEVEL_GROWTH = { hp: 8, atk: 2, def: 2, spAtk: 2, spDef: 2, speed: 1 };
const BASE_CRIT = { rate: 0.05, dmg: 0.30 };
const MATERIAL_SELL = { mat1: 6, mat2: 6, mat3: 8, mat4: 12, mat5: 14, mat6: 16, mat_wood: 5, mat_fish: 7, mat_ore: 9 };

/** 战力权重（v1.6） */
const POWER_WEIGHTS = {
  maxHp: 0.12, atk: 2.2, def: 1.6, spAtk: 1.8, spDef: 1.2, speed: 2.5,
  critRate: 100, critDmg: 60, level: 15,
};
