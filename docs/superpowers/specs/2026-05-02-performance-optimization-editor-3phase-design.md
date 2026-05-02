# MarkText 性能优化 & 新编辑模式 — 三阶段设计

> **目标:** 分三阶段将 MarkText 编辑器从"大文档卡顿"优化到"任意长度近零延迟"，并引入新型纯净预览编辑模式。
> **架构原则:** source 作为唯一真相来源，渲染从 source 出发，不反向解析 DOM。

---

## Phase 1: 治标 — 6项瓶颈修复

**目标:** 不改变架构，快速降低每次按键的计算复杂度。大文档延迟降低 60-80%。

**涉及文件:**
- `src/muya/lib/contentState/index.js` — blockIndex, incremental export
- `src/muya/lib/muya/lib/index.js` — dispatchChange debounce
- `src/muya/lib/parser/render/renderBlock/renderLeafBlock.js` — tokenCache on partialRender
- `src/muya/lib/contentState/history.js` — incremental undo
- `src/muya/lib/parser/render/index.js` — incremental collectLabels

### 优化 1: blockIndex Map — `getBlock()` O(n)→O(1)

在 ContentState 中维护 `Map<key, block>`:
- `createBlock()` 时 `blockIndex.set(key, block)`
- `removeBlock()` 时 `blockIndex.delete(key)`
- `getBlock(key)` 改为 `return this.blockIndex.get(key)`
- 预留扩展: IndexEntry 结构 `{ block, lineStart, lineCount }` 为 Phase 2 行级索引铺路

### 优化 2: dispatchChange debounce

`muya/lib/index.js` 的 `dispatchChange()` 中:
- 增加 150ms trailing debounce，合并连续按键
- 光标变化事件独立于内容变化事件
- 光标事件不触发 getMarkdown()

### 优化 3: partialRender 启用 tokenCache

`renderLeafBlock.js` 中移除 `skipCache` 限制:
- tokenCache 在 partialRender 和 full render 中均生效
- 保留 highlights 存在时跳过缓存的逻辑

### 优化 4: 增量 markdown 导出

在 ContentState 中维护 `markdownCache: Map<key, string>`:
- 编辑时只失效 `renderRange` 内 block 的缓存
- `getMarkdown()` 优先从缓存读取，仅重序列化变更 block
- 引用定义/脚注的全局扫描改为按需扫描

### 优化 5: history 增量存储

用 fast-diff 的 patch 格式替代全量深拷贝:
- 每次编辑生成 patch(diff(oldSource, newSource))
- undo/redo 时 apply patch 到当前 source → 重渲染
- 内存从 100×block_tree 降为 100×patch_size

### 优化 6: collectLabels 增量更新

只扫描 `renderRange` 内的 blocks 的 reference definitions:
- 维护全局 `labels` Map
- 增量更新: 移除旧 range 内的定义，添加新 range 内的定义

---

## Phase 2: 治本 — 行级增量渲染

**目标:** 将渲染粒度从"块级替换"降到"行级 diff"。任意长度文档近零延迟。

**依赖 Phase 1 的准备工作:**
- blockIndex (含 lineStart/lineCount) → 行级定位
- 增量 markdown 导出 → 行级脏标记模式
- history 增量存储 → patch 格式天然适配行级操作

### 架构变更

#### 行模型

```
Block (现有)
  ├── key, type, parent, children, preSibling, nextSibling
  ├── text: string (source)
  ├── lines: Line[]          ← 新增
  └── ...

Line
  ├── index: number          行号 (block 内)
  ├── sourceStart: number    source 中起始偏移
  ├── sourceEnd: number      source 中结束偏移
  ├── dirty: boolean         脏标记
  ├── vnode: VNode | null    缓存的 VNode
  └── height: number         缓存的行高
```

#### 渲染流程

```
用户输入 → 标记当前行为 dirty
         → 遍历 blocks，对 dirty lines:
            1. tokenizer(line.source) → inline tokens
            2. renderInlines(tokens) → new VNode
            3. patch(oldVnode, newVnode) → 只更新该行 DOM
            4. 更新后续行的 Y 偏移 (CSS transform 或直接修改 top)
         → 清除 dirty 标记
```

#### 关键设计

- **行高缓存**: 每行渲染后记录 `getBoundingClientRect().height`，减少 layout thrashing
- **虚拟滚动准备**: 行模型直接支持未来的虚拟滚动 (只渲染可视区域内的行)
- **块级语法不变**: 表格/代码块/列表仍按 block 整体管理，内部行级渲染

---

## Phase 3: 新模式 — 双层架构纯净预览编辑

**目标:** 语法标记完全透明化，用户只看到富文本渲染结果。语法错误时透传原始文本。光标行用双层结构 (隐藏 contenteditable + 可见渲染层 + 段表坐标映射)。

### 行状态模型

#### 只读行 (非光标行)

```
┌─────────────────────┐
│ 可见 DOM: 渲染富文本   │  ← 只读，contenteditable="false"
│ 缓存: source 字符串    │  ← 真相来源，无需同步
└─────────────────────┘
```

#### 光标行 (编辑行)

```
┌─────────────────────────────┐
│ 可见层 (只读 DOM)             │  ← 渲染结果 + 模拟光标
│   z-index: 2                 │
├─────────────────────────────┤
│ 隐藏层 (contenteditable)     │  ← 原始 source + 键盘/IME
│   opacity: 0, z-index: 1    │
└─────────────────────────────┘
```

### 段表 (Segment Table)

每次隐藏层 source 变化后重建:

```
tokenizer(source) → [
  { type: 'text',   sourceRange: [0,6),   displayRange: [0,6)   },  // 1:1
  { type: 'strong', sourceRange: [6,15),  displayRange: [6,11)  },  // 吸收4字符
  { type: 'text',   sourceRange: [15,21), displayRange: [11,17) },  // 1:1
]
```

**source→display 坐标转换:** 遍历段表累加 offset，有效语法段减去被吸收的标记字符数。
**display→source 坐标转换:** 反向遍历，有效语法段加回被吸收的标记字符数。

复杂度 O(segments)，一行通常 1-10 个段，接近常数时间。

### 编辑流程

```
1. 用户按键
   ↓
2. 隐藏层 contenteditable 接收输入 (浏览器原生处理)
   ↓
3. 读取隐藏层光标位置 → source 坐标
   ↓
4. 重建段表: tokenizer(hiddenLayer.textContent)
   ↓
5. 用段表渲染可见层 (遍历段，有效语法→富文本，破损语法→透传)
   ↓
6. source 坐标 → display 坐标 (通过段表转换)
   ↓
7. 绝对定位模拟光标到 display 坐标位置
```

### 行切换

```
旧光标行离开:
  1. 读取隐藏层 source
  2. 更新 block.source 缓存
  3. 全量渲染 source → 只读 DOM
  4. 移除双层结构

新光标行进入:
  1. 读取 block.source 缓存
  2. 建立双层结构 (隐藏 contenteditable + 可见层)
  3. tokenizer(source) → 段表
  4. 渲染可见层
  5. source 坐标 → display 坐标 → 定位模拟光标
```

### 撤销栈

直接在 source 上操作:
- `pushSnapshot(source)` — 记录当前 source 快照
- `undo()` → 还原 source → tokenize → 段表 → 重渲染
- 完全绕开 DOM 历史

### 跨行块级语法

表格、代码块等涉及多行的块级语法:
- 将涉及的所有行视为一个编辑单元
- 进入其中任意一行 → 整个单元切换为光标行状态
- 选区端点分别做 display→source 转换 → 直接在 source 上切割拼接 → 重渲染

### 关键技术风险

| 风险 | 缓解 |
|------|------|
| **IME 组合输入** — 隐藏层 composition 需镜像到可见层 | compositionupdate 中读取隐藏层文本，临时透传到可见层占位区域 |
| **模拟光标像素精度** — 绝对定位需精确匹配字体度量 | Canvas measureText() 或隐藏 span + getBoundingClientRect 测量 |
| **行内折行** — 长行折行后光标需跨多行定位 | Range.getClientRects() 检测折行点 |
| **复制/粘贴** — 渲染文本 vs source 文本 | 复制用 source 提取纯文本；粘贴走 source 插入→段表→重渲染 |

### 可复用的 muya 模块

- `parser/index.js` tokenizer() — 直接用于段表构建
- `parser/render/renderInlines/*` — 25+ inline 渲染器用于可见层
- `contentState/index.js` block tree — 结构不变，增加行级字段
- `parser/marked/lexer.js` — 块级解析不变
- `utils/importMarkdown.js` — 初始加载不变
- `utils/exportMarkdown.js` — 导出直接用 source 拼接

### 需要重写的 muya 模块

- `contentState/inputCtrl.js` (377行) — 不再操作 contenteditable DOM
- `selection/index.js` (715行) — 替换为段表坐标系统
- `selection/cursor.js` — 模拟光标替代浏览器光标
- `parser/render/index.js` partialRender — 行级替换块级
- `contentState/clickCtrl.js` — display→source 坐标转换
- `contentState/backspaceCtrl.js`, `enterCtrl.js` — 改为直接操作 source

---

## 三阶段总览

| 阶段 | 目标 | 改动量 | 工时 | 收益 |
|------|------|--------|------|------|
| 1. 治标 | 6项瓶颈修复 | ~350行 | 3-5天 | 大文档延迟 ↓60-80% |
| 2. 治本 | 行级增量渲染 | ~1500行 | 2-3周 | 任意长度近零延迟 |
| 3. 新模式 | 双层架构纯净预览 | ~2000行 | 3-4周 | 差异化体验 |
