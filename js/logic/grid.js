// v2.0 连线地图：不规则地形 · Boss · 路线评分 · 战斗弹窗

/** 苍岚峰 · 四叶节点地形（四角菱形枢纽 + 环路 + 外延支路） */
function buildPeakCloverShape(rows = 15, cols = 15) {
  const walk = new Set();
  const add = (r, c) => { if (r >= 0 && r < rows && c >= 0 && c < cols) walk.add(`${r},${c}`); };
  const diamond = (r, c, rad) => {
    for (let dr = -rad; dr <= rad; dr++) {
      for (let dc = -rad; dc <= rad; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= rad) add(r + dr, c + dc);
      }
    }
  };
  const line = (r1, c1, r2, c2) => {
    if (r1 === r2) {
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) add(r1, c);
    } else {
      for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) add(r, c1);
    }
  };

  const hubs = [[3, 3], [3, cols - 4], [rows - 4, 3], [rows - 4, cols - 4]];
  hubs.forEach(([r, c]) => diamond(r, c, 3));

  const [tl, tr, bl, br] = hubs;
  line(tl[0], tl[1], tr[0], tr[1]);
  line(bl[0], bl[1], br[0], br[1]);
  line(tl[0], tl[1], bl[0], bl[1]);
  line(tr[0], tr[1], br[0], br[1]);

  line(tl[0], tl[1], 0, tl[1]);
  line(tl[0], tl[1], tl[0], 0);
  line(tr[0], tr[1], 0, tr[1]);
  line(tr[0], tr[1], tr[0], cols - 1);
  line(0, tr[1], 0, cols - 1);
  line(bl[0], bl[1], rows - 1, bl[1]);
  line(bl[0], bl[1], bl[0], 0);
  line(bl[0], 0, rows - 1, 0);
  line(br[0], br[1], rows - 1, br[1]);
  line(br[0], br[1], br[0], cols - 1);

  const shape = Array.from({ length: rows }, () => Array(cols).fill(0));
  walk.forEach(key => {
    const [r, c] = key.split(',').map(Number);
    shape[r][c] = 1;
  });
  return shape;
}

const GRID_BY_REGION = {
  village: {
    rows: 6, cols: 7, encounterRate: 0.26,
    holes: [[0, 0], [0, 1], [1, 6], [2, 0], [4, 6], [5, 5], [5, 6]],
  },
  forest: {
    rows: 6, cols: 8, encounterRate: 0.32,
    holes: [[0, 0], [0, 1], [1, 7], [2, 0], [3, 7], [5, 7]],
  },
  ruins: {
    rows: 6, cols: 9, encounterRate: 0.38,
    holes: [[0, 0], [1, 8], [2, 0], [3, 8], [5, 7], [5, 8]],
  },
  peak: {
    rows: 15, cols: 15, encounterRate: 0.44,
    buildShape: buildPeakCloverShape,
  },
};

const CELL_LABEL = {
  start: '起', end: '终', boss: '👑', elite: '⭐',
  treasure: '📦', heal: '💊', encounter: '?', normal: '',
};

let gridDragging = false;
let gridSaveTimer = null;
window.isGridDragging = () => gridDragging;

function refreshGridDuringDraw() {
  renderMapGridOnly();
  scheduleGridSave();
}

function scheduleGridSave() {
  clearTimeout(gridSaveTimer);
  gridSaveTimer = setTimeout(save, 400);
}

function flushGridSave() {
  clearTimeout(gridSaveTimer);
  save();
}

function gridKey(r, c) { return `${r},${c}`; }

function parseGridKey(key) {
  const [r, c] = key.split(',').map(Number);
  return { r, c };
}

function buildShape(rows, cols, holes = []) {
  const shape = Array.from({ length: rows }, () => Array(cols).fill(1));
  for (const [r, c] of holes) {
    if (shape[r]?.[c] !== undefined) shape[r][c] = 0;
  }
  return shape;
}

function getRegionGridDef(regionId) {
  return GRID_BY_REGION[regionId] || GRID_BY_REGION.village;
}

function getGridStartEnd(rows, cols) {
  return { start: gridKey(0, cols - 1), end: gridKey(rows - 1, 0) };
}

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getGridConfig() {
  const regionId = state.currentRegion || 'village';
  const base = getRegionGridDef(regionId);
  const shape = base.buildShape
    ? base.buildShape(base.rows, base.cols)
    : buildShape(base.rows, base.cols, base.holes || []);
  const { start, end } = getGridStartEnd(base.rows, base.cols);
  if (!shape[0][base.cols - 1] || !shape[base.rows - 1][0]) {
    throw new Error('Grid start/end must be valid cells');
  }
  return { ...base, regionId, start, end, shape };
}

function isCellValid(key, g = state.grid) {
  if (!g?.shape) return false;
  const { r, c } = parseGridKey(key);
  return g.shape[r]?.[c] === 1;
}

function isFightCell(cell) {
  if (!cell) return false;
  return cell.type === 'encounter' || cell.type === 'boss' || cell.type === 'elite';
}

function generateGridCells(cfg) {
  const cells = {};
  const { start, end, rows, cols, shape } = cfg;
  const pool = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!shape[r][c]) continue;
      const key = gridKey(r, c);
      if (key === start) cells[key] = { type: 'start' };
      else if (key === end) cells[key] = { type: 'end' };
      else pool.push(key);
    }
  }
  shuffleArr(pool);
  const pick = () => pool.pop();

  cells[pick()] = { type: 'boss' };
  if (pool.length) cells[pick()] = { type: 'treasure', collected: false };
  if (pool.length) cells[pick()] = { type: 'heal', collected: false };

  for (const key of pool) {
    cells[key] = Math.random() < cfg.encounterRate
      ? { type: 'encounter' }
      : { type: 'normal' };
  }
  const encKeys = Object.keys(cells).filter(k => cells[k].type === 'encounter');
  if (encKeys.length) {
    const ek = encKeys[Math.floor(Math.random() * encKeys.length)];
    cells[ek] = { type: 'elite' };
  }
  return cells;
}

function applyScoutReveal(g) {
  g.revealed = g.revealed || [];
  if (!hasTalent('t_scout')) return;
  const hidden = Object.keys(g.cells).filter(k => {
    const t = g.cells[k].type;
    return (t === 'encounter' || t === 'boss' || t === 'elite') && !g.revealed.includes(k);
  });
  shuffleArr(hidden);
  for (let i = 0; i < 2 && hidden[i]; i++) g.revealed.push(hidden[i]);
}

function initGridMap(keepRegion) {
  if (!keepRegion) state.currentRegion = state.currentRegion || 'village';
  stopGridBattle();
  closeBattleModal();
  state.battleBuff = null;
  state.battleDebuff = null;
  const cfg = getGridConfig();
  const cells = generateGridCells(cfg);
  state.grid = {
    rows: cfg.rows,
    cols: cfg.cols,
    shape: cfg.shape,
    start: cfg.start,
    end: cfg.end,
    cells,
    path: [cfg.start],
    phase: 'draw',
    clearedEncounters: [],
    mapsCleared: state.grid?.mapsCleared || 0,
    mapSeed: Date.now() % 100000,
    revealed: [],
  };
  applyScoutReveal(state.grid);
}

function isGridAdjacent(a, b) {
  const pa = parseGridKey(a), pb = parseGridKey(b);
  return Math.abs(pa.r - pb.r) + Math.abs(pa.c - pb.c) === 1;
}

function isWalkable(key) {
  if (!isCellValid(key)) return false;
  const t = state.grid?.cells[key]?.type;
  return !!t;
}

function getPathFightCells() {
  const g = state.grid;
  if (!g) return [];
  return g.path.filter(k => k !== g.start && k !== g.end && isFightCell(g.cells[k]));
}

function getRemainingFightCells() {
  const g = state.grid;
  if (!g) return [];
  const cleared = new Set(g.clearedEncounters || []);
  return getPathFightCells().filter(k => !cleared.has(k));
}

function getPathEncounterCells() { return getPathFightCells(); }
function getRemainingEncounterCells() { return getRemainingFightCells(); }

function gridPathValid() {
  const g = state.grid;
  if (!g || g.path.length < 2) return false;
  if (g.path[0] !== g.start || g.path[g.path.length - 1] !== g.end) return false;
  for (let i = 1; i < g.path.length; i++) {
    if (!isGridAdjacent(g.path[i - 1], g.path[i])) return false;
    if (!isWalkable(g.path[i])) return false;
  }
  return true;
}

function canStartGridBattle() {
  const g = state.grid;
  return !!(g && g.phase === 'ready' && getRemainingFightCells().length > 0);
}

function stopGridBattle() {
  if (state.battleOn) {
    clearInterval(battleTimer);
    state.battleOn = false;
    endBattleBlock();
    state.monster = null;
    state.battleDebuff = null;
  }
}

function openBattleModal() {
  const el = document.getElementById('battleModal');
  if (el) el.classList.add('active');
}

function closeBattleModal() {
  const el = document.getElementById('battleModal');
  if (el) el.classList.remove('active');
  stopGridBattle();
}

function gridExtendTo(r, c) {
  const g = state.grid;
  if (!g || g.phase !== 'draw') return false;
  const key = gridKey(r, c);
  if (!isWalkable(key) && key !== g.start && key !== g.end) return false;

  const idx = g.path.indexOf(key);
  if (idx >= 0) {
    if (g.path.length !== idx + 1) {
      g.path = g.path.slice(0, idx + 1);
      return true;
    }
    return false;
  }

  const last = g.path[g.path.length - 1];
  if (!last) {
    if (key !== g.start) return false;
    g.path = [key];
    return true;
  }
  if (!isGridAdjacent(last, key)) return false;
  g.path.push(key);
  return true;
}

function gridPointerDown(r, c, button) {
  if (button !== 0) return;
  const g = state.grid;
  if (!g || g.phase !== 'draw') return;
  gridDragging = true;
  if (gridExtendTo(r, c)) refreshGridDuringDraw();
}

function gridPointerEnter(r, c) {
  if (!gridDragging) return;
  if (gridExtendTo(r, c)) refreshGridDuringDraw();
}

function gridPointerUp() {
  gridDragging = false;
  flushGridSave();
}

function gridRightClick(r, c) {
  const g = state.grid;
  if (!g || g.phase !== 'draw') return;
  const key = gridKey(r, c);
  const idx = g.path.indexOf(key);
  if (idx <= 0) return;
  g.path = g.path.slice(0, idx);
  refreshGridDuringDraw();
}

function gridClearPath() {
  if (!state.grid) return;
  stopGridBattle();
  closeBattleModal();
  if (state.grid.phase === 'ready') {
    state.grid.phase = 'draw';
    state.grid.clearedEncounters = [];
    resetPathCollectibles();
  }
  state.grid.path = [state.grid.start];
  state.monster = null;
  render(); save();
}

function resetPathCollectibles() {
  const g = state.grid;
  if (!g) return;
  for (const k of g.path) {
    const c = g.cells[k];
    if (c?.type === 'treasure' || c?.type === 'heal') c.collected = false;
  }
}

function getRoutePreview() {
  const g = state.grid;
  if (!g || !gridPathValid()) return null;
  const fights = getPathFightCells().length;
  const region = getRegion();
  const estClear = applyGoldGain(Math.floor((20 + state.level * 8) * region.goldMult));
  const treasures = g.path.filter(k => g.cells[k]?.type === 'treasure').length;
  return { fights, estClear, treasures, region: region.name };
}

function applyPathStartBonuses() {
  const g = state.grid;
  if (!g) return;
  for (const key of g.path) {
    const cell = g.cells[key];
    if (cell?.type === 'heal' && !cell.collected) {
      healPercent(0.15);
      applyShield(0.08);
      cell.collected = true;
      addLog('<span class="reflect">💊 路线补给：恢复 15% 生命 + 护盾</span>', true);
    }
  }
}

function calcShortestSteps(g) {
  if (!g) return 0;
  const q = [{ key: g.start, steps: 0 }];
  const seen = new Set([g.start]);
  while (q.length) {
    const { key, steps } = q.shift();
    if (key === g.end) return steps;
    const { r, c } = parseGridKey(key);
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nk = gridKey(r + dr, c + dc);
      if (seen.has(nk) || !isWalkable(nk)) continue;
      seen.add(nk);
      q.push({ key: nk, steps: steps + 1 });
    }
  }
  return g.rows + g.cols;
}

function calcRouteScore(opts = {}) {
  const applyTreasure = opts.treasures !== false && opts.efficiency !== true;
  const applyEfficiency = opts.efficiency !== false && opts.treasures !== true;
  const g = state.grid;
  if (!g) return { steps: 0, shortest: 0, efficiency: 0, bonusGold: 0, treasureGold: 0 };
  const steps = g.path.length - 1;
  const shortest = calcShortestSteps(g);
  const efficiency = shortest > 0 ? Math.max(0, Math.min(1, shortest / steps)) : 0;
  let treasureGold = 0;
  if (applyTreasure) {
    for (const key of g.path) {
      const c = g.cells[key];
      if (c?.type === 'treasure' && !c.collected) {
        treasureGold += Math.floor(15 + state.level * 4);
        c.collected = true;
      }
    }
  }
  const bonusGold = applyEfficiency
    ? Math.floor((30 + state.level * 6) * efficiency)
    : 0;
  return { steps, shortest, efficiency, bonusGold, treasureGold };
}

function confirmGridPath() {
  const g = state.grid;
  if (!g || g.phase !== 'draw') return;
  if (!gridPathValid()) {
    document.getElementById('gridStatus').textContent = '路线无效：须从黑格连到蓝格';
    return;
  }
  g.phase = 'ready';
  g.clearedEncounters = [];
  resetBattleStats();
  applyPathStartBonuses();
  const fights = getPathFightCells();
  if (!fights.length) {
    completeGridMap();
    return;
  }
  const bossOnPath = fights.some(k => g.cells[k].type === 'boss');
  if (bossOnPath && !hasStoryFlag('first_boss')) tryShowDialog('first_boss');
  autoUsePreBattleBuff();
  const preview = getRoutePreview();
  if (preview) {
    document.getElementById('gridStatus').textContent =
      `航线锁定 · 预计 ${preview.fights} 战 · 清剿约 ${formatCoin(preview.estClear)}` +
      (preview.treasures ? ` · 宝箱 ${preview.treasures}` : '');
  }
  addLog('—— 航线已确认，可开始挂机 ——', true);
  const score = calcRouteScore({ treasures: true, efficiency: false });
  if (score.treasureGold) {
    const tg = applyGoldGain(score.treasureGold);
    state.gold += tg;
    addLog(`<span class="loot">📦 路线宝箱 +${formatCoin(tg)}</span>`, true);
  }
  openBattleModal();
  render(); save();
}

function markPathCellCleared(cellKey) {
  const g = state.grid;
  if (!g || !cellKey) return;
  if (!g.clearedEncounters.includes(cellKey)) g.clearedEncounters.push(cellKey);
  if (g.cells[cellKey]?.type === 'boss') {
    addLog('<span class="lvl">👑 航线 Boss 已击破！</span>', true);
  }
  if (getRemainingFightCells().length === 0) {
    stopGridBattle();
    completeGridMap();
  }
}

function completeGridMap() {
  const g = state.grid;
  if (!g) return;
  const region = getRegion();
  const score = calcRouteScore({ treasures: false, efficiency: true });
  const base = Math.floor((20 + state.level * 8) * region.goldMult);
  const streakBonus = Math.floor(base * STREAK_GOLD_BONUS * Math.min(state.mapStreak || 0, 5));
  const totalGold = base + score.bonusGold + streakBonus;
  const gainedGold = applyGoldGain(totalGold);
  state.gold += gainedGold;
  state.xp += applyXpGain(Math.floor((15 + state.level * 5) * region.xpMult));
  checkLevelUp(true);
  checkLevelStory(state.level);
  onRouteComplete();
  g.mapsCleared = (g.mapsCleared || 0) + 1;

  if (!state.bestRoutes) state.bestRoutes = {};
  const prev = state.bestRoutes[region.id];
  const steps = g.path.length - 1;
  if (!prev || steps < prev.steps) {
    state.bestRoutes[region.id] = { steps, date: todayStr() };
  }

  addLog(`<span class="lvl">🗺 航线清剿完毕！+${formatCoin(gainedGold)}</span>` +
    (score.bonusGold ? ` <span class="loot">(捷径 +${score.bonusGold})</span>` : '') +
    (streakBonus ? ` <span class="loot">(连胜 +${streakBonus})</span>` : ''), true);
  const summary = formatBattleStatsSummary();
  if (summary) addLog(`<span class="sys">${summary}</span>`, true);
  autoUseRouteCompleteBonus();
  state.battleBuff = null;
  state.battleDebuff = null;
  closeBattleModal();
  initGridMap(true);
  render(); save();
}

function selectGridRegion(id) {
  const r = REGIONS.find(x => x.id === id);
  if (!r || !(typeof canAccessRegion === 'function' ? canAccessRegion(id) : state.level >= r.minLevel)) return;
  state.currentRegion = id;
  initGridMap(true);
  checkRegionStory(id);
  if (!hasStoryFlag('tutorial')) tryShowDialog('tutorial');
  render(); save();
}

function spawnPathMonster() {
  const g = state.grid;
  if (!g || g.phase !== 'ready') return false;
  const spots = getRemainingFightCells();
  if (!spots.length) {
    completeGridMap();
    return false;
  }
  const cellKey = spots[Math.floor(Math.random() * spots.length)];
  const isBoss = g.cells[cellKey]?.type === 'boss';
  const isElite = g.cells[cellKey]?.type === 'elite';
  const r = getRegion();
  const bossDef = getRegionBoss(r.id);
  const lv = Math.max(1, state.level + Math.floor(Math.random() * 3) - 1 + (isBoss ? 2 : 0) + (isElite ? 1 : 0));
  const hpMult = isBoss ? 2.2 : (isElite ? (COMBAT?.eliteHpMult || 1.45) : 1);
  const maxHp = Math.floor((30 + lv * 15) * hpMult);
  const name = isBoss ? bossDef.name : r.monsters[Math.floor(Math.random() * r.monsters.length)];
  const dropName = isBoss ? bossDef.mob : name;
  const speedMod = MONSTER_SPEED_MOD[dropName] || MONSTER_SPEED_MOD[name] || 0;
  state.monster = applyMonsterTrait({
    uid: Date.now() + Math.random(),
    name: isElite ? `⭐${name}` : name, level: lv, hp: maxHp, maxHp,
    atk: Math.floor((5 + lv * 3) * (isBoss ? 1.3 : (isElite ? 1.15 : 1))),
    def: Math.floor((2 + lv * 2) * (isBoss ? 1.2 : (isElite ? 1.1 : 1))),
    spAtk: 4 + lv * 2, spDef: 2 + lv * 2,
    speed: Math.max(1, 5 + lv + speedMod + (isBoss ? 2 : 0) + (isElite ? 1 : 0)),
    gold: applyGoldGain(Math.floor((10 + lv * 5) * r.goldMult * (isBoss ? 1.8 : 1) * (isElite ? (COMBAT?.eliteGoldMult || 1.35) : 1))),
    xp: Math.floor((15 + lv * 10) * r.xpMult * (isBoss ? 1.5 : 1) * (isElite ? 1.2 : 1)),
    regionId: r.id,
    sourceCell: cellKey,
    isBoss, isElite,
    dropName,
    bossTitle: isBoss ? bossDef.title : '',
    shieldHp: 0,
  });
  if (isBoss && r.id === 'ruins') state.monster.shieldHp = Math.floor(state.monster.maxHp * 0.1);
  if (isBoss && BOSS_SKILLS[r.id]) {
    addLog(`<span class="sys">Boss 技能：${BOSS_SKILLS[r.id].name} — ${BOSS_SKILLS[r.id].desc}</span>`, true);
  }
  if (isElite) addLog('<span class="sys">⭐ 精英怪：更高掉落与经验</span>', true);
  trackBattleStat('fights', 1);
  startBattleBlock(isBoss ? `👑 ${name} · ${bossDef.title}` : state.monster.name, lv);
  if (state.monster.trait) {
    addLog(`<span class="sys">特性：${state.monster.trait.name}（${state.monster.trait.desc}）</span>`, true);
  }
  logTurnOrder(calcStats(), state.monster);
  if (typeof applyMartialBattleStart === 'function') applyMartialBattleStart(state.monster);
  if (isBoss) {
    const s = calcStats();
    const hpPct = s.maxHp ? (state.currentHp ?? s.maxHp) / s.maxHp : 1;
    if (hpPct < 0.1) {
      if (!state.flags) state.flags = {};
      state.flags.bossLowHp = true;
      checkAchievements();
    }
  }
  flashMonsterEntrance();
  return true;
}

function flashMonsterEntrance() {
  const el = document.getElementById('monsterSprite');
  if (!el) return;
  el.classList.remove('monster-flash');
  void el.offsetWidth;
  el.classList.add('monster-flash');
}

function encodeRouteShare() {
  const g = state.grid;
  if (!g || !gridPathValid()) return '';
  const coords = g.path.map(k => k.replace(',', '_')).join('-');
  return `${state.currentRegion}|${coords}`;
}

function decodeRouteShare(code) {
  const g = state.grid;
  if (!g || g.phase !== 'draw') return false;
  const parts = code.trim().split('|');
  if (parts.length !== 2) return false;
  const [regionId, pathStr] = parts;
  if (regionId !== state.currentRegion) return false;
  const path = pathStr.split('-').map(s => s.replace('_', ','));
  if (path[0] !== g.start || path[path.length - 1] !== g.end) return false;
  for (let i = 1; i < path.length; i++) {
    if (!isGridAdjacent(path[i - 1], path[i]) || !isWalkable(path[i])) return false;
  }
  g.path = path;
  render(); save();
  return true;
}

function importRouteShare() {
  const code = document.getElementById('routeShareInput')?.value?.trim();
  if (!code) return;
  if (decodeRouteShare(code)) {
    document.getElementById('gridStatus').textContent = '已导入分享路线';
  } else {
    document.getElementById('gridStatus').textContent = '路线码无效或与当前地区不符';
  }
}

function exportRouteShare() {
  const code = encodeRouteShare();
  const input = document.getElementById('routeShareInput');
  if (input) input.value = code;
  if (code && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
}

window.gridPointerDown = gridPointerDown;
window.gridPointerEnter = gridPointerEnter;
window.gridPointerUp = gridPointerUp;
window.gridRightClick = gridRightClick;
window.gridClearPath = gridClearPath;
window.confirmGridPath = confirmGridPath;
window.selectGridRegion = selectGridRegion;
window.canStartGridBattle = canStartGridBattle;
window.spawnPathMonster = spawnPathMonster;
window.markPathCellCleared = markPathCellCleared;
window.gridPathValid = gridPathValid;
window.getRemainingEncounterCells = getRemainingEncounterCells;
window.encodeRouteShare = encodeRouteShare;
window.importRouteShare = importRouteShare;
window.exportRouteShare = exportRouteShare;
window.openBattleModal = openBattleModal;
window.closeBattleModal = closeBattleModal;
window.isCellValid = isCellValid;
window.CELL_LABEL = CELL_LABEL;
