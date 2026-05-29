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
  level_5: { title: '突破', lines: [{ speaker: '旁白', text: '气段初稳，你已非当年「废体」之躯。' }], once: 'level_5' },
  level_10: { title: '试炼在望', lines: [{ speaker: '旁白', text: '苍岚峰在望，赵凌必在峰顶。' }], once: 'level_10' },
};

const CHAPTER_ORDER = ['village', 'forest', 'ruins', 'peak'];

const CHAPTER_TITLES = {
  village: '第一章 · 乌石村',
  forest: '第二章 · 幽暗森林',
  ruins: '第三章 · 古代遗迹',
  peak: '第四章 · 苍岚峰',
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
}

function checkChapterPetGhost() {
  const ch = STORY.chapters?.ruins;
  if (ch?.onPetGhost) tryShowChapter('ch_ruins_pet', ch.onPetGhost, '墨翁赠礼');
}

function checkLevelStory(level) {
  checkChapterMilestones(level);
  if (level >= 5) tryShowDialog('level_5');
  if (level >= 10) tryShowDialog('level_10');
}

function getStoryProgress() {
  if (!hasStoryFlag('prologue')) return { label: '序章 · 莫欺少年穷', chapter: 0 };
  for (let i = CHAPTER_ORDER.length - 1; i >= 0; i--) {
    const id = CHAPTER_ORDER[i];
    if (hasStoryFlag('ch_' + id + '_enter')) {
      const name = STORY.regions?.[id]?.name || id;
      if (id === 'peak' && hasStoryFlag('ch_peak_victory')) return { label: '主线完成 · ' + name, chapter: 5 };
      return { label: CHAPTER_TITLES[id] || name, chapter: i + 1 };
    }
  }
  return { label: '序章 · 莫欺少年穷', chapter: 0 };
}

function initStoryOnLoad() {
  if (!hasStoryFlag('prologue')) {
    setTimeout(() => tryShowDialog('prologue'), 400);
    return;
  }
  setTimeout(() => {
    const rid = state.currentRegion || 'village';
    if (!hasStoryFlag('ch_' + rid + '_enter')) checkRegionStory(rid);
  }, 500);
}

window.advanceDialog = advanceDialog;
window.closeDialog = closeDialog;
