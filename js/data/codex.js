// v1.9 怪物图鉴
const CODEX = {
  '史莱姆': { unlockKills: 3, lore: '乌石村郊外最常见的小妖，胶体身躯，新手最好的练手对象。', weak: '物理' },
  '哥布林': { unlockKills: 3, lore: '贪婪的小绿人，常成群结队抢掠商路。', weak: '特攻' },
  '野狼': { unlockKills: 5, lore: '幽暗森林里的赤眼狼，血煞帮曾以兽核操控它们。', weak: '火' },
  '毒蜘蛛': { unlockKills: 5, lore: '背甲带毒斑的八足怪，被咬中会持续损血。', weak: '风' },
  '蝙蝠': { unlockKills: 3, lore: '夜行妖蝠，群居岩洞，超声波扰人心神。', weak: '光' },
  '骷髅': { unlockKills: 5, lore: '古代遗迹的残魂傀儡，剑宗旧战场的亡者。', weak: '雷' },
  '山贼': { unlockKills: 5, lore: '占山为王的匪徒，苍岚峰路上最烦人的拦路虎。', weak: '物理' },
  '史莱姆王': { unlockKills: 1, lore: '吞没商路的巨型史莱姆，乌石村外最大的威胁。', weak: '火', boss: true },
  '狼王': { unlockKills: 1, lore: '血月之下双眼赤红的兽王，血煞帮曾试图驯服它。', weak: '火', boss: true },
  '骨将军': { unlockKills: 1, lore: '青岚剑宗旧战场的亡魂聚合体，剑意未散。', weak: '雷', boss: true },
  '血煞头目': { unlockKills: 1, lore: '占峰为王的匪首，赵凌亦需借其势上位。', weak: '物理', boss: true },
  '魔焰执事': { unlockKills: 1, lore: '血煞帮余党以魔焰侵蚀尸骨所化的头目，焚天魔影的先遣。', weak: '光', boss: true },
};

function recordMonsterKill(name) {
  if (!name) return;
  if (!state.codex) state.codex = {};
  state.codex[name] = (state.codex[name] || 0) + 1;
  const entry = CODEX[name];
  if (entry && state.codex[name] === entry.unlockKills) {
    tryShowDialog('codex_' + name, [{ speaker: '图鉴', text: `已解锁【${name}】条目！` }]);
  }
}

function getCodexKills(name) {
  return (state.codex || {})[name] || 0;
}

function isCodexUnlocked(name) {
  const entry = CODEX[name];
  if (!entry) return false;
  return getCodexKills(name) >= entry.unlockKills;
}
