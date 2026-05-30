// v3.2 章节任务 · 小说推进

function initStoryChapter() {
  if (!state.storyChapter) {
    state.storyChapter = hasStoryFlag('prologue') ? 'village' : 'prologue';
  }
  if (state.storyChapter === 'prologue' && hasStoryFlag('prologue')) {
    state.storyChapter = 'village';
  }
  if (!state.regionRoutes) state.regionRoutes = {};
  if (!state.regionBossKills) state.regionBossKills = {};
  if (!state.completedChapters) state.completedChapters = [];
}

function canAccessRegion(regionId) {
  const r = REGIONS.find(x => x.id === regionId);
  if (!r) return false;
  if (state.level >= r.minLevel) return true;
  const ch = typeof getCurrentStoryChapter === 'function' ? getCurrentStoryChapter() : null;
  return ch?.regionId === regionId;
}

function getCurrentStoryChapter() {
  initStoryChapter();
  if (state.storyChapter === 'complete') return null;
  if (state.storyChapter === 'prologue') return null;
  return STORY_CHAPTER_BY_ID[state.storyChapter] || STORY_CHAPTERS[0];
}

function getChapterTaskProgress(task) {
  if (!task) return 0;
  switch (task.type) {
    case 'route_clear':
      return state.regionRoutes?.[task.regionId] || 0;
    case 'boss_kill':
      return state.regionBossKills?.[task.regionId] || 0;
    case 'level':
      return state.level || 1;
    case 'flag':
      return hasStoryFlag(task.flag) ? 1 : 0;
    case 'kill':
      return state.totalKills || 0;
    default:
      return 0;
  }
}

function isChapterTaskDone(task) {
  return getChapterTaskProgress(task) >= task.target;
}

function isCurrentChapterComplete() {
  const ch = getCurrentStoryChapter();
  if (!ch) return false;
  return ch.tasks.every(isChapterTaskDone);
}

function trackRegionRoute(regionId) {
  if (!regionId) return;
  initStoryChapter();
  state.regionRoutes[regionId] = (state.regionRoutes[regionId] || 0) + 1;
  checkStoryChapterTasks();
}

function trackRegionBossKill(regionId) {
  if (!regionId) return;
  initStoryChapter();
  state.regionBossKills[regionId] = (state.regionBossKills[regionId] || 0) + 1;
  checkStoryChapterTasks();
}

function checkStoryChapterTasks() {
  const ch = getCurrentStoryChapter();
  if (!ch) return;
  const readyFlag = 'ch_tasks_ready_' + ch.id;
  if (isCurrentChapterComplete() && !hasStoryFlag(readyFlag)) {
    setStoryFlag(readyFlag);
    if (typeof showToast === 'function') {
      showToast('📖 本章任务已完成，可开启下一章');
    }
    if (typeof render === 'function') render();
  }
}

function getStoryChapterTitle() {
  initStoryChapter();
  if (state.storyChapter === 'prologue') return '序章 · 莫欺少年穷';
  if (state.storyChapter === 'complete') return '主线完成 · 苍岚新秀';
  const ch = getCurrentStoryChapter();
  return ch?.title || '主线';
}

function advanceStoryChapter() {
  const ch = getCurrentStoryChapter();
  if (!ch || !isCurrentChapterComplete()) return false;

  const rw = ch.rewards || {};
  if (rw.gold) state.gold += rw.gold;
  if (rw.xp) state.xp += applyXpGain(rw.xp);
  if (rw.diamonds) state.diamonds = (state.diamonds || 0) + rw.diamonds;
  checkLevelUp(true);

  if (!state.completedChapters.includes(ch.id)) {
    state.completedChapters.push(ch.id);
  }
  setStoryFlag('ch_novel_done_' + ch.id);

  if (!ch.nextId) {
    state.storyChapter = 'complete';
    state.title = '苍岚新秀';
    if (typeof showToast === 'function') showToast('🎉 主线四章完结！');
    render(); save();
    return true;
  }

  state.storyChapter = ch.nextId;
  const next = STORY_CHAPTER_BY_ID[ch.nextId];
  if (next) {
    if (!hasStoryFlag('ch_' + next.regionId + '_enter')) {
      setStoryFlag('ch_' + next.regionId + '_enter');
    }
    state.currentRegion = next.regionId;
    if (typeof initGridMap === 'function') initGridMap(true);
    if (next.onOpen?.length) {
      showDialog(null, next.onOpen, null, next.title);
    }
    if (typeof showToast === 'function') {
      showToast(`📖 ${next.title} 已开启`);
    }
  }

  render(); save();
  return true;
}

function getCompletedChapterRecap() {
  initStoryChapter();
  return (state.completedChapters || [])
    .map(id => STORY_CHAPTER_BY_ID[id])
    .filter(Boolean);
}

window.advanceStoryChapter = advanceStoryChapter;
