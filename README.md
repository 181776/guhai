# 古海大陆

网页文字挂机 RPG，浅色像素风 UI，本地静态服务器运行。

**作者：WEI x CURSOR** · **当前版本：v2.6**

## 快速开始

> v1.5 起为多文件项目，**不能直接双击** `index.html`（浏览器会拦截本地 JS）。

### 方式一：VS Code Live Server（推荐）

1. 安装插件 **Live Server**
2. 右键 `index.html` → **Open with Live Server**

### 方式二：双击启动（Windows）

双击项目里的 **`start.bat`**，等出现 `Serving!` 后，浏览器打开：

**http://localhost:3000**

不要关黑色命令行窗口；关窗口 = 停止服务器。

### 方式三：命令行

```bash
cd "E:\vibe coding"
npx --yes serve . -p 3000
```

### 方式四：VS Code / Cursor Live Server

## 项目结构

```
古海大陆/
├── index.html          # 页面骨架
├── css/game.css        # 样式（含像素风主题）
├── js/
│   ├── data/           # 游戏数据 & 剧情 & 资源路径
│   │   ├── config.js
│   │   ├── world.js
│   │   ├── items.js
│   │   ├── auction.js
│   │   └── story.js
│   ├── state.js        # 存档、属性
│   ├── logic.js        # 战斗、系统
│   ├── logic/
│   │   └── grid.js     # v1.7 连线地图
│   ├── ui.js           # 渲染
│   └── main.js         # 入口
├── assets/img/         # 像素 PNG（见 docs/像素规格.md）
└── docs/
    ├── 像素规格.md
    └── 剧情大纲.md
```

## 玩法

1. **角色** → 天赋、套装、战力
2. **地图** → 左键拖线、右键取消 → 确认路线 → 挂机（只遇路线上的怪）
3. **拍卖会** → 金币/钻石竞拍、装备寄售
4. **商店 / 背包 / 生活 / 签到 / 宠物**

## 加美术

1. 用 **Aseprite** 按 [docs/像素规格.md](./docs/像素规格.md) 导出 PNG
2. 放入 `assets/img/` 对应文件夹
3. 刷新浏览器（路径已在 `js/data/story.js` 配好，缺图自动隐藏）

## 写剧情

在 `docs/剧情大纲.md` 起草，定稿后写入 `js/data/story.js` 的 `STORY` 对象。

## 重置存档

```javascript
localStorage.removeItem('idleRpgV1')
```

## 更新日志

👉 **[更新日志.md](./更新日志.md)**

| 版本 | 摘要 |
|------|------|
| v2.6 | 战斗强化：怪物特性、Boss三阶段、挂机战报 |
| v2.5 | 挂机药囊全自动用药 |
| v2.4 | 材料合成、主线章节事件 |
| v2.3 | 生活技能树、取消角色编辑、隐藏战力公式 |
| v2.2 | 地图 +20 格，Boss 红、宝箱紫 |
| v2.1 | 版本号展示、连线配色、拖线防抖 |
| v2.0 | 灵根、战力、不规则地图、战斗弹窗、装备图鉴 |
| v1.9.3 | 天时四象，去掉误入的海洋文案 |
| v1.9.2 | 修复天时函数缺失导致页面空白 |
| v1.9.1 | Boss 立绘、天时面板 |
| v1.8 | 导航像素图标、拖线挂机 |
| v1.7 | 连线地图、走格遇敌 |
| v1.6 | 钻石、拍卖会、战力 |
| v1.5 | 多文件拆分、像素风 UI、资源目录 |
| v1.4.1 | 地图、签到、宠物、生活修复 |
| v1.4 | 天赋、生活技能 |

**代码总行数：~1400 行**（html + css + js）
