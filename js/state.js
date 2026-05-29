const DEFAULT_STATE = {
  name: STORY.defaultHero.name,
  title: STORY.defaultHero.title,
  bio: STORY.defaultHero.bio,
  level: 1, xp: 0, xpNeed: 100, gold: 100, diamonds: 0,
  spiritRoot: 'fan',
  baseStats: { hp: 50, atk: 10, def: 10, spAtk: 10, spDef: 10, speed: 10 },
  baseCrit: { ...BASE_CRIT },
  currentHp: null,
  equip: { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null },
  bag: [], skills: [], talents: [], lifeCd: { chop: 0, fish: 0, mine: 0 },
  lifeSp: 0, lifeTree: {},
  currentRegion: 'village', pets: [], activePet: null,
  lastCheckin: '', checkinStreak: 0,
  auctionLots: [], auctionRefreshAt: 0,
  grid: null,
  codex: {}, itemCodex: {}, storyFlags: {}, bestRoutes: {},
  battleOn: false, monster: null, battleBuff: null, battleDebuff: null, battleStats: null,
};

function emptyStats() { return { hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, critRate: 0, critDmg: 0 }; }

function normalizeStats(raw) {
  const s = emptyStats();
  if (!raw) return s;
  const src = raw.stats || raw;
  for (const k of Object.keys(s)) if (src[k]) s[k] = src[k];
  return s;
}

function migrateItem(item) {
  if (!item || item.type === 'material') return item;
  const copy = { ...item, stats: normalizeStats(item) };
  if (copy.slot === 'armor') copy.slot = 'body';
  delete copy.atk; delete copy.def; delete copy.hp;
  return copy;
}

function migrateEquip(old) {
  const eq = { weapon: null, head: null, body: null, legs: null, feet: null, accessory: null };
  if (!old) return eq;
  if (old.weapon) eq.weapon = migrateItem(old.weapon);
  if (old.head) eq.head = migrateItem(old.head);
  if (old.body) eq.body = migrateItem(old.body);
  if (old.legs) eq.legs = migrateItem(old.legs);
  if (old.feet) eq.feet = migrateItem(old.feet);
  if (old.armor) eq.body = migrateItem({ ...old.armor, slot: 'body' });
  if (old.accessory) eq.accessory = migrateItem(old.accessory);
  return eq;
}

function migrate(data) {
  const d = { ...DEFAULT_STATE, ...data };
  d.baseCrit = data.baseCrit || { ...BASE_CRIT };
  d.skills = (data.skills || []).map(migrateItem);
  d.bag = (data.bag || []).map(migrateItem);
  d.equip = migrateEquip(data.equip);
  if (!data.baseStats) {
    d.baseStats = { hp: data.baseHp || 50, atk: data.baseAtk || 10, def: data.baseDef || 10, spAtk: 10, spDef: 10, speed: 10 };
  }
  if (d.currentHp == null) d.currentHp = calcStats(d).maxHp;
  d.talents = data.talents || [];
  d.lifeCd = sanitizeLifeCd(data.lifeCd || {});
  d.lifeSp = data.lifeSp || 0;
  d.lifeTree = data.lifeTree || {};
  d.currentRegion = data.currentRegion || 'village';
  d.pets = data.pets || [];
  d.activePet = data.activePet || null;
  d.lastCheckin = data.lastCheckin || '';
  d.checkinStreak = data.checkinStreak || 0;
  d.diamonds = data.diamonds || 0;
  d.auctionLots = data.auctionLots || [];
  d.auctionRefreshAt = data.auctionRefreshAt || 0;
  d.grid = data.grid || null;
  d.codex = data.codex || {};
  d.itemCodex = data.itemCodex || {};
  d.spiritRoot = data.spiritRoot || 'fan';
  d.storyFlags = data.storyFlags || {};
  d.bestRoutes = data.bestRoutes || {};
  d.battleBuff = data.battleBuff || null;
  d.battleDebuff = data.battleDebuff || null;
  d.battleStats = data.battleStats || null;
  if (d.grid) {
    if (d.grid.phase === 'walk') d.grid.phase = 'draw';
    if (!d.grid.clearedEncounters) d.grid.clearedEncounters = [];
    delete d.grid.walkIndex;
    if (!d.grid.shape) d.grid = null;
  }
  return d;
}

function sanitizeLifeCd(cd) {
  const now = Date.now();
  const keys = ['chop', 'fish', 'mine'];
  const out = {};
  for (const k of keys) {
    let v = Number(cd[k]) || 0;
    if (v > 0 && v < 1e10) v = 0;
    if (v > now + 3600000) v = 0;
    out[k] = (v > now) ? v : 0;
  }
  return out;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getRegion() {
  return REGIONS.find(r => r.id === state.currentRegion) || REGIONS[0];
}

function hasTalent(id, st = state) { return (st.talents || []).includes(id); }

function getTalentBonuses(st = state) {
  const bonus = emptyStats();
  let critDmgMult = 1;
  for (const tid of (st.talents || [])) {
    const t = TALENTS.find(x => x.id === tid);
    if (!t) continue;
    if (t.stats) for (const k of Object.keys(bonus)) bonus[k] += t.stats[k] || 0;
    if (t.effect === 'critDmgMult') critDmgMult *= t.value;
  }
  return { bonus, critDmgMult };
}

function load() { try { const d = localStorage.getItem('idleRpgV1'); return d ? JSON.parse(d) : null; } catch { return null; } }
function save() { localStorage.setItem('idleRpgV1', JSON.stringify(state)); }

function sumStats(list) {
  const total = emptyStats();
  for (const item of list) {
    if (!item) continue;
    const s = normalizeStats(item);
    for (const k of Object.keys(total)) total[k] += s[k] || 0;
  }
  return total;
}

function getSetCounts(st = state) {
  const counts = {};
  for (const slot of SET_SLOTS) {
    const item = st.equip[slot];
    if (item?.setId) counts[item.setId] = (counts[item.setId] || 0) + 1;
  }
  return counts;
}

function getActiveSetBonuses(st = state) {
  const counts = getSetCounts(st);
  const active = [];
  let stats = emptyStats(), critRate = 0, critDmg = 0;
  for (const [setId, count] of Object.entries(counts)) {
    const def = SET_DEFS[setId];
    if (!def) continue;
    const entry = { setId, name: def.name, count, active: count >= 4, desc: def.desc };
    active.push(entry);
    if (count >= 4) {
      const b = def.bonus;
      if (b.stats) for (const k of Object.keys(stats)) stats[k] += b.stats[k] || 0;
      critRate += b.critRate || 0;
      critDmg += b.critDmg || 0;
    }
  }
  return { active, stats, critRate, critDmg };
}

function calcStats(st = state) {
  const eqList = Object.values(st.equip).filter(Boolean);
  const eq = sumStats(eqList);
  const sk = sumStats(st.skills);
  const setB = getActiveSetBonuses(st);
  const tb = getTalentBonuses(st);
  const lv = st.level - 1;
  const bc = st.baseCrit || BASE_CRIT;
  const maxHp = st.baseStats.hp + eq.hp + sk.hp + setB.stats.hp + tb.bonus.hp + lv * LEVEL_GROWTH.hp;
  let critRate = bc.rate + eq.critRate + sk.critRate + setB.critRate + tb.bonus.critRate;
  let critDmg = (bc.dmg + eq.critDmg + sk.critDmg + setB.critDmg + tb.bonus.critDmg) * tb.critDmgMult;
  return {
    maxHp, hp: st.currentHp ?? maxHp,
    atk: (() => {
      let v = st.baseStats.atk + eq.atk + sk.atk + setB.stats.atk + tb.bonus.atk + lv * LEVEL_GROWTH.atk;
      if (st.battleBuff?.atkMult) v = Math.floor(v * st.battleBuff.atkMult);
      return v;
    })(),
    def: st.baseStats.def + eq.def + sk.def + setB.stats.def + tb.bonus.def + lv * LEVEL_GROWTH.def,
    spAtk: st.baseStats.spAtk + eq.spAtk + sk.spAtk + setB.stats.spAtk + tb.bonus.spAtk + lv * LEVEL_GROWTH.spAtk,
    spDef: st.baseStats.spDef + eq.spDef + sk.spDef + setB.stats.spDef + tb.bonus.spDef + lv * LEVEL_GROWTH.spDef,
    speed: st.baseStats.speed + eq.speed + sk.speed + setB.stats.speed + tb.bonus.speed + lv * LEVEL_GROWTH.speed,
    critRate: Math.min(0.95, critRate),
    critDmg,
    setBonuses: setB.active,
  };
}

function clampHp() { const s = calcStats(); state.currentHp = Math.min(s.maxHp, Math.max(0, state.currentHp ?? s.maxHp)); }

function calcCombatPower(st = state) {
  const s = calcStats(st);
  return Math.floor(sumSixStats(s) * getSpiritRootMult(st));
}

function healPercent(pct) { const s = calcStats(); state.currentHp = Math.min(s.maxHp, (state.currentHp ?? s.maxHp) + Math.floor(s.maxHp * pct)); }

let state = migrate(load() || structuredClone(DEFAULT_STATE));
let battleTimer = null, saveTimer = null, currentLogBlock = null;
let shopTab = 'weapon', pickingSlot = null, codexTab = 'monster';
