# Security Hardening Phase 2 Design

**Date**: 2026-05-02
**Status**: Approved

## Scope

Non-sandbox security hardening. Sandbox (`sandbox: true`) is deferred to Phase 3.

## Changes

### 1. Permission Request Handler

**File**: `src/main/app/index.js`

Add `setPermissionRequestHandler` in the `web-contents-created` callback. Allow only `clipboard-read`, `clipboard-write`, and `notifications`. Deny all others (camera, microphone, geolocation, midi, pointerLock, fullscreen, etc.).

The clipboard and notification permissions are for the Web Permissions API (`navigator.clipboard`, `new Notification()`). MarkText does not use these web APIs — clipboard goes through the Electron clipboard module via preload, notifications use a custom Vue component. These permissions are allowed as defense-in-depth in case future code uses the web APIs.

### 2. Protocol Whitelist for shell.openExternal

**Files**: `src/main/config.js`, `src/preload/index.js`, `src/main/menu/actions/file.js`

Default allowed protocols: `https:`, `http:`, `webdav:`, `smb:`, `ftp:`, `sftp:`, `mailto:`

- Add `ALLOWED_PROTOCOLS` constant to config.js
- Preload `openExternal` wrapper checks protocol against whitelist before calling `shell.openExternal`
- Main process `mt::format-link-click` handler also checks protocol
- Non-whitelisted protocols are silently rejected
- Protocols are compared by URL scheme prefix (e.g. `https:`)

### 3. Environment Variable Exposure

**No change**. Current exposure of `process.env` fields is acceptable for app functionality.

### 4. Markdown Link Confirmation Dialog

**No change**. Current behavior (no confirmation for http/https links) is preferred for UX.

### 5. HTTP to HTTPS for Pandoc Link

**File**: `src/renderer/src/store/notification.js`

Use HTTPS in production, HTTP in development:

```
`${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://pandoc.org`
```

## Files Changed

| File | Change |
|------|--------|
| `src/main/app/index.js` | Add `setPermissionRequestHandler` |
| `src/main/config.js` | Add `ALLOWED_PROTOCOLS` constant |
| `src/preload/index.js` | Protocol validation in `openExternal` wrapper |
| `src/main/menu/actions/file.js` | Protocol validation in `mt::format-link-click` |
| `src/renderer/src/store/notification.js` | Conditional HTTPS for pandoc link |

## Out of Scope

- `sandbox: true` (Phase 3)
- Removing `@electron/remote` (Phase 3 prerequisite)
- Preferences UI for protocol whitelist management (future enhancement)
- Reducing preload API surface (Phase 3 prerequisite)
