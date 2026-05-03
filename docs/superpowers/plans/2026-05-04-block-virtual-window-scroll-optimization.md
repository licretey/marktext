# Block Virtual Window Scroll Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate scroll stutter during pure browsing by rendering only viewport-adjacent blocks as real DOM; off-screen blocks use lightweight placeholder divs with cached heights.

**Architecture:** Three new modules under `src/muya/lib/virtualScroll/` — HeightCache stores per-block pixel heights, ViewportDetector computes visible/buffer/placeholder sets, VirtualScrollManager wires them together and hooks into StateRender. Existing `partialRender()` is extended to emit `<div data-placeholder>` for off-screen blocks instead of full snabbdom VNodes. Cursor block is always force-rendered for contenteditable safety.

**Tech Stack:** JavaScript (ES modules), snabbdom VNode system, mocha+chai for unit tests

**Parallel execution:** Task 1 + Task 2 + Task 8 can run in parallel (independent files with agreed interface). Task 3 requires 1+2 done. Task 4+5+6 can run in parallel after 3 done. Task 7 depends on 4+5.

---

### Task 1: HeightCache — per-block pixel height storage

**Files:**
- Create: `src/muya/lib/virtualScroll/heightCache.js`
- Create: `test/unit/specs/heightCache.spec.js`

**Interface contract (also used by Task 2, coded in parallel):**
```js
class HeightCache {
  get(key)        // -> number | undefined
  set(key, h)     // -> void
  invalidate(key) // -> void
  invalidateAfter(key) // -> void
  clear()         // -> void
  get size()      // -> number
}
```

- [ ] **Step 1: Write the failing test**

```js
// test/unit/specs/heightCache.spec.js
import HeightCache from '../../../src/muya/lib/virtualScroll/heightCache'

describe('HeightCache', () => {
  let cache
  beforeEach(() => { cache = new HeightCache() })

  it('get returns undefined for unknown key', () => {
    expect(cache.get('abc')).to.be.undefined
  })

  it('set then get returns stored height', () => {
    cache.set('k1', 42)
    expect(cache.get('k1')).to.equal(42)
  })

  it('set overwrites existing height', () => {
    cache.set('k1', 42)
    cache.set('k1', 99)
    expect(cache.get('k1')).to.equal(99)
  })

  it('size reflects unique keys', () => {
    expect(cache.size).to.equal(0)
    cache.set('a', 10)
    cache.set('b', 20)
    expect(cache.size).to.equal(2)
    cache.set('a', 30) // overwrite, not new
    expect(cache.size).to.equal(2)
  })

  it('invalidate removes a single key', () => {
    cache.set('a', 10)
    cache.set('b', 20)
    cache.invalidate('a')
    expect(cache.get('a')).to.be.undefined
    expect(cache.get('b')).to.equal(20)
    expect(cache.size).to.equal(1)
  })

  it('invalidate is no-op for unknown key', () => {
    cache.set('a', 10)
    cache.invalidate('zzz')
    expect(cache.size).to.equal(1)
  })

  it('invalidateAfter removes all keys after given key in order sequence', () => {
    // simulate ordered block keys: k0, k1, k2, k3, k4
    cache.set('k0', 10)
    cache.set('k1', 20)
    cache.set('k2', 30)
    cache.set('k3', 40)
    cache.set('k4', 50)
    // order list represents document order
    cache.setOrder(['k0', 'k1', 'k2', 'k3', 'k4'])
    cache.invalidateAfter('k2')
    expect(cache.get('k0')).to.equal(10)
    expect(cache.get('k1')).to.equal(20)
    expect(cache.get('k2')).to.equal(30) // key itself kept
    expect(cache.get('k3')).to.be.undefined
    expect(cache.get('k4')).to.be.undefined
    expect(cache.size).to.equal(3)
  })

  it('invalidateAfter without order list invalidates nothing beyond the key', () => {
    cache.set('a', 10)
    cache.set('b', 20)
    cache.invalidateAfter('a')
    // without setOrder, invalidateAfter can't know what "after" means
    expect(cache.get('a')).to.equal(10)
    expect(cache.get('b')).to.equal(20)
  })

  it('clear removes all entries', () => {
    cache.set('a', 10)
    cache.set('b', 20)
    cache.clear()
    expect(cache.size).to.equal(0)
    expect(cache.get('a')).to.be.undefined
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx mocha --require @babel/register test/unit/specs/heightCache.spec.js`
Expected: FAIL — module not found or class not defined

- [ ] **Step 3: Write minimal implementation**

```js
// src/muya/lib/virtualScroll/heightCache.js

// Per-block pixel height cache.
// Stores height + metadata in a Map<blockKey, Entry>.
// Supports ordered invalidation for insert/delete scenarios.
class HeightCache {
  constructor() {
    this._cache = new Map()
    this._order = null // Array<string> block keys in document order
  }

  /** @param {string[]} keys — block keys in document order */
  setOrder(keys) {
    this._order = keys
  }

  /** @returns {number|undefined} cached height in px */
  get(key) {
    const entry = this._cache.get(key)
    return entry ? entry.height : undefined
  }

  /** @param {number} height — px value from getBoundingClientRect().height */
  set(key, height) {
    const prev = this._cache.get(key)
    this._cache.set(key, {
      height,
      version: prev ? prev.version + 1 : 1,
      measuredAt: Date.now()
    })
  }

  /** Remove single key from cache (e.g. after editing that block) */
  invalidate(key) {
    this._cache.delete(key)
  }

  /** Remove all keys after `key` in document order (e.g. after insert/delete rows) */
  invalidateAfter(key) {
    if (!this._order) return
    const idx = this._order.indexOf(key)
    if (idx === -1) return
    for (let i = idx + 1; i < this._order.length; i++) {
      this._cache.delete(this._order[i])
    }
  }

  /** Remove all cached entries */
  clear() {
    this._cache.clear()
    this._order = null
  }

  get size() {
    return this._cache.size
  }
}

export default HeightCache
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx mocha --require @babel/register test/unit/specs/heightCache.spec.js`
Expected: 8/8 passing

- [ ] **Step 5: Commit**

```bash
git add src/muya/lib/virtualScroll/heightCache.js test/unit/specs/heightCache.spec.js
git commit -m "feat: add HeightCache for per-block pixel height storage

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: ViewportDetector — compute visible/buffer/placeholder block sets

**Files:**
- Create: `src/muya/lib/virtualScroll/viewportDetector.js`
- Create: `test/unit/specs/viewportDetector.spec.js`

**Depends on:** HeightCache interface only (runs in parallel with Task 1)

- [ ] **Step 1: Write the failing test**

```js
// test/unit/specs/viewportDetector.spec.js
import ViewportDetector from '../../../src/muya/lib/virtualScroll/viewportDetector'

// Minimal mock: implements the same API as HeightCache for testing
class MockCache {
  constructor(heights) { this._h = heights } // { key: height }
  get(key) { return this._h[key] }
}

// Minimal mock: simulates scroll container
class MockContainer {
  constructor(scrollTop, clientHeight) {
    this.scrollTop = scrollTop
    this.clientHeight = clientHeight
  }
}

describe('ViewportDetector', () => {
  let detector
  beforeEach(() => { detector = new ViewportDetector() })

  it('all blocks visible when container is tall enough', () => {
    const container = new MockContainer(0, 500)
    const cache = new MockCache({ k0: 50, k1: 50, k2: 50 })
    const result = detector.computeVisible(container, cache, ['k0', 'k1', 'k2'], null)
    expect(result.visibleKeys.has('k0')).to.be.true
    expect(result.visibleKeys.has('k1')).to.be.true
    expect(result.visibleKeys.has('k2')).to.be.true
    expect(result.placeholderKeys.size).to.equal(0)
  })

  it('blocks below viewport become placeholder', () => {
    const container = new MockContainer(0, 100)
    const cache = new MockCache({ k0: 60, k1: 60, k2: 60, k3: 60 })
    const result = detector.computeVisible(container, cache, ['k0', 'k1', 'k2', 'k3'], null)
    // viewport 100 + buffer 100 each = effective range 0..300
    // k0@0, k1@60, k2@120, k3@180 — all within effective range
    // k4@240 would be in buffer above, but we only have 4 keys
    expect(result.placeholderKeys.size).to.equal(0)
  })

  it('blocks far below viewport are placeholder', () => {
    const container = new MockContainer(0, 100)
    const cache = new MockCache({
      k0: 60, k1: 60, k2: 60, k3: 60, k4: 60,
      k5: 60, k6: 60, k7: 60, k8: 60, k9: 60
    })
    const keys = ['k0','k1','k2','k3','k4','k5','k6','k7','k8','k9']
    const result = detector.computeVisible(container, cache, keys, null)
    // viewport 100 + 200 buffer = 300px effective. ~5 blocks.
    // Blocks beyond ~k5 should be placeholder.
    expect(result.placeholderKeys.size).to.be.greaterThan(0)
    expect(result.visibleKeys.has('k0')).to.be.true
    // far block
    expect(result.placeholderKeys.has('k9')).to.be.true
  })

  it('blocks above viewport become placeholder when scrolled down', () => {
    const container = new MockContainer(500, 100)
    // each block 60px, k0@0..60, k1@60..120, ..., k8@480, k9@540
    const heights = {}
    const keys = []
    for (let i = 0; i < 12; i++) { heights['k' + i] = 60; keys.push('k' + i) }
    const cache = new MockCache(heights)
    const result = detector.computeVisible(container, cache, keys, null)
    // viewport at 500..600, buffer 400..700
    // k6@360, k7@420 — in buffer above
    // k8@480, k9@540 — in visible
    // k10@600 — in buffer below
    expect(result.placeholderKeys.has('k0')).to.be.true
    expect(result.placeholderKeys.has('k1')).to.be.true
    expect(result.visibleKeys.has('k8')).to.be.true
    expect(result.visibleKeys.has('k9')).to.be.true
  })

  it('cursorKey is always in visibleKeys', () => {
    const container = new MockContainer(0, 100)
    const cache = new MockCache({ a: 60, b: 60, c: 60, d: 60, e: 60, f: 60 })
    const keys = ['a', 'b', 'c', 'd', 'e', 'f']
    const result = detector.computeVisible(container, cache, keys, 'f')
    expect(result.visibleKeys.has('f')).to.be.true
  })

  it('cache miss treats block as visible', () => {
    const container = new MockContainer(0, 100)
    const cache = new MockCache({ k0: 60, k1: 60 }) // k2 missing
    const result = detector.computeVisible(container, cache, ['k0', 'k1', 'k2'], null)
    expect(result.visibleKeys.has('k2')).to.be.true // cache miss -> visible
    expect(result.placeholderKeys.has('k2')).to.be.false
  })

  it('empty blocks array returns empty sets', () => {
    const container = new MockContainer(0, 100)
    const cache = new MockCache({})
    const result = detector.computeVisible(container, cache, [], null)
    expect(result.visibleKeys.size).to.equal(0)
    expect(result.bufferKeys.size).to.equal(0)
    expect(result.placeholderKeys.size).to.equal(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx mocha --require @babel/register test/unit/specs/viewportDetector.spec.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```js
// src/muya/lib/virtualScroll/viewportDetector.js

// Buffer size as a ratio of viewport height above and below the visible area.
const BUFFER_RATIO = 1.0

class ViewportDetector {
  /**
   * Compute which blocks are visible, in buffer zone, or off-screen.
   *
   * @param {{ scrollTop: number, clientHeight: number }} container
   * @param {{ get(key: string): number|undefined }} cache — HeightCache instance
   * @param {string[]} allBlockKeys — all top-level block keys in document order
   * @param {string|null} cursorKey — cursor block key (always forced visible)
   * @returns {{ visibleKeys: Set<string>, bufferKeys: Set<string>, placeholderKeys: Set<string> }}
   */
  computeVisible(container, cache, allBlockKeys, cursorKey) {
    const visibleKeys = new Set()
    const bufferKeys = new Set()
    const placeholderKeys = new Set()

    if (allBlockKeys.length === 0) return { visibleKeys, bufferKeys, placeholderKeys }

    const viewTop = container.scrollTop
    const viewHeight = container.clientHeight
    const viewBottom = viewTop + viewHeight
    const bufferSize = viewHeight * BUFFER_RATIO
    const effectiveTop = viewTop - bufferSize
    const effectiveBottom = viewBottom + bufferSize

    let accumulatedY = 0
    const blockTops = new Map() // key -> top Y position

    for (const key of allBlockKeys) {
      blockTops.set(key, accumulatedY)
      const cachedHeight = cache.get(key)

      if (cachedHeight === undefined) {
        // Cache miss (first render): treat as visible, assume default height
        visibleKeys.add(key)
        accumulatedY += 60 // default estimate for first pass
      } else {
        const blockBottom = accumulatedY + cachedHeight

        if (blockBottom < effectiveTop) {
          // Block is above the buffer zone
          placeholderKeys.add(key)
        } else if (accumulatedY > effectiveBottom) {
          // Block is below the buffer zone
          placeholderKeys.add(key)
        } else if (accumulatedY >= effectiveTop && blockBottom <= effectiveBottom) {
          // Block is fully inside the buffer zone — visible
          visibleKeys.add(key)
        } else {
          // Block intersects the buffer boundary — in buffer zone
          bufferKeys.add(key)
        }

        accumulatedY = blockBottom
      }
    }

    // Force cursor block into visible set for contenteditable safety
    if (cursorKey && placeholderKeys.has(cursorKey)) {
      placeholderKeys.delete(cursorKey)
      visibleKeys.add(cursorKey)
    }
    if (cursorKey && bufferKeys.has(cursorKey)) {
      bufferKeys.delete(cursorKey)
      visibleKeys.add(cursorKey)
    }

    return { visibleKeys, bufferKeys, placeholderKeys }
  }
}

export default ViewportDetector
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx mocha --require @babel/register test/unit/specs/viewportDetector.spec.js`
Expected: 7/7 passing

- [ ] **Step 5: Commit**

```bash
git add src/muya/lib/virtualScroll/viewportDetector.js test/unit/specs/viewportDetector.spec.js
git commit -m "feat: add ViewportDetector for visible/buffer/placeholder set computation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: VirtualScrollManager — wire cache + detector, expose to StateRender

**Files:**
- Create: `src/muya/lib/virtualScroll/index.js`

**Depends on:** Task 1 (HeightCache in place) + Task 2 (ViewportDetector in place)

- [ ] **Step 1: Write the implementation**

```js
// src/muya/lib/virtualScroll/index.js
import HeightCache from './heightCache'
import ViewportDetector from './viewportDetector'

class VirtualScrollManager {
  /**
   * @param {import('../parser/render').default} stateRender — StateRender instance
   */
  constructor(stateRender) {
    this.stateRender = stateRender
    this.cache = new HeightCache()
    this.detector = new ViewportDetector()
    this._measurePending = false
  }

  /**
   * Schedule height measurement after render.
   * Call after render() / partialRender() completes (DOM is in place).
   * Measurements happen in rAF to avoid forced layout.
   */
  afterRender() {
    if (this._measurePending) return
    this._measurePending = true
    requestAnimationFrame(() => {
      this._measureHeights()
      this._measurePending = false
    })
  }

  /**
   * Delegate to ViewportDetector to get visibility classification.
   */
  getVisibleRange() {
    const container = this.stateRender.muya.container
    const blocks = this.stateRender.muya.contentState.blocks
    const allKeys = blocks.map(b => b.key)
    const cursor = this.stateRender.muya.contentState.cursor
    const cursorKey = cursor && cursor.start ? cursor.start.key : null

    // Keep the order list updated for invalidateAfter
    this.cache.setOrder(allKeys)

    return this.detector.computeVisible(container, this.cache, allKeys, cursorKey)
  }

  /**
   * Measure all currently visible real-DOM blocks and update cache.
   * Only measures blocks that are in the visible or buffer sets (real DOM).
   */
  _measureHeights() {
    const container = this.stateRender.muya.container
    if (!container) return

    const { visibleKeys, bufferKeys } = this.getVisibleRange()
    const measureKeys = new Set([...visibleKeys, ...bufferKeys])

    for (const key of measureKeys) {
      const dom = document.getElementById(key)
      if (dom) {
        const height = dom.getBoundingClientRect().height
        if (height > 0) {
          this.cache.set(key, height)
        }
      }
    }
  }
}

export default VirtualScrollManager
```

- [ ] **Step 2: Commit**

```bash
git add src/muya/lib/virtualScroll/index.js
git commit -m "feat: add VirtualScrollManager wiring cache + detector

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: StateRender integration — constructor, render(), partialRender()

**Files:**
- Modify: `src/muya/lib/parser/render/index.js:1-10` (import section)
- Modify: `src/muya/lib/parser/render/index.js:142-156` (constructor)
- Modify: `src/muya/lib/parser/render/index.js:354-368` (render method)
- Modify: `src/muya/lib/parser/render/index.js:370-423` (partialRender method)

**Depends on:** Task 3 (VirtualScrollManager exists)

- [ ] **Step 1: Add import at top of file**

At line 7 (after `import { beginRules } from '../rules'`), add:

```js
import VirtualScrollManager from '../../virtualScroll'
```

- [ ] **Step 2: Add VirtualScrollManager to constructor**

In `class StateRender`, in `constructor(muya)` (around line 156, after `this.container = null`), add:

```js
this.virtualScroll = null // initialized after container is set
```

In `setContainer(container)` method (line 158-160), change:

```js
setContainer(container) {
  this.container = container
}
```

To:

```js
setContainer(container) {
  this.container = container
  this.virtualScroll = new VirtualScrollManager(this)
}
```

- [ ] **Step 3: Add afterRender() call in render() method**

At the end of `render()` method (line 354-368), after `this.renderDiagram()`, add:

The existing render method ends with:
```js
patch(oldVdom, newVdom)
this.renderMermaid()
this.renderDiagram()
this.codeCache.clear()
```

Change to:
```js
patch(oldVdom, newVdom)
this.renderMermaid()
this.renderDiagram()
this.codeCache.clear()
if (this.virtualScroll) {
  this.virtualScroll.afterRender()
}
```

- [ ] **Step 4: Modify partialRender() to support placeholder blocks**

This is the main change. The existing `partialRender()` method:

```js
partialRender(blocks, activeBlocks, matches, startKey, endKey) {
  const cursorOutMostBlock = activeBlocks[activeBlocks.length - 1]
  const needRenderCursorBlock = cursorOutMostBlock && blocks.indexOf(cursorOutMostBlock) === -1
  const t = this.muya.options.t || ((key) => key)
  const newVnode = h(
    'section',
    blocks.map((block) => this.renderBlock(null, block, activeBlocks, matches, false, t))
  )
  const html = toHTML(newVnode).replace(/^<section>([\s\S]+?)<\/section>$/, '$1')

  const needToRemoved = []
  const firstOldDom = startKey
    ? document.querySelector(`#${startKey}`)
    : document.querySelector(`div#${CLASS_OR_ID.AG_EDITOR_ID}`).firstElementChild
  if (!firstOldDom) {
    return
  }
  needToRemoved.push(firstOldDom)
  let nextSibling = firstOldDom.nextElementSibling
  while (nextSibling && nextSibling.id !== endKey) {
    needToRemoved.push(nextSibling)
    nextSibling = nextSibling.nextElementSibling
  }
  nextSibling && needToRemoved.push(nextSibling)

  firstOldDom.insertAdjacentHTML('beforebegin', html)

  Array.from(needToRemoved).forEach((dom) => dom.remove())

  if (needRenderCursorBlock) {
    const { key } = cursorOutMostBlock
    const cursorDom = document.querySelector(`#${key}`)
    if (cursorDom) {
      const oldCursorVnode = toVNode(cursorDom)
      const newCursorVnode = this.renderBlock(
        null,
        cursorOutMostBlock,
        activeBlocks,
        matches,
        false,
        t
      )
      patch(oldCursorVnode, newCursorVnode)
    }
  }

  this.renderMermaid()
  this.renderDiagram()
  this.codeCache.clear()
}
```

Replace with:

```js
partialRender(blocks, activeBlocks, matches, startKey, endKey) {
  const cursorOutMostBlock = activeBlocks[activeBlocks.length - 1]
  const needRenderCursorBlock = cursorOutMostBlock && blocks.indexOf(cursorOutMostBlock) === -1
  const t = this.muya.options.t || ((key) => key)

  // --- virtual scroll: visibility classification ---
  let visibleSet = null
  if (this.virtualScroll) {
    const range = this.virtualScroll.getVisibleRange()
    visibleSet = new Set([...range.visibleKeys, ...range.bufferKeys])
    // always force-render the changed range (startKey..endKey)
    // since those blocks are being edited
    if (startKey) {
      visibleSet.add(startKey)
    }
    if (endKey) {
      visibleSet.add(endKey)
    }
    // force the cursor block
    const cursor = this.muya.contentState.cursor
    if (cursor && cursor.start) {
      visibleSet.add(cursor.start.key)
    }
  }

  const renderBlockOrPlaceholder = (block) => {
    if (!visibleSet || visibleSet.has(block.key)) {
      return this.renderBlock(null, block, activeBlocks, matches, false, t)
    }
    // placeholder: lightweight div with cached height
    const cachedHeight = this.virtualScroll.cache.get(block.key)
    const height = cachedHeight != null ? cachedHeight : 60
    return h(
      `div#${block.key}.${CLASS_OR_ID.AG_PARAGRAPH}`,
      {
        attrs: { 'data-placeholder': '', 'data-block-key': block.key },
        style: { height: height + 'px', overflow: 'hidden' }
      }
    )
  }

  const newVnode = h(
    'section',
    blocks.map(renderBlockOrPlaceholder)
  )
  const html = toHTML(newVnode).replace(/^<section>([\s\S]+?)<\/section>$/, '$1')

  const needToRemoved = []
  const firstOldDom = startKey
    ? document.querySelector(`#${startKey}`)
    : document.querySelector(`div#${CLASS_OR_ID.AG_EDITOR_ID}`).firstElementChild
  if (!firstOldDom) {
    return
  }
  needToRemoved.push(firstOldDom)
  let nextSibling = firstOldDom.nextElementSibling
  while (nextSibling && nextSibling.id !== endKey) {
    needToRemoved.push(nextSibling)
    nextSibling = nextSibling.nextElementSibling
  }
  nextSibling && needToRemoved.push(nextSibling)

  firstOldDom.insertAdjacentHTML('beforebegin', html)

  Array.from(needToRemoved).forEach((dom) => dom.remove())

  if (needRenderCursorBlock) {
    const { key } = cursorOutMostBlock
    const cursorDom = document.querySelector(`#${key}`)
    if (cursorDom) {
      const oldCursorVnode = toVNode(cursorDom)
      const newCursorVnode = this.renderBlock(
        null,
        cursorOutMostBlock,
        activeBlocks,
        matches,
        false,
        t
      )
      patch(oldCursorVnode, newCursorVnode)
    }
  }

  this.renderMermaid()
  this.renderDiagram()
  this.codeCache.clear()

  // Schedule height measurement after DOM update
  if (this.virtualScroll) {
    this.virtualScroll.afterRender()
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/muya/lib/parser/render/index.js
git commit -m "feat: integrate VirtualScrollManager into StateRender render/partialRender

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: ContentState invalidation — notify cache after edits

**Files:**
- Modify: `src/muya/lib/contentState/index.js:266-308` (partialRender method)

**Depends on:** Task 3 (VirtualScrollManager exists on StateRender)

- [ ] **Step 1: Add cache invalidation in ContentState.partialRender()**

In `ContentState.partialRender()` (line 266), add invalidation before calling `this.stateRender.partialRender(...)`:

The method starts:
```js
partialRender(isRenderCursor = true) {
  const {
    blocks,
    searchMatches: { matches, index }
  } = this
  const activeBlocks = this.getActiveBlocks()
  const [startKey, endKey] = this.renderRange
```

After line 272 (`const [startKey, endKey] = this.renderRange`), add:

```js
  // Invalidate height cache for the blocks being re-rendered
  if (this.stateRender.virtualScroll) {
    if (startKey) {
      this.stateRender.virtualScroll.cache.invalidate(startKey)
      this.stateRender.virtualScroll.cache.invalidateAfter(startKey)
    }
  }
```

The rest of the method is unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/muya/lib/contentState/index.js
git commit -m "feat: invalidate height cache on edit in ContentState.partialRender

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Scroll-driven DOM swap — targeted placeholder ↔ real block transitions

**Files:**
- Modify: `src/muya/lib/virtualScroll/index.js` (add onScroll + _swapDOM methods)
- Modify: `src/muya/lib/index.js:76-88` (wire scroll handler)

**Depends on:** Task 3 + Task 4 (StateRender has virtualScroll integrated)

**Why not call partialRender:** partialRender only renders a cursor-based contiguous range (`blocks.slice(startIndex, endIndex)` from `renderRange`). It does NOT touch blocks outside that range. Scroll-driven updates need to swap individual blocks anywhere in the document. A direct DOM swap per block is more targeted and avoids full re-tokenization of unrelated blocks.

- [ ] **Step 1: Add onScroll + _swapDOM to VirtualScrollManager**

Replace the entire `src/muya/lib/virtualScroll/index.js` content (keeping Task 3's base + adding scroll handling):

The scroll handler tracks the previous render set and on each scroll:
1. Computes new visible+buffer set
2. For blocks that ENTERED the set: render them as real DOM, replace placeholder
3. For blocks that EXITED the set: replace real DOM with placeholder div
4. Updates the tracked set

```js
// src/muya/lib/virtualScroll/index.js
import HeightCache from './heightCache'
import ViewportDetector from './viewportDetector'
import { CLASS_OR_ID } from '../config'
import { h, toHTML } from '../parser/render/snabbdom'

const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('mt_vscroll_debug') === '1'
const log = (...args) => DEBUG && console.log('[VirtualScroll]', ...args)

class VirtualScrollManager {
  constructor(stateRender) {
    this.stateRender = stateRender
    this.cache = new HeightCache()
    this.detector = new ViewportDetector()
    this._measurePending = false
    this._scrollPending = false

    // Track the current set of keys that have real DOM (visible + buffer).
    // null = not yet initialized (first render)
    this._renderedKeys = null
  }

  afterRender() {
    if (this._measurePending) return
    this._measurePending = true
    requestAnimationFrame(() => {
      this._measureHeights()
      this._measurePending = false
    })
  }

  getVisibleRange() {
    const container = this.stateRender.muya.container
    const blocks = this.stateRender.muya.contentState.blocks
    const allKeys = blocks.map(b => b.key)
    const cursor = this.stateRender.muya.contentState.cursor
    const cursorKey = cursor && cursor.start ? cursor.start.key : null
    this.cache.setOrder(allKeys)
    return this.detector.computeVisible(container, this.cache, allKeys, cursorKey)
  }

  _measureHeights() {
    const container = this.stateRender.muya.container
    if (!container) return

    const { visibleKeys, bufferKeys } = this.getVisibleRange()
    const measureKeys = new Set([...visibleKeys, ...bufferKeys])

    for (const key of measureKeys) {
      const dom = document.getElementById(key)
      if (dom) {
        const height = dom.getBoundingClientRect().height
        if (height > 0) {
          this.cache.set(key, height)
        }
      }
    }

    // After first measurement, mark which keys have real DOM
    if (!this._renderedKeys) {
      this._renderedKeys = new Set(measureKeys)
    }

    log('_measureHeights: measured', measureKeys.size, 'blocks, cache size:', this.cache.size)
  }

  /**
   * Called on scroll. Swaps individual blocks between placeholder and real DOM
   * as they enter or exit the visible+buffer zone. Does NOT rebuild the whole document.
   * Throttled via rAF.
   */
  onScroll() {
    if (this._scrollPending) return
    this._scrollPending = true
    requestAnimationFrame(() => {
      this._scrollPending = false

      if (!this._renderedKeys) return // not yet initialized

      const container = this.stateRender.muya.container
      if (!container) return

      const blocks = this.stateRender.muya.contentState.blocks
      const allKeys = blocks.map(b => b.key)
      const cursor = this.stateRender.muya.contentState.cursor
      const cursorKey = cursor && cursor.start ? cursor.start.key : null
      this.cache.setOrder(allKeys)

      const { visibleKeys, bufferKeys } =
        this.detector.computeVisible(container, this.cache, allKeys, cursorKey)

      const newRenderKeys = new Set([...visibleKeys, ...bufferKeys])

      // Keys that are now visible but were not before: placeholder -> real
      const toRender = []
      // Keys that were visible but are not now: real -> placeholder
      const toCollapse = []

      for (const key of newRenderKeys) {
        if (!this._renderedKeys.has(key)) toRender.push(key)
      }
      for (const key of this._renderedKeys) {
        if (!newRenderKeys.has(key)) toCollapse.push(key)
      }

      if (toRender.length === 0 && toCollapse.length === 0) return

      log('onScroll: toRender=' + toRender.length, 'toCollapse=' + toCollapse.length,
        'visible=' + visibleKeys.size, 'buffer=' + bufferKeys.size)

      const editorDom = document.querySelector(`div#${CLASS_OR_ID.AG_EDITOR_ID}`)
      if (!editorDom) return

      const activeBlocks = this.stateRender.muya.contentState.getActiveBlocks()
      const matches = this.stateRender.muya.contentState.searchMatches.matches
      const t = this.stateRender.muya.options.t || ((key) => key)

      // Collapse: real DOM -> placeholder
      for (const key of toCollapse) {
        const oldDom = document.getElementById(key)
        if (!oldDom || oldDom.hasAttribute('data-placeholder')) continue

        const cachedHeight = this.cache.get(key)
        const height = cachedHeight != null ? cachedHeight : 60
        const placeholderHtml = `<div id="${key}" data-placeholder="" data-block-key="${key}" class="ag-paragraph" style="height:${height}px;overflow:hidden"></div>`
        oldDom.insertAdjacentHTML('beforebegin', placeholderHtml)
        oldDom.remove()
        this._renderedKeys.delete(key)
      }

      // Render: placeholder -> real DOM
      for (const key of toRender) {
        const oldDom = document.getElementById(key)
        if (!oldDom) continue

        const block = this.stateRender.muya.contentState.getBlock(key)
        if (!block) {
          // block not found: remove placeholder, add to rendered set anyway
          oldDom.remove()
          this._renderedKeys.add(key)
          continue
        }

        const newVnode = this.stateRender.renderBlock(null, block, activeBlocks, matches, false, t)
        const html = toHTML(newVnode)
        oldDom.insertAdjacentHTML('beforebegin', html)
        oldDom.remove()
        this._renderedKeys.add(key)
      }

      // Measure new real blocks
      this.afterRender()
    })
  }
}

export default VirtualScrollManager
```

- [ ] **Step 2: Wire scroll handler in muya/index.js**

In `src/muya/lib/index.js`, in the `init()` method (line 76-88). The existing scroll handler:

```js
const handleScroll = debounce(() => {
  eventCenter.dispatch('scroll', {
    scrollTop: container.scrollTop
  })
}, 100)
```

Change to:

```js
const handleScroll = debounce(() => {
  eventCenter.dispatch('scroll', {
    scrollTop: container.scrollTop
  })
  if (contentState.stateRender.virtualScroll) {
    contentState.stateRender.virtualScroll.onScroll()
  }
}, 100)
```

- [ ] **Step 3: Commit**

```bash
git add src/muya/lib/virtualScroll/index.js src/muya/lib/index.js
git commit -m "feat: add scroll-driven DOM swap for virtual window visibility transitions

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Cursor safety — ensure cursor block is always real DOM

**Files:**
- Modify: `src/muya/lib/contentState/index.js:239-264` (render / setCursor flow)

**Depends on:** Task 4 + Task 5 (StateRender + ContentState both have virtualScroll awareness)

- [ ] **Step 1: Add cursor safety check before setCursor**

In `ContentState.render()` (line 243-264) and `ContentState.partialRender()` (line 266-308), the `setCursor()` call restores cursor position. If the cursor block is a placeholder, cursor restoration fails silently.

Add a guard method to ContentState before the class closing brace (`export default ContentState`, around line 934):

```js
  /**
   * Ensure the cursor block is rendered as real DOM before cursor placement.
   * If the block is a placeholder, force a single render on it.
   */
  _ensureCursorBlockReal() {
    if (!this.cursor || !this.cursor.start) return
    const { key } = this.cursor.start
    const dom = document.getElementById(key)
    if (!dom) return

    // Check if cursor block is a placeholder
    if (dom.hasAttribute('data-placeholder')) {
      const block = this.getBlock(key)
      if (!block) return
      this.singleRender(block, false)
    }
  }
```

- [ ] **Step 2: Call it before setCursor in render()**

In `render()` method, before `if (isRenderCursor) { this.setCursor() }` (line 258), add:

```js
    if (isRenderCursor) {
      this._ensureCursorBlockReal()
      this.setCursor()
    }
```

In `partialRender()` method, before `if (isRenderCursor) { this.setCursor() }` (line 303), add the same:

```js
    if (isRenderCursor) {
      this._ensureCursorBlockReal()
      this.setCursor()
    }
```

- [ ] **Step 3: Commit**

```bash
git add src/muya/lib/contentState/index.js
git commit -m "feat: ensure cursor block is real DOM before cursor placement

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Developer diagnostics logging — debug output for testing

**Files:**
- Modify: `src/muya/lib/virtualScroll/index.js` (add logging)
- Modify: `src/muya/lib/parser/render/index.js` (add logging in partialRender)

**Can run in parallel with:** Task 1 + Task 2 (no dependencies)

- [ ] **Step 1: Add instrumentation to VirtualScrollManager**

Add a `DEBUG` flag and logging calls in `src/muya/lib/virtualScroll/index.js`:

At the top of the file after imports, add:

```js
const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('mt_vscroll_debug') === '1'
const log = (...args) => DEBUG && console.log('[VirtualScroll]', ...args)
```

In `afterRender()`, add:
```js
log('afterRender: measuring heights, cache size:', this.cache.size)
```

In `_measureHeights()`, add at end:
```js
log('_measureHeights: measured', measureKeys.size, 'blocks, cache size:', this.cache.size)
```

In `getVisibleRange()`, add:
```js
log('getVisibleRange: cache size:', this.cache.size)
```

In `onScroll()`, after computing visibility sets, add:
```js
log('onScroll: visible=' + visibleKeys.size, 'buffer=' + bufferKeys.size, 'placeholder=' + placeholderKeys.size)
```

- [ ] **Step 2: Add instrumentation to StateRender.partialRender()**

In `src/muya/lib/parser/render/index.js`, inside `partialRender()`, after the visibility classification block, add:

```js
if (visibleSet && typeof localStorage !== 'undefined' && localStorage.getItem('mt_vscroll_debug') === '1') {
  const { visibleKeys, bufferKeys, placeholderKeys } = this.virtualScroll.getVisibleRange()
  console.log('[StateRender] partialRender: visible=' + visibleKeys.size,
    'buffer=' + bufferKeys.size, 'placeholder=' + placeholderKeys.size,
    'changed=[' + startKey + '..' + endKey + ']')
}
```

- [ ] **Step 3: Add enable/disable instructions in commit message**

To enable debug logging:
```
localStorage.setItem('mt_vscroll_debug', '1')
```

To disable:
```
localStorage.removeItem('mt_vscroll_debug')
```

- [ ] **Step 4: Commit**

```bash
git add src/muya/lib/virtualScroll/index.js src/muya/lib/parser/render/index.js
git commit -m "feat: add developer diagnostics logging for virtual scroll

Enable via localStorage.setItem('mt_vscroll_debug', '1')

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Execution Order Summary

```
Phase 1 (parallel, no deps):
  Task 1: HeightCache ─────────┐
  Task 2: ViewportDetector ────┤── all can run simultaneously
  Task 8: Logging ─────────────┘

Phase 2 (requires 1+2):
  Task 3: VirtualScrollManager

Phase 3 (parallel, requires 3):
  Task 4: StateRender integration ─┐
  Task 5: ContentState invalidation─┤── all can run simultaneously
  Task 6: Scroll listener ──────────┘

Phase 4 (requires 4+5):
  Task 7: Cursor safety
```

## Verification

After all tasks complete, start the app with debug logging:

```bash
# In browser console
localStorage.setItem('mt_vscroll_debug', '1')
# Reload, open a large markdown file, scroll
# Expected log output:
# [VirtualScroll] afterRender: measuring heights, cache size: N
# [VirtualScroll] onScroll: visible=10 buffer=10 placeholder=500
```

Manual test checklist:
1. Open a file with 500+ lines
2. Scroll smoothly — check no stutter vs baseline (localStorage.removeItem('mt_vscroll_debug', '1'))
3. Click into a line and type — cursor stays in place
4. Insert/delete lines — cache invalidates correctly
5. Scroll far down then back up — blocks re-render correctly
6. Search (Ctrl+F) — matches in placeholder blocks are findable via data-block-key
