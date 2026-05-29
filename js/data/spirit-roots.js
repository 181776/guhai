// v2.0 灵根：影响经验加成与战力系数
const SPIRIT_ROOTS = {
  fan:  { id: 'fan',  name: '凡灵根',   mult: 1.0,  desc: '最常见灵根，无额外加成。' },
  mu:   { id: 'mu',   name: '木灵根',   mult: 1.08, desc: '木系灵根，经验 +8%。' },
  huo:  { id: 'huo',  name: '火灵根',   mult: 1.12, desc: '火系灵根，经验 +12%。' },
  shui: { id: 'shui', name: '水灵根',   mult: 1.10, desc: '水系灵根，经验 +10%。' },
  jin:  { id: 'jin',  name: '金灵根',   mult: 1.15, desc: '金系灵根，经验 +15%。' },
  hun:  { id: 'hun',  name: '混沌灵根', mult: 1.25, desc: '万中无一，经验 +25%。' },
};

function getSpiritRoot(st = state) {
  return SPIRIT_ROOTS[st.spiritRoot] || SPIRIT_ROOTS.fan;
}

function getSpiritRootMult(st = state) {
  return getSpiritRoot(st).mult;
}

function applyXpGain(base, st = state) {
  return Math.floor(base * getSpiritRootMult(st));
}

function sumSixStats(s) {
  return s.maxHp + s.atk + s.def + s.spAtk + s.spDef + s.speed;
}
