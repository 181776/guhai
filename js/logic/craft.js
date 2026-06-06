// v3.5 材料合成（无战斗药剂）

function getMaterialCount(matId) {
  const item = state.bag.find(i => i.type === 'material' && i.id === matId);
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

function craftItem(recipeId) {
  const recipe = CRAFT_RECIPES.find(r => r.id === recipeId);
  if (!recipe || !canCraft(recipeId)) return false;
  if (!consumeMaterials(recipe.mats)) return false;
  state.gold -= recipe.gold;
  trackGoldSpent(recipe.gold);
  addToBag({ ...recipe.product, count: 1, uid: 'craft_' + recipe.product.id + '_' + Date.now() });
  state.totalCrafts = (state.totalCrafts || 0) + 1;
  checkAchievements();
  showToast(`${recipe.icon} 合成成功：${recipe.product.name}`);
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
