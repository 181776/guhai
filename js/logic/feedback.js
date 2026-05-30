// 玩家反馈

const FEEDBACK_TYPES = [
  { id: 'suggest', label: '建议' },
  { id: 'bug', label: 'Bug' },
  { id: 'balance', label: '平衡' },
  { id: 'other', label: '其他' },
];

const FEEDBACK_IDEA_KINDS = [
  { id: 'weapon', label: '武器' },
  { id: 'accessory', label: '饰品' },
  { id: 'gear', label: '装备' },
  { id: 'talent', label: '天赋' },
  { id: 'achievement', label: '成就' },
];

function getFeedbackIdeaKindLabel(id) {
  return FEEDBACK_IDEA_KINDS.find(k => k.id === id)?.label || '';
}

function getFeedbackTypeLabel(id) {
  return FEEDBACK_TYPES.find(t => t.id === id)?.label || '其他';
}

function buildFeedbackBody(typeId, message, contact, ideaKind, ideaNote) {
  const region = typeof getRegion === 'function' ? getRegion() : null;
  const lines = [];
  if (message.trim()) {
    lines.push('## 反馈内容', message.trim(), '');
  }
  if (ideaKind && ideaNote.trim()) {
    const kindLabel = getFeedbackIdeaKindLabel(ideaKind);
    lines.push(
      '## 原创投稿（供作者实装参考）',
      `- 投稿类型：${kindLabel}`,
      '',
      ideaNote.trim(),
      '',
    );
  }
  lines.push(
    '---',
    '## 游戏信息（自动附带）',
    `- 项目：${FEEDBACK.projectName}`,
    `- 版本：v${GAME_VERSION}`,
    `- 角色：${state.name || '—'} · Lv.${state.level || 1}`,
    `- 地区：${region?.name || state.currentRegion || '—'}`,
    `- 时间：${new Date().toLocaleString('zh-CN')}`,
  );
  if (contact?.trim()) lines.push(`- 联系方式：${contact.trim()}`);
  lines.push(`- 页面：${location.href}`);
  return lines.join('\n');
}

function buildFeedbackTitle(typeId, message, ideaKind, ideaNote) {
  const label = getFeedbackTypeLabel(typeId);
  if (ideaKind && ideaNote.trim()) {
    const kindLabel = getFeedbackIdeaKindLabel(ideaKind);
    const nameLine = ideaNote.trim().split('\n').find(l => /^名称[：:]\s*/.test(l));
    const name = nameLine ? nameLine.replace(/^名称[：:]\s*/, '').trim() : ideaNote.trim().replace(/\s+/g, ' ').slice(0, 24);
    return `[原创·${kindLabel}] ${name}${name.length >= 24 ? '…' : ''}`;
  }
  const preview = message.trim().replace(/\s+/g, ' ').slice(0, 36);
  return `[${label}] ${preview}${message.trim().length > 36 ? '…' : ''}`;
}

function openFeedbackModal() {
  const el = document.getElementById('feedbackModal');
  if (!el) return;
  const saved = state.feedbackDraft || {};
  const typeEl = document.getElementById('feedbackType');
  const msgEl = document.getElementById('feedbackMessage');
  const contactEl = document.getElementById('feedbackContact');
  const ideaKindEl = document.getElementById('feedbackIdeaKind');
  const ideaNoteEl = document.getElementById('feedbackIdeaNote');
  if (typeEl) typeEl.value = saved.type || 'suggest';
  if (msgEl) msgEl.value = saved.message || '';
  if (contactEl) contactEl.value = saved.contact || '';
  if (ideaKindEl) ideaKindEl.value = saved.ideaKind || '';
  if (ideaNoteEl) ideaNoteEl.value = saved.ideaNote || '';
  updateFeedbackMeta();
  el.classList.add('show');
  msgEl?.focus();
}

function closeFeedbackModal() {
  document.getElementById('feedbackModal')?.classList.remove('show');
}

function saveFeedbackDraft() {
  state.feedbackDraft = {
    type: document.getElementById('feedbackType')?.value || 'suggest',
    message: document.getElementById('feedbackMessage')?.value || '',
    contact: document.getElementById('feedbackContact')?.value || '',
    ideaKind: document.getElementById('feedbackIdeaKind')?.value || '',
    ideaNote: document.getElementById('feedbackIdeaNote')?.value || '',
  };
  save();
}

function updateFeedbackMeta() {
  const el = document.getElementById('feedbackMeta');
  if (!el) return;
  const region = typeof getRegion === 'function' ? getRegion() : null;
  el.textContent = `v${GAME_VERSION} · ${state.name || '旅人'} Lv.${state.level || 1} · ${region?.name || '—'}`;
}

function readFeedbackForm() {
  const typeId = document.getElementById('feedbackType')?.value || 'suggest';
  const message = document.getElementById('feedbackMessage')?.value || '';
  const contact = document.getElementById('feedbackContact')?.value || '';
  const ideaKind = document.getElementById('feedbackIdeaKind')?.value || '';
  const ideaNote = document.getElementById('feedbackIdeaNote')?.value || '';
  return { typeId, message, contact, ideaKind, ideaNote };
}

function validateFeedbackForm({ message, ideaKind, ideaNote }) {
  if (message.trim()) {
    if (ideaNote.trim() && !ideaKind) return { ok: false, hint: '请选择原创投稿类型' };
    return { ok: true };
  }
  if (ideaKind && ideaNote.trim()) return { ok: true };
  if (ideaNote.trim() && !ideaKind) return { ok: false, hint: '请选择原创投稿类型' };
  return { ok: false, hint: '请填写反馈内容，或完成原创投稿备注' };
}

async function copyFeedbackText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return ok;
}

async function submitFeedback() {
  const form = readFeedbackForm();
  const check = validateFeedbackForm(form);
  if (!check.ok) {
    showToast(check.hint);
    (form.ideaNote.trim() && !form.ideaKind ? document.getElementById('feedbackIdeaKind') : document.getElementById('feedbackMessage'))?.focus();
    return;
  }
  saveFeedbackDraft();
  const title = buildFeedbackTitle(form.typeId, form.message, form.ideaKind, form.ideaNote);
  const body = buildFeedbackBody(form.typeId, form.message, form.contact, form.ideaKind, form.ideaNote);
  const url = `${FEEDBACK.issuesUrl}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  let copied = false;
  try {
    copied = await copyFeedbackText(body);
  } catch (_) {}
  if (url.length > 7500) {
    if (copied) showToast('内容已复制！GitHub 链接过长，请粘贴后提交');
    else showToast('反馈内容过长，请使用「复制内容」后手动提交');
    window.open(FEEDBACK.issuesUrl, '_blank', 'noopener');
  } else {
    window.open(url, '_blank', 'noopener');
    showToast(copied ? '已打开 GitHub，内容已复制到剪贴板' : '已打开 GitHub 反馈页');
  }
  closeFeedbackModal();
}

async function copyFeedbackOnly() {
  const form = readFeedbackForm();
  const check = validateFeedbackForm(form);
  if (!check.ok) {
    showToast(check.hint);
    return;
  }
  saveFeedbackDraft();
  const text = `# ${buildFeedbackTitle(form.typeId, form.message, form.ideaKind, form.ideaNote)}\n\n${buildFeedbackBody(form.typeId, form.message, form.contact, form.ideaKind, form.ideaNote)}`;
  try {
    const ok = await copyFeedbackText(text);
    showToast(ok ? '反馈内容已复制' : '复制失败，请手动选中复制');
  } catch (_) {
    showToast('复制失败，请手动选中复制');
  }
}

window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.submitFeedback = submitFeedback;
window.copyFeedbackOnly = copyFeedbackOnly;
