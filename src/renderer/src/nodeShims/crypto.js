const c = window.nodeCrypto
export const createHash = c.createHash.bind(c)
export default c
