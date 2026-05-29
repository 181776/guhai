function isPlayerFirst(s, m) {
  if (s.speed > m.speed) return true;
  if (s.speed < m.speed) return false;
  return Math.random() > 0.5;
}

function logTurnOrder(s, m) {
  if (s.speed > m.speed) addLog(`⚡ 速度 ${s.speed} > ${m.speed}，<b>你先手</b>`, true);
  else if (s.speed < m.speed) addLog(`⚡ 速度 ${s.speed} < ${m.speed}，<b>${m.name} 先手</b>`, true);
  else addLog(`⚡ 速度相同（${s.speed}），本回合随机先手`, true);
}

function spawnMonster() {
  if (state.grid?.phase === 'ready') return spawnPathMonster();
  return false;
}

const MONSTER_TRAITS = {
  slime: { id: 'slime', name: '韧皮', desc: '防御更高', hpMult: 1.1, defMult: 1.18 },
  goblin: { id: 'goblin', name: '狂暴', desc: '攻击高，防御低', atkMult: 1.2, defMult: 0.88 },
  wolf: { id: 'wolf', name: '疾袭', desc: '高速连击', speedAdd: 4, atkMult: 1.06 },
  skeleton: { id: 'skeleton', name: '硬骨', desc: '高物防', defMult: 1.25, spDefMult: 0.92 },
  bat: { id: 'bat', name: '嗜血', desc: '命中时少量吸血', lifeSteal: 0.08 },
  bandit: { id: 'bandit', name: '破甲', desc: '有概率压低你防御', rendChance: 0.28, rendMult: 0.8 },
  spider: { id: 'spider', name: '毒牙', desc: '命中后追加毒伤', poisonChance: 0.35 },
};

const MONSTER_TRAIT_BY_NAME = {
  '史莱姆': MONSTER_TRAITS.slime,
  '哥布林': MONSTER_TRAITS.goblin,
  '野狼': MONSTER_TRAITS.wolf,
  '骷髅': MONSTER_TRAITS.skeleton,
  '蝙蝠': MONSTER_TRAITS.bat,
  '山贼': MONSTER_TRAITS.bandit,
  '毒蜘蛛': MONSTER_TRAITS.spider,
};

function createBattleStats() {
  return { fights: 0, kills: 0, bossKills: 0, damageDealt: 0, damageTaken: 0, crits: 0, potionsUsed: 0 };
}

function resetBattleStats() {
  state.battleStats = createBattleStats();
}

function trackBattleStat(key, inc = 1) {
  if (!state.battleStats) state.battleStats = createBattleStats();
  state.battleStats[key] = (state.battleStats[key] || 0) + inc;
}

function getMonsterTrait(name) {
  return MONSTER_TRAIT_BY_NAME[name] || null;
}

function formatBattleStatsSummary() {
  const st = state.battleStats;
  if (!st || !st.fights) return '';
  return `战斗统计：${st.fights}战 ${st.kills}胜` +
    ` · Boss ${st.bossKills} · 造成${st.damageDealt} · 承受${st.damageTaken}` +
    ` · 暴击${st.crits} · 用药${st.potionsUsed}`;
}

function applyMonsterTrait(m) {
  const trait = getMonsterTrait(m.dropName || m.name);
  if (!trait) return m;
  m.trait = trait;
  if (trait.hpMult) {
    m.maxHp = Math.floor(m.maxHp * trait.hpMult);
  }
  if (trait.atkMult) m.atk = Math.max(1, Math.floor(m.atk * trait.atkMult));
  if (trait.defMult) m.def = Math.max(1, Math.floor(m.def * trait.defMult));
  if (trait.spDefMult) m.spDef = Math.max(1, Math.floor(m.spDef * trait.spDefMult));
  if (trait.speedAdd) m.speed = Math.max(1, m.speed + trait.speedAdd);
  m.hp = m.maxHp;
  return m;
}

function tryPetDrop() {
  const r = getRegion();
  if (Math.random() > 0.06) return;
  const pool = PET_DROP_BY_REGION[r.id] || ['p_slime'];
  const pid = pool[Math.floor(Math.random() * pool.length)];
  if (state.pets.includes(pid)) return;
  state.pets.push(pid);
  const pet = PETS.find(p => p.id === pid);
  addLog(`<span class="drop">🐾 捕获宠物：${pet?.name || pid}！</span>`);
  if (pid === 'p_ghost') checkChapterPetGhost();
}

function tryDiamondDrop() {
  if (Math.random() > 0.04) return;
  state.diamonds = (state.diamonds || 0) + 1;
  addLog(`<span class="drop">💎 稀有掉落：钻石 +1</span>`);
}

function rollDrop(monster) {
  const drops = [];
  if (Math.random() < 0.55) {
    const pool = MONSTER_DROPS[monster.name] || ['mat1'];
    const mat = MATERIALS.find(m => m.id === pool[Math.floor(Math.random() * pool.length)]);
    if (mat) drops.push({ ...mat });
  }
  if (Math.random() < 0.15) {
    const tpl = DROP_WEAPONS[Math.floor(Math.random() * DROP_WEAPONS.length)];
    drops.push({ ...tpl, uid: Date.now() + Math.random() });
  }
  if (Math.random() < 0.08) {
    const tpl = DROP_SET[Math.floor(Math.random() * DROP_SET.length)];
    drops.push({ ...tpl, uid: Date.now() + Math.random() });
  }
  return drops;
}

function addToBag(item) {
  if (item.type === 'material') {
    const ex = state.bag.find(i => i.type === 'material' && i.id === item.id);
    if (ex) { ex.count = (ex.count || 1) + 1; return ex; }
    state.bag.push({ ...item, count: 1, uid: 'mat_' + item.id });
    return;
  }
  state.bag.push({ ...item, uid: item.uid || (Date.now() + Math.random()) });
  recordItemDiscovered(item);
}

function getSellPrice(item) {
  if (item.type === 'material') return (MATERIAL_SELL[item.id] || 5) * (item.count || 1);
  if (item.type === 'consumable') return (CONSUMABLE_SELL[item.id] || 10) * (item.count || 1);
  if (item.sellPrice) return item.sellPrice;
  if (item.price) return Math.floor(item.price * 0.45);
  return 15;
}

function sellItem(uid) {
  const idx = state.bag.findIndex(i => i.uid == uid);
  if (idx < 0) return;
  const item = state.bag[idx];
  if (item.type === 'manual') return;
  const price = getSellPrice(item);
  state.gold += price;
  state.bag.splice(idx, 1);
  render(); save();
}

function sellOneMaterial(uid) {
  const item = state.bag.find(i => i.uid == uid);
  if (!item || (item.type !== 'material' && item.type !== 'consumable')) return;
  const unit = item.type === 'material'
    ? (MATERIAL_SELL[item.id] || 5)
    : (CONSUMABLE_SELL[item.id] || 10);
  state.gold += unit;
  item.count = (item.count || 1) - 1;
  if (item.count <= 0) state.bag = state.bag.filter(i => i.uid !== uid);
  render(); save();
}

function startBattleBlock(name, lv) {
  const log = document.getElementById('battleLog');
  const block = document.createElement('div');
  block.className = 'log-block';
  const mSpd = state.monster?.speed ?? '?';
  block.innerHTML = `<div class="log-header">【对战 Lv.${lv} ${name} · 速度 ${mSpd}】</div>`;
  log.prepend(block);
  currentLogBlock = block;
  while (log.children.length > 25) log.lastChild.remove();
}

function addLog(html, isSystem) {
  if (!currentLogBlock) {
    const log = document.getElementById('battleLog');
    const block = document.createElement('div');
    block.className = 'log-block';
    log.prepend(block);
    currentLogBlock = block;
  }
  const line = document.createElement('div');
  line.className = 'log-line' + (isSystem ? ' sys' : '');
  line.innerHTML = html;
  currentLogBlock.appendChild(line);
  document.getElementById('battleLog').scrollTop = 0;
}

function endBattleBlock() { currentLogBlock = null; }

function dealPlayerDamage(m, s, isSpecial) {
  const atk = isSpecial ? s.spAtk : s.atk;
  const def = isSpecial ? m.spDef : m.def;
  let dmg = Math.max(1, atk - def + Math.floor(Math.random() * 4));
  const isCrit = Math.random() < s.critRate;
  if (isCrit) dmg = Math.max(1, Math.floor(dmg * (1 + s.critDmg)));
  m.hp -= dmg;
  trackBattleStat('damageDealt', dmg);
  if (isCrit) trackBattleStat('crits', 1);
  const tag = isSpecial ? '特攻' : '物攻';
  if (isCrit) addLog(`<span class="crit">💥 暴击${tag}！</span>造成 <span class="dmg">${dmg}</span> 伤害`);
  else addLog(`${tag}命中，造成 <span class="dmg">${dmg}</span> 伤害`);
}

function triggerBossPhaseIfNeeded(m, s) {
  if (!m.isBoss) return;
  if (!m.phase) m.phase = 1;
  if (m.hp <= Math.floor(m.maxHp * 0.7) && !m.phase70) {
    m.phase70 = true;
    m.phase = 2;
    m.atk = Math.floor(m.atk * 1.2);
    m.speed += 2;
    addLog('<span class="crit">👑 Boss 二阶段：狂怒，攻击与速度提升！</span>', true);
  }
  if (m.hp <= Math.floor(m.maxHp * 0.3) && !m.phase30) {
    m.phase30 = true;
    m.phase = 3;
    const heal = Math.floor(m.maxHp * 0.12);
    m.hp = Math.min(m.maxHp, m.hp + heal);
    const burst = Math.max(1, Math.floor(m.spAtk * 1.25) - Math.floor(s.spDef * 0.6));
    state.currentHp = Math.max(0, (state.currentHp ?? s.maxHp) - burst);
    trackBattleStat('damageTaken', burst);
    addLog(`<span class="dmg">👑 Boss 三阶段：血怒爆发，造成 ${burst} 伤害并回复 ${heal} 生命！</span>`, true);
  }
}

function applyMonsterAfterHitEffects(m, dmg, s) {
  const trait = m.trait;
  if (!trait || dmg <= 0) return;
  if (trait.lifeSteal) {
    const heal = Math.max(1, Math.floor(dmg * trait.lifeSteal));
    m.hp = Math.min(m.maxHp, m.hp + heal);
    addLog(`<span class="reflect">${m.name} 嗜血回复 ${heal} 生命</span>`);
  }
  if (trait.poisonChance && Math.random() < trait.poisonChance) {
    const poison = Math.max(1, Math.floor(s.maxHp * 0.03));
    state.currentHp = Math.max(0, (state.currentHp ?? s.maxHp) - poison);
    trackBattleStat('damageTaken', poison);
    addLog(`<span class="dmg">☠ ${m.name} 毒伤追加 ${poison}</span>`);
  }
  if (trait.rendChance && Math.random() < trait.rendChance) {
    const reduce = Math.max(1, Math.floor((state.battleDebuff?.defDrop || 0) + (1 - trait.rendMult) * 100));
    state.battleDebuff = { defDrop: reduce, untilMonsterUid: m.uid };
    addLog(`<span class="dmg">${m.name} 破甲成功！本场你的物防临时降低</span>`);
  }
}

function battleTick() {
  if (!state.monster) {
    if (!spawnMonster()) return;
  }
  const m = state.monster, s = calcStats();
  clampHp();
  triggerBossPhaseIfNeeded(m, s);
  const playerFirst = isPlayerFirst(s, m);
  for (const phase of (playerFirst ? ['player', 'monster'] : ['monster', 'player'])) {
    if (m.hp <= 0 || (state.currentHp ?? 0) <= 0) break;
    if (phase === 'player') {
      dealPlayerDamage(m, s, Math.random() < 0.25);
    } else {
      const useSpecial = Math.random() < 0.2;
      const playerDef = state.battleDebuff?.untilMonsterUid === m.uid
        ? Math.max(1, Math.floor(s.def * 0.82))
        : s.def;
      const dmg = useSpecial
        ? Math.max(1, m.spAtk - s.spDef + Math.floor(Math.random() * 3))
        : Math.max(1, m.atk - playerDef + Math.floor(Math.random() * 3));
      addLog(`${m.name} ${useSpecial ? '特攻' : '物攻'}，造成 <span class="dmg">${dmg}</span> 伤害`);
      state.currentHp = Math.max(0, (state.currentHp ?? s.maxHp) - dmg);
      trackBattleStat('damageTaken', dmg);
      applyMonsterAfterHitEffects(m, dmg, s);
      if (hasTalent('t_reflect') && m.hp > 0) {
        const reflect = Math.max(1, Math.floor(dmg * 0.2));
        m.hp -= reflect;
        addLog(`<span class="reflect">反伤之躯！反弹 ${reflect} 伤害</span>`);
        trackBattleStat('damageDealt', reflect);
      }
    }
  }
  autoUseIdleHeal();
  clampHp();
  if (m.hp <= 0) {
    const sourceCell = m.sourceCell;
    state.gold += m.gold; state.xp += applyXpGain(m.xp);
    trackBattleStat('kills', 1);
    recordMonsterKill(m.name);
    if (m.isBoss) {
      recordMonsterKill(m.dropName || m.name);
      trackBattleStat('bossKills', 1);
    }
    addLog(`✔ 击败 ${m.name}！<span class="loot">+${m.gold}金 +${m.xp}经验</span>`);
    if (hasTalent('t_killheal')) { healPercent(0.08); addLog('<span class="reflect">嗜血本能回复 8% 生命</span>'); }
    tryPetDrop();
    tryDiamondDrop();
      for (const d of rollDrop({ ...m, name: m.dropName || m.name })) { addToBag(d); addLog(`<span class="drop">📦 掉落：${d.name}</span>`); }
    healPercent(0.2); checkLevelUp(); endBattleBlock();
    const wasBoss = m.isBoss;
    const bossRegion = m.regionId;
    state.monster = null;
    state.battleDebuff = null;
    if (wasBoss && bossRegion) checkChapterBossDefeat(bossRegion);
    if (sourceCell) markPathCellCleared(sourceCell);
    if (state.battleOn && canStartGridBattle()) spawnMonster();
    render(); save();
    return;
  }
  if ((state.currentHp ?? 0) <= 0) {
    if (autoUseEmergencyHeal()) {
      render(); save();
      return;
    }
    addLog('<span class="dmg">你已倒下，3秒后恢复30%生命</span>');
    clearInterval(battleTimer); state.battleOn = false;
    setTimeout(() => { state.currentHp = Math.floor(calcStats().maxHp * 0.3); addLog('—— 恢复再战 ——', true); render(); save(); }, 3000);
  }
  render();
}

function checkLevelUp(silent) {
  while (state.xp >= state.xpNeed) {
    state.xp -= state.xpNeed; state.level++;
    state.xpNeed = Math.floor(state.xpNeed * 1.5);
    for (const k of Object.keys(LEVEL_GROWTH)) state.baseStats[k] += LEVEL_GROWTH[k];
    state.currentHp = calcStats().maxHp;
    if (!silent) addLog(`<span class="lvl">🎉 升级 Lv.${state.level}！生命回满</span>`);
    checkLevelStory(state.level);
  }
}

function equipItem(item) {
  const old = state.equip[item.slot];
  state.equip[item.slot] = item;
  state.bag = state.bag.filter(i => i.uid !== item.uid);
  if (old) state.bag.push(old);
  clampHp(); pickingSlot = null; render(); save();
}

function unequipSlot(slot) {
  const item = state.equip[slot];
  if (!item) return;
  state.equip[slot] = null; state.bag.push(item);
  clampHp(); render(); save();
}

function learnManual(item) {
  if (state.skills.some(s => s.id === item.id)) return;
  state.skills.push({ id: item.id, name: item.name, stats: normalizeStats(item), rarity: item.rarity, desc: item.desc });
  state.bag = state.bag.filter(i => i.uid !== item.uid);
  clampHp(); render(); save();
}

function buyItem(shopItem) {
  if (state.gold < shopItem.price) return;
  if (shopItem.type === 'manual' && (state.skills.some(s => s.id === shopItem.id) || state.bag.some(i => i.id === shopItem.id && i.type === 'manual'))) return;
  state.gold -= shopItem.price;
  addToBag({ ...shopItem, uid: Date.now() + Math.random() });
  render(); save();
}

function unlockTalent(id) {
  const t = TALENTS.find(x => x.id === id);
  if (!t || hasTalent(id) || state.gold < t.price) return;
  state.gold -= t.price;
  state.talents.push(id);
  clampHp(); render(); save();
}

function doLifeSkill(id) {
  const skill = LIFE_SKILLS.find(s => s.id === id);
  if (!skill) return;
  const now = Date.now();
  const bonus = getLifeBonuses(id);
  const cdMs = Math.floor(skill.cd * bonus.cdMult);
  if (now < (state.lifeCd[id] || 0)) {
    const left = Math.ceil((state.lifeCd[id] - now) / 1000);
    document.getElementById('lifeToast').textContent = `${skill.name} 冷却中，还需 ${left} 秒`;
    return;
  }
  state.lifeCd[id] = now + cdMs;
  addToBag({ ...skill.mat });
  const baseG = skill.gold[0] + Math.floor(Math.random() * (skill.gold[1] - skill.gold[0] + 1));
  const g = Math.floor(baseG * bonus.goldMult);
  state.gold += g;
  const xpGain = skill.xp + bonus.xpBonus;
  state.xp += applyXpGain(xpGain);
  state.lifeSp = (state.lifeSp || 0) + 1;
  checkLevelUp(true);
  document.getElementById('lifeToast').textContent =
    `${skill.icon} ${skill.msg}！获得 ${skill.mat.name} ×1，+${g} 金，+${xpGain} 经验 · 生活点 +1`;
  render(); save();
}

function selectRegion(id) {
  selectGridRegion(id);
}

function doCheckin() {
  const today = todayStr();
  if (state.lastCheckin === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  state.checkinStreak = (state.lastCheckin === yStr) ? state.checkinStreak + 1 : 1;
  state.lastCheckin = today;
  const idx = Math.min(state.checkinStreak - 1, CHECKIN_BASE.length - 1);
  const gold = CHECKIN_BASE[idx];
  state.gold += gold;
  if (state.checkinStreak >= 7) state.diamonds = (state.diamonds || 0) + 2;
  else if (state.checkinStreak >= 4) state.diamonds = (state.diamonds || 0) + 1;
  if (state.checkinStreak === 3 && !state.pets.includes('p_slime')) {
    state.pets.push('p_slime');
  }
  render(); save();
}

function setActivePet(id) {
  if (!state.pets.includes(id)) return;
  state.activePet = state.activePet === id ? null : id;
  render(); save();
}

function setCheatGold(val) {
  state.gold = Math.max(0, Math.floor(val) || 0);
  render(); save();
}

function setCheatDiamonds(val) {
  state.diamonds = Math.max(0, Math.floor(val) || 0);
  render(); save();
}

function ensureAuctionLots() {
  const now = Date.now();
  if (state.auctionLots?.length && state.auctionRefreshAt > now) return;
  state.auctionLots = generateAuctionLots(state);
  state.auctionRefreshAt = now + AUCTION_REFRESH_MS;
}

function buyAuctionLot(lotId) {
  ensureAuctionLots();
  const lot = state.auctionLots.find(l => l.id === lotId);
  if (!lot || lot.sold) return;
  const item = lot.item;
  if (item.type === 'manual') {
    if (state.skills.some(s => s.id === item.id) || state.bag.some(i => i.id === item.id && i.type === 'manual')) return;
  }
  if (lot.currency === 'diamond') {
    if ((state.diamonds || 0) < lot.price) return;
    state.diamonds -= lot.price;
  } else {
    if (state.gold < lot.price) return;
    state.gold -= lot.price;
  }
  addToBag({ ...item, uid: Date.now() + Math.random() });
  lot.sold = true;
  render(); save();
}

function consignToAuction(uid) {
  const idx = state.bag.findIndex(i => i.uid == uid);
  if (idx < 0) return;
  const item = state.bag[idx];
  if (item.type === 'material' || item.type === 'manual' || item.type === 'consumable') return;
  if (!item.slot) return;
  const base = getSellPrice(item);
  const bonus = Math.floor(base * 0.25);
  state.gold += base + bonus;
  if (item.rarity === 'epic' && Math.random() < 0.35) {
    state.diamonds = (state.diamonds || 0) + 1;
  }
  state.bag.splice(idx, 1);
  render(); save();
}

function refreshAuctionNow() {
  state.auctionLots = generateAuctionLots(state);
  state.auctionRefreshAt = Date.now() + AUCTION_REFRESH_MS;
  render(); save();
}
