import { resolve, dirname } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'
import postcssPresetEnv from 'postcss-preset-env'
import packageJson from './package.json' with { type: 'json' }
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  main: {
    build: {
      externalizeDeps: {
        exclude: ['electron-store']
      }
    },
    define: {
      MARKTEXT_VERSION: JSON.stringify(packageJson.version),
      MARKTEXT_VERSION_STRING: JSON.stringify(`v${packageJson.version}`)
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        common: resolve(__dirname, 'src/common'),
        muya: resolve(__dirname, 'src/muya'),
        main_renderer: resolve(__dirname, 'src/main')
      },
      extensions: ['.mjs', '.js', '.json']
    }
  },
  preload: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        common: resolve(__dirname, 'src/common'),
        muya: resolve(__dirname, 'src/muya'),
        main_renderer: resolve(__dirname, 'src/main')
      },
      extensions: ['.mjs', '.js', '.json']
    }
  },
  renderer: {
    define: {
      // contextIsolation: true — Node.js globals are unavailable in renderer.
      // Replace bare identifiers with globalThis/window.* equivalents.
      global: 'globalThis',
      process: 'window.process',
      Buffer: 'window.nodeBuffer'
    },
    assetsInclude: ['**/*.md'],
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/out/**', '**/.git/**'],
        usePolling: true,
        interval: 1000
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        common: resolve(__dirname, 'src/common'),
        muya: resolve(__dirname, 'src/muya'),
        main_renderer: resolve(__dirname, 'src/main'),
        // Override Node.js builtins with contextBridge-compatible shims
        // NOTE: sub-path aliases (fs/promises) must come BEFORE their parent (fs) — Vite does prefix matching
        'fs/promises': resolve(__dirname, 'src/renderer/src/nodeShims/fs/promises.js'),
        path: resolve(__dirname, 'src/renderer/src/nodeShims/path.js'),
        fs: resolve(__dirname, 'src/renderer/src/nodeShims/fs.js'),
        crypto: resolve(__dirname, 'src/renderer/src/nodeShims/crypto.js'),
        os: resolve(__dirname, 'src/renderer/src/nodeShims/os.js'),
        url: resolve(__dirname, 'src/renderer/src/nodeShims/url.js'),
        zlib: resolve(__dirname, 'src/renderer/src/nodeShims/zlib.js'),
        child_process: resolve(__dirname, 'src/renderer/src/nodeShims/child_process.js'),
        electron: resolve(__dirname, 'src/renderer/src/nodeShims/electron.js')
      },
      extensions: ['.mjs', '.js', '.json', '.vue']
    },
    plugins: [
      vue(),
      svgLoader()
    ],
    css: {
      postcss: {
        plugins: [
          postcssPresetEnv({
            stage: 0,
            features: { 'nesting-rules': true }
          })
        ]
      }
    }
  }
})
