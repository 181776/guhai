// v3.0 元系统：成就、悬赏、宠物加成、青岚焰、挂机策略

const IDLE_MODES = {
  safe: { id: 'safe', name: '保守', healRatio: 0.55, desc: '生命＜55% 自动用药' },
  balanced: { id: 'balanced', name: '均衡', healRatio: 0.4, desc: '生命＜40% 自动用药' },
  aggressive: { id: 'aggressive', name: '激进', healRatio: 0.25, desc: '生命＜25% 才用药，省药多打' },
};

const BATTLE_SPEEDS = { 1: 900, 2: 450 };

const PET_BONUSES = {
  p_slime: { stats: { hp: 15 }, desc: 'HP +15' },
  p_wolf: { stats: { atk: 3 }, desc: '物攻 +3' },
  p_bat: { stats: { speed: 2 }, desc: '速度 +2' },
  p_spider: { stats: { critRate: 0.02 }, desc: '暴击 +2%' },
  p_ghost: { stats: { spAtk: 4, spDef: 2 }, desc: '特攻 +4 特防 +2' },
};

const QINGLAN_STAGES = [
  { id: 0, name: '微火', need: 0, desc: '丹田深处，一缕无人察觉的火苗。' },
  { id: 1, name: '初燃', need: 5, desc: '击败 5 个 Boss 后，火苗开始稳定跳动。' },
  { id: 2, name: '凝焰', need: 12, desc: '青岚焰轮廓初现，特攻获得永久 +2。' },
  { id: 3, name: '觉醒', need: 25, desc: '焰心通明，全属性 +1%。' },
];

const REGION_WEATHER = {
  village: { icon: '☀️', name: '晴', tip: '乌石晴日，史莱姆略脆，物攻伤害 +5%' },
  forest: { icon: '🌫️', name: '雾', tip: '幽林雾重，毒系怪增多，带好回血药' },
  ruins: { icon: '🌙', name: '夜', tip: '遗迹月夜，特攻伤害 +8%' },
  peak: { icon: '❄️', name: '寒', tip: '峰顶风寒，Boss 二阶段更早触发' },
};

const BOSS_SKILLS = {
  village: { name: '凝胶反震', desc: '受击 15% 概率反弹 8% 伤害' },
  forest: { name: '狼嚎', desc: '二阶段速度 +3' },
  ruins: { name: '骨盾', desc: '入场获得 10% 最大生命护盾' },
  peak: { name: '断峰剑意', desc: '三阶段额外特攻一击' },
};

const ACHIEVEMENTS = [
  { id: 'a_first_kill', name: '初战告捷', desc: '击败任意怪物 1 次', check: s => (s.totalKills || 0) >= 1, reward: { gold: 30 } },
  { id: 'a_kills50', name: '百人斩', desc: '累计击败 50 怪', check: s => (s.totalKills || 0) >= 50, reward: { gold: 200 } },
  { id: 'a_kills200', name: '千人斩', desc: '累计击败 200 怪', check: s => (s.totalKills || 0) >= 200, reward: { diamonds: 2 } },
  { id: 'a_route1', name: '初清航线', desc: '清剿航线 1 次', check: s => (s.totalRoutes || 0) >= 1, reward: { gold: 50 } },
  { id: 'a_route10', name: '老练猎手', desc: '清剿航线 10 次', check: s => (s.totalRoutes || 0) >= 10, reward: { gold: 300 } },
  { id: 'a_boss5', name: 'Boss 猎手', desc: '累计击败 Boss 5 次', check: s => (s.totalBossKills || 0) >= 5, reward: { lifeSp: 3 } },
  { id: 'a_lv5', name: '气段初稳', desc: '达到 Lv.5', check: s => s.level >= 5, reward: { gold: 80 } },
  { id: 'a_lv10', name: '试炼在望', desc: '达到 Lv.10', check: s => s.level >= 10, reward: { diamonds: 1 } },
  { id: 'a_pet3', name: '百兽同行', desc: '捕获 3 只宠物', check: s => (s.pets || []).length >= 3, reward: { gold: 150 } },
  { id: 'a_craft5', name: '巧手匠心', desc: '合成消耗品 5 次', check: s => (s.totalCrafts || 0) >= 5, reward: { lifeSp: 2 } },
  { id: 'a_combo5', name: '连战连捷', desc: '单航线连击达 5', check: s => (s.maxCombo || 0) >= 5, reward: { gold: 100 } },
  { id: 'a_streak3', name: '三连胜', desc: '连续清剿 3 条航线', check: s => (s.mapStreak || 0) >= 3, reward: { diamonds: 1 } },
  { id: 'a_ruins', name: '踏入遗迹', desc: '进入古代遗迹', check: s => !!(s.storyFlags || {})['ch_ruins_enter'], reward: { gold: 120 } },
  { id: 'a_peak', name: '登峰', desc: '进入苍岚峰', check: s => !!(s.storyFlags || {})['ch_peak_enter'], reward: { gold: 200 } },
  { id: 'a_codex5', name: '博闻强识', desc: '解锁 5 种怪物图鉴', check: s => Object.keys(s.codex || {}).filter(k => (s.codex[k] || 0) > 0).length >= 5, reward: { gold: 80 } },
];

const BOUNTY_POOL = [
  { type: 'kill', target: 8, label: '击败怪物', gold: 80, xp: 40 },
  { type: 'boss', target: 1, label: '击败 Boss', gold: 120, xp: 60 },
  { type: 'route', target: 1, label: '清剿航线', gold: 100, xp: 50 },
];

const RIVAL_TAUNTS = [
  '赵凌：废物，别拖后腿。',
  '赵凌：凭你也配跟我抢怪？',
  '赵凌：峰顶见，我会让你跪。',
  '赵凌：哼，运气不错罢了。',
];

const WEAKNESS_BONUS = 0.12;

const COMBO_BONUS_PER = 0.02;
const COMBO_BONUS_CAP = 0.15;
const STREAK_GOLD_BONUS = 0.1;
