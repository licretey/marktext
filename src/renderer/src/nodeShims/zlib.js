const z = window.nodeZlib
export const deflateSync = (buf, opts) => z.deflateSync(buf, opts)
export default z
