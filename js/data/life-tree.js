// v3.6.4 生活技能树：采集获得生活点，加点强化砍柴/钓鱼/挖矿
const LIFE_TREE = [
  { id: 'lt_c1', branch: 'chop', skill: 'chop', name: '樵夫入门', desc: '砍柴经验 +20%', cost: 1, req: [], xpMult: 0.2 },
  { id: 'lt_c2', branch: 'chop', skill: 'chop', name: '快斧', desc: '砍柴冷却 -15%', cost: 2, req: ['lt_c1'], cdMult: -0.15 },
  { id: 'lt_c3', branch: 'chop', skill: 'chop', name: '栋梁之材', desc: '砍柴额外木料 +1', cost: 2, req: ['lt_c2'], matBonus: 1 },
  { id: 'lt_f1', branch: 'fish', skill: 'fish', name: '渔家子弟', desc: '钓鱼经验 +20%', cost: 1, req: [], xpMult: 0.2 },
  { id: 'lt_f2', branch: 'fish', skill: 'fish', name: '熟练抛竿', desc: '钓鱼冷却 -15%', cost: 2, req: ['lt_f1'], cdMult: -0.15 },
  { id: 'lt_f3', branch: 'fish', skill: 'fish', name: '大鱼满仓', desc: '钓鱼额外鲜鱼 +1', cost: 2, req: ['lt_f2'], matBonus: 1 },
  { id: 'lt_m1', branch: 'mine', skill: 'mine', name: '矿工学徒', desc: '挖矿经验 +20%', cost: 1, req: [], xpMult: 0.2 },
  { id: 'lt_m2', branch: 'mine', skill: 'mine', name: '省力镐', desc: '挖矿冷却 -15%', cost: 2, req: ['lt_m1'], cdMult: -0.15 },
  { id: 'lt_m3', branch: 'mine', skill: 'mine', name: '富矿感应', desc: '挖矿额外原矿 +1', cost: 2, req: ['lt_m2'], matBonus: 1 },
  { id: 'lt_all', branch: 'all', skill: null, name: '巧手匠心', desc: '全部生活技能经验 +10%', cost: 3, req: ['lt_c2', 'lt_f2', 'lt_m2'], xpMult: 0.1, allSkills: true },
];

const LIFE_BRANCH_LABEL = { chop: '🪓 林业', fish: '🎣 渔业', mine: '⛏️ 矿业', all: '🌟 通用' };

function hasLifeNode(id) {
  return !!(state.lifeTree || {})[id];
}

function canUnlockLifeNode(id) {
  const node = LIFE_TREE.find(n => n.id === id);
  if (!node || hasLifeNode(id)) return false;
  if ((state.lifeSp || 0) < node.cost) return false;
  return node.req.every(r => hasLifeNode(r));
}

function unlockLifeNode(id) {
  if (!canUnlockLifeNode(id)) return;
  const node = LIFE_TREE.find(n => n.id === id);
  state.lifeSp -= node.cost;
  if (!state.lifeTree) state.lifeTree = {};
  state.lifeTree[id] = 1;
  render(); save();
}

function getLifeBonuses(skillId) {
  let xpMult = 1, cdMult = 1, matBonus = 0;
  for (const node of LIFE_TREE) {
    if (!hasLifeNode(node.id)) continue;
    if (node.allSkills || node.skill === skillId) {
      if (node.xpMult) xpMult += node.xpMult;
      if (node.cdMult) cdMult += node.cdMult;
      if (node.matBonus) matBonus += node.matBonus;
    }
  }
  cdMult = Math.max(0.4, cdMult);
  return { xpMult, cdMult, matBonus };
}
