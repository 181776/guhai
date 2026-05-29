// v2.0 装备图鉴
function buildEquipCodexEntry(item, category) {
  return {
    id: item.id,
    name: item.name,
    category,
    slot: item.slot,
    setId: item.setId || null,
    rarity: item.rarity || 'common',
    stats: item.stats,
    desc: item.desc || '',
    lore: item.lore || item.desc || '尚未收录来历。',
  };
}

const EQUIP_CODEX = {};
for (const w of WEAPONS) EQUIP_CODEX[w.id] = buildEquipCodexEntry(w, 'weapon');
for (const a of ACCESSORIES) EQUIP_CODEX[a.id] = buildEquipCodexEntry(a, 'accessory');
for (const s of SET_ITEMS) EQUIP_CODEX[s.id] = buildEquipCodexEntry(s, 'set');
for (const d of DROP_WEAPONS) EQUIP_CODEX[d.id] = buildEquipCodexEntry({ ...d, lore: '打怪稀有掉落，来历不明。' }, 'weapon');
for (const d of DROP_SET) EQUIP_CODEX[d.id] = buildEquipCodexEntry({ ...d, lore: '打怪稀有掉落，来历不明。' }, 'set');

const SET_CODEX = Object.entries(SET_DEFS).map(([setId, def]) => ({
  setId,
  name: def.name,
  desc: def.desc,
  bonus: def.bonus,
}));

function recordItemDiscovered(item) {
  if (!item?.id || item.type === 'material') return;
  const cat = item.type === 'manual' ? 'manual' : (item.setId ? 'set' : (item.slot === 'weapon' ? 'weapon' : item.slot === 'accessory' ? 'accessory' : 'gear'));
  if (cat === 'manual') return;
  if (!state.itemCodex) state.itemCodex = {};
  if (!state.itemCodex[item.id]) state.itemCodex[item.id] = { count: 0, firstAt: Date.now() };
  state.itemCodex[item.id].count = (state.itemCodex[item.id].count || 0) + 1;
}

function isItemCodexUnlocked(id) {
  return !!(state.itemCodex || {})[id];
}

function getItemCodexCount(id) {
  return (state.itemCodex || {})[id]?.count || 0;
}
