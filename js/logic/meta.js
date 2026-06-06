// v3.0 元系统逻辑

function getBattleInterval() {
  return BATTLE_SPEEDS[state.battleSpeed || 1] || 900;
}

function restartBattleTimer() {
  if (!state.battleOn) return;
  clearInterval(battleTimer);
  battleTimer = setInterval(battleTick, getBattleInterval());
}

function setBattleSpeed(spd) {
  if (!BATTLE_SPEEDS[spd]) return;
  state.battleSpeed = spd;
  restartBattleTimer();
  render(); save();
}

function getPetBonuses(st = state) {
  const bonus = emptyStats();
  if (!st.activeBattlePet) return bonus;
  const pb = PET_BONUSES[st.activeBattlePet];
  if (!pb?.stats) return bonus;
  for (const k of Object.keys(bonus)) bonus[k] += pb.stats[k] || 0;
  return bonus;
}

function getLifePetBonusText(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet || pet.type !== 'life') return '';
  const skill = LIFE_SKILLS.find(s => s.id === pet.lifeSkill);
  return skill ? `自动${skill.name} · 效率 ${Math.round(LIFE_PET_EFFICIENCY * 100)}%` : '';
}

function tickLifePetGather() {
  const pid = state.activeLifePet;
  if (!pid || !state.pets.includes(pid)) return;
  const pet = PETS.find(p => p.id === pid);
  if (pet?.type !== 'life' || !pet.lifeSkill) return;
  const skill = LIFE_SKILLS.find(s => s.id === pet.lifeSkill);
  if (!skill) return;
  const now = Date.now();
  const cdKey = 'pet_' + pet.lifeSkill;
  const bonus = getLifeBonuses(pet.lifeSkill);
  const cdMs = Math.floor(skill.cd * bonus.cdMult);
  if (now < (state.lifePetCd?.[cdKey] || 0)) return;
  state.lifePetCd[cdKey] = now + cdMs;
  const xpGain = Math.max(1, Math.floor(skill.xp * (bonus.xpMult || 1) * LIFE_PET_EFFICIENCY));
  state.xp += applyXpGain(xpGain);
  if (Math.random() < LIFE_PET_EFFICIENCY) addToBag({ ...skill.mat });
  state.lifeSp = (state.lifeSp || 0) + (Math.random() < LIFE_PET_EFFICIENCY ? 1 : 0);
  checkLevelUp(true);
  save();
}

function trackGoldSpent(amount) {
  if (!amount || amount <= 0) return;
  state.totalGoldSpent = (state.totalGoldSpent || 0) + amount;
  checkAchievements();
}

function handleBattleDefeat() {
  clearInterval(battleTimer);
  state.battleOn = false;
  flushDeferredDialogs();
  state.combo = 0;
  state.mapStreak = 0;
  state.pendingDefeatRetry = true;
  state.totalDeaths = (state.totalDeaths || 0) + 1;

  const goldLoss = Math.min(state.gold, Math.max(ECONOMY.defeatGoldMin, Math.floor(state.gold * ECONOMY.defeatGoldPct)));
  const xpLoss = Math.min(state.xp, Math.floor(state.xp * ECONOMY.defeatXpPct));
  state.gold -= goldLoss;
  state.xp -= xpLoss;

  state.battleDebuff = null;
  state.playerStatus = null;
  endBattleBlock();
  restoreMpFull();
  addLog(`<span class="dmg">💀 战败！损失 ${formatCoin(goldLoss)}、${xpLoss} 经验（等级不变）</span>`, true);

  showDefeatModal(goldLoss, xpLoss);
  if (typeof openBattleModal === 'function') openBattleModal();
  checkAchievements();
  render(); save();
}

function resumeBattleAfterDefeat(resetRoute) {
  if (!canStartGridBattle()) {
    render(); save();
    return;
  }
  if (resetRoute && state.grid) {
    state.grid.clearedEncounters = [];
    resetPathCollectibles();
    state.monster = null;
    state.battleDebuff = null;
    state.playerStatus = null;
  }
  state.battleOn = true;
  clampHp();
  if (!state.monster) {
    spawnMonster();
  } else {
    const m = state.monster;
    const label = m.isBoss && m.bossTitle
      ? `👑 ${m.dropName || m.name} · ${m.bossTitle}`
      : m.name;
    startBattleBlock(label, m.level);
    logTurnOrder(calcStats(), m);
  }
  clearInterval(battleTimer);
  battleTimer = setInterval(battleTick, getBattleInterval());
  addLog('—— 沿路线挂机 ——', true);
  render(); save();
}

function retryAfterDefeat() {
  if (!state.pendingDefeatRetry) return;
  state.pendingDefeatRetry = false;
  const s = calcStats();
  state.currentHp = Math.max(1, Math.floor(s.maxHp * ECONOMY.defeatRetryHpPct));
  closeDefeatModal();
  addLog('—— 再战！生命恢复至两成，继续当前战斗 ——', true);
  resumeBattleAfterDefeat(false);
}

function retreatAfterDefeat() {
  if (!state.pendingDefeatRetry) return;
  state.pendingDefeatRetry = false;
  const s = calcStats();
  state.currentHp = s.maxHp;
  closeDefeatModal();
  addLog('—— 撤退！生命已回满，航线清剿从头开始 ——', true);
  resumeBattleAfterDefeat(true);
}

function showDefeatModal(goldLoss, xpLoss) {
  const el = document.getElementById('defeatModal');
  const text = document.getElementById('defeatText');
  if (!el) return;
  if (text) {
    text.textContent = `你在战斗中倒下，损失了 ${formatCoin(goldLoss)} 与 ${xpLoss} 点经验。等级未降低，但挂机已暂停。`;
  }
  el.classList.add('show');
}

function closeDefeatModal() {
  document.getElementById('defeatModal')?.classList.remove('show');
}

function getQinglanStage(st = state) {
  const kills = st.totalBossKills || 0;
  let stage = QINGLAN_STAGES[0];
  for (const q of QINGLAN_STAGES) {
    if (kills >= q.need) stage = q;
  }
  return stage;
}

function getQinglanStatBonus(st = state) {
  const stage = getQinglanStage(st).id;
  if (stage >= 2) return { spAtk: 2 };
  return emptyStats();
}

function getQinglanMult(st = state) {
  return getQinglanStage(st).id >= 3 ? 1.01 : 1;
}

function rollDailyBounty() {
  const today = todayStr();
  if (state.bounty?.date === today) return;
  const b = BOUNTY_POOL[Math.floor(Math.random() * BOUNTY_POOL.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  state.bounty = {
    date: today, regionId: region.id, type: b.type,
    target: b.target, progress: 0, label: b.label,
    gold: b.gold, xp: b.xp, claimed: false,
  };
}

function trackBounty(type, n = 1) {
  rollDailyBounty();
  const b = state.bounty;
  if (!b || b.claimed || b.type !== type) return;
  b.progress = Math.min(b.target, (b.progress || 0) + n);
  if (b.progress >= b.target) showToast('📜 悬赏已完成，去成就页领取！');
  save();
}

function claimBounty() {
  rollDailyBounty();
  const b = state.bounty;
  if (!b || b.claimed || b.progress < b.target) return false;
  b.claimed = true;
  state.gold += applyGoldGain(b.gold);
  state.xp += applyXpGain(b.xp);
  checkLevelUp(true);
  showToast(`📜 悬赏奖励 +${formatCoin(b.gold)} +${b.xp} 经验`);
  checkAchievements();
  render(); save();
  return true;
}

function checkAchievements() {
  if (!state.achievements) state.achievements = {};
  let any = false;
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    if (!a.check(state)) continue;
    state.achievements[a.id] = Date.now();
    const rw = a.reward || {};
    if (rw.gold) state.gold += applyGoldGain(rw.gold);
    if (rw.diamonds) state.diamonds = (state.diamonds || 0) + rw.diamonds;
    if (rw.lifeSp) state.lifeSp = (state.lifeSp || 0) + rw.lifeSp;
    showToast(a.noReward ? `🏆 纪念成就：${a.name}` : `🏆 成就：${a.name}`);
    any = true;
  }
  if (any) save();
  return any;
}

function showToast(msg, ms = 2800) {
  let el = document.getElementById('gameToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'gameToast';
    el.className = 'game-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), ms);
}

function tryRivalTaunt() {
  if (Math.random() > 0.08) return;
  addLog(`<span class="sys">${RIVAL_TAUNTS[Math.floor(Math.random() * RIVAL_TAUNTS.length)]}</span>`, true);
}

function getComboBonus() {
  const c = state.combo || 0;
  return Math.min(COMBO_BONUS_CAP, c * COMBO_BONUS_PER);
}

function onBattleWin(isBoss, regionId) {
  state.combo = (state.combo || 0) + 1;
  if (state.combo > (state.maxCombo || 0)) state.maxCombo = state.combo;
  state.totalKills = (state.totalKills || 0) + 1;
  if (isBoss) {
    state.totalBossKills = (state.totalBossKills || 0) + 1;
    trackBounty('boss');
    if (typeof trackRegionBossKill === 'function') trackRegionBossKill(regionId);
  }
  trackBounty('kill');
  tryRivalTaunt();
  checkAchievements();
  if (typeof checkStoryChapterTasks === 'function') checkStoryChapterTasks();
}

function onRouteComplete() {
  state.combo = 0;
  state.totalRoutes = (state.totalRoutes || 0) + 1;
  state.mapStreak = (state.mapStreak || 0) + 1;
  trackBounty('route');
  checkAchievements();
  if (typeof trackRegionRoute === 'function') trackRegionRoute(state.currentRegion);
}

function getWeaknessBonus(monsterName) {
  if (!isCodexUnlocked(monsterName)) return 0;
  const entry = CODEX[monsterName];
  if (!entry?.weak) return 0;
  return WEAKNESS_BONUS;
}

function tickPlayerStatus(s) {
  const ps = state.playerStatus;
  if (!ps) return;
  if (ps.burn > 0) {
    const dmg = Math.max(1, Math.floor(s.maxHp * 0.02));
    state.currentHp = Math.max(0, (state.currentHp ?? s.maxHp) - dmg);
    trackBattleStat('damageTaken', dmg);
    addLog(`<span class="dmg">🔥 灼烧 ${dmg}</span>`);
    ps.burn--;
  }
  if (ps.shield > 0) ps.shield--;
}

function applyShield(hpPct) {
  if (!state.playerStatus) state.playerStatus = {};
  state.playerStatus.shieldHp = Math.max(state.playerStatus.shieldHp || 0,
    Math.floor(calcStats().maxHp * hpPct));
}

function absorbShield(dmg) {
  const ps = state.playerStatus;
  if (!ps?.shieldHp || ps.shieldHp <= 0) return dmg;
  const absorbed = Math.min(ps.shieldHp, dmg);
  ps.shieldHp -= absorbed;
  if (ps.shieldHp <= 0) addLog('<span class="sys">🛡 护盾破碎</span>', true);
  return dmg - absorbed;
}

function checkOfflineSummary() {
  const last = state.lastSaveTime;
  if (!last) { state.lastSaveTime = Date.now(); return; }
  const gap = Date.now() - last;
  if (gap < 60000) return;
  const mins = Math.floor(gap / 60000);
  if (mins < 1) return;
  setTimeout(() => {
    showDialog(null, [
      { speaker: '旁白', text: `你离开了约 ${mins} 分钟。` },
      { speaker: '旁白', text: state.battleOn ? '挂机仍在后台推演，欢迎回来。' : '确认路线并开始挂机，可继续成长。' },
    ], null, '离线摘要');
  }, 800);
}

window.setBattleSpeed = setBattleSpeed;
window.claimBounty = claimBounty;
window.retryAfterDefeat = retryAfterDefeat;
window.retreatAfterDefeat = retreatAfterDefeat;
window.closeDefeatModal = closeDefeatModal;
