# 古海大陆 — Agent 快速指南

## 项目概述

古海大陆（Ancient Sea Continent）是一款纯前端武侠 RPG 页游，从斗破苍穹式废柴逆袭主线出发。HTML + CSS + vanilla JS，零依赖、零构建。

## 如何运行

```bash
# 随便起个 HTTP 服务器就行
npx serve .          # 最简单
python -m http.server 8080
```

打开 `index.html`（直接 file:// 也可，但 HTTP 服务器更稳）。

## 文件结构

```
index.html          — 单页面，所有 UI 区域都在这里
css/
  game.css          — 主样式（布局、组件、动画）
  theme-v31.css     — 主题变体（阴影、配色微调）
js/
  main.js           — 入口，事件绑定，全局函数挂到 window
  state.js          — 全局状态 DEFAULT_STATE + 工具函数
  ui.js             — 所有页面渲染（renderChar, renderMap, renderCodex, ...）
  ui-effects.js     — 视觉特效（粒子、闪烁等）
  logic.js          — 主游戏逻辑（战斗、移动、装备等）
  logic/            — 按模块拆分的逻辑
    grid.js         — 地图格子（移动、遭遇、Boss 格）
    dialog.js       — 对话/剧情系统
    feedback.js     — 玩家反馈文案
    craft.js        — 合成系统
    martial.js      — 武功系统
    meta.js         — 成就、统计
    save-io.js      — 存档读写（export/import/reset）
    story-quest.js  — 主线任务
  data/             — 纯数据层，不包含逻辑
    story.js        — 剧情文本、人物、怪物资源映射 (ASSETS)
    bosses.js       — 各地区 Boss 数据 (REGION_BOSSES)
    codex.js        — 怪物图鉴 (CODEX) + 解锁逻辑
    equip-codex.js  — 装备图鉴
    items.js        — 物品/装备/武器数据
    martial.js      — 武功数据
    auction.js      — 拍卖会数据
    config.js       — 游戏配置常量（天赋、难度等）
    life-tree.js    — 生活技能树
    spirit-roots.js — 灵根系统
    world.js        — 世界地图/地区数据
    meta.js         — 成就定义
    story-chapters.js — 章节数据
    craft.js        — 合成配方
assets/img/
  monsters/         — 怪物精灵 (PNG, 64x64~160x160)
  characters/       — 角色立绘
  icons/nav/        — 侧边栏图标 (SVG)
  regions/          — 地区背景
  pets/             — 宠物精灵
  ui/               — UI 装饰图
docs/
  像素规格.md        — 精灵尺寸规格说明
```

## 核心架构

### 数据流（单向）

```
data/*.js (静态数据)  ──→  logic.js / logic/*.js (游戏逻辑)
                                    │
                              state 对象 (全局状态)
                                    │
                              ui.js (渲染)  ──→  DOM
                                    │
                              save-io.js  ⇄  localStorage
```

- **state** 是唯一真相源。所有游戏数据都在 `state` 对象里（见 `state.js` 的 `DEFAULT_STATE`）。
- **渲染** 是无状态的 — 改了 state，调对应的 `render*()` 就能刷新 UI。
- **存档** 存在 localStorage，key 是 `guhai_save`。

### 关键全局变量

| 变量/函数 | 位置 | 说明 |
|-----------|------|------|
| `state` | state.js | 全局游戏状态 |
| `CODEX` | data/codex.js | 怪物图鉴条目 |
| `REGION_BOSSES` | data/bosses.js | Boss 数据 |
| `ASSETS` | data/story.js | 图片路径映射 |
| `STORY` | data/story.js | 剧情文本 |
| `SHOP` | data/items.js | 商店物品 |
| `render()` | main.js | 刷新全部 UI |

### 怪物/图鉴相关

- **普通怪物** 图片路径在 `ASSETS.monsters`（`story.js`），图鉴定义在 `CODEX`（`codex.js`）
- **Boss** 图片路径在 `REGION_BOSSES`（`bosses.js`），图鉴定义也在 `CODEX`
- 新增怪物需要：① 放 PNG 到 `assets/img/monsters/` ② 在 `CODEX` 加条目 ③ 是 Boss 的话在 `REGION_BOSSES` 加条目 ④ 在 `ASSETS.monsters` 加路径
- 图鉴渲染：`ui.js` 的 `renderCodex()`，样式：`game.css` 的 `.codex-*`
- 图鉴缩略图尺寸：`.codex-thumb .unit-sprite`（当前 160x160，3 列网格）

### CSS 注意事项

- 主题变量定义在 `game.css` 顶部（`--bg`, `--text`, `--gold` 等）
- `theme-v31.css` 覆盖部分变量实现主题变体
- 别在 HTML 里写内联样式，统一放 `game.css`

## 常见改法速查

| 需求 | 改哪里 |
|------|--------|
| 加怪物 | `assets/img/monsters/` + `codex.js` + `story.js` (`ASSETS.monsters`) |
| 加 Boss | 同上 + `bosses.js` |
| 加物品/装备 | `data/items.js` |
| 改文案 | `data/story.js` |
| 改 UI 样式 | `css/game.css` |
| 改战斗逻辑 | `logic.js` |
| 加新页面 | `index.html`（HTML 结构）+ `ui.js`（渲染函数） |
