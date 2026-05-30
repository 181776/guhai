window.openSlotPicker = function(slot) { pickingSlot = pickingSlot === slot ? null : slot; renderChar(); };

window.equipFromPicker = function(uid) { const item = state.bag.find(i => i.uid == uid); if (item) equipItem(item); };

window.unequipFromSlot = function(slot) { unequipSlot(slot); };

window.learnFromBag = function(uid) { const item = state.bag.find(i => i.uid == uid); if (item?.type === 'manual') learnManual(item); };

window.buyFromShop = function(id) { const item = SHOP.find(i => i.id === id); if (item) buyItem(item); };

window.sellItem = sellItem;

window.sellOneMaterial = sellOneMaterial;

window.unlockTalent = unlockTalent;

window.doLifeSkill = doLifeSkill;

window.selectRegion = selectRegion;

window.setActivePet = setActivePet;
window.setActiveBattlePet = setActiveBattlePet;
window.setActiveLifePet = setActiveLifePet;

window.buyAuctionLot = buyAuctionLot;

window.consignToAuction = consignToAuction;

window.unlockLifeNode = unlockLifeNode;

window.craftItem = craftItem;

function render() {
  renderTopBar(); renderChar(); renderMap(); renderBattle();
  renderBag(); renderShop(); renderAuction(); renderLife(); renderCheckin(); renderPet(); renderCodex(); renderAchievements(); renderCheat();
}

document.getElementById('gridRegionTabs').addEventListener('click', e => {
  const tab = e.target.closest('[data-region]');
  if (!tab || tab.disabled) return;
  selectGridRegion(tab.dataset.region);
});

const pathGridEl = document.getElementById('pathGrid');
pathGridEl.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  e.preventDefault();
  const cell = e.target.closest('[data-r]');
  if (!cell) return;
  gridPointerDown(+cell.dataset.r, +cell.dataset.c, e.button);
});

document.addEventListener('mousemove', e => {
  if (!isGridDragging()) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const cell = el?.closest?.('[data-r]');
  if (!cell) return;
  gridPointerEnter(+cell.dataset.r, +cell.dataset.c);
});

document.addEventListener('mouseup', () => gridPointerUp());
pathGridEl.addEventListener('contextmenu', e => {
  e.preventDefault();
  const cell = e.target.closest('[data-r]');
  if (!cell) return;
  gridRightClick(+cell.dataset.r, +cell.dataset.c);
});
pathGridEl.addEventListener('dragstart', e => e.preventDefault());

document.getElementById('gridClear').addEventListener('click', gridClearPath);
document.getElementById('gridGo').addEventListener('click', confirmGridPath);
document.getElementById('routeExport').addEventListener('click', exportRouteShare);
document.getElementById('routeImport').addEventListener('click', importRouteShare);
document.getElementById('btnExportSave').addEventListener('click', exportSave);
document.getElementById('importSaveFile').addEventListener('change', e => {
  const f = e.target.files?.[0];
  if (f) importSaveFromFile(f);
  e.target.value = '';
});

document.querySelectorAll('.codex-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    codexTab = tab.dataset.codex;
    renderCodex();
  });
});

document.getElementById('battleModalClose').addEventListener('click', () => {
  closeBattleModal();
  render();
  save();
});

document.getElementById('battleModal').addEventListener('click', e => {
  if (e.target.id === 'battleModal') {
    closeBattleModal();
    render();
    save();
  }
});

document.getElementById('lifeGrid').addEventListener('click', e => {
  const btn = e.target.closest('button[data-life]');
  if (btn && !btn.disabled) doLifeSkill(btn.dataset.life);
});

document.getElementById('petGrid').addEventListener('click', e => {
  const btn = e.target.closest('button[data-pet]');
  if (!btn) return;
  if (btn.dataset.petType === 'life') setActiveLifePet(btn.dataset.pet);
  else setActiveBattlePet(btn.dataset.pet);
});

document.getElementById('btnCheckin').addEventListener('click', doCheckin);

document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
  const page = btn.dataset.page;
  if (typeof navigateToPage === 'function') navigateToPage(page);
  else {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-' + page).classList.add('active');
  }
}));

document.querySelectorAll('.shop-tab').forEach(tab => tab.addEventListener('click', () => { shopTab = tab.dataset.shop; renderShop(); }));

document.getElementById('cheatSetGold').addEventListener('click', () => {
  setCheatGold(document.getElementById('cheatGoldInput').value);
});

document.getElementById('cheatAdd1k').addEventListener('click', () => { setCheatGold(state.gold + 1000); });
document.getElementById('cheatAdd10k').addEventListener('click', () => { setCheatGold(state.gold + 10000); });

document.getElementById('cheatSetDiamond').addEventListener('click', () => {
  setCheatDiamonds(document.getElementById('cheatDiamondInput').value);
});

document.getElementById('cheatAdd5dia').addEventListener('click', () => { setCheatDiamonds((state.diamonds || 0) + 5); });

document.getElementById('cheatSetSpiritRoot').addEventListener('click', () => {
  const id = document.getElementById('cheatSpiritRoot').value;
  if (SPIRIT_ROOTS[id]) {
    state.spiritRoot = id;
    render(); save();
  }
});

document.getElementById('openFeedback')?.addEventListener('click', openFeedbackModal);
document.getElementById('feedbackSubmit')?.addEventListener('click', submitFeedback);
document.getElementById('feedbackCopy')?.addEventListener('click', copyFeedbackOnly);
document.getElementById('feedbackModal')?.addEventListener('click', e => {
  if (e.target.id === 'feedbackModal') closeFeedbackModal();
});
['feedbackType', 'feedbackMessage', 'feedbackContact', 'feedbackIdeaKind', 'feedbackIdeaNote'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', saveFeedbackDraft);
});
document.getElementById('feedbackType')?.addEventListener('change', updateFeedbackMeta);

document.getElementById('toggleBattle').addEventListener('click', () => {
  if (!state.battleOn && !canStartGridBattle()) {
    addLog('<span class="sys">请先连线路线并确认，路线上须有未清剿的怪物格</span>', true);
    return;
  }
  state.battleOn = !state.battleOn;
  if (state.battleOn) {
    clampHp();
    autoUsePreBattleBuff();
    if (!state.monster) spawnMonster();
    else if (!currentLogBlock) startBattleBlock(state.monster.name, state.monster.level);
    battleTimer = setInterval(battleTick, getBattleInterval());
    addLog('—— 沿路线挂机 ——', true);
  } else {
    clearInterval(battleTimer);
    endBattleBlock();
    addLog('—— 停止挂机 ——', true);
  }
  render(); save();
});

if (!state.grid?.cells) initGridMap(true);
else if (state.grid.phase === 'walk') {
  state.grid.phase = 'draw';
  state.grid.path = [state.grid.start];
} else if (!state.grid.shape) initGridMap(true);
else {
  const def = GRID_BY_REGION[state.currentRegion || 'village'];
  if (state.grid.rows !== def.rows || state.grid.cols !== def.cols) initGridMap(true);
}

function initGameBranding() {
  const el = document.getElementById('gameVersion');
  if (el && typeof GAME_VERSION !== 'undefined') el.textContent = `v${GAME_VERSION}`;
  if (typeof GAME_VERSION !== 'undefined') document.title = `古海大陆 v${GAME_VERSION}`;
}

initGameBranding();
initStoryOnLoad();
if (typeof initStoryChapter === 'function') initStoryChapter();
if (typeof canAccessRegion === 'function' && typeof STORY_CHAPTER_BY_ID !== 'undefined') {
  const ch = STORY_CHAPTER_BY_ID[state.storyChapter];
  if (ch?.regionId && canAccessRegion(ch.regionId) && state.currentRegion !== ch.regionId) {
    const phase = state.grid?.phase;
    if (!phase || phase === 'draw') {
      state.currentRegion = ch.regionId;
      initGridMap(true);
    }
  }
}
rollDailyBounty();
checkOfflineSummary();
checkAchievements();
render();

saveTimer = setInterval(save, 3000);

setInterval(() => {
  if (document.getElementById('page-life').classList.contains('active')) renderLife();
}, 500);

setInterval(() => {
  if (document.getElementById('page-auction').classList.contains('active')) renderAuction();
}, 1000);

setInterval(() => {
  if (typeof tickLifePetGather === 'function') tickLifePetGather();
}, 2000);
