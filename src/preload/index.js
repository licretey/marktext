import { contextBridge, shell, clipboard, webUtils, ipcRenderer, webFrame } from 'electron'
import fs from 'fs-extra'
import { isFile, isDirectory, ensureDirSync } from 'common/filesystem'
import { electronAPI } from '@electron-toolkit/preload'
import {
  isChildOfDirectory,
  hasMarkdownExtension,
  MARKDOWN_INCLUSIONS,
  isSamePathSync,
  isImageFile
} from 'common/filesystem/paths'
import { rgPath } from '@vscode/ripgrep'
import path from 'path'
import commandExists from 'command-exists'
import { loadTranslations } from '../common/i18n'
import crypto from 'crypto'
import os from 'os'
import url from 'url'
import cp from 'child_process'
import zlib from 'zlib'


const i18nUtils = {
  loadTranslations
}

// Wrap Electron modules in plain objects — contextBridge only supports
// serializable values (plain objects, functions, primitives).
const customElectronAPI = {
  shell: {
    openExternal: (url) => {
      try {
        const allowed = ['https:', 'http:', 'webdav:', 'smb:', 'ftp:', 'sftp:', 'mailto:']
        const protocol = new URL(url).protocol
        if (allowed.includes(protocol)) {
          shell.openExternal(url)
        } else {
          ipcRenderer.send('mt::blocked-protocol')
        }
      } catch (_) {
        // Invalid URL, silently ignore
      }
    },
    showItemInFolder: (path) => shell.showItemInFolder(path),
    openPath: (path) => shell.openPath(path)
  },
  clipboard: {
    writeText: (text) => clipboard.writeText(text)
  },
  webUtils: {
    getPathForFile: (file) => webUtils.getPathForFile(file)
  }
}

const fileUtilsAPI = {
  isFile: (path) => isFile(path),
  isDirectory: (path) => isDirectory(path),
  emptyDir: (path) => fs.emptyDir(path),
  copy: (src, dest) => fs.copy(src, dest),
  ensureDir: (path) => fs.ensureDir(path),
  outputFile: (path, data) => fs.outputFile(path, data),
  move: (src, dest) => fs.move(src, dest),
  stat: (path) => fs.stat(path),
  writeFile: (path, data, encoding) => {
    // Handle Buffer-like objects passed from renderer (contextBridge serialized)
    if (data && data.type === 'Buffer' && Array.isArray(data.data)) {
      data = Buffer.from(data.data)
    }
    return fs.writeFile(path, data, encoding)
  },
  readFile: (path) => fs.readFile(path),
  ensureDirSync: (path) => ensureDirSync(path),
  pathExistsSync: (path) => fs.pathExistsSync(path),
  isChildOfDirectory: (dir, child) => isChildOfDirectory(dir, child),
  hasMarkdownExtension: (filename) => hasMarkdownExtension(filename),
  MARKDOWN_INCLUSIONS,
  isSamePathSync: (pathA, pathB) => isSamePathSync(pathA, pathB),
  isImageFile: (filepath) => isImageFile(filepath)
}

const commandAPI = {
  exists: (command) => {
    try {
      // 先尝试使用 command-exists 检查
      if (commandExists.sync(command)) {
        return true
      }

      // 对于 picgo，额外检查常见安装路径
      if (command === 'picgo' && process.platform === 'darwin') {
        const commonPaths = [
          '/usr/local/bin/picgo',
          '/opt/homebrew/bin/picgo',
          `${process.env.HOME}/.npm-global/bin/picgo`,
          `${process.env.HOME}/.npm/bin/picgo`,
          '/usr/local/lib/node_modules/.bin/picgo'
        ]

        for (const picgoPath of commonPaths) {
          if (fs.pathExistsSync(picgoPath)) {
            console.log(`Found picgo at: ${picgoPath}`)
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking command existence:', error)
      return false
    }
  }
}

// Node.js built-in APIs exposed for renderer compatibility shims.
// These run in the preload's privileged context where Node.js is available.

const nodeFs = {
  readFile: (p, opts) => fs.readFile(p, opts),
  readFileSync: (p, opts) => {
    const raw = fs.readFileSync(p, opts)
    if (raw === null || raw === undefined) return raw
    if (typeof raw === 'string') return raw
    return raw.toString('utf-8')
  },
  readdirSync: (p) => fs.readdirSync(p),
  renameSync: (oldPath, newPath) => fs.renameSync(oldPath, newPath),
  statSync: (p) => {
    const s = fs.statSync(p)
    return {
      mode: s.mode,
      size: s.size,
      mtimeMs: s.mtimeMs,
      ctimeMs: s.ctimeMs,
      atimeMs: s.atimeMs,
      birthtimeMs: s.birthtimeMs,
      isFile: s.isFile(),
      isDirectory: s.isDirectory(),
      isSymbolicLink: s.isSymbolicLink(),
      isBlockDevice: s.isBlockDevice(),
      isCharacterDevice: s.isCharacterDevice(),
      isFIFO: s.isFIFO(),
      isSocket: s.isSocket(),
      dev: s.dev,
      ino: s.ino,
      nlink: s.nlink,
      uid: s.uid,
      gid: s.gid,
      rdev: s.rdev,
      blksize: s.blksize,
      blocks: s.blocks
    }
  },
  constants: {
    F_OK: fs.constants.F_OK,
    R_OK: fs.constants.R_OK,
    W_OK: fs.constants.W_OK,
    X_OK: fs.constants.X_OK,
    COPYFILE_EXCL: fs.constants.COPYFILE_EXCL,
    COPYFILE_FICLONE: fs.constants.COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE: fs.constants.COPYFILE_FICLONE_FORCE,
    S_IXUSR: fs.constants.S_IXUSR,
    S_IXGRP: fs.constants.S_IXGRP,
    S_IXOTH: fs.constants.S_IXOTH,
    S_IRUSR: fs.constants.S_IRUSR,
    S_IWUSR: fs.constants.S_IWUSR,
    S_IRGRP: fs.constants.S_IRGRP,
    S_IROTH: fs.constants.S_IROTH
  }
}

const nodeCrypto = {
  createHash: (type) => ({
    update: (content, encoding) => ({
      digest: (format) => crypto.createHash(type).update(content, encoding).digest(format)
    })
  })
}

const nodeOs = {
  tmpdir: () => os.tmpdir()
}

const nodeUrl = {
  fileURLToPath: (u) => url.fileURLToPath(u)
}

const nodeBuffer = {
  from: (data, encoding) => {
    const buf = Buffer.from(data, encoding)
    return {
      type: 'Buffer',
      data: Array.from(buf),
      toString: (enc) => buf.toString(enc)
    }
  },
  byteLength: (str) => Buffer.byteLength(str)
}

const nodeZlib = {
  deflateSync: (buf, opts) => {
    const result = zlib.deflateSync(Buffer.from(buf), opts)
    return {
      type: 'Buffer',
      data: Array.from(result),
      toString: (enc) => result.toString(enc)
    }
  }
}

const nodeChildProcess = {
  spawn: (cmd, args, opts) => {
    const child = cp.spawn(cmd, args, opts)
    return {
      on: (event, cb) => {
        child.on(event, (...a) => {
          // Convert Buffer args to strings for contextBridge serialization
          cb(...a.map((v) => (Buffer.isBuffer(v) ? v.toString('utf-8') : v)))
        })
      },
      get stdout() {
        return {
          on: (event, cb) => {
            child.stdout?.on(event, (chunk) => {
              cb(Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk)
            })
          }
        }
      },
      get stderr() {
        return {
          on: (event, cb) => {
            child.stderr?.on(event, (chunk) => {
              cb(Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : chunk)
            })
          }
        }
      },
      kill: () => child.kill()
    }
  },
  exec: (cmd, opts, cb) => {
    // Handle exec(cmd, cb) and exec(cmd, opts, cb) signatures
    const callback = typeof opts === 'function' ? opts : cb
    const options = typeof opts === 'function' ? undefined : opts
    return cp.exec(cmd, options, (err, stdout, stderr) => {
      callback(err, stdout, stderr)
    })
  },
  execFile: (cmd, args, opts, cb) => {
    const callback = typeof opts === 'function' ? opts : cb
    const options = typeof opts === 'function' ? undefined : opts
    return cp.execFile(cmd, args, options, (err, stdout, stderr) => {
      callback(err, stdout, stderr)
    })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // Inject writable window.process in main world via webFrame.executeJavaScript.
    // contextBridge creates read-only properties — use executeJavaScript instead
    // so that code which assigns to window.process (e.g. process/browser.js
    // polyfill processed by Vite's define) works without error.
    // Must be fire-and-forget in preload; executeJavaScript runs in the main
    // world's microtask queue before page scripts.
    // Inject a proper Buffer constructor in the main world — instanceOf checks
    // (e.g. @electron/remote valueToMeta) require Buffer to be callable.
    webFrame.executeJavaScript(`
      class NodeBuffer extends Uint8Array {
        static from(data, byteOffset, length) {
          if (typeof data === 'string') return new NodeBuffer(new TextEncoder().encode(data))
          if (data instanceof ArrayBuffer) return new NodeBuffer(new Uint8Array(data, byteOffset || 0, length || data.byteLength))
          if (Array.isArray(data)) return new NodeBuffer(data)
          if (data instanceof Uint8Array) return new NodeBuffer(data)
          if (data && data.type === 'Buffer' && Array.isArray(data.data)) return new NodeBuffer(data.data)
          return new NodeBuffer(data)
        }
        static byteLength(str) {
          if (typeof str === 'string') return new TextEncoder().encode(str).length
          return str && str.length || 0
        }
        toString(encoding) { return new TextDecoder('utf-8').decode(this) }
      }
      window.nodeBuffer = NodeBuffer
    `)
    webFrame.executeJavaScript(`window.process = Object.assign(${JSON.stringify({
      platform: process.platform,
      env: { ...process.env },
      resourcesPath: process.resourcesPath,
      versions: { ...process.versions },
      contextId: process.contextId,
      argv: [],
      title: 'browser',
      browser: true,
      version: '',
      cwd: function() { return '/' },
      chdir: function() {},
      umask: function() { return 0 },
      binding: function() { throw new Error('process.binding is not supported') },
      listeners: function() { return [] },
      emit: function() {},
      addListener: function() {},
      once: function() {},
      off: function() {},
      removeListener: function() {},
      removeAllListeners: function() {},
      prependListener: function() {},
      prependOnceListener: function() {},
      getuid: function() { return 0 },
      getgid: function() { return 0 },
      geteuid: function() { return 0 },
      getegid: function() { return 0 },
      getgroups: function() { return [] },
      hrtime: function() { return [0, 0] },
      cpuUsage: function() { return { user: 0, system: 0 } },
      memoryUsage: function() { return { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 } },
      uptime: function() { return 0 },
      exit: function() {},
      kill: function() {},
      pid: 0,
      ppid: 0,
      features: {},
      execPath: '',
      debugPort: 0,
      _maxListeners: undefined,
      config: {}
    })}, { on: function(event, cb) {} })`)
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ...customElectronAPI,
      getSystemFonts: () => ipcRenderer.invoke('mt::get-system-fonts')
    })
    contextBridge.exposeInMainWorld('rgPath', rgPath)
    contextBridge.exposeInMainWorld('fileUtils', fileUtilsAPI)
    contextBridge.exposeInMainWorld('path', path)
    contextBridge.exposeInMainWorld('commandExists', commandAPI)
    contextBridge.exposeInMainWorld('i18nUtils', i18nUtils)
    contextBridge.exposeInMainWorld('nodeFs', nodeFs)
    contextBridge.exposeInMainWorld('nodeCrypto', nodeCrypto)
    contextBridge.exposeInMainWorld('nodeOs', nodeOs)
    contextBridge.exposeInMainWorld('nodeUrl', nodeUrl)
    contextBridge.exposeInMainWorld('nodeZlib', nodeZlib)
    contextBridge.exposeInMainWorld('nodeChildProcess', nodeChildProcess)
  } catch (error) {
    console.error('FAILED to expose APIs:', error)
  }
} else {
  window.process = {
    platform: process.platform,
    env: { ...process.env },
    resourcesPath: process.resourcesPath,
    versions: { ...process.versions }
  }
  window.electron = { ...electronAPI, ...customElectronAPI, getSystemFonts: () => ipcRenderer.invoke('mt::get-system-fonts') }
  window.rgPath = rgPath
  window.fileUtils = fileUtilsAPI
  window.path = path
  window.commandExists = commandAPI
  window.i18nUtils = i18nUtils
  window.nodeBuffer = nodeBuffer
  window.nodeFs = nodeFs
  window.nodeCrypto = nodeCrypto
  window.nodeOs = nodeOs
  window.nodeUrl = nodeUrl
  window.nodeZlib = nodeZlib
  window.nodeChildProcess = nodeChildProcess
}
