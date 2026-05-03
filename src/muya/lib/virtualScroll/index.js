// Virtual scroll manager — block-level virtual window for scroll performance.
//
// Developer diagnostics: enable via localStorage.setItem('mt_vscroll_debug', '1')
//
// DEBUG module-level flag — checked before every console.log.
// log() wrapper — uses spread args, guarded by DEBUG.

const DEBUG = typeof localStorage !== 'undefined' && localStorage.getItem('mt_vscroll_debug') === '1'
const log = (...args) => DEBUG && console.log('[VirtualScroll]', ...args)

// Placeholder: VirtualScrollManager class will be added in Task 3.
// HeightCache and ViewportDetector will be imported and wired there.

export { DEBUG, log }
