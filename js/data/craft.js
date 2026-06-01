// v3.5 材料合成 · 无战斗药剂
const CRAFT_RECIPES = [
  {
    id: 'cr_wood_b', name: '柴捆', icon: '🪵',
    desc: '将木料打包，便于贩卖',
    mats: { mat_wood: 5 }, gold: 15,
    product: { id: 'mat_wood_b', name: '柴捆', type: 'material', rarity: 'common', desc: '五大捆柴火', sellPrice: 35 },
  },
  {
    id: 'cr_fish_b', name: '鱼干串', icon: '🐟',
    desc: '鲜鱼晾晒成串',
    mats: { mat_fish: 4 }, gold: 20,
    product: { id: 'mat_fish_b', name: '鱼干串', type: 'material', rarity: 'common', desc: '四条鱼干', sellPrice: 42 },
  },
  {
    id: 'cr_ore_b', name: '精矿块', icon: '⛏️',
    desc: '原矿提炼成块',
    mats: { mat_ore: 4 }, gold: 25,
    product: { id: 'mat_ore_b', name: '精矿块', type: 'material', rarity: 'fine', desc: '提炼后的矿石', sellPrice: 55 },
  },
  {
    id: 'cr_mat_pack', name: '猎材包', icon: '📦',
    desc: '怪物材料打包',
    mats: { mat1: 3, mat2: 3 }, gold: 30,
    product: { id: 'mat_pack1', name: '猎材包', type: 'material', rarity: 'fine', desc: '常见猎材合集', sellPrice: 60 },
  },
];

const CONSUMABLE_SELL = {};
