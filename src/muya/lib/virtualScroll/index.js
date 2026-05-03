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
      if (dom && !dom.hasAttribute('data-placeholder')) {
        const height = dom.getBoundingClientRect().height
        if (height > 0) {
          this.cache.set(key, height)
        }
      }
    }

    log('_measureHeights: measured', measureKeys.size, 'blocks, cache size:', this.cache.size)

    // Keep rendered-keys tracker in sync with current visible+buffer set
    this._renderedKeys = new Set(measureKeys)
  }

  /**
   * Called on scroll. Swaps blocks between placeholder and real DOM
   * as they enter or exit the visible+buffer zone. Throttled via rAF.
   * Uses batch DOM replacement to avoid per-block layout thrashing.
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

      // Batch collapse: real DOM -> placeholder (single DOM insert + single remove pass)
      if (toCollapse.length > 0) {
        let collapseHtml = ''
        const collapseKeys = []
        for (const key of toCollapse) {
          const oldDom = document.getElementById(key)
          if (!oldDom || oldDom.hasAttribute('data-placeholder')) continue
          const cachedHeight = this.cache.get(key)
          const height = cachedHeight != null && cachedHeight > 0 ? cachedHeight : 60
          collapseHtml += `<div id="${key}" data-placeholder="" data-block-key="${key}" class="${CLASS_OR_ID.AG_PARAGRAPH}" style="height:${height}px;overflow:hidden;contain:strict"></div>`
          collapseKeys.push(key)
        }
        if (collapseKeys.length > 0) {
          const anchor = document.getElementById(collapseKeys[0])
          if (anchor) {
            anchor.insertAdjacentHTML('beforebegin', collapseHtml)
            for (const key of collapseKeys) {
              const oldDom = document.getElementById(key)
              if (oldDom && !oldDom.hasAttribute('data-placeholder')) oldDom.remove()
              this._renderedKeys.delete(key)
            }
          }
        }
      }

      // Batch render: placeholder -> real DOM
      if (toRender.length > 0) {
        let renderHtml = ''
        const renderKeys = []
        for (const key of toRender) {
          const oldDom = document.getElementById(key)
          if (!oldDom) continue
          const block = this.stateRender.muya.contentState.getBlock(key)
          if (!block) {
            oldDom.remove()
            this._renderedKeys.delete(key)
            continue
          }
          const newVnode = this.stateRender.renderBlock(null, block, activeBlocks, matches, false, t)
          renderHtml += toHTML(newVnode)
          renderKeys.push(key)
        }
        if (renderKeys.length > 0) {
          const anchor = document.getElementById(renderKeys[0])
          if (anchor) {
            anchor.insertAdjacentHTML('beforebegin', renderHtml)
            for (const key of renderKeys) {
              const oldDom = document.getElementById(key)
              if (oldDom && oldDom.hasAttribute('data-placeholder')) oldDom.remove()
              else if (oldDom) oldDom.remove()
              this._renderedKeys.add(key)
            }
          }
        }
      }

      // Measure new real blocks
      this.afterRender()
    })
  }
}

export default VirtualScrollManager
export { DEBUG, log }
