const cp = window.nodeChildProcess
export const spawn = cp.spawn.bind(cp)
export const exec = cp.exec.bind(cp)
export const execFile = cp.execFile.bind(cp)
export default cp
