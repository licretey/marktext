import ViewportDetector from '../../../src/muya/lib/virtualScroll/viewportDetector.js'

class MockCache {
  constructor(heights) { this._h = heights }
  get(key) { return this._h[key] }
}

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

  it('blocks far below viewport are placeholder', () => {
    const container = new MockContainer(0, 100)
    const cache = new MockCache({
      k0: 60, k1: 60, k2: 60, k3: 60, k4: 60,
      k5: 60, k6: 60, k7: 60, k8: 60, k9: 60
    })
    const keys = ['k0','k1','k2','k3','k4','k5','k6','k7','k8','k9']
    const result = detector.computeVisible(container, cache, keys, null)
    expect(result.placeholderKeys.size).to.be.greaterThan(0)
    expect(result.visibleKeys.has('k0')).to.be.true
    expect(result.placeholderKeys.has('k9')).to.be.true
  })

  it('blocks above viewport become placeholder when scrolled down', () => {
    const container = new MockContainer(500, 100)
    const heights = {}
    const keys = []
    for (let i = 0; i < 12; i++) { heights['k' + i] = 60; keys.push('k' + i) }
    const cache = new MockCache(heights)
    const result = detector.computeVisible(container, cache, keys, null)
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
    const cache = new MockCache({ k0: 60, k1: 60 })
    const result = detector.computeVisible(container, cache, ['k0', 'k1', 'k2'], null)
    expect(result.visibleKeys.has('k2')).to.be.true
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
