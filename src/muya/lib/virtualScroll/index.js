// Virtual scroll manager — block-level virtual window for scroll performance.
//
// Developer diagnostics: enable via localStorage.setItem('mt_vscroll_debug', '1')

import HeightCache from './heightCache'
import ViewportDetector from './viewportDetector'
import { toHTML } from '../parser/render/snabbdom'
import { CLASS_OR_ID } from '../config'

const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('mt_vscroll_debug') === '1'
const log = (...args) => DEBUG && console.log('[VirtualScroll]', ...args)

class VirtualScrollManager {
  /**
   * @param {import('../../parser/render').default} stateRender — StateRender instance
   */
  constructor(stateRender) {
    this.stateRender = stateRender
    this.cache = new HeightCache()
    this.detector = new ViewportDetector()
    this._measurePending = false
    this._scrollPending = false
    // Track which keys currently have real DOM (visible + buffer).
    // Populated by first _measureHeights, then managed exclusively by onScroll.
    this._renderedKeys = new Set()
    this._initialized = false
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
   * Returns { visibleKeys: Set, bufferKeys: Set, placeholderKeys: Set }
   */
  getVisibleRange() {
    const container = this.stateRender.muya.container
    const blocks = this.stateRender.muya.contentState.blocks
    const allKeys = blocks.map(b => b.key)
    const cursor = this.stateRender.muya.contentState.cursor
    const cursorKey = cursor && cursor.start ? cursor.start.key : null

    // Keep the order list updated for invalidateAfter
    this.cache.setOrder(allKeys)

    const result = this.detector.computeVisible(container, this.cache, allKeys, cursorKey)
    log('getVisibleRange: cache size:', this.cache.size, 'visible:', result.visibleKeys.size, 'buffer:', result.bufferKeys.size, 'placeholder:', result.placeholderKeys.size)
    return result
  }

  /**
   * Measure all currently visible real-DOM blocks and update cache.
   * Only measures blocks that are in the visible or buffer sets (real DOM).
   * On first call, initializes _renderedKeys from current visible+buffer set.
   * After initialization, never modifies _renderedKeys — onScroll owns it.
   */
  _measureHeights() {
    const container = this.stateRender.muya.container
    if (!container) return

    const blocks = this.stateRender.muya.contentState.blocks
    const allKeys = blocks.map(b => b.key)
    this.cache.setOrder(allKeys)
    const { visibleKeys, bufferKeys } = this.detector.computeVisible(
      container, this.cache, allKeys, null
    )
    const measureKeys = new Set([...visibleKeys, ...bufferKeys])

    // Collect entries in document order (allKeys order), not Set insertion order.
    const entries = []
    for (const key of allKeys) {
      if (!measureKeys.has(key)) continue
      const dom = document.getElementById(key)
      if (dom && !dom.hasAttribute('data-placeholder')) {
        entries.push({ key, dom })
      }
    }

    // Measure effective vertical space using position difference between
    // consecutive DOM siblings. This naturally accounts for margins, padding,
    // borders, and margin collapsing — all of which getBoundingClientRect
    // alone would miss.
    for (let i = 0; i < entries.length; i++) {
      const { key, dom } = entries[i]
      let height = 0
      if (i < entries.length - 1) {
        height = entries[i + 1].dom.getBoundingClientRect().top - dom.getBoundingClientRect().top
      }
      if (height <= 0) {
        height = dom.getBoundingClientRect().height
      }
      if (height > 0) {
        this.cache.set(key, height)
      }
    }

    log('_measureHeights: measured', entries.length, 'blocks, cache size:', this.cache.size)

    // On first call, seed _renderedKeys from the current real-DOM set.
    // After that, onScroll manages _renderedKeys exclusively — overwriting
    // it here would desync from the actual DOM state and cause blank blocks.
    if (!this._initialized) {
      this._renderedKeys = new Set(measureKeys)
      this._initialized = true
      log('_measureHeights: initialized _renderedKeys with', this._renderedKeys.size, 'keys')
    }
  }

  /**
   * Re-seed _renderedKeys after a full render rebuilds all DOM.
   * Call after ContentState.render() so that onScroll doesn't
   * compare against stale keys from before the full render.
   */
  reinitializeRenderedKeys() {
    const container = this.stateRender.muya.container
    if (!container) return

    const blocks = this.stateRender.muya.contentState.blocks
    const allKeys = blocks.map(b => b.key)
    this.cache.setOrder(allKeys)
    const { visibleKeys, bufferKeys } = this.detector.computeVisible(
      container, this.cache, allKeys, null
    )
    this._renderedKeys = new Set([...visibleKeys, ...bufferKeys])
    this._initialized = true
    log('reinitializeRenderedKeys: re-seeded with', this._renderedKeys.size, 'keys')
  }

  /**
   * Called on scroll. Ensures visible+buffer blocks have real DOM and
   * blocks outside have placeholders. Each block swap uses outerHTML
   * (single DOM operation per block, no layout thrashing).
   * Throttled via rAF.
   */
  onScroll() {
    if (this._scrollPending) return
    this._scrollPending = true
    requestAnimationFrame(() => {
      this._scrollPending = false

      if (!this._initialized) return

      const container = this.stateRender.muya.container
      if (!container) return

      const blocks = this.stateRender.muya.contentState.blocks
      const allKeys = blocks.map(b => b.key)
      const cursor = this.stateRender.muya.contentState.cursor
      const cursorKey = cursor && cursor.start ? cursor.start.key : null
      this.cache.setOrder(allKeys)

      const { visibleKeys, bufferKeys } =
        this.detector.computeVisible(container, this.cache, allKeys, cursorKey)

      const renderSet = new Set([...visibleKeys, ...bufferKeys])

      // 1. Collapse blocks leaving the render zone: real DOM → placeholder
      const toCollapse = []
      for (const key of this._renderedKeys) {
        if (!renderSet.has(key)) toCollapse.push(key)
      }

      // 2. Render blocks entering the render zone: placeholder → real DOM
      const toRender = []
      for (const key of renderSet) {
        if (!this._renderedKeys.has(key)) toRender.push(key)
      }

      if (toRender.length === 0 && toCollapse.length === 0) return

      log('onScroll: render=' + toRender.length, 'collapse=' + toCollapse.length)

      const activeBlocks = this.stateRender.muya.contentState.getActiveBlocks()
      const matches = this.stateRender.muya.contentState.searchMatches.matches
      const t = this.stateRender.muya.options.t || ((key) => key)

      // Collapse: per-block outerHTML swap (avoids duplicate-ID issues
      // that the batch insertAdjacentHTML approach had)
      for (const key of toCollapse) {
        const oldDom = document.getElementById(key)
        if (!oldDom) { this._renderedKeys.delete(key); continue }
        if (oldDom.hasAttribute('data-placeholder')) { this._renderedKeys.delete(key); continue }
        const cachedHeight = this.cache.get(key)
        const height = cachedHeight != null && cachedHeight > 0 ? cachedHeight : 60
        oldDom.outerHTML = `<div id="${key}" data-placeholder="" data-block-key="${key}" class="${CLASS_OR_ID.AG_PARAGRAPH}" style="height:${height}px;overflow:hidden;contain:strict"></div>`
        this._renderedKeys.delete(key)
      }

      // Render: per-block outerHTML swap
      for (const key of toRender) {
        const oldDom = document.getElementById(key)
        if (!oldDom) continue
        const block = this.stateRender.muya.contentState.getBlock(key)
        if (!block) { oldDom.remove(); this._renderedKeys.delete(key); continue }
        oldDom.outerHTML = toHTML(this.stateRender.renderBlock(null, block, activeBlocks, matches, false, t))
        this._renderedKeys.add(key)
      }

      this.afterRender()
    })
  }
}

export default VirtualScrollManager
export { DEBUG, log }
