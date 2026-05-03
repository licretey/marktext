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
    // Track which keys currently have real DOM (visible + buffer). null = first render not done yet
    this._renderedKeys = null
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

    log('_measureHeights: measured', measureKeys.size, 'blocks, cache size:', this.cache.size)

    // After first measurement, initialize the rendered-keys tracker
    if (!this._renderedKeys) {
      this._renderedKeys = new Set(measureKeys)
    }
  }

  /**
   * Called on scroll. Swaps individual blocks between placeholder and real DOM
   * as they enter or exit the visible+buffer zone. Throttled via rAF.
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

      // Keys now visible that were not before: placeholder -> real
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

      log('onScroll: toRender=' + toRender.length, 'toCollapse=' + toCollapse.length)

      const activeBlocks = this.stateRender.muya.contentState.getActiveBlocks()
      const matches = this.stateRender.muya.contentState.searchMatches.matches
      const t = this.stateRender.muya.options.t || ((key) => key)

      // Collapse: real DOM -> placeholder
      for (const key of toCollapse) {
        const oldDom = document.getElementById(key)
        if (!oldDom || oldDom.hasAttribute('data-placeholder')) continue

        const cachedHeight = this.cache.get(key)
        const height = cachedHeight != null ? cachedHeight : 60
        const placeholderHtml = `<div id="${key}" data-placeholder="" data-block-key="${key}" class="${CLASS_OR_ID.AG_PARAGRAPH}" style="height:${height}px;overflow:hidden"></div>`
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
export { DEBUG, log }
