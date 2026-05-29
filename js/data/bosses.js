// v1.9.1 各地区航线 Boss
const REGION_BOSSES = {
  village: {
    name: '史莱姆王', mob: '史莱姆', title: '乌石沼地领主',
    emoji: '👑', sprite: 'assets/img/monsters/boss_village.svg',
    desc: '吞没商路的巨型史莱姆，乌石村外最大的威胁。',
  },
  forest: {
    name: '狼王', mob: '野狼', title: '幽林兽王',
    emoji: '👑', sprite: 'assets/img/monsters/boss_forest.svg',
    desc: '血月之下双眼赤红的兽王，血煞帮曾试图驯服它。',
  },
  ruins: {
    name: '骨将军', mob: '骷髅', title: '遗迹守将',
    emoji: '👑', sprite: 'assets/img/monsters/boss_ruins.svg',
    desc: '青岚剑宗旧战场的亡魂聚合体，剑意未散。',
  },
  peak: {
    name: '血煞头目', mob: '山贼', title: '怒潮峰主',
    emoji: '👑', sprite: 'assets/img/monsters/boss_peak.svg',
    desc: '占峰为王的匪首，赵凌亦需借其势上位。',
  },
};

function getRegionBoss(regionId) {
  return REGION_BOSSES[regionId || state.currentRegion] || REGION_BOSSES.village;
}

function getGridBossKey(g) {
  if (!g?.cells) return null;
  return Object.keys(g.cells).find(k => g.cells[k]?.type === 'boss') || null;
}

function bossPortraitHtml(regionId) {
  const b = getRegionBoss(regionId);
  return `<div class="sprite-wrap sprite-boss">${pixelImg(b.sprite, b.name, 'unit-sprite')}
    <span class="unit-sprite-fallback">${b.emoji}</span></div>`;
}

function battlePortraitHtml(m) {
  if (m?.isBoss) return bossPortraitHtml(m.regionId || state.currentRegion);
  return monsterPortraitHtml(m?.name);
}
