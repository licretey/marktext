# Block Virtual Window Scroll Optimization

> **Status:** Design approved 2026-05-04
> **Priority:** Performance (#1) > Architecture (#2) > Security (#3)

## Goal

Eliminate scroll stutter during pure browsing (no editing) by rendering only viewport-adjacent blocks as real DOM. Off-screen blocks get lightweight placeholder divs with cached heights. This reduces DOM node count and Snabbdom patch cost for large documents without changing any editing behavior.

## Motivation

muya's current `partialRender` already limits DOM updates to changed blocks, but every block in the document is always real DOM. For a 10k-line document, that means ~10k paragraph elements, each with children for syntax-highlighted tokens. Scroll stutter comes from the browser's layout/reflow cost on this large tree, not from JavaScript parse time.

block-level virtual window is the right granularity: finer than document-level (whole document swap), coarser than token-level (too many nodes to manage). Blocks are muya's native rendering unit — the snabbdom `patch()` already operates per-block via `renderBlock()`.

## Design

### Architecture

```
scroll event (rAF throttled)
  -> viewportDetector.computeVisible()
  -> returns { visibleKeys, bufferKeys, placeholderKeys }
  -> StateRender: visible+buffer -> real renderBlock() -> real DOM
  -> StateRender: placeholder -> <div style="height:${cachedHeight}px">
  -> after render: heightCache.update() from real DOM measurements
```

Three new modules in `src/muya/lib/virtualScroll/`:

| Module | Responsibility | Lines |
|--------|---------------|-------|
| `heightCache.js` | Store per-block pixel heights, invalidate on edit | ~60 |
| `viewportDetector.js` | Compute which blocks intersect viewport + buffers | ~50 |
| `index.js` (VirtualScrollManager) | Wire cache + detector, expose to StateRender | ~40 |

Two existing files modified:

| File | Change | Lines |
|------|--------|-------|
| `src/muya/lib/parser/render/index.js` | render/partialRender integrate virtual scroll | ~30 |
| `src/muya/lib/contentState/index.js` | Notify cache invalidation after edit | ~10 |

Total: ~190 lines, 3 new files + 2 modified.

### Component 1: HeightCache

```
Map<blockKey, { height: number, version: number, measuredAt: number }>
```

API:
- `get(key) -> number | undefined`
- `set(key, height)` — write after DOM measurement
- `invalidate(key)` — single block stale
- `invalidateAfter(key)` — all blocks after key stale (insert/delete rows)
- `clear()` — full rebuild

**Write timing:** After `render()`/`partialRender()`, in a `requestAnimationFrame` callback, iterate visible blocks and record `getBoundingClientRect().height`. Never measure synchronously during render — that forces layout.

**Read timing:** Before render, viewportDetector queries cache to compute placeholder heights for off-screen blocks.

**First load:** Cache is empty. All blocks render normally (same as today). After first render, heights are measured and cached. Second scroll uses cache.

**Invalidation:** `partialRender` covers a contiguous range of block keys. All blocks in that range are invalidated. When block count changes (insert/delete), `invalidateAfter` is called on the first affected key.

### Component 2: ViewportDetector

```
computeVisible(container, cache, allBlockKeys, cursorKey) -> {
  visibleKeys: Set<string>
  bufferKeys: Set<string>
  placeholderKeys: Set<string>
}
```

Algorithm:
1. From `container.scrollTop` and `container.clientHeight`, compute viewport top/bottom
2. Add 1x viewport height as buffer above and below
3. Iterate `allBlockKeys` in order. For each key:
   - If cache has height: accumulate Y, determine if it intersects buffer zone
   - If cache miss (first render): treat as visible
4. `cursorKey` is always added to `visibleKeys`
5. Return three sets

**Scroll listener:** `scroll` event on the editor container, throttled via `requestAnimationFrame`. Also fires on `resize`.

### Component 3: VirtualScrollManager (index.js)

```
class VirtualScrollManager {
  constructor(stateRender)
  afterRender()           // measure heights, update cache
  getVisibleRange()       // delegate to ViewportDetector
}
```

Lifecycle:
1. StateRender creates `VirtualScrollManager` on init
2. `render()`: full render -> `manager.afterRender()` (measure all)
3. `partialRender()`: `manager.getVisibleRange()` -> split blocks -> render real vs placeholder -> `manager.afterRender()` (measure changed)
4. ContentState edit: calls `manager.cache.invalidate(key)` + `invalidateAfter(key)` before partialRender

### StateRender Changes

**`render()` (full):** Append `this.virtualScroll.afterRender()` at end.

**`partialRender()`:** This is the main change. Current flow replaces a contiguous range of DOM with new rendered blocks. New flow:
1. Receive full block list + the changed range (startKey, endKey)
2. Call `virtualScroll.getVisibleRange()` to get visibility classification
3. For `placeholderKeys`: emit `<div data-placeholder data-block-key="${key}" style="height:${cachedHeight}px">`
4. For `visibleKeys + bufferKeys + cursorKey`: emit full `renderBlock()` output (same as today)
5. Build combined VNode tree, patch to DOM
6. Call `virtualScroll.afterRender()`

**`singleRender()`:** If block is not in visible range, skip. Otherwise, same as today.

### ContentState Changes

In every method that calls `partialRender()` (keydown handlers, paste, undo/redo):
- After modifying block content, call `this.stateRender.virtualScroll.cache.invalidate(key)`
- If row count changed, also call `this.stateRender.virtualScroll.cache.invalidateAfter(key)`

### contenteditable Safety

The cursor block (where `document.getSelection()` anchor/focus lives) must always be real DOM. The `cursorKey` from `contentState.cursor.start.key` is force-added to `visibleKeys`. When cursor moves to a placeholder block, that block is re-rendered as real DOM before the cursor lands, via a `selectionchange` listener in contentState.

### Performance Budget

| Operation | Before (10k lines) | After (10k lines) |
|-----------|-------------------|-------------------|
| DOM nodes | ~80k | ~3k (30 blocks visible) |
| Snabbdom patch | 10k VNodes | ~100 VNodes |
| Scroll handler | none | rAF + Set lookup |
| First load | same | same + 1 measure pass (~5ms) |

## Non-Goals

- Does NOT change editing behavior or cursor handling
- Does NOT change muya's tokenizer or parser
- Does NOT introduce viewport-level DOM recycling (full block VNode recreation)
- Does NOT touch the markdown lexer or export path

## Risks & Mitigations

1. **Height drift (placeholder height wrong after edit):** Mitigated by `invalidate` + `invalidateAfter` on every edit. Next render remeasures.
2. **Scroll jump when placeholder replaced with real block:** Mitigated by placeholder `div` having exact same height as cached real block height.
3. **Search/find across off-screen blocks:** Placeholder blocks have `data-block-key` attribute for DOM query. If a match is in a placeholder block, force-render that block before highlighting.
4. **contenteditable focus loss:** cursor key always forced visible. `selectionchange` listener handles edge cases.
