import HeightCache from '../../../src/muya/lib/virtualScroll/heightCache.js'

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
    cache.set('a', 30)
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
    cache.set('k0', 10)
    cache.set('k1', 20)
    cache.set('k2', 30)
    cache.set('k3', 40)
    cache.set('k4', 50)
    cache.setOrder(['k0', 'k1', 'k2', 'k3', 'k4'])
    cache.invalidateAfter('k2')
    expect(cache.get('k0')).to.equal(10)
    expect(cache.get('k1')).to.equal(20)
    expect(cache.get('k2')).to.equal(30)
    expect(cache.get('k3')).to.be.undefined
    expect(cache.get('k4')).to.be.undefined
    expect(cache.size).to.equal(3)
  })

  it('invalidateAfter without order list invalidates nothing beyond the key', () => {
    cache.set('a', 10)
    cache.set('b', 20)
    cache.invalidateAfter('a')
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
