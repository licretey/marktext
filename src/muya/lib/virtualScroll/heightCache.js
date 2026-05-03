class HeightCache {
  constructor() {
    this._cache = new Map()
    this._order = null
  }

  setOrder(keys) {
    this._order = keys
  }

  get(key) {
    const entry = this._cache.get(key)
    return entry ? entry.height : undefined
  }

  set(key, height) {
    const prev = this._cache.get(key)
    this._cache.set(key, {
      height,
      version: prev ? prev.version + 1 : 1,
      measuredAt: Date.now()
    })
  }

  invalidate(key) {
    this._cache.delete(key)
  }

  invalidateAfter(key) {
    if (!this._order) return
    const idx = this._order.indexOf(key)
    if (idx === -1) return
    for (let i = idx + 1; i < this._order.length; i++) {
      this._cache.delete(this._order[i])
    }
  }

  invalidateRange(startKey, endKey) {
    if (!this._order) return
    const startIdx = this._order.indexOf(startKey)
    if (startIdx === -1) return
    const endIdx = endKey ? this._order.indexOf(endKey) : this._order.length - 1
    const end = endIdx === -1 ? this._order.length - 1 : endIdx
    for (let i = startIdx; i <= end && i < this._order.length; i++) {
      this._cache.delete(this._order[i])
    }
  }

  clear() {
    this._cache.clear()
    this._order = null
  }

  get size() {
    return this._cache.size
  }
}

export default HeightCache
