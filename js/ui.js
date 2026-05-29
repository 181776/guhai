function statLabel(item) {
  const s = normalizeStats(item);
  return Object.entries(s).filter(([, v]) => v).map(([k, v]) => {
    if (k === 'critRate') return `暴击+${(v * 100).toFixed(0)}%`;
    if (k === 'critDmg') return `爆伤+${(v * 100).toFixed(0)}%`;
    return `${STAT_LABELS[k] || k}${v > 0 ? '+' : ''}${v}`;
  }).join(' ') || '—';
}

function esc(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }

function renderTopBar() {
  const s = calcStats(); clampHp();
  const power = calcCombatPower();
  const root = getSpiritRoot();
  const hpPct = s.maxHp ? (state.currentHp / s.maxHp * 100).toFixed(0) : 100;
  const xpPct = (state.xp / state.xpNeed * 100).toFixed(0);
  const region = getRegion();
  const pet = state.activePet ? PETS.find(p => p.id === state.activePet) : null;
  document.getElementById('topBar').innerHTML = `
    <span><b>${esc(state.name)}</b> · Lv.${state.level}</span>
    <span class="combat-power" title="综合战力">⚔ ${power}</span>
    <span class="spirit-root-badge" title="${esc(root.desc)}">🌱 ${root.name}</span>
    <span style="color:var(--text-muted)">📍 ${region.name}</span>
    ${pet ? `<span title="${esc(pet.name)}">${pet.icon}</span>` : ''}
    <div class="bar-wrap">HP <div class="bar"><div class="bar-fill hp" style="width:${hpPct}%"></div></div> ${state.currentHp}/${s.maxHp}</div>
    <div class="bar-wrap">XP <div class="bar"><div class="bar-fill xp" style="width:${xpPct}%"></div></div> ${state.xp}/${state.xpNeed}</div>
    <span class="gold">💰 ${state.gold}</span>
    <span class="diamond">💎 ${state.diamonds || 0}</span>`;
}

function buildPathGridHtml(g, regionBoss) {
  const pathSet = new Set(g.path);
  const cleared = new Set(g.clearedEncounters || []);
  const revealed = new Set(g.revealed || []);
  let html = '';
  for (let r = 0; r < g.rows; r++) {
    for (let c = 0; c < g.cols; c++) {
      const key = gridKey(r, c);
      if (!g.shape?.[r]?.[c]) {
        html += `<div class="grid-cell-void" aria-hidden="true"></div>`;
        continue;
      }
      const cell = g.cells[key];
      const ct = cell?.type || 'normal';
      const onPath = pathSet.has(key);
      const isStart = key === g.start;
      const isEnd = key === g.end;
      const clearedCell = cleared.has(key);
      const isFight = isFightCell(cell);

      let cls = 'grid-cell';
      if (ct === 'start') cls += ' cell-start';
      else if (ct === 'end') cls += ' cell-end';
      else if (ct === 'boss') cls += ' cell-boss';
      else if (ct === 'treasure') cls += ' cell-treasure';
      else if (ct === 'heal') cls += ' cell-heal';
      if (onPath && !isStart && !isEnd) {
        cls += g.phase === 'draw' ? ' cell-path' : ' cell-path-locked';
      }
      if (g.phase === 'ready' && isFight && onPath && !clearedCell) cls += ' cell-pending';
      if (g.phase === 'ready' && clearedCell) cls += ' cell-cleared';
      if (revealed.has(key) && g.phase === 'draw') cls += ' cell-revealed';

      let label = CELL_LABEL[ct] || '';
      if (ct === 'boss') label = '👑';
      if (g.phase === 'ready' && clearedCell && isFight) label = '✓';
      else if (g.phase === 'ready' && isFight && onPath && !clearedCell) label = ct === 'boss' ? '👑' : '?';
      else if (onPath && !isStart && !isEnd && g.phase === 'draw' && !label) label = '·';
      else if (g.phase === 'draw' && revealed.has(key) && (ct === 'encounter' || ct === 'boss')) label = ct === 'boss' ? '👑' : '?';

      const title = ct === 'boss' ? `Boss：${regionBoss.name}` : ct;
      html += `<button type="button" class="${cls}" data-r="${r}" data-c="${c}" title="${title}">${label}</button>`;
    }
  }
  return html;
}

function updateMapStatusLine() {
  const g = state.grid;
  if (!g) return;
  const statusEl = document.getElementById('gridStatus');
  const remaining = getRemainingFightCells().length;
  const totalEnc = getPathFightCells().length;
  const best = state.bestRoutes?.[state.currentRegion];
  if (g.phase === 'draw') {
    statusEl.textContent = gridPathValid()
      ? '路线已连通，点击「确认路线」开始挂机（短路线有捷径奖励）'
      : '左键拖线 · 右键取消 · 👑Boss 📦箱 💊补给 · 空白处为不可通行';
  } else {
    statusEl.textContent = `航线锁定 · 剩余 ${remaining}/${totalEnc} 战 · ${state.battleOn ? '挂机中…' : '在战斗窗口开始挂机'}` +
      (best ? ` · 最佳 ${best.steps} 步` : '');
  }
  document.getElementById('gridClear').disabled = g.phase === 'ready' && state.battleOn;
  document.getElementById('gridGo').disabled = g.phase !== 'draw' || !gridPathValid();
}

/** 仅刷新格子与状态行（拖线时用，避免下方区域抖动） */
function renderMapGridOnly() {
  const g = state.grid;
  if (!g?.cells) return;
  const regionBoss = getRegionBoss(state.currentRegion);
  const gridEl = document.getElementById('pathGrid');
  if (gridEl.style.gridTemplateColumns !== `repeat(${g.cols}, 28px)`) {
    gridEl.style.gridTemplateColumns = `repeat(${g.cols}, 28px)`;
  }
  gridEl.innerHTML = buildPathGridHtml(g, regionBoss);
  updateMapStatusLine();
}

function renderMap() {
  const region = getRegion();
  if (!state.grid?.cells) initGridMap(true);
  const g = state.grid;
  const regionBoss = getRegionBoss(region.id);

  document.getElementById('gridRegionTabs').innerHTML = REGIONS.map(r => {
    const locked = state.level < r.minLevel;
    const active = r.id === state.currentRegion;
    const disabled = locked || (g.phase === 'ready' && state.battleOn);
    return `<button type="button" class="grid-region-tab${active ? ' active' : ''}${locked ? ' locked' : ''}" data-region="${r.id}"${disabled ? ' disabled' : ''}>${r.name}</button>`;
  }).join('');

  renderMapGridOnly();

  const banner = regionArt(region.id);
  document.getElementById('gridMapInfo').innerHTML =
    `${banner ? pixelImg(banner, region.name, 'region-banner') : ''}
    <strong>${region.name}</strong> · 不规则地图 · 已通关 ${g.mapsCleared || 0} 次<br>${region.desc}
    ${STORY.regions[region.id]?.intro ? `<br><em>${STORY.regions[region.id].intro}</em>` : ''}
    <br><span class="footer-tip">本地区经验倍率 ×${region.xpMult}</span>`;

  document.getElementById('mapBattleTitle').textContent = `挂机战斗 · ${region.name}`;

  const gallery = document.getElementById('monsterGallery');
  if (gallery) {
    gallery.innerHTML = `
      <p class="bag-section-title">本地区怪物 · 航线 Boss：<b>${regionBoss.name}</b></p>
      <div class="monster-gallery-grid">
        <div class="monster-thumb boss-thumb">${bossPortraitHtml(region.id)}<span>${regionBoss.name}</span></div>
        ${region.monsters.map(n =>
          `<div class="monster-thumb">${monsterPortraitHtml(n)}<span>${n}</span></div>`
        ).join('')}
      </div>`;
  }
}

function renderCheckin() {
  const today = todayStr();
  const done = state.lastCheckin === today;
  document.getElementById('checkinStreak').textContent = `${state.checkinStreak} 天`;
  const btn = document.getElementById('btnCheckin');
  btn.disabled = done;
  btn.textContent = done ? '今日已签到' : '今日签到';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  const nextStreak = (state.lastCheckin === yStr) ? state.checkinStreak + 1 : 1;
  const previewGold = CHECKIN_BASE[Math.min(nextStreak - 1, CHECKIN_BASE.length - 1)];
  const statusEl = document.getElementById('checkinStatus');
  if (done) {
    statusEl.textContent = `今日已领取。连续签到 ${state.checkinStreak} 天。`;
  } else {
    let extra = '';
    if (nextStreak >= 7) extra = '，+2 钻石';
    else if (nextStreak >= 4) extra = '，+1 钻石';
    statusEl.textContent = `签到可得 ${previewGold} 金币${extra}` +
      (nextStreak === 3 && !state.pets.includes('p_slime') ? '，连续第 3 天额外获得小史莱姆宠物' : '');
  }
}

function renderPet() {
  document.getElementById('petGrid').innerHTML = PETS.map(p => {
    const owned = state.pets.includes(p.id);
    const isActive = state.activePet === p.id;
    const art = owned ? petArt(p.id) : '';
    return `<div class="pet-card${owned ? '' : ' locked'}${isActive ? ' active' : ''}">
      <div class="pet-icon">${art ? pixelImg(art, p.name, 'pet-sprite') : (owned ? p.icon : '❓')}</div>
      <div class="pet-name">${owned ? p.name : '???'}</div>
      <span class="badge ${p.rarity}">${p.rarity}</span>
      <p class="item-desc" style="margin:8px 0">${owned ? p.desc : '地图战斗有概率捕获'}</p>
      ${owned ? `<button type="button" class="btn btn-sm" data-pet="${p.id}">${isActive ? '取消跟随' : '设为跟随'}</button>` : ''}
    </div>`;
  }).join('');
}

function renderSetBonus() {
  const counts = getSetCounts();
  return Object.keys(SET_DEFS).map(setId => {
    const def = SET_DEFS[setId];
    const count = counts[setId] || 0;
    const active = count >= 4;
    return `<div class="set-bonus-box${active ? '' : ' inactive'}">
      <h3>${def.name} ${active ? '✓ 已激活' : ''}</h3>
      <p>${def.desc}</p>
      <div class="set-progress">进度：${count} / 4 件（头饰·衣甲·护腿·战靴）</div>
    </div>`;
  }).join('');
}

function renderEquipCodexSets() {
  const el = document.getElementById('equipCodexSets');
  if (!el) return;
  el.innerHTML = `<h3 class="bag-section-title">套装效果</h3>${renderSetBonus()}
    <p class="footer-tip">集齐同套装四件（头饰·衣甲·护腿·战靴）激活效果；进度随当前装备更新</p>`;
}

function renderChar() {
  const s = calcStats();
  const power = calcCombatPower();
  const root = getSpiritRoot();
  const story = getStoryProgress();
  document.getElementById('charProfile').innerHTML = `
    <div class="char-name">${esc(state.name)}</div>
    <div class="char-title">${esc(state.title)}</div>
    <div class="char-bio">${esc(state.bio || '暂无简介')}</div>
    <div class="story-progress">📖 主线：${esc(story.label)}</div>
    <div class="spirit-root-box"><span class="spirit-root-label">灵根</span> <b>${root.name}</b>
      <span class="footer-tip">${esc(root.desc)}</span></div>
    <div class="combat-power-box">战力 <span class="combat-power-lg">${power}</span></div>`;
  document.getElementById('charStats').innerHTML = `
    <div class="stat-item"><b>HP</b><span>${state.currentHp}/${s.maxHp}</span></div>
    <div class="stat-item"><b>物攻</b><span>${s.atk}</span></div>
    <div class="stat-item"><b>物防</b><span>${s.def}</span></div>
    <div class="stat-item"><b>特攻</b><span>${s.spAtk}</span></div>
    <div class="stat-item"><b>特防</b><span>${s.spDef}</span></div>
    <div class="stat-item"><b>速度</b><span>${s.speed}</span></div>
    <div class="stat-item"><b>暴击率</b><span>${(s.critRate * 100).toFixed(1)}%</span></div>
    <div class="stat-item"><b>爆伤</b><span>${(s.critDmg * 100).toFixed(0)}%</span></div>`;

  let slotsHtml = '<div class="equip-group-title">⚔ 武器 · 饰品</div>';
  for (const slot of ['weapon', 'accessory']) slotsHtml += renderSlot(slot);
  slotsHtml += '<div class="equip-group-title">🛡 套装部位</div>';
  for (const slot of SET_SLOTS) slotsHtml += renderSlot(slot, true);
  document.getElementById('equipSlots').innerHTML = slotsHtml;

  const picker = document.getElementById('slotPicker');
  if (pickingSlot) {
    picker.style.display = 'block';
    document.getElementById('slotPickerTitle').textContent = `选择${SLOT_NAMES[pickingSlot]}`;
    const candidates = state.bag.filter(i => i.slot === pickingSlot && i.type !== 'material');
    document.getElementById('slotPickerList').innerHTML = candidates.length === 0
      ? '<li class="skill-empty">背包无此部位装备</li>'
      : candidates.map(item => `<li><span class="item-info"><span class="badge ${item.setId ? 'set' : item.rarity}">${esc(item.name)}</span>
          <div class="item-desc">${statLabel(item)}${item.setId ? ' · ' + SET_DEFS[item.setId]?.name : ''}</div></span>
          <button class="btn btn-sm" onclick="equipFromPicker('${item.uid}')">装备</button></li>`).join('');
  } else picker.style.display = 'none';

  const skillEl = document.getElementById('skillDisplay');
  skillEl.innerHTML = state.skills.length === 0 ? '<li class="skill-empty">暂无武功</li>' :
    state.skills.map(sk => `<li><span class="item-info"><span class="badge manual">${esc(sk.name)}</span>
      <div class="item-desc">${statLabel(sk)}</div></span></li>`).join('');

  document.getElementById('talentDisplay').innerHTML = TALENTS.map(t => {
    const owned = hasTalent(t.id);
    return `<li><span class="item-info">
      <span class="badge talent">${esc(t.name)}</span>
      <div class="item-desc">${esc(t.desc)}</div></span>
      ${owned ? '<span class="badge common">已觉醒</span>' :
        `<button class="btn btn-sm" onclick="unlockTalent('${t.id}')" ${state.gold < t.price ? 'disabled' : ''}>觉醒 ${t.price}金</button>`}
    </li>`;
  }).join('');
}

function renderSlot(slot, isSet) {
  const item = state.equip[slot];
  const isActive = pickingSlot === slot;
  return `<div class="equip-slot${isSet ? ' set-slot' : ''}${isActive ? ' active' : ''}">
    <div class="slot-label">${SLOT_NAMES[slot]}</div>
    <div class="slot-item">${item ? `<b>${esc(item.name)}</b>${item.setId ? `<div class="item-desc"><span class="badge set">${SET_DEFS[item.setId]?.name}</span></div>` : ''}
      <div class="item-desc">${statLabel(item)}</div>` : '<div class="empty">未装备</div>'}</div>
    <div class="slot-actions">
      <button class="btn btn-sm" onclick="openSlotPicker('${slot}')">更换</button>
      ${item ? `<button class="btn btn-sm btn-outline" onclick="unequipFromSlot('${slot}')">卸下</button>` : ''}
    </div></div>`;
}

function renderBattle() {
  const btn = document.getElementById('toggleBattle');
  const canBattle = canStartGridBattle();
  btn.textContent = state.battleOn ? '停止挂机' : '开始挂机';
  btn.className = state.battleOn ? 'btn btn-danger' : 'btn';
  btn.disabled = !state.battleOn && !canBattle;
  btn.title = canBattle || state.battleOn ? '' : '请先在上方连线路线并确认，路线上须有怪物格';
  const s = calcStats(); clampHp();
  const hpPct = s.maxHp ? (state.currentHp / s.maxHp * 100).toFixed(0) : 100;
  document.getElementById('playerName').textContent = state.name;
  const power = calcCombatPower();
  const debuffTag = state.battleDebuff ? ' · 破甲中' : '';
  document.getElementById('playerStats').textContent = `战力${power} · 物攻${s.atk} 物防${s.def} 速度${s.speed}${debuffTag}`;
  document.getElementById('playerHpBar').style.width = hpPct + '%';
  document.getElementById('playerHpText').textContent = `${state.currentHp} / ${s.maxHp}`;

  const pSprite = document.getElementById('playerSprite');
  if (pSprite) pSprite.innerHTML = unitPortraitHtml(ASSETS.characters.player, state.name, '⚔️', 'unit-sprite');

  const pBadge = document.getElementById('playerTurnBadge');
  const mBadge = document.getElementById('monsterTurnBadge');
  pBadge.style.display = 'none';
  mBadge.style.display = 'none';

  if (state.monster) {
    const m = state.monster, pct = Math.max(0, m.hp / m.maxHp * 100);
    const mSprite = document.getElementById('monsterSprite');
    if (mSprite) {
      mSprite.innerHTML = battlePortraitHtml(m);
      if (m.isBoss) mSprite.classList.add('sprite-boss-active');
      else mSprite.classList.remove('sprite-boss-active');
    }
    document.getElementById('monsterName').textContent = m.isBoss ? `👑 ${m.name}` : m.name;
    const mPower = Math.floor(m.maxHp * 0.12 + m.atk * 2.2 + m.def * 1.6 + m.spAtk * 1.8 + m.spDef * 1.2 + m.speed * 2.5 + m.level * 15);
    const traitTag = m.trait ? ` · 特性${m.trait.name}` : '';
    const phaseTag = m.isBoss ? ` · P${m.phase || 1}` : '';
    document.getElementById('monsterStats').textContent =
      `${m.isBoss && m.bossTitle ? m.bossTitle + ' · ' : ''}战力${mPower} · Lv.${m.level} 物攻${m.atk} 速度${m.speed}${traitTag}${phaseTag}`;
    document.getElementById('monsterHpBar').style.width = pct + '%';
    document.getElementById('monsterHpText').textContent = `${Math.max(0, m.hp)} / ${m.maxHp}`;
    if (s.speed > m.speed) {
      pBadge.textContent = '⚡ 先手'; pBadge.className = 'turn-badge'; pBadge.style.display = 'inline-block';
    } else if (s.speed < m.speed) {
      mBadge.textContent = '⚡ 先手'; mBadge.className = 'turn-badge enemy-first'; mBadge.style.display = 'inline-block';
    } else {
      pBadge.textContent = '速度相同'; pBadge.className = 'turn-badge'; pBadge.style.display = 'inline-block';
      mBadge.textContent = '速度相同'; mBadge.className = 'turn-badge enemy-first'; mBadge.style.display = 'inline-block';
    }
  } else {
    document.getElementById('monsterSprite').innerHTML = unitPortraitHtml('', '', '👹', 'unit-sprite');
    document.getElementById('monsterName').textContent = '等待遇敌…';
    document.getElementById('monsterStats').textContent = '确认路线并开始挂机';
    document.getElementById('monsterHpBar').style.width = '0%';
    document.getElementById('monsterHpText').textContent = '—';
  }
}

function renderBag() {
  const content = document.getElementById('bagContent'), empty = document.getElementById('bagEmpty');
  if (state.bag.length === 0) { content.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  const materials = state.bag.filter(i => i.type === 'material');
  const consumables = state.bag.filter(i => i.type === 'consumable');
  const manuals = state.bag.filter(i => i.type === 'manual');
  const gear = state.bag.filter(i => i.slot && i.type !== 'manual' && i.type !== 'material' && i.type !== 'consumable');
  let html = '';
  if (consumables.length) {
    html += '<div class="bag-section-title">🧪 挂机药囊</div><ul class="equip-list">';
    html += consumables.map(item => `<li><span class="item-info"><span class="badge ${item.rarity}">${esc(item.name)}</span> × ${item.count || 1}
      <div class="item-desc">${esc(item.desc || '')} · 挂机自动消耗</div></span>
      <button class="btn btn-sm btn-sell" onclick="sellOneMaterial('${item.uid}')">卖×1</button></li>`).join('');
    html += '</ul>';
  }
  if (materials.length) {
    html += '<div class="bag-section-title">📦 材料</div><ul class="equip-list">';
    html += materials.map(item => `<li><span class="item-info"><span class="badge material">${esc(item.name)}</span> × ${item.count || 1}
      <div class="item-desc">单价 ${MATERIAL_SELL[item.id] || 5} 金</div></span>
      <button class="btn btn-sm btn-sell" onclick="sellOneMaterial('${item.uid}')">卖×1</button>
      <button class="btn btn-sm btn-sell" onclick="sellItem('${item.uid}')">全卖 ${getSellPrice(item)}金</button></li>`).join('');
    html += '</ul>';
  }
  if (gear.length) {
    html += '<div class="bag-section-title">⚔ 装备</div><ul class="equip-list">';
    html += gear.map(item => `<li><span class="item-info"><span class="badge ${item.setId ? 'set' : item.rarity}">${SLOT_NAMES[item.slot]} ${esc(item.name)}</span>
      <div class="item-desc">${statLabel(item)} · 售价 ${getSellPrice(item)} 金</div></span>
      <button class="btn btn-sm btn-sell" onclick="sellItem('${item.uid}')">贩卖</button></li>`).join('');
    html += '</ul>';
  }
  if (manuals.length) {
    html += '<div class="bag-section-title">📜 秘籍（不可贩卖）</div><ul class="equip-list">';
    html += manuals.map(item => `<li><span class="item-info">${esc(item.name)} · ${statLabel(item)}</span>
      <button class="btn btn-sm" onclick="learnFromBag('${item.uid}')">学习</button></li>`).join('');
    html += '</ul>';
  }
  content.innerHTML = html;
}

function getShopItems() {
  if (shopTab === 'weapon') return WEAPONS;
  if (shopTab === 'set') return SET_ITEMS;
  if (shopTab === 'manual') return MANUALS;
  return ACCESSORIES;
}

function renderLife() {
  const now = Date.now();
  const spBar = document.getElementById('lifeSpBar');
  if (spBar) spBar.textContent = `生活点：${state.lifeSp || 0}（采集 +1）`;

  document.getElementById('lifeGrid').innerHTML = LIFE_SKILLS.map(skill => {
    const bonus = getLifeBonuses(skill.id);
    const cdMs = Math.floor(skill.cd * bonus.cdMult);
    const cdLeft = Math.max(0, Math.ceil(((state.lifeCd[skill.id] || 0) - now) / 1000));
    const onCd = cdLeft > 0;
    const gMin = Math.floor(skill.gold[0] * bonus.goldMult);
    const gMax = Math.floor(skill.gold[1] * bonus.goldMult);
    const xpShow = skill.xp + bonus.xpBonus;
    return `<div class="life-card">
      <h3>${skill.icon} ${skill.name}</h3>
      <p>${skill.msg}，获得 <b>${skill.mat.name}</b><br>金币 ${gMin}~${gMax} · 经验 +${xpShow}</p>
      <button type="button" class="btn btn-sm" data-life="${skill.id}" ${onCd ? 'disabled' : ''}>${onCd ? `冷却 ${cdLeft}s` : '进行'}</button>
      <div class="life-cd">间隔 ${(cdMs / 1000).toFixed(1)} 秒</div>
    </div>`;
  }).join('');

  renderLifeTree();
  renderCraft();
}

function renderCraft() {
  const el = document.getElementById('craftList');
  const tip = document.getElementById('craftIdleTip');
  if (tip) tip.textContent = `挂机药囊：${getIdlePotionSummary()}`;
  if (!el) return;
  el.innerHTML = CRAFT_RECIPES.map(recipe => {
    const ok = canCraft(recipe.id);
    return `<div class="craft-card">
      <div class="craft-card-head">
        <b>${recipe.icon} ${esc(recipe.name)}</b>
        <span class="badge ${ok ? 'epic' : 'common'}">${recipe.gold} 金</span>
      </div>
      <p class="item-desc">${esc(recipe.desc)}</p>
      <p class="craft-mats">${formatCraftMats(recipe.mats)}</p>
      <button type="button" class="btn btn-sm" onclick="craftItem('${recipe.id}')" ${ok ? '' : 'disabled'}>合成</button>
    </div>`;
  }).join('');
}

function renderLifeTree() {
  const el = document.getElementById('lifeTree');
  if (!el) return;
  const branches = ['chop', 'fish', 'mine', 'all'];
  el.innerHTML = branches.map(br => {
    const nodes = LIFE_TREE.filter(n => n.branch === br);
    if (!nodes.length) return '';
    return `<div class="life-tree-branch">
      <h3 class="life-tree-branch-title">${LIFE_BRANCH_LABEL[br]}</h3>
      <ul class="life-tree-nodes">${nodes.map(node => {
        const owned = hasLifeNode(node.id);
        const can = canUnlockLifeNode(node.id);
        const locked = !owned && !can && node.req.some(r => !hasLifeNode(r));
        return `<li class="life-tree-node${owned ? ' owned' : ''}${locked ? ' locked' : ''}">
          <div class="life-tree-node-head">
            <b>${esc(node.name)}</b>
            ${owned ? '<span class="badge epic">已学习</span>' : `<span class="badge common">${node.cost} 点</span>`}
          </div>
          <p class="item-desc">${esc(node.desc)}</p>
          ${owned ? '' : `<button type="button" class="btn btn-sm" onclick="unlockLifeNode('${node.id}')" ${can ? '' : 'disabled'}>加点</button>`}
        </li>`;
      }).join('')}</ul>
    </div>`;
  }).join('');
}

function renderCheat() {
  document.getElementById('cheatGoldNow').textContent = state.gold;
  const input = document.getElementById('cheatGoldInput');
  if (document.activeElement !== input) input.value = state.gold;
  document.getElementById('cheatDiamondNow').textContent = state.diamonds || 0;
  const dInput = document.getElementById('cheatDiamondInput');
  if (document.activeElement !== dInput) dInput.value = state.diamonds || 0;
  const srSel = document.getElementById('cheatSpiritRoot');
  if (srSel && !srSel.dataset.inited) {
    srSel.innerHTML = Object.values(SPIRIT_ROOTS).map(r =>
      `<option value="${r.id}"${state.spiritRoot === r.id ? ' selected' : ''}>${r.name} ×${r.mult}</option>`
    ).join('');
    srSel.dataset.inited = '1';
  } else if (srSel) {
    srSel.value = state.spiritRoot || 'fan';
  }
}

function renderCodex() {
  const listEl = document.getElementById('codexList');
  const setsEl = document.getElementById('equipCodexSets');
  const tipEl = document.getElementById('codexTip');
  if (!listEl) return;

  document.querySelectorAll('.codex-tab').forEach(t => t.classList.toggle('active', t.dataset.codex === codexTab));

  if (codexTab === 'monster') {
    if (setsEl) setsEl.style.display = 'none';
    listEl.style.display = '';
    if (tipEl) tipEl.textContent = '击败足够数量解锁 lore 与弱点。瞭望术天赋可识破地图上的怪格。';
    listEl.innerHTML = Object.keys(CODEX).map(name => {
      const entry = CODEX[name];
      const kills = getCodexKills(name);
      const unlocked = isCodexUnlocked(name);
      const rid = entry.boss ? Object.keys(REGION_BOSSES).find(k => REGION_BOSSES[k].name === name) : null;
      const thumb = entry.boss ? bossPortraitHtml(rid) : monsterPortraitHtml(name);
      return `<li class="codex-item${unlocked ? '' : ' locked'}${entry.boss ? ' codex-boss' : ''}">
        <div class="codex-thumb">${thumb}</div>
        <div class="codex-info">
          <b>${entry.boss ? '👑 ' : ''}${name}</b>
          <span class="badge ${unlocked ? 'epic' : 'common'}">${unlocked ? '已解锁' : `${kills}/${entry.unlockKills} 击败`}</span>
          <p>${unlocked ? entry.lore : '??? 击败后解锁'}</p>
          ${unlocked ? `<p class="footer-tip">弱点：${entry.weak}</p>` : ''}
        </div>
      </li>`;
    }).join('');
    return;
  }

  if (tipEl) tipEl.textContent = '获得装备后解锁图鉴。套装效果见下方。';
  listEl.style.display = '';
  if (setsEl) setsEl.style.display = 'block';
  renderEquipCodexSets();

  const catLabel = { weapon: '武器', accessory: '饰品', set: '套装' };
  listEl.innerHTML = Object.values(EQUIP_CODEX).map(entry => {
    const unlocked = isItemCodexUnlocked(entry.id);
    const count = getItemCodexCount(entry.id);
    const slotLabel = entry.setId ? SET_DEFS[entry.setId]?.name : (SLOT_NAMES[entry.slot] || catLabel[entry.category] || '');
    return `<li class="codex-item${unlocked ? '' : ' locked'}">
      <div class="codex-info" style="width:100%">
        <b>${esc(entry.name)}</b>
        <span class="badge ${entry.setId ? 'set' : entry.rarity}">${slotLabel}</span>
        <span class="badge ${unlocked ? 'epic' : 'common'}">${unlocked ? `已获得 ×${count}` : '未获得'}</span>
        <p>${unlocked ? esc(entry.lore) : '??? 获得后解锁'}</p>
        ${unlocked && entry.stats ? `<p class="footer-tip">${statLabel({ stats: entry.stats })}</p>` : ''}
      </div>
    </li>`;
  }).join('');
}

function formatAuctionCountdown(ms) {
  if (ms <= 0) return '即将刷新';
  const sec = Math.ceil(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} 分 ${s} 秒`;
}

function renderAuction() {
  ensureAuctionLots();
  const left = Math.max(0, (state.auctionRefreshAt || 0) - Date.now());
  document.getElementById('auctionTimer').textContent = `距下次刷新：${formatAuctionCountdown(left)}`;

  document.getElementById('auctionBuyList').innerHTML = state.auctionLots.map(lot => {
    if (lot.sold) {
      return `<li class="auction-sold"><span class="item-info"><span class="badge common">已售出</span> ${esc(lot.item.name)}</span></li>`;
    }
    const item = lot.item;
    const tag = item.type === 'manual' ? '秘籍' : item.setId ? SET_DEFS[item.setId]?.name : (SLOT_NAMES[item.slot] || '物品');
    const priceLabel = lot.currency === 'diamond'
      ? `💎 ${lot.price}`
      : `${lot.price} 金`;
    const canBuy = lot.currency === 'diamond'
      ? (state.diamonds || 0) >= lot.price
      : state.gold >= lot.price;
    return `<li><span class="item-info">
      <span class="badge ${item.setId ? 'set' : item.rarity}">${tag}</span> ${esc(item.name)} · ${statLabel(item)}
      ${item.desc ? `<div class="item-desc">${esc(item.desc)}</div>` : ''}
      <div class="item-desc">成交价 <span class="${lot.currency === 'diamond' ? 'diamond' : 'gold'}">${priceLabel}</span></div></span>
      <button class="btn btn-sm" onclick="buyAuctionLot('${lot.id}')" ${canBuy ? '' : 'disabled'}">竞拍</button></li>`;
  }).join('');

  const gear = state.bag.filter(i => i.slot && i.type !== 'material' && i.type !== 'manual');
  const empty = document.getElementById('auctionConsignEmpty');
  const list = document.getElementById('auctionConsignList');
  if (!gear.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = gear.map(item => {
    const base = getSellPrice(item);
    const total = base + Math.floor(base * 0.25);
    return `<li><span class="item-info"><span class="badge ${item.setId ? 'set' : item.rarity}">${SLOT_NAMES[item.slot]} ${esc(item.name)}</span>
      <div class="item-desc">${statLabel(item)} · 寄售可得约 ${total} 金${item.rarity === 'epic' ? '（史诗或得💎）' : ''}</div></span>
      <button class="btn btn-sm btn-sell" onclick="consignToAuction('${item.uid}')">寄售</button></li>`;
  }).join('');
}

function renderShop() {
  document.querySelectorAll('.shop-tab').forEach(t => t.classList.toggle('active', t.dataset.shop === shopTab));
  document.getElementById('shopList').innerHTML = getShopItems().map(item => {
    const isManual = item.type === 'manual';
    const owned = isManual && (state.skills.some(s => s.id === item.id) || state.bag.some(i => i.id === item.id && i.type === 'manual'));
    const tag = isManual ? '秘籍' : item.setId ? SET_DEFS[item.setId]?.name : (SLOT_NAMES[item.slot] || '');
    return `<li><span class="item-info"><span class="badge ${item.setId ? 'set' : item.rarity}">${tag}</span> ${esc(item.name)} · ${statLabel(item)}
      ${item.desc ? `<div class="item-desc">${esc(item.desc)}</div>` : ''}</span>
      <button class="btn btn-sm" onclick="buyFromShop('${item.id}')" ${state.gold < item.price || owned ? 'disabled' : ''}>${owned ? '已拥有' : item.price + ' 金'}</button></li>`;
  }).join('');
}
