const BUFFER_RATIO = 2.0

class ViewportDetector {
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

    for (const key of allBlockKeys) {
      const cachedHeight = cache.get(key)

      if (cachedHeight === undefined) {
        visibleKeys.add(key)
        accumulatedY += 60
      } else {
        const blockBottom = accumulatedY + cachedHeight

        if (blockBottom < effectiveTop) {
          placeholderKeys.add(key)
        } else if (accumulatedY > effectiveBottom) {
          placeholderKeys.add(key)
        } else if (accumulatedY >= effectiveTop && blockBottom <= effectiveBottom) {
          visibleKeys.add(key)
        } else {
          bufferKeys.add(key)
        }

        accumulatedY = blockBottom
      }
    }

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
