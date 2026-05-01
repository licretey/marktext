const f = window.nodeFs
const fu = window.fileUtils

export const readFileSync = f.readFileSync.bind(f)
export const readdirSync = f.readdirSync.bind(f)
export const renameSync = f.renameSync.bind(f)
export const statSync = (p) => f.statSync(p)
export const constants = f.constants

// Also expose async versions via fileUtils
export const stat = fu.stat.bind(fu)
export const readFile = fu.readFile.bind(fu)
export const writeFile = fu.writeFile.bind(fu)

const fs = {
  ...f,
  ...fu,
  statSync: (p) => f.statSync(p),
  constants: f.constants
}

export default fs
