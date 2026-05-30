// v2.4+ 合成与消耗品 · v2.5 纯挂机自动用药

const HEAL_AUTO_ORDER = ['c_elite', 'c_heal60', 'c_heal30'];
const AUTO_HEAL_RATIO = 0.4;

function getMaterialCount(matId) {
  const item = state.bag.find(i => i.type === 'material' && i.id === matId);
  return item ? (item.count || 1) : 0;
}

function findConsumableStack(id) {
  return state.bag.find(i => i.type === 'consumable' && i.id === id);
}

function getConsumableCount(id) {
  const item = findConsumableStack(id);
  return item ? (item.count || 1) : 0;
}

function canCraft(recipeId) {
  const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
  if (!recipe) return false;
  if (state.gold < recipe.gold) return false;
  for (const [id, need] of Object.entries(recipe.mats)) {
    if (getMaterialCount(id) < need) return false;
  }
  return true;
}

function consumeMaterials(mats) {
  for (const [id, need] of Object.entries(mats)) {
    if (getMaterialCount(id) < need) return false;
  }
  for (const [id, need] of Object.entries(mats)) {
    const item = state.bag.find(i => i.type === 'material' && i.id === id);
    item.count = (item.count || 1) - need;
    if (item.count <= 0) state.bag = state.bag.filter(i => i.uid !== item.uid);
  }
  return true;
}

function addConsumable(product) {
  const ex = state.bag.find(i => i.type === 'consumable' && i.id === product.id);
  if (ex) { ex.count = (ex.count || 1) + 1; return ex; }
  const item = { ...product, count: 1, uid: 'con_' + product.id + '_' + Date.now() };
  state.bag.push(item);
  return item;
}

function applyConsumableEffect(item) {
  if (item.effect === 'heal') {
    healPercent(item.value);
  } else if (item.effect === 'xp') {
    state.xp += applyXpGain(item.value);
    checkLevelUp(true);
  } else if (item.effect === 'healXp') {
    healPercent(item.value);
    state.xp += applyXpGain(item.xp || 50);
    checkLevelUp(true);
  } else if (item.effect === 'battleAtk') {
    state.battleBuff = { atkMult: 1 + item.value };
  }
}

function consumeConsumableStack(item) {
  if (!item) return false;
  item.count = (item.count || 1) - 1;
  if (item.count <= 0) state.bag = state.bag.filter(i => i.uid !== item.uid);
  return true;
}

function logAutoPotion(name) {
  if (typeof addLog === 'function') {
    addLog(`<span class="drop">🧪 挂机用药：${name}</span>`);
  }
}

function autoUseConsumableById(id) {
  const item = findConsumableStack(id);
  if (!item) return false;
  applyConsumableEffect(item);
  if (typeof trackBattleStat === 'function') trackBattleStat('potionsUsed', 1);
  logAutoPotion(item.name);
  consumeConsumableStack(item);
  return true;
}

function autoUseBestHeal(maxRatio) {
  const s = calcStats();
  const hp = state.currentHp ?? 0;
  const ratio = s.maxHp ? hp / s.maxHp : 1;
  if (ratio >= maxRatio && hp > 0) return false;
  for (const id of HEAL_AUTO_ORDER) {
    if (getConsumableCount(id) > 0) return autoUseConsumableById(id);
  }
  return false;
}

/** 确认路线 / 开挂机前：自动吃战前 buff */
function autoUsePreBattleBuff() {
  if (state.battleBuff || getConsumableCount('c_atk15') <= 0) return false;
  return autoUseConsumableById('c_atk15');
}

/** 战斗中：生命低于阈值自动回血 */
function autoUseIdleHeal() {
  return autoUseBestHeal(typeof getIdleHealRatio === 'function' ? getIdleHealRatio() : AUTO_HEAL_RATIO);
}

/** 即将倒下：依次尝试所有回血药，避免中断挂机 */
function autoUseEmergencyHeal() {
  if ((state.currentHp ?? 0) > 0) return false;
  while ((state.currentHp ?? 0) <= 0) {
    let used = false;
    for (const id of HEAL_AUTO_ORDER) {
      if (getConsumableCount(id) > 0 && autoUseConsumableById(id)) {
        used = true;
        break;
      }
    }
    if (!used) return false;
  }
  return true;
}

/** 航线清剿完毕：自动用经验药并补满状态 */
function autoUseRouteCompleteBonus() {
  if (getConsumableCount('c_xp40') > 0) autoUseConsumableById('c_xp40');
  autoUseBestHeal(0.95);
}

function craftItem(recipeId) {
  const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
  if (!recipe || !canCraft(recipeId)) return false;
  if (!consumeMaterials(recipe.mats)) return false;
  state.gold -= recipe.gold;
  trackGoldSpent(recipe.gold);
  addConsumable(recipe.product);
  state.totalCrafts = (state.totalCrafts || 0) + 1;
  checkAchievements();
  const toast = document.getElementById('lifeToast');
  if (toast) toast.textContent = `${recipe.icon} 合成成功：${recipe.product.name} ×1（挂机时自动使用）`;
  render(); save();
  return true;
}

function formatCraftMats(mats) {
  return Object.entries(mats).map(([id, n]) => {
    const name = LIFE_SKILLS.find(s => s.mat.id === id)?.mat.name
      || MATERIALS.find(m => m.id === id)?.name || id;
    const have = getMaterialCount(id);
    const ok = have >= n;
    return `<span class="${ok ? 'craft-ok' : 'craft-lack'}">${name} ${have}/${n}</span>`;
  }).join(' · ');
}

function getIdlePotionSummary() {
  const parts = [];
  for (const id of ['c_atk15', ...HEAL_AUTO_ORDER, 'c_xp40']) {
    const n = getConsumableCount(id);
    if (n > 0) {
      const item = findConsumableStack(id);
      if (item) parts.push(`${item.name}×${n}`);
    }
  }
  return parts.length ? parts.join(' · ') : '暂无（去生活页合成）';
}
