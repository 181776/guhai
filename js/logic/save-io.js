// v1.9 存档导出 / 导入
function exportSave() {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `guhai-save-Lv${state.level}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importSaveFromText(text) {
  try {
    const data = JSON.parse(text);
    state = migrate(data);
    if (!state.grid?.cells) initGridMap(true);
    render();
    save();
    addLog('<span class="sys">存档已导入</span>', true);
    return true;
  } catch (e) {
    alert('存档格式无效：' + e.message);
    return false;
  }
}

function importSaveFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => importSaveFromText(reader.result);
  reader.readAsText(file);
}

window.exportSave = exportSave;
window.importSaveFromFile = importSaveFromFile;
