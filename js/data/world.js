const TALENTS = [
  { id: 't_reflect', name: '反伤之躯', desc: '受击时反弹 20% 伤害给敌人', price: 300, effect: 'reflect', value: 0.2 },
  { id: 't_critx2', name: '爆伤翻倍', desc: '爆伤加成 ×2（30% 变 60%）', price: 500, effect: 'critDmgMult', value: 2 },
  { id: 't_killheal', name: '嗜血本能', desc: '击败敌人回复 8% 最大生命', price: 250, effect: 'killHeal', value: 0.08 },
  { id: 't_speed', name: '疾风步', desc: '速度 +6', price: 200, stats: { speed: 6 } },
  { id: 't_critup', name: '会心之眼', desc: '暴击率 +8%', price: 350, stats: { critRate: 0.08 } },
  { id: 't_scout', name: '瞭望术', desc: '进图随机识破 2 个怪物/Boss 格', price: 280, effect: 'gridReveal' },
];

const LIFE_SKILLS = [
  { id: 'chop', name: '砍柴', icon: '🪓', cd: 2500, xp: 5,
    mat: { id: 'mat_wood', name: '木料', type: 'material', rarity: 'common', desc: '生活材料，可贩卖' },
    gold: [3, 10], msg: '砍下一段木料' },
  { id: 'fish', name: '钓鱼', icon: '🎣', cd: 3000, xp: 6,
    mat: { id: 'mat_fish', name: '鲜鱼', type: 'material', rarity: 'common', desc: '生活材料，可贩卖' },
    gold: [4, 12], msg: '钓到一条鱼' },
  { id: 'mine', name: '挖矿', icon: '⛏️', cd: 3500, xp: 8,
    mat: { id: 'mat_ore', name: '原矿', type: 'material', rarity: 'common', desc: '生活材料，可贩卖' },
    gold: [5, 14], msg: '挖出一块原矿' },
];

const REGIONS = [
  { id: 'village', name: '乌石村', minLevel: 1, goldMult: 1, xpMult: 1,
    desc: '陆燃被嘲「废体」的家乡。史莱姆、哥布林在郊外游荡，是重修气段的第一步。',
    monsters: ['史莱姆', '哥布林'] },
  { id: 'forest', name: '幽暗森林', minLevel: 3, goldMult: 1.2, xpMult: 1.15,
    desc: '兽眼赤红，血煞帮暗中炼核。赵凌亦在此猎名，危机与名声并存。',
    monsters: ['野狼', '毒蜘蛛', '蝙蝠'] },
  { id: 'ruins', name: '古代遗迹', minLevel: 6, goldMult: 1.5, xpMult: 1.3,
    desc: '青岚剑宗旧战场。墨翁残魂在此等候，青岚焰火种即将苏醒。',
    monsters: ['骷髅', '山贼', '哥布林'] },
  { id: 'peak', name: '苍岚峰', minLevel: 8, goldMult: 2, xpMult: 1.6,
    desc: '剑宗试炼之峰。断峰剑意藏于云间，赵凌已在峰顶等最后一战。',
    monsters: ['山贼', '毒蜘蛛', '骷髅', '野狼'] },
];

const PETS = [
  { id: 'p_slime', name: '小史莱姆', icon: '🟢', rarity: 'common', desc: '黏糊糊的跟屁虫' },
  { id: 'p_wolf', name: '幼狼', icon: '🐺', rarity: 'rare', desc: '警惕但忠诚' },
  { id: 'p_bat', name: '迷你蝠', icon: '🦇', rarity: 'common', desc: '喜欢倒挂着睡' },
  { id: 'p_spider', name: '小毒蛛', icon: '🕷️', rarity: 'rare', desc: '八条腿跑得飞快' },
  { id: 'p_ghost', name: '小骷髅', icon: '💀', rarity: 'epic', desc: '墨翁分神所化，遗迹中结缘' },
];

const PET_DROP_BY_REGION = {
  village: ['p_slime', 'p_bat'],
  forest: ['p_wolf', 'p_spider', 'p_bat'],
  ruins: ['p_ghost', 'p_slime'],
  peak: ['p_wolf', 'p_ghost'],
};

const CHECKIN_BASE = [50, 80, 100, 120, 150, 180, 250];
