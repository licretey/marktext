# MarkText 性能优化与现代化方案 — 设计文档

版本 1.0 · 2026-04-30 · 方案 A（渐进升级）

---

## 1. 背景与目标

### 1.1 当前技术栈

| 层 | 技术 | 版本 | 问题 |
|----|------|------|------|
| 桌面框架 | Electron | 18.x | Chromium 内核老化 |
| UI 框架 | Vue 2.6 + Vuex 3 + Vue Router 3 | ^2.6.14 | 社区维护减少 |
| 组件库 | Element UI | ^2.15.8 | 与 Vue 3 不兼容 |
| 构建 | Webpack 5 + Babel | ^5.72.0 | 开发冷启动慢 |
| 编辑器核心 | Muya (自研) | 0.1.2 | 大文档性能瓶颈 |
| 测试 | Karma + Mocha / Playwright | — | — |

### 1.2 待解决的性能问题

| 编号 | 问题 | 现象 | 根因方向 |
|------|------|------|----------|
| A | 大文件打开慢 | 5000+ 行 Markdown 加载 > 3s | 全量同步解析 + 全量 DOM 渲染 |
| B | 编辑大文件卡顿 | 输入到屏幕更新延迟 > 50ms | 每次 input 触发完整管线 (parse→diff→patch) |
| C | 特殊内容渲染慢 | 大量公式/表格/Mermaid 的文档滚动掉帧 | KaTeX/Mermaid 同步阻塞主线程 |
| D | 开发冷启动慢 | `yarn run dev` 20-30s | ESLint 阻塞 webpack + Babel 转译慢 |
| E | 技术栈老化 | Vue 2/EOL dep 安全风险 | 框架版本落后 |

### 1.3 优化目标

| 指标 | 现状 | 目标 |
|------|------|------|
| `yarn run dev` 冷启动 | 20-30s | < 10s |
| `yarn run dev` 二次启动 | 15-20s | < 5s |
| 5000 行 Markdown 打开 | ~3s | < 1s |
| 编辑输入延迟 (P95) | > 50ms | < 16ms (60fps) |
| 含 50+ 公式文档滚动 | 掉帧 | 流畅 60fps |
| 构建后包体大小 | 基准 | 不增加 > 10% |

### 1.4 约束

- 优先稳定性：每个阶段独立可测可回退
- 最小改动：总计 ~380 行，不重构核心架构
- Vue 迁移走 `@vue/compat` 兼容模式，不改写现有组件逻辑
- Muya 保持纯浏览器 API 约束，不加 Node/Electron 依赖

---

## 2. 总体架构

```
┌──────────────────────────────────────────────────────────┐
│                    MarkText 应用                         │
├──────────────────────────────────────────────────────────┤
│  Main Process (src/main/)                                │
│  Electron 30+ · 几乎不改动 · 窗口管理 / IPC / 文件IO      │
├──────────────────────────────────────────────────────────┤
│  Renderer Process (src/renderer/)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Vue 3 (@vue/compat) · Element Plus · Vuex 4     │   │
│  │ Vue Router 4 · mitt (Event Bus)                  │   │
│  │ 46 SFC 组件 · 8 Vuex Module · 命令面板            │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Muya (src/muya/) · 纯浏览器 API                   │   │
│  │ ContentState → Block Tree → Snabbdom → DOM        │   │
│  │ 补丁: 虚拟滚动 · 输入节流 · 懒渲染                  │   │
│  └──────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│  Build: Webpack 5 + SWC · ESLint 分离 · Filesystem Cache │
└──────────────────────────────────────────────────────────┘
```

### 改动边界

- **src/renderer/** — Vue 3 迁移（改动可控）
- **src/muya/** — 性能补丁（只加不改）
- **src/main/** — 几乎不动
- **.electron-vue/** — Webpack 配置调优
- **package.json** — 依赖版本升级

---

## 3. 分阶段实施计划

共 4 个阶段，12 个任务。阶段间低耦合，可并行推进（详见第 5 节并行策略）。

```
阶段1 (构建链)    阶段2 (Electron)    阶段3 (Vue 3)      阶段4 (Muya)
▇▇▇▇▇▇▇▇▇▇      ▇▇▇▇▇▇▇▇▇▇        ▇▇▇▇▇▇▇▇▇▇        ▇▇▇▇▇▇▇▇▇▇
1.1 ESLint分离    2.1 Electron升级    3.1 依赖替换        4.1 虚拟滚动
1.2 SWC替换Babel  2.2 原生模块验证    3.2 compat启动      4.2 输入节流
1.3 持久化缓存                         3.3 Element Plus   4.3 懒渲染
                                       3.4 Event Bus替换
                                       3.5 警告修复
```

---

## 4. 分阶段详细任务

### 阶段 1：构建链优化（改动极小、收益最高、无业务逻辑影响）

#### 任务 1.1 — ESLint 移出 webpack 编译管线

**目标**：删除 webpack 中的 ESLintPlugin，消除编译时阻塞。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `.electron-vue/webpack.main.config.js` | 删除 `ESLintPlugin` 相关代码 (~15行) | 删除 import / new ESLintPlugin() / 相关配置 |
| `.electron-vue/webpack.renderer.config.js` | 删除 `ESLintPlugin` 相关代码 (~18行) | 同上 |
| `package.json` | 无改动 | `lint` / `lint:fix` 脚本保持不变 |

**验证清单：**
- [ ] `yarn run dev` 启动，确认无 ESLint 报错消失
- [ ] `yarn run lint` 独立运行，确认检查正常
- [ ] `yarn run pack` 生产构建正常

**预估改动量**：-33 行

---

#### 任务 1.2 — Babel 替换为 SWC

**目标**：用 SWC 替代 Babel 进行 JS 转译，提升编译速度 5-10x。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 删除 7 个 `@babel/*` devDependencies，增加 `swc-loader` + `@swc/core` | — |
| `.electron-vue/webpack.main.config.js` | `babel-loader` → `swc-loader` (~5行改动) | — |
| `.electron-vue/webpack.renderer.config.js` | `babel-loader` → `swc-loader` (~8行改动) | — |
| `src/muya/webpack.config.js` | 同步替换 (~3行改动) | — |
| `.swcrc` | **新建** (~10行) | SWC 配置文件 |

**`.swcrc` 配置：**
```json
{
  "jsc": {
    "parser": { "syntax": "ecmascript" },
    "target": "es2015",
    "loose": true
  },
  "module": { "type": "commonjs" },
  "sourceMaps": true
}
```

**验证清单：**
- [ ] 三个 webpack config 编译通过
- [ ] `yarn run unit` 所有测试通过
- [ ] `yarn run e2e` 通过
- [ ] 生产构建产物尺寸不增加 > 5%

**预估改动量**：+26 行 / -7 个包

---

#### 任务 1.3 — Webpack 持久化缓存启用

**目标**：开发模式下启用 filesystem cache，二次启动加速 80%+。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `.electron-vue/webpack.renderer.config.js` | 开发模式 `cache: { type: 'filesystem' }` (~3行) | — |
| `.electron-vue/webpack.main.config.js` | 已有缓存配置，无需改动 | — |

**说明**：之前 svgo-loader 阻塞缓存的问题已绕过——开发模式下 SVG sprite 不重新生成，保持使用已有产物。

**验证清单：**
- [ ] `yarn run dev` 首次启动，确认 `.cache/webpack/` 目录生成
- [ ] 停止后再次 `yarn run dev`，确认编译时间显著缩短
- [ ] `yarn run pack` 无缓存冲突

**预估改动量**：+3 行

---

### 阶段 2：Electron 升级

#### 任务 2.1 — Electron 版本升级

**目标**：Electron 18 → 30+ LTS，获得 Chromium 内核性能提升。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | `electron` 版本改为 `^30.0.0` | — |
| `package.json` | `electron-builder` 升级到最新兼容版 | — |
| `package.json` | `electron-rebuild` 升级到最新 | — |
| `src/main/index.js` | 检查 `@electron/remote` 初始化代码兼容性 | `remoteInitializeServer()` API |

**已知风险点：**
- `@electron/remote` v2.x → 需验证 Electron 30 兼容性
- `electron-store` 可能需升级到 v9+
- `electron-log` 可能需升级到 v5+

**验证清单：**
- [ ] `yarn install` 无原生模块编译错误
- [ ] `electron-rebuild -f` 全部通过
- [ ] keytar、fontmanager-redux 等原生模块编译成功
- [ ] `yarn run build:bin` 打包成功
- [ ] 基础功能冒烟：窗口创建 / 文件打开 / 菜单 / 设置 / 主题切换

**预估改动量**：~5 行版本号 + 升级验证

---

#### 任务 2.2 — 原生模块兼容性验证

**目标**：确认所有 `.node` 原生 addon 在新 Electron 下正常工作。

**涉及模块：**
- `keytar` — 密码存储
- `fontmanager-redux` — 字体管理
- `native-keymap` — 键盘布局
- `vscode-ripgrep` — 文件搜索

**验证清单：**
- [ ] 应用启动无 `dlopen` 错误
- [ ] 密码/密钥存储读写正常
- [ ] 字体列表加载正常
- [ ] 键盘快捷键映射正确
- [ ] 文件内搜索功能正常

**预估改动量**：0 行（验证任务）

---

### 阶段 3：Vue 3 渐进迁移

#### 任务 3.1 — 依赖替换

**目标**：替换所有框架级依赖为 Vue 3 生态版本。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | `vue@^2.6.14` → `vue@^3.5.0` + `@vue/compat@^3.5.0` | Vue 3 + 兼容层 |
| `package.json` | `vuex@^3.6.2` → `vuex@^4.1.0` | Store |
| `package.json` | `vue-router@^3.5.3` → `vue-router@^4.4.0` | Router |
| `package.json` | `vue-electron` 删除 | Vue 3 不需要 |
| `package.json` | `vue-template-compiler` 删除 | Vue 3 不需要 |
| `package.json` | `element-ui` → `element-plus` | 组件库 |
| `package.json` | `babel-plugin-component` 删除 | Element Plus 用不同按需加载 |
| `package.json` | `vue-loader` → `vue-loader@^17` | 适配 Vue 3 SFC 编译 |
| `package.json` | 新增 `mitt` | Event Bus 替代 |
| `package.json` | 新增 `@element-plus/icons-vue` | Element Plus 图标 |

**验证清单：**
- [ ] `yarn install` 无依赖冲突
- [ ] 依赖树无 `vue@2` 残留

**预估改动量**：~25 行 package.json

---

#### 任务 3.2 — Vue 3 Compat 模式启动

**目标**：用 `@vue/compat` 让 Vue 2 代码在 Vue 3 下运行，不改业务逻辑。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/main.js` | 重写入口 (~40行) | `new Vue()` → `createApp()` + `configureCompat()` |
| `src/renderer/bootstrap.js` | 检查兼容性 | 确认 `global.marktext = {}` 初始化无冲突 |
| `src/renderer/router/index.js` | `new VueRouter()` → `createRouter()` | 路由创建方式变更 |

**`src/renderer/main.js` 核心改动示意：**
```js
import { createApp, configureCompat } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHashHistory } from 'vue-router'
import mitt from 'mitt'

// 事件总线替换 Vue.prototype.$bus
const emitter = mitt()

const app = createApp({
  store: createStore({ /* ... */ }),
  router: createRouter({ history: createWebHashHistory(), routes }),
  template: '<router-view class="view"></router-view>'
})

// 服务注入
services.forEach(s => {
  app.config.globalProperties['$' + s.name] = s[s.name]
})

app.config.globalProperties.$http = axios
app.config.globalProperties.$eventBus = emitter

app.mount('#app')
```

**验证清单：**
- [ ] `yarn run dev` Vue 3 compat 模式启动无报错
- [ ] 编辑器窗口加载正常
- [ ] Electron IPC 通信正常（`mt::` 事件）
- [ ] 所有 Vuex module 加载正常
- [ ] 路由跳转正常

**预估改动量**：~50 行

---

#### 任务 3.3 — Element Plus 组件适配

**目标**：Element UI → Element Plus，API 差异修复。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/main.js` | 替换 Element 组件导入路径 (~30行) | `element-ui` → `element-plus` |
| `src/renderer/assets/styles/index.css` | 替换主题引入 | `element-ui/lib/theme-chalk/index.css` → Element Plus CSS |

**Element Plus 与 Element UI 的主要 API 差异：**
- 图标独立为 `@element-plus/icons-vue`
- `el-form-item` 的 `label-width` 改为 `label-width` prop
- `el-dialog` 的 `visible` → `model-value`

**验证清单：**
- [ ] 所有 Element 组件渲染无异常
- [ ] 设置窗口 UI 正常
- [ ] 侧边栏面板正常
- [ ] 命令面板正常
- [ ] 内联工具栏/表情选择器/快速插入正常

**预估改动量**：~40 行

---

#### 任务 3.4 — Event Bus 替换

**目标**：Vue 2 的 `$on/$off/$emit` Event Bus 用 `mitt` 替换。

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/renderer/bus.js` | EventEmitter → mitt() | API 兼容 |
| `src/renderer/main.js` | 注入 `$eventBus` | 替换旧 `Vue.prototype.$bus` |

**`bus.js` 改动示意：**
```js
// 旧: import Vue from 'vue'
// 旧: export default new Vue()
// 新:
import mitt from 'mitt'
export default mitt()
```

所有 `bus.$on()` / `bus.$emit()` / `bus.$off()` 调用处 **无需改动**——mitt API 与 Vue Event Bus 完全兼容。

**验证清单：**
- [ ] `bus.$emit('file-changed', ...)` 监听正常
- [ ] `bus.$emit('show-command-palette', ...)` 正常
- [ ] 命令注册/注销事件正常
- [ ] 无遗漏的 `$on/$off` 调用

**预估改动量**：~3 行

---

#### 任务 3.5 — Vue 2 已废弃 API 警告修复

**目标**：消除 `@vue/compat` 运行时警告，为后续去 compat 做准备。

**需修复的警告类型及文件范围：**

| 警告类型 | 影响文件 (预估) | 修复方式 |
|----------|----------------|---------|
| `<slot slot="xxx">` | ~8 个 `.vue` | → `<template #xxx>` |
| `v-model` 旧语法 | ~15 个 `.vue` | → `modelValue` + `update:modelValue` |
| `$listeners` | ~5 个 `.vue` | → `$attrs` (Vue 3 自动合并) |
| `filters` | ~3 个 `.vue` | → `computed` / `methods` |
| `Vue.set() / Vue.delete()` | ~5 个 `.js` | → 直接赋值 (Vue 3 Proxy 响应式) |
| 生命钩子 `beforeDestroy` | ~10 个 `.vue` | → `beforeUnmount` |

**验证清单：**
- [ ] 浏览器控制台 `[Vue compat]` 警告清空
- [ ] 所有现有功能正常

**预估改动量**：~80 行

---

### 阶段 4：Muya 性能补丁

#### 任务 4.1 — 大文档虚拟滚动

**目标**：只渲染可视区 (±1 屏) 的 block，其余用占位 div 保留滚动条高度。

**实施方案：**

在 `ContentState.render()` 输出前加视口裁剪层：

1. 监听容器滚动事件，计算当前 `scrollTop` 对应的 block 索引范围
2. 只对 `[startIndex - 1, endIndex + 1]` 范围的 block 执行 snabbdom patch
3. 用哨兵 div（总高度 = 裁剪掉的 block 高度之和）维持滚动条
4. 文档导出、搜索等全量操作走原有管线不变

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/muya/lib/contentState/index.js` | 加视口过滤 (~30行) | render() 入口加裁剪 |
| `src/muya/lib/utils/viewportFilter.js` | **新建** (~30行) | 计算可见 block 范围 |
| `src/muya/lib/assets/styles/virtualScroll.css` | **新建** (~15行) | 占位 div 样式 |

**验证清单：**
- [ ] 5000 行 Markdown 打开 < 1s
- [ ] 滚动流畅 60fps，无白屏闪烁
- [ ] 滚动位置记忆正常（切 Tab 返回保持位置）
- [ ] Ctrl+F 搜索不受影响（搜索走全量 block tree）
- [ ] 导出 HTML/PDF 包含完整内容
- [ ] 源码模式切换正常

**预估改动量**：~75 行

---

#### 任务 4.2 — 输入事件合并节流

**目标**：将高频 `input` 事件用 `requestAnimationFrame` 合并，减少 parse→diff→patch 调用次数。

**实施方案：**

1. 在 `Keyboard` 事件处理器中，`input` 事件不再直接触发渲染
2. 改为标记 `dirty = true`，在下一个 `requestAnimationFrame` 中统一处理
3. 对中文输入法特殊处理：
   - `compositionstart` → 暂停渲染更新
   - `compositionupdate` → 只更新 composition 预览
   - `compositionend` → 恢复并触发一次完整渲染

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/muya/lib/eventHandler/keyboard.js` | 加节流逻辑 (~35行) | input/composition 事件改造 |

**验证清单：**
- [ ] 英文输入无卡顿感
- [ ] 中文（拼音/五笔）输入法不闪烁、不丢字
- [ ] 日语输入法正常
- [ ] 撤销/重做正常（undo stack 没有多余状态）
- [ ] 粘贴大段文本正常

**预估改动量**：~35 行

---

#### 任务 4.3 — 公式/图表懒渲染

**目标**：KaTeX/Mermaid/Flowchart 等重渲染仅在 block 进入视口时执行。

**实施方案：**

1. 在 `div`/`pre`/`figure` 块的渲染逻辑中，用 `IntersectionObserver` 包装
2. 块进入视口时调用 `katex.renderToString()` / `mermaid.run()`
3. 视口外的块显示占位骨架，渲染结果缓存到 block 对象上
4. 导出的全量管线不经过 IntersectionObserver

**文件改动：**

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/muya/lib/contentState/render/lazyRender.js` | **新建** (~35行) | IntersectionObserver 包装器 |
| 相关 block 渲染函数 | 加懒渲染调用 (~15行) | div/pre/figure 的 functionType 路由加判断 |

**验证清单：**
- [ ] 含 50+ KaTeX 公式的文档滚动流畅
- [ ] 含 Mermaid/Flowchart 的文档初次渲染不阻塞
- [ ] 公式显示正确（无 layout shift）
- [ ] 导出 HTML 含所有公式
- [ ] 打印/PDF 导出正常

**预估改动量**：~50 行

---

## 5. 并行开发策略

### 5.1 依赖图

```
任务1.1 (ESLint) ──┐
                    ├── 阶段1并行块 ──┐
任务1.2 (SWC)    ──┤                 │
                    │                 ├── Vue3迁移 ── 阶段4
任务1.3 (Cache)   ──┘                 │    (独立)
                                      │
任务2.1 (Electron) ── 阶段2 ──┐       │
              ──┐              ├── 集成测试
任务2.2 (验证)  ──┘              │
                                 │
任务3.1 (依赖) ──┐               │
任务3.2 (compat) ──┤              │
任务3.3 (Element+)─├─ 阶段3 ──┐  │
任务3.4 (EventBus)─┤          ├──┘
任务3.5 (警告修复)─┘          │
                              │
任务4.1 (虚拟滚动)─┐           │
任务4.2 (节流)  ──├─ 阶段4 ───┘
任务4.3 (懒渲染) ─┘
```

### 5.2 并行分组

**第 1 波（不依赖其他任务，可同时开工）：**
- 组 A：任务 1.1 + 1.2 + 1.3（同一个人，串行快）
- 组 B：任务 2.1 + 2.2（同一个人，Electron 升级）
- 组 C：任务 4.1 + 4.2 + 4.3（同一个人，Muya 补丁）

**第 2 波（依赖阶段 1/2 完成，可和第 1 波 C 组并行）：**
- 组 D：任务 3.1 → 3.2 → 3.3 → 3.4 → 3.5（串行，Vue 3 迁移）

### 5.3 3 人并行最短时间线

```
            Day1  Day2  Day3  Day4  Day5
人员A (构建)  ▇▇▇▇▇          (完成)
人员B (Elect) ▇▇▇▇▇▇▇▇▇     (完成)
人员C (Muya)  ▇▇▇▇▇▇▇▇▇▇▇▇▇  (完成)
人员A (Vue3)             ▇▇▇▇▇▇▇▇▇▇
```

---

## 6. 风险评估与回退策略

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| SWC 编译产物与 Babel 有差异 | 低 | 中 | 对比生产构建产物，如有差异回退到 Babel |
| Electron 30 的原生模块编译失败 | 中 | 高 | `electron-rebuild` 失败则降级到 Electron 28 LTS |
| `@vue/compat` 未覆盖某些 Vue 2 API | 中 | 中 | compat 显示警告不阻塞运行，逐项修复 |
| Element Plus 部分组件 API 不兼容 | 低 | 中 | 逐个组件检查，用 Element Plus 等价 API 替换 |
| 虚拟滚动影响搜索/Ctrl+F | 低 | 高 | 搜索不走虚拟滚动管线，直接查 block tree |
| 输入节流导致 undo stack 异常 | 低 | 中 | 节流只在 input 层，不改变 ContentState 的状态管理 |

### 回退原则

- 每个任务独立提交，出问题可 `git revert` 单次提交
- 阶段 3（Vue 3）整体可回退——compat 模式的 Vue 2 代码在新旧 Vue 下都能跑
- 阶段 4（Muya 补丁）每个补丁独立开关，出问题关掉不影响其他功能

---

## 7. 验收矩阵

| 编号 | 验收项 | 方法 | 通过标准 |
|------|--------|------|----------|
| V1 | `yarn run dev` 冷启动 | 计时 | < 10s |
| V2 | `yarn run dev` 二次启动 | 计时 | < 5s |
| V3 | 5000 行 Markdown 打开 | 计时 | < 1s |
| V4 | 输入延迟 | Performance 面板 | P95 < 16ms |
| V5 | 50+ 公式文档滚动 | 目测 + FPS meter | 60fps 无掉帧 |
| V6 | `yarn run lint` | 运行 | 0 errors |
| V7 | `yarn run unit` | 运行 | 全部通过 |
| V8 | `yarn run e2e` | 运行 | 全部通过 |
| V9 | `yarn run pack` | 构建 | 产物尺寸 < 旧版 × 1.1 |
| V10 | 中文/日文输入法 | 手动 | 无闪烁、无丢字 |
| V11 | 撤销/重做 | 手动 | 行为正常 |
| V12 | HTML/PDF 导出 | 手动 | 内容完整 |
| V13 | 源码模式切换 | 手动 | 内容不丢失 |

---

## 8. 审查记录

| 日期 | 审查者 | 版本 | 备注 |
|------|--------|------|------|
| 2026-04-30 | — | v1.0 | 初稿 |
