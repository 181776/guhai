// v2.4 生活材料合成 · v2.5 纯挂机自动用药
const CRAFT_RECIPES = [
  {
    id: 'cr_heal30', name: '止血散', icon: '💊',
    desc: '挂机：生命＜40% 时自动服用',
    mats: { mat_wood: 2 }, gold: 30,
    product: { id: 'c_heal30', name: '止血散', type: 'consumable', rarity: 'common', effect: 'heal', value: 0.3, desc: '苏清教的粗制伤药' },
  },
  {
    id: 'cr_heal60', name: '苏清药包', icon: '🩹',
    desc: '挂机：低血优先于止血散',
    mats: { mat_wood: 1, mat_fish: 1 }, gold: 60,
    product: { id: 'c_heal60', name: '苏清药包', type: 'consumable', rarity: 'rare', effect: 'heal', value: 0.6, desc: '青梅竹马配制的药包' },
  },
  {
    id: 'cr_xp40', name: '行气符', icon: '📿',
    desc: '挂机：航线清剿完毕自动使用',
    mats: { mat_fish: 2 }, gold: 50,
    product: { id: 'c_xp40', name: '行气符', type: 'consumable', rarity: 'common', effect: 'xp', value: 40, desc: '以鲜鱼血墨书符，助气行周' },
  },
  {
    id: 'cr_atk15', name: '淬锋散', icon: '⚔',
    desc: '挂机：确认路线/开战斗时自动服用',
    mats: { mat_ore: 2 }, gold: 80,
    product: { id: 'c_atk15', name: '淬锋散', type: 'consumable', rarity: 'rare', effect: 'battleAtk', value: 0.15, desc: '本航线物攻+15%，至清剿完毕' },
  },
  {
    id: 'cr_elite', name: '三材汤', icon: '🍲',
    desc: '挂机：危急/低血优先，回满+经验',
    mats: { mat_wood: 1, mat_fish: 1, mat_ore: 1 }, gold: 150,
    product: { id: 'c_elite', name: '三材汤', type: 'consumable', rarity: 'epic', effect: 'healXp', value: 1, xp: 80, desc: '四象调和，回满生命并得经验' },
  },
];

const CONSUMABLE_SELL = { c_heal30: 8, c_heal60: 18, c_xp40: 12, c_atk15: 20, c_elite: 35 };
