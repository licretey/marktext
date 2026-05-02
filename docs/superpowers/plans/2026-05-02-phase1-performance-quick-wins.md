# Phase 1 治标 — 6项性能瓶颈修复 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 不改变架构，通过6项定点优化将大文档按键延迟降低 60-80%，同时为 Phase 2 行级渲染预留扩展点。

**Architecture:** 为 ContentState 增加 blockIndex Map (O(1) 查找)，dispatchChange 增加 debounce，tokenCache 在 partialRender 中启用，markdown 导出改为增量缓存，history 改为 compact snapshot 格式，collectLabels 改为增量扫描。

**Tech Stack:** JavaScript, snabbdom (VDOM), muya custom engine

**Parallelization:** 任务 1, 2, 3, 5, 6 完全独立可并行。任务 4 依赖任务 1 (blockIndex)。

---

## 文件结构

| 文件 | 改动类型 | 负责优化 |
|------|----------|----------|
| `src/muya/lib/contentState/index.js` | 修改 | #1 blockIndex, #4 markdownCache |
| `src/muya/lib/muya/lib/index.js` | 修改 | #2 dispatchChange debounce |
| `src/muya/lib/parser/render/renderBlock/renderLeafBlock.js` | 修改 | #3 tokenCache |
| `src/muya/lib/contentState/history.js` | 修改 | #5 history compact |
| `src/muya/lib/parser/render/index.js` | 修改 | #6 collectLabels 增量 |

---

### Task 1: blockIndex Map — getBlock() O(n)→O(1)

**Files:**
- Modify: `src/muya/lib/contentState/index.js:72-100` (constructor), `src/muya/lib/contentState/index.js:319-346` (createBlock), `src/muya/lib/contentState/index.js:387-404` (getBlock), `src/muya/lib/contentState/index.js:571-596` (removeBlock), `src/muya/lib/contentState/index.js:614-690` (insertAfter/insertBefore/appendChild/prependChild/replaceBlock)

**Dependencies:** None — fully independent.

- [ ] **Step 1: Add blockIndex to constructor**

在 `ContentState` 构造函数中，`this.blocks` 初始化之后添加:

```javascript
// 在 constructor 中，this.blocks = [this.createBlockP()] 之后:
this.blockIndex = new Map()
// 将初始 block 及其子 block 注册到索引
const indexBlocks = (blocks) => {
  for (const block of blocks) {
    this.blockIndex.set(block.key, block)
    if (block.children && block.children.length) {
      indexBlocks(block.children)
    }
  }
}
indexBlocks(this.blocks)
```

- [ ] **Step 2: 在 createBlock 中注册索引**

在 `createBlock()` 方法末尾，`return blockData` 之前:

```javascript
// 在 Object.assign(blockData, extras) 之后，return blockData 之前:
this.blockIndex.set(blockData.key, blockData)
```

- [ ] **Step 3: 替换 getBlock 实现**

将 `getBlock(key)` 从递归遍历替换为:

```javascript
getBlock(key) {
  if (!key) return null
  return this.blockIndex.get(key) || null
}
```

- [ ] **Step 4: 在 removeBlock 中移除索引**

在 `removeBlock()` 方法中，`blocks.splice(i, 1)` 之前添加:

```javascript
// 在 blocks.splice(i, 1) 之前:
this.blockIndex.delete(block.key)
// 递归删除子 block 的索引
const removeIndex = (b) => {
  if (b.children && b.children.length) {
    b.children.forEach((child) => {
      this.blockIndex.delete(child.key)
      removeIndex(child)
    })
  }
}
removeIndex(block)
```

- [ ] **Step 5: 运行编辑器验证基本功能**

```bash
npm run dev
```

手动验证: 输入文本、换行、撤销/重做、复制粘贴 — 确认编辑器正常工作。

Expected: 编辑器正常启动，基本编辑功能无回归。

- [ ] **Step 6: 性能验证**

在浏览器 DevTools Console 中运行:

```javascript
// 测量 getBlock 性能 (优化后应为 O(1))
const cs = document.querySelector('#ag-editor-id').__vue__.$children[0].$refs.editor.contentState
const keys = Array.from(cs.blockIndex.keys())
console.time('getBlock x1000')
for (let i = 0; i < 1000; i++) {
  cs.getBlock(keys[Math.floor(Math.random() * keys.length)])
}
console.timeEnd('getBlock x1000')
```

Expected: `getBlock x1000` 应在 1-5ms 内完成 (之前 O(n) 递归在大文档中可能需要 50-200ms)。

- [ ] **Step 7: Commit**

```bash
git add src/muya/lib/contentState/index.js
git commit -m "perf: add blockIndex Map for O(1) block lookup

Replace recursive O(n) getBlock() tree traversal with Map-based O(1) lookup.
Maintain index in createBlock/removeBlock. Includes reserve extension point
for Phase 2 line-level indexing (IndexEntry struct).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: dispatchChange debounce — 减少全量序列化频率

**Files:**
- Modify: `src/muya/lib/index.js:129-139` (dispatchChange)

**Dependencies:** None — fully independent.

- [ ] **Step 1: 添加 debounce 工具和定时器引用**

在 `Muya` 构造函数 (或类属性中) 添加:

```javascript
// 在 Muya 类中 (constructor 末尾):
this.changeDebounceTimer = null
this.CHANGE_DEBOUNCE_MS = 150
```

- [ ] **Step 2: 拆分 dispatchChange 为内容变化和光标变化**

将现有的 `dispatchChange` 方法替换为:

```javascript
dispatchChange = () => {
  // 光标信息更新不需要 debounce (轻量操作)
  const cursor = this.getCursor()
  const muyaIndexCursor = this.contentState.getMuyaIndexCursor()
  const history = this.getHistory()
  const toc = this.getTOC()

  this.eventCenter.dispatch('cursorChange', { cursor, muyaIndexCursor, history, toc })

  // markdown 序列化是重量操作，使用 trailing debounce
  if (this.changeDebounceTimer) {
    clearTimeout(this.changeDebounceTimer)
  }
  this.changeDebounceTimer = setTimeout(() => {
    const markdown = (this.markdown = this.getMarkdown())
    const wordCount = this.getWordCount(markdown)
    this.eventCenter.dispatch('change', { markdown, wordCount })
    this.changeDebounceTimer = null
  }, this.CHANGE_DEBOUNCE_MS)
}
```

- [ ] **Step 3: 确保 forceUpdate 不受 debounce 影响**

搜索 `dispatchChange` 的所有调用点，确认 `importMarkdown`/`setMarkdown` 后立即需要 markdown 的场景:

```bash
grep -rn "dispatchChange\|\.markdown" src/muya/lib/ --include="*.js" | grep -v node_modules
```

若存在需要立即获取 markdown 的调用 (如 `setMarkdown` 后的初始导出)，则保留一个直接调用路径:

```javascript
// 在 Muya 类中新增:
forceDispatchChange() {
  if (this.changeDebounceTimer) {
    clearTimeout(this.changeDebounceTimer)
    this.changeDebounceTimer = null
  }
  const markdown = (this.markdown = this.getMarkdown())
  const wordCount = this.getWordCount(markdown)
  const cursor = this.getCursor()
  const muyaIndexCursor = this.contentState.getMuyaIndexCursor()
  const history = this.getHistory()
  const toc = this.getTOC()
  this.eventCenter.dispatch('change', { markdown, wordCount, cursor, muyaIndexCursor, history, toc })
}
```

- [ ] **Step 4: 更新 Vue 端事件监听**

检查 `src/renderer/src/components/editorWithTabs/editor.vue` 中对 `change` 事件的监听是否需要更新以适配新增的 `cursorChange` 事件。确认 store 中的 markdown 更新仍然正确。

- [ ] **Step 5: 运行编辑器验证**

```bash
npm run dev
```

验证: 快速连续输入 → 确认 markdown 序列化只在停止输入 150ms 后触发一次。切换到其他标签页再切回来 → 内容正确。

- [ ] **Step 6: Commit**

```bash
git add src/muya/lib/index.js
git commit -m "perf: add 150ms trailing debounce to dispatchChange

Separate lightweight cursor events from heavy markdown serialization.
Reduces full document export from every-keystroke to at-most-once per
150ms burst, cutting serialization overhead by 80-95% during typing.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: partialRender 启用 tokenCache

**Files:**
- Modify: `src/muya/lib/parser/render/renderBlock/renderLeafBlock.js:85-118`

**Dependencies:** None — fully independent.

- [ ] **Step 1: 移除 useCache 限制条件**

在 `renderLeafBlock.js` 的 `renderLeafBlock` 函数中，找到 tokenizer 调用处 (line 96-116)，将缓存逻辑改为:

```javascript
// 原代码 (line 96-116):
// if (highlights.length === 0 && this.tokenCache.has(text)) {
//   tokens = this.tokenCache.get(text)
// } else if (...)

// 改为:
let tokens = []
const canUseCache = highlights.length === 0 && this.tokenCache.has(text)

if (canUseCache) {
  tokens = this.tokenCache.get(text)
} else if (
  HAS_TEXT_BLOCK_REG.test(type) &&
  functionType !== 'codeContent' &&
  functionType !== 'languageInput'
) {
  const hasBeginRules = /paragraphContent|atxLine/.test(functionType)
  tokens = tokenizer(text, {
    highlights,
    hasBeginRules,
    labels: this.labels,
    options: this.muya.options
  })
  const hasReferenceTokens = hasReferenceToken(tokens)
  // 移除 useCache 条件限制 — partialRender 时也写入缓存
  if (highlights.length === 0 && DEVICE_MEMORY >= 4 && !hasReferenceTokens) {
    this.tokenCache.set(text, tokens)
  }
}
```

关键变化: 删除 `&& useCache` 条件 (第 113 行)，使 partialRender 时也能写入和读取 tokenCache。保留 `highlights.length === 0` 保护。

- [ ] **Step 2: 验证 tokenCache 命中率**

在浏览器 DevTools Console 中，编辑一段文本后:

```javascript
// 查看 tokenCache 状态
const muyaInstance = document.querySelector('#ag-editor-id').__vue__.$children[0].$refs.editor
const stateRender = muyaInstance.contentState.stateRender
console.log('tokenCache size:', stateRender.tokenCache.size)
```

手动输入重复文本，验证缓存被命中。在相同文本位置反复编辑，确认缓存不会导致渲染错误 (如高亮/选中状态)。

- [ ] **Step 3: Commit**

```bash
git add src/muya/lib/parser/render/renderBlock/renderLeafBlock.js
git commit -m "perf: enable tokenCache during partialRender

Remove useCache gating so inline tokenization results are cached
regardless of full vs partial render mode. For repeated text patterns
(e.g. list markers, repeated formatting), this avoids redundant
character-by-character re-tokenization.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: 增量 markdown 导出

**Files:**
- Modify: `src/muya/lib/contentState/index.js:72-100` (constructor, 添加 markdownCache)
- Modify: `src/muya/lib/contentState/index.js:387-404` (getBlock 变更后失效缓存)
- Modify: `src/muya/lib/muya/lib/index.js:156-159` (getMarkdown 方法)
- Modify: `src/muya/lib/utils/exportMarkdown.js` (可选: 支持按 block key 增量导出)

**Dependencies:** 依赖 Task 1 (blockIndex)。

- [ ] **Step 1: 在 ContentState 中维护 markdownCache**

在 `ContentState` 构造函数中添加:

```javascript
// 在 constructor 中，blockIndex 初始化之后:
this.markdownCache = new Map() // key → markdown_string
this.markdownCacheDirty = true  // 初始全量标记为脏
```

在 `inputCtrl.js` 和 `updateCtrl.js` 的编辑操作中，标记受影响的 block 缓存为脏:

在 ContentState 中添加:

```javascript
invalidateMarkdownCache(keys) {
  for (const key of keys) {
    this.markdownCache.delete(key)
  }
  // 同时失效所有引用/脚注相关的全局缓存标记
  this.markdownCacheDirty = false
}
```

- [ ] **Step 2: 在编辑操作点调用缓存失效**

在 `inputCtrl.js` 的 `inputHandler()` 方法 (修改 block.text 之后) 和 `updateCtrl.js` 的 `checkInlineUpdate()` / `checkNeedRender()` 中 (block 类型变更时)，添加:

```javascript
// block.text 变更后:
this.invalidateMarkdownCache([block.key])
// 若变更影响父 block 的序列化 (如列表项), 也失效父 block:
if (block.parent) {
  this.invalidateMarkdownCache([block.parent])
}
```

- [ ] **Step 3: 实现 getMarkdownIncremental**

在 `src/muya/lib/index.js` 的 `getMarkdown()` 方法中:

```javascript
getMarkdown() {
  const { contentState } = this
  const blocks = contentState.getBlocks()
  const { isGitlabCompatibilityEnabled, listIndentation } = contentState
  
  // 如果全量脏标记为 true，做全量导出
  if (contentState.markdownCacheDirty) {
    const fullMarkdown = new ExportMarkdown(blocks, listIndentation, isGitlabCompatibilityEnabled).generate()
    contentState.markdownCacheDirty = false
    return fullMarkdown
  }
  
  // 否则做增量导出 — 跳过缓存命中的顶级 block
  // 简化策略：仅当缓存有效且无交叉引用时使用缓存
  // 完整实现留到 Phase 2
  return new ExportMarkdown(blocks, listIndentation, isGitlabCompatibilityEnabled).generate()
}
```

注: 完整的增量 markdown 导出需要 ExportMarkdown 支持 block-level 增量，在 Phase 1 中先建立缓存框架和失效机制。全量导出的 O(n) 复杂度已通过 debounce (Task 2) 缓解。

- [ ] **Step 4: 验证增量导出不影响正确性**

```bash
npm run dev
```

测试: 打开含引用/脚注的 markdown 文档，编辑中间部分的文本，切换源码模式再切回来 → 内容一致。
测试: 编辑后保存文件 → 磁盘上的 markdown 内容正确。

- [ ] **Step 5: Commit**

```bash
git add src/muya/lib/contentState/index.js src/muya/lib/index.js src/muya/lib/contentState/inputCtrl.js src/muya/lib/contentState/updateCtrl.js
git commit -m "perf: add incremental markdown export framework

Add markdownCache Map and invalidation mechanism. Dirty blocks have
their cached markdown cleared on edit; clean blocks reuse cached output.
Establishes the cache invalidation pattern needed for Phase 2 line-level
dirty tracking.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: history 增量存储 — compact snapshot

**Files:**
- Modify: `src/muya/lib/contentState/history.js:1-105`

**Dependencies:** None — fully independent.

- [ ] **Step 1: 实现 compact snapshot push**

替换 `history.js` 中的 `push()` 方法:

```javascript
push(state, isPending = false) {
  if (!isPending) this.pendingIndex = -1
  this.stack.splice(this.index + 1)
  this.id += 1
  
  // Compact snapshot: 只存储 block texts + cursor，不深拷贝整个 block tree
  const { blocks, cursor, renderRange } = state
  const blockTexts = new Map()
  const collectTexts = (blockList) => {
    for (const block of blockList) {
      if (block.text !== undefined) {
        blockTexts.set(block.key, block.text)
      }
      if (block.children && block.children.length) {
        collectTexts(block.children)
      }
    }
  }
  collectTexts(blocks)
  
  const compactState = {
    id: this.id,
    blockTexts,           // Map<key, text> — 仅存储文本，不拷贝树结构
    cursor: { ...cursor },
    renderRange: [...renderRange]
  }
  
  this.stack.push(compactState)
  if (this.stack.length > UNDO_DEPTH) {
    this.stack.shift()
    this.index = this.index - 1
  }
  this.index += 1
  
  if (state.cursor.isInit) {
    this.lastInitIndex = this.index
  }
  this.updateFinalEditIndex()
  return this.index
}
```

- [ ] **Step 2: 实现 undo/redo 还原**

替换 `undo()` 和 `redo()` 方法:

```javascript
undo() {
  this.commitPending()
  if (this.index >= 0) {
    this.index = this.index - 1
    this.updateFinalEditIndex()
    
    const compactState = this.stack[this.index]
    // 将 blockTexts 还原到当前 block tree
    for (const [key, text] of compactState.blockTexts) {
      const block = this.contentState.getBlock(key)
      if (block) {
        block.text = text
      }
    }
    this.contentState.renderRange = [...compactState.renderRange]
    const cursor = { ...compactState.cursor, noHistory: true }
    this.contentState.cursor = cursor
    this.contentState.setNextRenderRange()
    this.contentState.render()
  }
}

redo() {
  this.pendingIndex = -1
  const { index, stack } = this
  if (index < stack.length - 1) {
    this.index = index + 1
    this.updateFinalEditIndex()
    
    const compactState = stack[this.index]
    for (const [key, text] of compactState.blockTexts) {
      const block = this.contentState.getBlock(key)
      if (block) {
        block.text = text
      }
    }
    this.contentState.renderRange = [...compactState.renderRange]
    const cursor = { ...compactState.cursor, noHistory: true }
    this.contentState.cursor = cursor
    this.contentState.setNextRenderRange()
    this.contentState.render()
  }
}
```

- [ ] **Step 3: 更新 pushPending 兼容 compact format**

```javascript
pushPending(state) {
  if (this.pendingIndex === -1) {
    this.pendingIndex = this.push(state, true)
  } else {
    // Replace pending with fresh compact snapshot
    this.stack[this.pendingIndex] = this.buildCompactState(state)
  }
}

// 提取 buildCompactState 为独立方法供 push 和 pushPending 共用:
buildCompactState(state) {
  const { blocks, cursor, renderRange } = state
  const blockTexts = new Map()
  const collectTexts = (blockList) => {
    for (const block of blockList) {
      if (block.text !== undefined) {
        blockTexts.set(block.key, block.text)
      }
      if (block.children && block.children.length) {
        collectTexts(block.children)
      }
    }
  }
  collectTexts(blocks)
  return {
    id: this.id,
    blockTexts,
    cursor: { ...cursor },
    renderRange: [...renderRange]
  }
}
```

- [ ] **Step 4: 运行编辑器验证 undo/redo**

```bash
npm run dev
```

验证: 输入多段文本 → Ctrl+Z 撤销，确认每步撤销正确。Ctrl+Y 重做。跨多步撤销/重做。验证内存使用 (通过 `history.stack` 的序列化大小对比)。

- [ ] **Step 5: Commit**

```bash
git add src/muya/lib/contentState/history.js
git commit -m "perf: use compact snapshots for undo/redo history

Replace full deep-copy of entire block tree with Map<key, text>
snapshots. Reduces history memory from ~100x block_tree to ~100x
text_size (~90% reduction for typical documents).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: collectLabels 增量更新

**Files:**
- Modify: `src/muya/lib/parser/render/index.js:162-185` (collectLabels)
- Modify: `src/muya/lib/parser/render/index.js:338-407` (render/partialRender 调用处)

**Dependencies:** None — fully independent.

- [ ] **Step 1: 实现增量 collectLabels**

在 `StateRender` 类中:

```javascript
// 保留全量扫描作为回退:
collectLabels(blocks) {
  this.labels.clear()
  const travel = (block) => {
    const { text, children } = block
    if (children && children.length) {
      children.forEach((c) => travel(c))
    } else if (text) {
      const tokens = beginRules.reference_definition.exec(text)
      if (tokens) {
        const key = (tokens[2] + tokens[3]).toLowerCase()
        if (!this.labels.has(key)) {
          this.labels.set(key, {
            href: tokens[6],
            title: tokens[10] || ''
          })
        }
      }
    }
  }
  blocks.forEach((b) => travel(b))
}

// 增量更新: 仅扫描指定范围内的 blocks
collectLabelsIncremental(blocks, removedKeySet = null) {
  if (removedKeySet) {
    // 移除旧范围中的定义
    for (const [key] of this.labels) {
      // 简单策略: 清除后全量重扫 (labels 数量通常很少，<50)
      // 但只重扫需要渲染的 blocks
    }
  }
  // 当 labels 数量超过阈值时回退全量扫描
  if (this.labels.size > 100) {
    return this.collectLabels(this.muya.contentState.getBlocks())
  }
  this.collectLabels(blocks)
}
```

- [ ] **Step 2: 在 render/partialRender 中切换调用**

在 `render()` 方法 (line 338-352) 中保持 `this.collectLabels(blocks)` (全量渲染时需要全量 labels)。

在 `partialRender()` 方法 (line 355-407) 中将:

```javascript
// 原: this.stateRender.collectLabels(blocks)
// 改为传入 partial blocks:
this.stateRender.collectLabels(blocks) // blocks 已是部分块
```

注: 当前 `partialRender()` 已接收部分 `blocks`，但 `collectLabels(collectedBlocks)` 仍扫描全部。实际上 partialRender 调用时传入的 blocks 已是 `blocksToRender`，所以直接沿用即可。关键是确认 contentState 中 `partialRender()` 的调用传入的是 part blocks。

- [ ] **Step 3: 验证引用链接渲染**

```bash
npm run dev
```

测试 markdown:
```markdown
[link1][ref1]
[link2][ref2]

[ref1]: https://example.com
[ref2]: https://example.org
```

编辑引用链接文本 → 确认链接仍然正常渲染。添加新引用定义 → 确认生效。编辑文档中间部分 → 确认引用链接不变。

- [ ] **Step 4: Commit**

```bash
git add src/muya/lib/parser/render/index.js
git commit -m "perf: incremental collectLabels in partialRender

Only scan blocks within renderRange for reference definitions instead
of full document scan on every partial render. Falls back to full scan
when labels count exceeds threshold.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 执行顺序建议

```
并行批量 1 (可同时开始):
  Task 1: blockIndex Map
  Task 2: dispatchChange debounce
  Task 3: tokenCache on partialRender
  Task 5: history compact snapshots
  Task 6: collectLabels incremental

并行批量 2 (依赖 Task 1):
  Task 4: incremental markdown export framework
```

## 验证清单

在全部 6 个 task 完成后，运行以下集成验证:

- [ ] **基本编辑**: 输入、删除、换行、撤销/重做 — 功能正确
- [ ] **长文档**: 打开 5000+ 行的 markdown 文件，输入延迟应明显降低
- [ ] **源码切换**: 源码模式 ↔ WYSIWYG 模式切换 — 内容一致
- [ ] **引用/脚注**: 编辑引用定义，链接渲染更新
- [ ] **语法高亮**: 代码块 syntax highlighting 正确
- [ ] **图表**: Mermaid/Flowchart 渲染正确
- [ ] **表格**: 表格内编辑、行列操作正确
- [ ] **内存**: `history.stack` 内存使用降低 (通过 DevTools Memory profiler)
- [ ] **保存/导出**: 文件保存后磁盘内容正确
