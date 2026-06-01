// v3.5+ 武功学习 · 战斗被动 · v3.6 MP 消耗

function learnMartialArt(id) {
  const ma = getMartialArt(id);
  if (!ma) return false;
  if (hasLearnedMartial(id)) return false;
  const slots = getMartialSlotCount();
  if ((state.martialArts || []).length >= slots) {
    showToast(`武功栏已满（${slots} 栏，每 5 级 +1 栏位）`);
    return false;
  }
  if (state.gold < ma.price) return false;
  state.gold -= ma.price;
  trackGoldSpent(ma.price);
  if (!state.martialArts) state.martialArts = [];
  state.martialArts.push(id);
  if (!state.martialCodex) state.martialCodex = {};
  state.martialCodex[id] = Date.now();
  showToast(`📖 习得武功：${ma.name}`);
  checkAchievements();
  render(); save();
  return true;
}

function recordMartialTrigger(id) {
  if (!state.martialTriggers) state.martialTriggers = {};
  state.martialTriggers[id] = (state.martialTriggers[id] || 0) + 1;
}

function recordMpFail() {
  state.totalMpFails = (state.totalMpFails || 0) + 1;
  if (!state.flags) state.flags = {};
  state.flags.mpFailOnce = true;
}

function applyMartialBattleStart(m) {
  if (!m || !state.martialArts?.length) return;
  for (const id of state.martialArts) {
    const ma = getMartialArt(id);
    if (!ma?.effect) continue;
    const cost = getMartialMpCost(ma);
    const cur = getCurrentMp();
    if (cost > 0 && cur < cost) {
      recordMpFail();
      addLog(`<span class="sys">⚠ 武功【${ma.name}】精力不足（需 ${cost}，当前 ${cur}），未能发动</span>`, true);
      continue;
    }
    if (ma.effect === 'paralyzeStart') {
      if (Math.random() >= (ma.chance || 0)) continue;
      if (cost > 0) state.currentMp = cur - cost;
      if (!m.status) m.status = {};
      m.status.paralyze = Math.max(m.status.paralyze || 0, ma.turns || 3);
      recordMartialTrigger(ma.id);
      addLog(`<span class="sys">⚡ 武功【${ma.name}】发动！${m.name} 被麻痹 ${ma.turns} 回合${cost > 0 ? ` · 精力 -${cost}` : ''}</span>`, true);
      break;
    }
  }
  checkAchievements();
}

function tickMonsterParalyze(m) {
  if (!m?.status?.paralyze || m.status.paralyze <= 0) return false;
  m.status.paralyze--;
  addLog(`<span class="sys">💫 ${m.name} 麻痹中，本回合无法行动</span>`);
  return true;
}

window.learnMartialArt = learnMartialArt;
