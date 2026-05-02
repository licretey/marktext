# Security Hardening Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden Electron security by adding permission request handling, protocol whitelist validation for external URL opening, and conditional HTTPS.

**Architecture:** Five isolated changes across five files. A shared `ALLOWED_PROTOCOLS` constant in config.js is imported by both preload (for renderer-initiated `openExternal` calls) and main process (for markdown link click handling). Permission handling is a standalone block in the existing `web-contents-created` callback.

**Tech Stack:** Electron 41, Node.js, no new dependencies

---

### Task 1: Add ALLOWED_PROTOCOLS constant

**Files:**
- Modify: `src/main/config.js`

- [ ] **Step 1: Add constant to config.js**

Add after the `URL_REG` export at line 83:

```js
export const ALLOWED_PROTOCOLS = Object.freeze([
  'https:',
  'http:',
  'webdav:',
  'smb:',
  'ftp:',
  'sftp:',
  'mailto:'
])
```

- [ ] **Step 2: Verify**

Run: `grep -n 'ALLOWED_PROTOCOLS' src/main/config.js`
Expected: Shows the new lines.

- [ ] **Step 3: Commit**

```bash
git add src/main/config.js
git commit -m "feat: add ALLOWED_PROTOCOLS whitelist for shell.openExternal validation"
```

---

### Task 2: Add setPermissionRequestHandler

**Files:**
- Modify: `src/main/app/index.js:104-115`

- [ ] **Step 1: Add permission handler**

Replace the existing `web-contents-created` callback body (lines 105-114) with:

```js
    app.on('web-contents-created', (event, contents) => {
      contents.on('will-attach-webview', (event) => {
        event.preventDefault()
      })
      contents.on('will-navigate', (event) => {
        event.preventDefault()
      })
      contents.setWindowOpenHandler((details) => {
        return { action: 'deny' }
      })

      contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowed = ['clipboard-read', 'clipboard-write', 'notifications']
        callback(allowed.includes(permission))
      })
    })
```

- [ ] **Step 2: Verify**

Run: `grep -A 3 'setPermissionRequestHandler' src/main/app/index.js`
Expected: Shows the handler with allowed permissions list.

- [ ] **Step 3: Commit**

```bash
git add src/main/app/index.js
git commit -m "feat: add setPermissionRequestHandler to deny camera/mic/geolocation"
```

---

### Task 3: Protocol validation in preload openExternal

**Files:**
- Modify: `src/preload/index.js:29-31`

- [ ] **Step 1: Add protocol check to openExternal wrapper**

Import `ALLOWED_PROTOCOLS` at top of preload. Currently config.js is not imported in preload — use a local copy of the protocol list since preload runs in a separate context and cannot import from main process ESM modules directly.

Replace the `openExternal` wrapper at line 31:

```js
    openExternal: (url) => {
      const allowed = ['https:', 'http:', 'webdav:', 'smb:', 'ftp:', 'sftp:', 'mailto:']
      const protocol = new URL(url).protocol
      if (allowed.includes(protocol)) {
        shell.openExternal(url)
      }
    },
```

- [ ] **Step 2: Verify**

Run: `grep -A 8 'openExternal:' src/preload/index.js`
Expected: Shows the new wrapper with protocol validation.

- [ ] **Step 3: Commit**

```bash
git add src/preload/index.js
git commit -m "feat: add protocol whitelist validation to preload openExternal"
```

---

### Task 4: Protocol validation in mt::format-link-click handler

**Files:**
- Modify: `src/main/menu/actions/file.js:523-525`

- [ ] **Step 1: Add protocol check before shell.openExternal**

Replace lines 523-525:

```js
  if (URL_REG.test(urlCandidate)) {
    shell.openExternal(urlCandidate)
    return
```

with:

```js
  if (URL_REG.test(urlCandidate)) {
    const protocol = new URL(urlCandidate).protocol
    if (ALLOWED_PROTOCOLS.includes(protocol)) {
      shell.openExternal(urlCandidate)
    }
    return
```

Add `ALLOWED_PROTOCOLS` to the existing import from `../../config` at line 7:

```js
import { EXTENSION_HASH, PANDOC_EXTENSIONS, URL_REG, ALLOWED_PROTOCOLS } from '../../config'
```

- [ ] **Step 2: Verify**

Run: `grep -B 2 -A 5 'ALLOWED_PROTOCOLS' src/main/menu/actions/file.js`
Expected: Shows import and protocol check.

- [ ] **Step 3: Commit**

```bash
git add src/main/menu/actions/file.js
git commit -m "feat: add protocol whitelist validation to markdown link click handler"
```

---

### Task 5: Conditional HTTPS for pandoc link

**Files:**
- Modify: `src/renderer/src/store/notification.js:26`

- [ ] **Step 1: Change pandoc URL to conditional HTTPS**

Replace line 26:

```js
        window.electron.shell.openExternal('http://pandoc.org')
```

with:

```js
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
        window.electron.shell.openExternal(`${protocol}://pandoc.org`)
```

- [ ] **Step 2: Verify**

Run: `grep -A 2 'pandoc.org' src/renderer/src/store/notification.js`
Expected: Shows conditional protocol logic.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/store/notification.js
git commit -m "fix: use HTTPS for pandoc link in production"
```

---

### Task 6: Integration test

- [ ] **Step 1: Build and start the app**

```bash
npm run dev
```

- [ ] **Step 2: Verify no regressions**

- [x] App starts without errors
- [x] Open a markdown file, click a https link → opens in browser
- [x] Click a `mailto:` link → opens email client
- [x] Click a `javascript:` link → silently ignored (open any `.md`, add `[test](javascript:alert(1))`, click it)
- [x] `file://` links to local markdown files still open correctly (these go through the `else` branch in file.js, not `shell.openExternal`)
- [x] Pandoc notification link opens pandoc.org
- [x] No new console errors

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "chore: integration test fixes for security hardening phase 2"
```
