// 剧情与像素资源路径（v1.5+）
// 完整大纲见 docs/剧情大纲.md

const ASSETS = {
  ui: {
    logo: 'assets/img/ui/logo.png',
    panel: 'assets/img/ui/panel.png',
    nav: {
      char: 'assets/img/icons/nav/char.svg',
      map: 'assets/img/icons/nav/map.svg',
      bag: 'assets/img/icons/nav/bag.svg',
      shop: 'assets/img/icons/nav/shop.svg',
      auction: 'assets/img/icons/nav/auction.svg',
      life: 'assets/img/icons/nav/life.svg',
      checkin: 'assets/img/icons/nav/checkin.svg',
      pet: 'assets/img/icons/nav/pet.svg',
      cheat: 'assets/img/icons/nav/cheat.svg',
    },
  },
  regions: {
    village: 'assets/img/regions/village.png',
    forest: 'assets/img/regions/forest.png',
    ruins: 'assets/img/regions/ruins.png',
    peak: 'assets/img/regions/peak.png',
    blaze: 'assets/img/regions/peak.png',
  },
  characters: {
    player: 'assets/img/characters/player.png',
    suqing: 'assets/img/characters/suqing.png',
    zhaoling: 'assets/img/characters/zhaoling.png',
  },
  monsters: {
    '史莱姆': 'assets/img/monsters/slime.svg',
    '哥布林': 'assets/img/monsters/goblin.svg',
    '野狼': 'assets/img/monsters/wolf.svg',
    '骷髅': 'assets/img/monsters/skeleton.svg',
    '蝙蝠': 'assets/img/monsters/bat.svg',
    '山贼': 'assets/img/monsters/bandit.svg',
    '毒蜘蛛': 'assets/img/monsters/spider.svg',
  },
  pets: {
    p_slime: 'assets/img/pets/slime.png',
    p_wolf: 'assets/img/pets/wolf.png',
    p_bat: 'assets/img/pets/bat.png',
    p_spider: 'assets/img/pets/spider.png',
    p_ghost: 'assets/img/pets/ghost.png',
  },
};

/** 王道热血 · 废柴逆袭主线（原创，斗破式气质） */
const STORY = {
  meta: {
    title: '青岚焰',
    tagline: '丹田虽空，心火未灭。',
    theme: '废体少年陆燃，从乌石村一路打至苍岚峰顶。',
  },

  /** 新档默认角色信息（剧情固定，不可编辑） */
  defaultHero: {
    name: '陆燃',
    title: '乌石废体',
    bio: '三年前气尽断途，今日重提木剑，誓把尊严亲手挣回来。',
  },

  characters: {
    luruan: { name: '陆燃', role: '主角', desc: '丹田异火沉睡的天才落难者' },
    suqing: { name: '苏清', role: '青梅竹马', desc: '药铺姑娘，唯一不信他废了的人' },
    mobo: { name: '莫伯', role: '村长', desc: '知晓秘辛的老人，暗中照拂' },
    zhaoling: { name: '赵凌', role: '宿敌', desc: '赵家大少，傲慢，专爱踩人上位' },
    moweng: { name: '墨翁', role: '引路人', desc: '遗迹残魂，毒舌，识得青岚焰' },
    han: { name: '韩执事', role: '宗门', desc: '苍岚剑宗外门，唯实力论' },
  },

  prologue: {
    id: 'prologue',
    title: '序章 · 莫欺少年穷',
    lines: [
      { speaker: '旁白', text: '三年前，陆燃七段气龄名动乌石，如今连三段都稳不住。' },
      { speaker: '赵凌', text: '废物就是废物。滚去村外打史莱姆，别脏了我们赵家的路。' },
      { speaker: '苏清', text: '别听他的……把这伤药带上。我相信你，不是废了，是在等机缘。' },
      { speaker: '莫伯', text: '一百铜钱、一柄木剑，够你起步。尊严，要一拳一拳打回来。' },
      { speaker: '旁白', text: '你握紧木剑。丹田深处，有一缕无人察觉的微火，轻轻跳了一下。' },
    ],
  },

  regions: {
    village: {
      name: '乌石村',
      intro: '被退婚、被嘲讽、被遗弃的地方——也是一切重新开始的地方。',
      blurb: '哥布林扰村、赵凌抢功。莫伯让你先在此重修基础。',
    },
    forest: {
      name: '幽暗森林',
      intro: '兽眼赤红，黑气缠体。血煞帮在林深处炼化兽核，赵凌也盯上了这里。',
      blurb: '救货郎、破兽潮，与赵凌首次正面交锋。',
    },
    ruins: {
      name: '古代遗迹',
      intro: '百年前青岚剑宗灭门旧战场。墨翁残魂苏醒：你丹田里沉睡着青岚焰。',
      blurb: '破血祭、结缘小骷髅，异火初兆，宿敌逃向苍岚峰。',
    },
    peak: {
      name: '苍岚峰',
      intro: '剑宗外门试炼之地。登顶得断峰剑意，赵凌已在峰顶等你最后一战。',
      blurb: '韩执事观战。胜则名动一方，败则万事皆休。',
    },
    blaze: {
      name: '青岚余烬',
      intro: '魔焰自遗迹方向蔓延，妖兽暴走。青岚火种觉醒后，你是唯一能够平定余烬的人。',
      blurb: '击退魔焰执事，在乱战中稳住青岚火种，魔渊边境已在望。',
    },
  },

  chapters: {
    village: {
      onEnter: [
        { speaker: '旁白', text: '乌石村的风仍带着讥笑。你不语，只把木剑指向村外。' },
        { speaker: '莫伯', text: '史莱姆最宜练气。攒够铜钱，去兵器铺换把像样的剑。' },
      ],
      milestoneLv3: [
        { speaker: '莫伯', text: '森林里的狼眼红了……去查查，迟了又要死人。' },
      ],
    },
    forest: {
      onEnter: [
        { speaker: '旁白', text: '树冠吞没天光。远处传来狼嚎，不像兽，更像人在哭。' },
        { speaker: '赵凌', text: '哟，废物也敢进林？滚远点，别拖本少后腿。' },
      ],
      onRescue: [
        { speaker: '货郎', text: '血煞帮在遗迹筑台……他们要挖什么火种！' },
      ],
    },
    ruins: {
      onEnter: [
        { speaker: '旁白', text: '断剑插在土里，风过如泣。你胸口那缕微火，忽然烫了。' },
        { speaker: '墨翁', text: '小子，你体内是青岚焰。想翻身？先过了老夫这一关。' },
      ],
      onPetGhost: [
        { speaker: '墨翁', text: '这小骷髅是老夫分神所化，跟着你，不算丢人。' },
      ],
    },
    peak: {
      onEnter: [
        { speaker: '韩执事', text: '苍岚峰只认剑与胆。上去，或死，或脱胎换骨。' },
        { speaker: '赵凌', text: '陆燃！峰顶狭路，今日你我不死不休！' },
      ],
      onVictory: [
        { speaker: '旁白', text: '断峰剑意入体，青岚焰冲天。韩执事沉默良久，递来内门选拔令。' },
        { speaker: '陆燃', text: '我的路，自己走。但今日之胜，不是结束，是开始。' },
      ],
    },
    blaze: {
      onEnter: [
        { speaker: '旁白', text: '黑焰冲天，妖兽嘶吼。青岚余烬之地，步步都是魔气。' },
        { speaker: '韩执事', text: '血煞帮在唤醒焚天魔影。你既觉醒本源火种，这余烬之地，只能由你来平。' },
      ],
      onVictory: [
        { speaker: '墨翁', text: '好！魔焰执事已退，青岚火种稳了三分。' },
        { speaker: '陆燃', text: '魔渊边境……我准备好了。' },
      ],
    },
  },

  rivalry: {
    rival: '赵凌',
    quotes: [
      '废物就该有废物的觉悟。',
      '你以为赢我一次，就能改变什么？',
      '峰顶见。我会让你跪下来求饶。',
    ],
  },

  foreshadow: [
    '丹田微火 = 青岚焰火种，随等级与天赋觉醒逐步显露',
    '墨翁 / 小骷髅 = 后续传功与剧情对话 NPC',
    '血煞帮 = 遗迹篇反派，可扩展为 repeat Boss',
    '内门选拔 = 下一版本新地图钩子',
  ],
};

const MONSTER_EMOJI = {
  '史莱姆': '🟢', '哥布林': '👺', '野狼': '🐺', '骷髅': '💀',
  '蝙蝠': '🦇', '山贼': '🥷', '毒蜘蛛': '🕷️',
};

function pixelImg(src, alt, className) {
  if (!src) return '';
  const cls = className ? ` class="${className}"` : ' class="pixel-art"';
  return `<img src="${src}" alt="${alt || ''}"${cls} loading="lazy" onerror="this.remove()">`;
}

function unitPortraitHtml(src, alt, emoji, className) {
  const cls = className || 'unit-sprite';
  const em = emoji || '❓';
  const img = src ? pixelImg(src, alt, cls) : '';
  return `<div class="sprite-wrap">${img}<span class="unit-sprite-fallback">${em}</span></div>`;
}

function monsterPortraitHtml(name) {
  if (!name) return unitPortraitHtml('', '', '👹', 'unit-sprite');
  return unitPortraitHtml(monsterArt(name), name, MONSTER_EMOJI[name] || '👹', 'unit-sprite');
}

function regionArt(id) {
  return ASSETS.regions[id] || '';
}

function monsterArt(name) {
  return ASSETS.monsters[name] || '';
}

function petArt(id) {
  return ASSETS.pets[id] || '';
}

function storyRegionIntro(id) {
  const r = STORY.regions[id];
  return r ? (r.intro || r.blurb || '') : '';
}
