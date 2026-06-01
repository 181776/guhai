// v3.1 UI 动效：切页、数字跳动、获得物品提示

const _uiTrack = { gold: null, diamonds: null, hp: null, xp: null };

function lootIcon(item) {
  if (!item) return '📦';
  if (item.type === 'material') return '🪵';
  if (item.type === 'consumable') return '🧪';
  if (item.type === 'manual') return '📜';
  if (item.setId) return '🛡';
  if (item.slot === 'weapon') return '⚔';
  return '💎';
}

function lootTag(item) {
  if (item.type === 'material') return '材料';
  if (item.type === 'consumable') return '消耗品';
  if (item.setId) return '套装';
  return item.rarity || '物品';
}

function showLootNotify(item) {
  const stack = document.getElementById('lootStack');
  if (!stack || !item?.name) return;
  const el = document.createElement('div');
  const rarity = item.rarity || item.type || 'common';
  el.className = `loot-notify px-panel ${rarity}`;
  el.innerHTML = `<span class="loot-notify-icon">${lootIcon(item)}</span>
    <span class="loot-notify-name">${escUi(item.name)}</span>
    <span class="loot-notify-tag">${lootTag(item)}</span>`;
  stack.appendChild(el);
  while (stack.children.length > 5) stack.firstChild.remove();
  setTimeout(() => el.remove(), 2600);
}

function escUi(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function popStatNum(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const key = id.replace('top', '').toLowerCase();
  const prev = _uiTrack[key];
  if (prev != null && prev !== val) {
    el.classList.remove('num-pop');
    void el.offsetWidth;
    el.classList.add('num-pop');
  }
  _uiTrack[key] = val;
  el.textContent = val;
}

function syncTopBarNumbers() {
  popStatNum('topGold', state.gold);
  popStatNum('topDiamond', state.diamonds || 0);
  popStatNum('topHp', state.currentHp ?? 0);
  popStatNum('topMp', getCurrentMp());
  const s = calcStats();
  popStatNum('topXp', `${state.xp}/${state.xpNeed}`);
}

function showFloatReward(text, kind, anchorEl) {
  let layer = document.getElementById('floatRewardLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'floatRewardLayer';
    layer.className = 'float-reward-layer';
    document.body.appendChild(layer);
  }
  const el = document.createElement('div');
  el.className = `float-reward ${kind || 'gold'}`;
  el.textContent = text;
  const rect = anchorEl?.getBoundingClientRect?.();
  if (rect) {
    el.style.left = `${rect.left + rect.width / 2 - 20}px`;
    el.style.top = `${rect.top}px`;
  } else {
    el.style.left = '50%';
    el.style.top = '40%';
    el.style.transform = 'translateX(-50%)';
  }
  layer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function navigateToPage(pageId) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'page-enter'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    void page.offsetWidth;
    page.classList.add('active', 'page-enter');
  }
}

window.showLootNotify = showLootNotify;
window.syncTopBarNumbers = syncTopBarNumbers;
window.showFloatReward = showFloatReward;
window.navigateToPage = navigateToPage;
