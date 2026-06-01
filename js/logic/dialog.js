// v1.9+ 剧情弹窗 · v2.4 主线章节事件
const STORY_DIALOGS = {
  prologue: {
    title: '序章 · 莫欺少年穷',
    lines: STORY.prologue?.lines || [{ speaker: '旁白', text: '丹田虽空，心火未灭。' }],
    once: 'prologue',
  },
  tutorial: {
    title: '航线指南',
    lines: [
      { speaker: '莫伯', text: '这片大陆各行有各险。先从右上黑格连到左下蓝格，规划你的路线。' },
      { speaker: '莫伯', text: '左键长按拖线，右键取消一格。路线上的怪才会在挂机时出现。' },
      { speaker: '莫伯', text: '👑 Boss 格、📦 宝箱、💊 补给——善用它们，短路线有额外奖励。' },
    ],
    once: 'tutorial',
  },
  first_boss: {
    title: 'Boss 战',
    lines: [
      { speaker: '旁白', text: '路线上的 👑 格盘踞着头目级妖物，击败它才能清剿整条航线。' },
      { speaker: '陆燃', text: '……来吧。' },
    ],
    once: 'first_boss',
  },
  level_8: {
    title: '青岚初现',
    lines: [
      { speaker: '旁白', text: '丹田深处，一缕青焰悄然燃起——无人知晓，那是传说中的青岚焰。' },
      { speaker: '莫伯', text: '陆燃，你身上的气息……变了。' },
    ],
    once: 'level_8',
  },
  level_15: {
    title: '焰心微明',
    lines: [
      { speaker: '陆燃', text: '赵凌，当年你夺我灵根，今日我必登苍岚峰！' },
      { speaker: '旁白', text: '青岚焰在血脉中跳动，每一次击杀都在为焰心添柴。' },
    ],
    once: 'level_15',
  },
  level_5: { title: '突破', lines: [{ speaker: '旁白', text: '气段初稳，你已非当年「废体」之躯。' }], once: 'level_5' },
  level_10: { title: '试炼在望', lines: [{ speaker: '旁白', text: '苍岚峰在望，赵凌必在峰顶。' }], once: 'level_10' },
};

const CHAPTER_ORDER = ['village', 'forest', 'ruins', 'peak', 'blaze'];

const CHAPTER_TITLES = {
  village: '第一章 · 乌石村',
  forest: '第二章 · 幽暗森林',
  ruins: '第三章 · 古代遗迹',
  peak: '第四章 · 苍岚峰',
  blaze: '第五章 · 青岚余烬',
};

let dialogQueue = [];
let dialogOnClose = null;

function storyFlags() {
  if (!state.storyFlags) state.storyFlags = {};
  return state.storyFlags;
}

function hasStoryFlag(key) {
  return !!storyFlags()[key];
}

function setStoryFlag(key) {
  storyFlags()[key] = true;
  save();
}

function showDialog(id, customLines, onClose, customTitle) {
  const def = STORY_DIALOGS[id];
  if (!def && !customLines) return false;
  const lines = customLines || def.lines;
  const title = customTitle || def?.title || '剧情';
  dialogQueue.push({ title, lines, onClose });
  if (dialogQueue.length === 1) renderDialogStep();
  return true;
}

function tryShowDialog(id, customLines, onClose) {
  const def = STORY_DIALOGS[id];
  if (def?.once && hasStoryFlag(def.once)) return false;
  if (def?.once) setStoryFlag(def.once);
  return showDialog(id, customLines, onClose);
}

function tryShowChapter(flag, lines, title, onClose) {
  if (!lines?.length || hasStoryFlag(flag)) return false;
  setStoryFlag(flag);
  return showDialog(null, lines, onClose, title);
}

function renderDialogStep() {
  const box = document.getElementById('storyDialog');
  if (!box || !dialogQueue.length) return;
  const { title, lines } = dialogQueue[0];
  const idx = box.dataset.lineIdx ? +box.dataset.lineIdx : 0;
  const line = lines[idx];
  if (!line) {
    closeDialog();
    return;
  }
  box.classList.add('open');
  box.dataset.lineIdx = idx;
  document.getElementById('dialogTitle').textContent = title;
  document.getElementById('dialogSpeaker').textContent = line.speaker || '旁白';
  document.getElementById('dialogText').textContent = line.text;
  document.getElementById('dialogNext').textContent = idx >= lines.length - 1 ? '关闭' : '下一句';
}

function advanceDialog() {
  const box = document.getElementById('storyDialog');
  if (!box || !dialogQueue.length) return;
  const lines = dialogQueue[0].lines;
  let idx = (+box.dataset.lineIdx || 0) + 1;
  if (idx >= lines.length) {
    closeDialog();
    return;
  }
  box.dataset.lineIdx = idx;
  document.getElementById('dialogSpeaker').textContent = lines[idx].speaker || '旁白';
  document.getElementById('dialogText').textContent = lines[idx].text;
  document.getElementById('dialogNext').textContent = idx >= lines.length - 1 ? '关闭' : '下一句';
}

function closeDialog() {
  const box = document.getElementById('storyDialog');
  if (!box) return;
  const done = dialogQueue.shift();
  box.classList.remove('open');
  box.dataset.lineIdx = '0';
  if (done?.onClose) done.onClose();
  if (dialogQueue.length) renderDialogStep();
}

function checkRegionStory(regionId) {
  const ch = STORY.chapters?.[regionId];
  if (ch?.onEnter?.length) {
    tryShowChapter('ch_' + regionId + '_enter', ch.onEnter, CHAPTER_TITLES[regionId] || ('抵达 · ' + regionId));
    return;
  }
  const intro = STORY.regions?.[regionId]?.intro;
  if (intro) tryShowChapter('ch_' + regionId + '_enter', [{ speaker: '旁白', text: intro }], '抵达 · ' + (STORY.regions[regionId]?.name || regionId));
}

function checkChapterMilestones(level) {
  const ch = STORY.chapters?.village;
  if (level >= 3 && ch?.milestoneLv3) {
    tryShowChapter('ch_village_lv3', ch.milestoneLv3, '莫伯的提醒');
  }
}

function checkChapterBossDefeat(regionId) {
  const ch = STORY.chapters?.[regionId];
  if (!ch) return;
  if (regionId === 'forest' && ch.onRescue) {
    tryShowChapter('ch_forest_rescue', ch.onRescue, '货郎惊魂');
  }
  if (regionId === 'peak' && ch.onVictory) {
    tryShowChapter('ch_peak_victory', ch.onVictory, '峰顶证道', () => {
      state.title = '苍岚新秀';
      render(); save();
    });
  }
  if (regionId === 'blaze' && ch.onVictory) {
    tryShowChapter('ch_blaze_victory', ch.onVictory, '余烬平定', () => {
      state.title = '青岚承续';
      render(); save();
    });
  }
}

function checkChapterPetGhost() {
  const ch = STORY.chapters?.ruins;
  if (ch?.onPetGhost) tryShowChapter('ch_ruins_pet', ch.onPetGhost, '墨翁赠礼');
}

function checkLevelStory(level) {
  checkChapterMilestones(level);
  if (level >= 5) tryShowDialog('level_5');
  if (level >= 8) tryShowDialog('level_8');
  if (level >= 10) tryShowDialog('level_10');
  if (level >= 15) tryShowDialog('level_15');
}

function getCharStoryPanelData() {
  const progress = getStoryProgress();
  const done = state.storyChapter === 'complete';
  let chapterId = null;
  if (hasStoryFlag('prologue')) {
    for (const id of CHAPTER_ORDER) {
      if (hasStoryFlag('ch_' + id + '_enter')) chapterId = id;
    }
    if (!chapterId) chapterId = 'village';
  }
  const region = chapterId ? STORY.regions[chapterId] : null;
  const castByChapter = {
    village: ['mobo', 'zhaoling', 'suqing'],
    forest: ['zhaoling'],
    ruins: ['moweng'],
    peak: ['han', 'zhaoling'],
    blaze: ['han', 'moweng'],
  };
  const cast = (chapterId ? castByChapter[chapterId] : ['suqing', 'mobo'])
    .map(k => STORY.characters[k]).filter(Boolean);

  let synopsis = STORY.meta.tagline;
  let objective = '点击地图，规划航线，在挂机战斗中成长。';
  if (!hasStoryFlag('prologue')) {
    synopsis = '三年前气尽断途，赵凌当众羞辱。苏清塞来伤药，莫伯给你木剑与铜钱——丹田深处，微火初跳。';
    objective = '阅读序章弹窗，然后开始乌石村外的修行。';
  } else if (done) {
    synopsis = (state.completedChapters || []).includes('blaze')
      ? '五章走完，青岚火种重稳。魔渊边境已开，焚天魔影的阴影仍未散去。'
      : STORY.chapters.peak.onVictory[0].text;
    objective = (state.completedChapters || []).includes('blaze')
      ? '主线第五章已完成。魔渊篇，敬请期待。'
      : '主线第四章已完成。青岚余烬之祸，即将展开。';
  } else if (region) {
    synopsis = region.intro || region.blurb || synopsis;
    objective = region.blurb || objective;
  }

  const milestones = [];
  if (hasStoryFlag('ch_village_lv3')) milestones.push('莫伯提醒');
  if (hasStoryFlag('ch_forest_rescue')) milestones.push('货郎获救');
  if (hasStoryFlag('ch_ruins_pet')) milestones.push('墨翁赠礼');
  if (hasStoryFlag('ch_peak_victory')) milestones.push('峰顶证道');
  if (hasStoryFlag('ch_blaze_victory')) milestones.push('余烬平定');

  return {
    title: progress.label,
    chapterId,
    synopsis,
    objective,
    cast,
    milestones,
    done,
    rival: STORY.rivalry?.rival,
  };
}

function getStoryProgress() {
  if (typeof getStoryChapterTitle === 'function') {
    const label = getStoryChapterTitle();
    const ch = getCurrentStoryChapter?.();
    const idx = ch ? STORY_CHAPTERS.findIndex(c => c.id === ch.id) : (state.storyChapter === 'complete' ? STORY_CHAPTERS.length : 0);
    return { label, chapter: idx + 1 };
  }
  if (!hasStoryFlag('prologue')) return { label: '序章 · 莫欺少年穷', chapter: 0 };
  for (let i = CHAPTER_ORDER.length - 1; i >= 0; i--) {
    const id = CHAPTER_ORDER[i];
    if (hasStoryFlag('ch_' + id + '_enter')) {
      const name = STORY.regions?.[id]?.name || id;
      if (id === 'peak' && hasStoryFlag('ch_peak_victory') && !hasStoryFlag('ch_blaze_enter')) {
        return { label: '第四章完成 · 待入余烬', chapter: 4 };
      }
      if (id === 'blaze' && hasStoryFlag('ch_blaze_victory')) {
        return { label: '主线完成 · 青岚承续', chapter: 5 };
      }
      return { label: CHAPTER_TITLES[id] || name, chapter: i + 1 };
    }
  }
  return { label: '序章 · 莫欺少年穷', chapter: 0 };
}

function initStoryOnLoad() {
  if (typeof initStoryChapter === 'function') initStoryChapter();
  if (!hasStoryFlag('prologue')) {
    setTimeout(() => tryShowDialog('prologue', null, () => {
      if (typeof initStoryChapter === 'function') {
        state.storyChapter = 'village';
        save();
        if (typeof render === 'function') render();
      }
    }), 400);
    return;
  }
  setTimeout(() => {
    const rid = state.currentRegion || 'village';
    if (!hasStoryFlag('ch_' + rid + '_enter')) checkRegionStory(rid);
  }, 500);
}

window.advanceDialog = advanceDialog;
window.closeDialog = closeDialog;
