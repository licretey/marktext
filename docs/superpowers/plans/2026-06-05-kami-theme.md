# Kami Theme Series — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 Kami design system themes (kami, kami-yami, kami-rainbow) to MarkText following the existing theme registration pattern.

**Architecture:** Follow the project's 7-registration-point theme system: CSS file → themeColor.ts import → util/theme.ts switch → config.ts listing → menu template → window background color → i18n labels. No new infrastructure needed.

**Tech Stack:** CSS custom properties, TypeScript

**Spec:** `docs/superpowers/specs/2026-06-05-kami-theme-design.md`

---

## File Map

| Operation | File |
|-----------|------|
| Create | `packages/desktop/src/renderer/src/assets/themes/kami.theme.css` |
| Create | `packages/desktop/src/renderer/src/assets/themes/kami-yami.theme.css` |
| Create | `packages/desktop/src/renderer/src/assets/themes/kami-rainbow.theme.css` |
| Create | `packages/desktop/src/renderer/src/assets/themes/prismjs/kami.theme.css` |
| Create | `packages/desktop/src/renderer/src/assets/themes/prismjs/kami-yami.theme.css` |
| Create | `packages/desktop/src/renderer/src/assets/themes/prismjs/kami-rainbow.theme.css` |
| Modify | `packages/desktop/src/common/theme.ts` |
| Modify | `packages/desktop/src/renderer/src/util/themeColor.ts` |
| Modify | `packages/desktop/src/renderer/src/util/theme.ts` |
| Modify | `packages/desktop/src/renderer/src/prefComponents/theme/config.ts` |
| Modify | `packages/desktop/src/main/menu/templates/theme.ts` |
| Modify | `packages/desktop/src/main/windows/base.ts` |
| Modify | `packages/desktop/static/locales/*.json` (9 files) |

---

### Task 1: Create kami.theme.css (Light)

**Files:**
- Create: `packages/desktop/src/renderer/src/assets/themes/kami.theme.css`

- [ ] **Step 1: Write kami.theme.css**

```css
:root {
  /* Kami theme — warm parchment, ink-blue accent */
  --themeColor: #1B365D;
  --themeColor90: rgba(27, 54, 93, 0.9);
  --themeColor80: rgba(27, 54, 93, 0.8);
  --themeColor70: rgba(27, 54, 93, 0.7);
  --themeColor60: rgba(27, 54, 93, 0.6);
  --themeColor50: rgba(27, 54, 93, 0.5);
  --themeColor40: rgba(27, 54, 93, 0.4);
  --themeColor30: rgba(27, 54, 93, 0.3);
  --themeColor20: rgba(27, 54, 93, 0.2);
  --themeColor10: rgba(27, 54, 93, 0.1);

  --highlightColor: rgba(27, 54, 93, 0.2);
  --selectionColor: rgba(27, 54, 93, 0.15);
  --editorColor: #3d3d3a;
  --editorColor80: rgba(61, 61, 58, 0.8);
  --editorColor60: rgba(61, 61, 58, 0.6);
  --editorColor50: rgba(61, 61, 58, 0.5);
  --editorColor40: rgba(61, 61, 58, 0.4);
  --editorColor30: rgba(61, 61, 58, 0.3);
  --editorColor10: rgba(61, 61, 58, 0.1);
  --editorColor04: rgba(61, 61, 58, 0.04);
  --editorBgColor: #f5f4ed;
  --deleteColor: #8b4513;
  --iconColor: rgba(61, 61, 58, 0.56);
  --codeBgColor: #faf9f5;
  --codeBlockBgColor: #faf9f5;
  --footnoteBgColor: rgba(80, 78, 73, 0.04);
  --inputBgColor: #faf9f5;

  --focusColor: var(--themeColor);

  --buttonFontColor: rgba(61, 61, 58, 0.7);
  --buttonBgColor: #e8e6dc;
  --buttonBorder: 1px solid #e8e6dc;
  --buttonShadow: none;
  --buttonFontColorHover: var(--buttonFontColor);
  --buttonBgColorHover: #ddd9cf;
  --buttonBorderHover: 1px solid #d5d1c7;
  --buttonFontColorActive: var(--buttonFontColor);
  --buttonBgColorActive: #d5d1c7;
  --buttonBorderActive: 1px solid #ccc8bd;

  --buttonPrimaryFontColor: #faf9f5;
  --buttonPrimaryBgColor: var(--themeColor);
  --buttonPrimaryBorder: none;
  --buttonPrimaryShadow: none;
  --buttonPrimaryFontColorHover: var(--buttonPrimaryFontColor);
  --buttonPrimaryBgColorHover: #2D5A8A;
  --buttonPrimaryBorderHover: var(--buttonPrimaryBorder);
  --buttonPrimaryFontColorActive: var(--buttonPrimaryFontColor);
  --buttonPrimaryBgColorActive: #142845;
  --buttonPrimaryBorderActive: var(--buttonPrimaryBorder);
  --buttonPrimaryFocusBorder: none;
  --buttonPrimaryFocusShadow: inset 0 0 0 1px rgba(250, 249, 245, 0.5), 0 0 0 1px var(--themeColor);
  --tableBorderColor: #e8e6dc;

  /* Markdown element colors — warm-gray scale, h1 as only chromatic heading */
  --headingColor: #141413;
  --h1Color: #1B365D;
  --h2Color: #141413;
  --h3Color: #3d3d3a;
  --h4Color: #504e49;
  --h5Color: #6b6a64;
  --h6Color: #6b6a64;
  --blockquoteTextColor: #504e49;
  --blockquoteBorderColor: #1B365D;
  --hrColor: #e8e6dc;
  --linkColor: #1B365D;
  --strongColor: #141413;
  --emColor: #504e49;
  --listMarkerColor: #1B365D;

  /* Sidebar */
  --sideBarColor: rgba(61, 61, 58, 0.7);
  --sideBarIconColor: var(--iconColor);
  --sideBarTitleColor: #3d3d3a;
  --sideBarTextColor: #6b6a64;
  --sideBarBgColor: #faf9f5;
  --sideBarItemHoverBgColor: rgba(61, 61, 58, 0.05);
  --itemBgColor: #e8e6dc;

  /* Float elements */
  --floatFontColor: rgba(61, 61, 58, 0.8);
  --floatBgColor: #faf9f5;
  --floatHoverColor: rgba(61, 61, 58, 0.06);
  --floatBorderColor: #e8e6dc;
  --floatShadow: rgba(0, 0, 0, 0.06);
  --maskColor: rgba(0, 0, 0, 0.2);
  --editorAreaWidth: 750px;
}

.side-bar {
  border-right: 1px solid #e8e6dc !important;
}

.editor-tabs {
  box-shadow: none !important;
}
.editor-tabs:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid #e8e6dc;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.editor-tabs ul.tabs-container:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid #e8e6dc;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.tabs-container > li,
.tabs-container > li.active {
  background: var(--editorBgColor) !important;
}

:not(pre) > code[class*='language-'],
pre:not(.CodeMirror-line),
pre[class*='language-'],
pre.ag-paragraph {
  background: var(--codeBlockBgColor) !important;
  border: 1px solid #e8e6dc !important;
}
p:not(.ag-active)[data-role='hr']::before {
  border-top: 2px dashed var(--editorColor10) !important;
  background: none !important;
}
figure.ag-active.ag-container-block > div.ag-container-preview {
  box-shadow: 0 3px 8px 0 var(--floatShadow) !important;
}

.ag-front-menu .submenu,
.ag-float-wrapper {
  box-shadow: 0 4px 8px 0 var(--floatShadow) !important;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/desktop/src/renderer/src/assets/themes/kami.theme.css
git commit -m "feat: add kami light theme CSS"
```

---

### Task 2: Create kami-yami.theme.css (Dark)

**Files:**
- Create: `packages/desktop/src/renderer/src/assets/themes/kami-yami.theme.css`

- [ ] **Step 1: Write kami-yami.theme.css**

```css
:root {
  /* Kami Yami theme — warm dark canvas, ink-blue accent */
  --themeColor: #2D5A8A;
  --themeColor90: rgba(45, 90, 138, 0.9);
  --themeColor80: rgba(45, 90, 138, 0.8);
  --themeColor70: rgba(45, 90, 138, 0.7);
  --themeColor60: rgba(45, 90, 138, 0.6);
  --themeColor50: rgba(45, 90, 138, 0.5);
  --themeColor40: rgba(45, 90, 138, 0.4);
  --themeColor30: rgba(45, 90, 138, 0.3);
  --themeColor20: rgba(45, 90, 138, 0.2);
  --themeColor10: rgba(45, 90, 138, 0.1);

  --highlightColor: rgba(45, 90, 138, 0.3);
  --selectionColor: rgba(45, 90, 138, 0.25);
  --editorColor: #d0cec8;
  --editorColor80: rgba(208, 206, 200, 0.8);
  --editorColor60: rgba(208, 206, 200, 0.6);
  --editorColor50: rgba(208, 206, 200, 0.5);
  --editorColor40: rgba(208, 206, 200, 0.4);
  --editorColor30: rgba(208, 206, 200, 0.3);
  --editorColor10: rgba(208, 206, 200, 0.1);
  --editorColor04: rgba(208, 206, 200, 0.04);
  --editorBgColor: #1a1a18;
  --deleteColor: #d4845a;
  --iconColor: rgba(208, 206, 200, 0.56);
  --codeBgColor: #242422;
  --codeBlockBgColor: #242422;
  --footnoteBgColor: rgba(208, 206, 200, 0.04);
  --inputBgColor: #242422;

  --focusColor: var(--themeColor);

  --buttonFontColor: rgba(208, 206, 200, 0.7);
  --buttonBgColor: #30302e;
  --buttonBorder: 1px solid #3d3d3a;
  --buttonShadow: none;
  --buttonFontColorHover: var(--buttonFontColor);
  --buttonBgColorHover: #3d3d3a;
  --buttonBorderHover: 1px solid #504e49;
  --buttonFontColorActive: var(--buttonFontColor);
  --buttonBgColorActive: #2a2a28;
  --buttonBorderActive: 1px solid #3d3d3a;

  --buttonPrimaryFontColor: #faf9f5;
  --buttonPrimaryBgColor: var(--themeColor);
  --buttonPrimaryBorder: none;
  --buttonPrimaryShadow: none;
  --buttonPrimaryFontColorHover: var(--buttonPrimaryFontColor);
  --buttonPrimaryBgColorHover: #3a6ea8;
  --buttonPrimaryBorderHover: var(--buttonPrimaryBorder);
  --buttonPrimaryFontColorActive: var(--buttonPrimaryFontColor);
  --buttonPrimaryBgColorActive: #1B365D;
  --buttonPrimaryBorderActive: var(--buttonPrimaryBorder);
  --buttonPrimaryFocusBorder: none;
  --buttonPrimaryFocusShadow: inset 0 0 0 1px rgba(26, 26, 24, 0.5), 0 0 0 1px var(--themeColor);
  --tableBorderColor: #3d3d3a;

  /* Markdown element colors */
  --headingColor: #e8e6dc;
  --h1Color: #2D5A8A;
  --h2Color: #e8e6dc;
  --h3Color: #d0cec8;
  --h4Color: #b8b5ae;
  --h5Color: #8a8882;
  --h6Color: #8a8882;
  --blockquoteTextColor: #b8b5ae;
  --blockquoteBorderColor: #2D5A8A;
  --hrColor: #3d3d3a;
  --linkColor: #2D5A8A;
  --strongColor: #e8e6dc;
  --emColor: #d0cec8;
  --listMarkerColor: #2D5A8A;

  /* Sidebar */
  --sideBarColor: rgba(208, 206, 200, 0.6);
  --sideBarIconColor: var(--iconColor);
  --sideBarTitleColor: #d0cec8;
  --sideBarTextColor: #8a8882;
  --sideBarBgColor: #30302e;
  --sideBarItemHoverBgColor: rgba(208, 206, 200, 0.05);
  --itemBgColor: #3d3d3a;

  /* Float elements */
  --floatFontColor: rgba(208, 206, 200, 0.8);
  --floatBgColor: #30302e;
  --floatHoverColor: rgba(208, 206, 200, 0.06);
  --floatBorderColor: #3d3d3a;
  --floatShadow: rgba(0, 0, 0, 0.3);
  --maskColor: rgba(0, 0, 0, 0.5);
  --editorAreaWidth: 750px;
}

.side-bar {
  border-right: 1px solid #3d3d3a !important;
}

.editor-tabs {
  box-shadow: none !important;
}
.editor-tabs:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid #3d3d3a;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.editor-tabs ul.tabs-container:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid #3d3d3a;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.tabs-container > li,
.tabs-container > li.active {
  background: var(--editorBgColor) !important;
}

:not(pre) > code[class*='language-'],
pre:not(.CodeMirror-line),
pre[class*='language-'],
pre.ag-paragraph {
  background: var(--codeBlockBgColor) !important;
  border: 1px solid #3d3d3a !important;
}
p:not(.ag-active)[data-role='hr']::before {
  border-top: 2px dashed var(--editorColor10) !important;
  background: none !important;
}
figure.ag-active.ag-container-block > div.ag-container-preview {
  box-shadow: 0 3px 8px 0 var(--floatShadow) !important;
}

.ag-front-menu .submenu,
.ag-float-wrapper {
  box-shadow: 0 4px 8px 0 var(--floatShadow) !important;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/desktop/src/renderer/src/assets/themes/kami-yami.theme.css
git commit -m "feat: add kami-yami dark theme CSS"
```

---

### Task 3: Create kami-rainbow.theme.css (Light variant)

**Files:**
- Create: `packages/desktop/src/renderer/src/assets/themes/kami-rainbow.theme.css`

- [ ] **Step 1: Write kami-rainbow.theme.css**

This file is identical to `kami.theme.css` except for the heading color block. It reuses all other variables from the kami base.

```css
:root {
  /* Kami Rainbow theme — kami base with warm rainbow headings */
  --themeColor: #1B365D;
  --themeColor90: rgba(27, 54, 93, 0.9);
  --themeColor80: rgba(27, 54, 93, 0.8);
  --themeColor70: rgba(27, 54, 93, 0.7);
  --themeColor60: rgba(27, 54, 93, 0.6);
  --themeColor50: rgba(27, 54, 93, 0.5);
  --themeColor40: rgba(27, 54, 93, 0.4);
  --themeColor30: rgba(27, 54, 93, 0.3);
  --themeColor20: rgba(27, 54, 93, 0.2);
  --themeColor10: rgba(27, 54, 93, 0.1);

  --highlightColor: rgba(27, 54, 93, 0.2);
  --selectionColor: rgba(27, 54, 93, 0.15);
  --editorColor: #3d3d3a;
  --editorColor80: rgba(61, 61, 58, 0.8);
  --editorColor60: rgba(61, 61, 58, 0.6);
  --editorColor50: rgba(61, 61, 58, 0.5);
  --editorColor40: rgba(61, 61, 58, 0.4);
  --editorColor30: rgba(61, 61, 58, 0.3);
  --editorColor10: rgba(61, 61, 58, 0.1);
  --editorColor04: rgba(61, 61, 58, 0.04);
  --editorBgColor: #f5f4ed;
  --deleteColor: #8b4513;
  --iconColor: rgba(61, 61, 58, 0.56);
  --codeBgColor: #faf9f5;
  --codeBlockBgColor: #faf9f5;
  --footnoteBgColor: rgba(80, 78, 73, 0.04);
  --inputBgColor: #faf9f5;

  --focusColor: var(--themeColor);

  --buttonFontColor: rgba(61, 61, 58, 0.7);
  --buttonBgColor: #e8e6dc;
  --buttonBorder: 1px solid #e8e6dc;
  --buttonShadow: none;
  --buttonFontColorHover: var(--buttonFontColor);
  --buttonBgColorHover: #ddd9cf;
  --buttonBorderHover: 1px solid #d5d1c7;
  --buttonFontColorActive: var(--buttonFontColor);
  --buttonBgColorActive: #d5d1c7;
  --buttonBorderActive: 1px solid #ccc8bd;

  --buttonPrimaryFontColor: #faf9f5;
  --buttonPrimaryBgColor: var(--themeColor);
  --buttonPrimaryBorder: none;
  --buttonPrimaryShadow: none;
  --buttonPrimaryFontColorHover: var(--buttonPrimaryFontColor);
  --buttonPrimaryBgColorHover: #2D5A8A;
  --buttonPrimaryBorderHover: var(--buttonPrimaryBorder);
  --buttonPrimaryFontColorActive: var(--buttonPrimaryFontColor);
  --buttonPrimaryBgColorActive: #142845;
  --buttonPrimaryBorderActive: var(--buttonPrimaryBorder);
  --buttonPrimaryFocusBorder: none;
  --buttonPrimaryFocusShadow: inset 0 0 0 1px rgba(250, 249, 245, 0.5), 0 0 0 1px var(--themeColor);
  --tableBorderColor: #e8e6dc;

  /* Markdown element colors — low-saturation warm rainbow */
  --headingColor: #141413;
  --h1Color: #1B365D;
  --h2Color: #b35d3d;
  --h3Color: #8a7520;
  --h4Color: #3d7a5a;
  --h5Color: #6b4d8a;
  --h6Color: #4d6a8a;
  --blockquoteTextColor: #504e49;
  --blockquoteBorderColor: #1B365D;
  --hrColor: #e8e6dc;
  --linkColor: #1B365D;
  --strongColor: #141413;
  --emColor: #504e49;
  --listMarkerColor: #1B365D;

  /* Sidebar */
  --sideBarColor: rgba(61, 61, 58, 0.7);
  --sideBarIconColor: var(--iconColor);
  --sideBarTitleColor: #3d3d3a;
  --sideBarTextColor: #6b6a64;
  --sideBarBgColor: #faf9f5;
  --sideBarItemHoverBgColor: rgba(61, 61, 58, 0.05);
  --itemBgColor: #e8e6dc;

  /* Float elements */
  --floatFontColor: rgba(61, 61, 58, 0.8);
  --floatBgColor: #faf9f5;
  --floatHoverColor: rgba(61, 61, 58, 0.06);
  --floatBorderColor: #e8e6dc;
  --floatShadow: rgba(0, 0, 0, 0.06);
  --maskColor: rgba(0, 0, 0, 0.2);
  --editorAreaWidth: 750px;
}

.side-bar {
  border-right: 1px solid #e8e6dc !important;
}

.editor-tabs {
  box-shadow: none !important;
}
.editor-tabs:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid #e8e6dc;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.editor-tabs ul.tabs-container:after {
  position: absolute;
  content: '';
  border-bottom: 1px solid #e8e6dc;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.tabs-container > li,
.tabs-container > li.active {
  background: var(--editorBgColor) !important;
}

:not(pre) > code[class*='language-'],
pre:not(.CodeMirror-line),
pre[class*='language-'],
pre.ag-paragraph {
  background: var(--codeBlockBgColor) !important;
  border: 1px solid #e8e6dc !important;
}
p:not(.ag-active)[data-role='hr']::before {
  border-top: 2px dashed var(--editorColor10) !important;
  background: none !important;
}
figure.ag-active.ag-container-block > div.ag-container-preview {
  box-shadow: 0 3px 8px 0 var(--floatShadow) !important;
}

.ag-front-menu .submenu,
.ag-float-wrapper {
  box-shadow: 0 4px 8px 0 var(--floatShadow) !important;
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/desktop/src/renderer/src/assets/themes/kami-rainbow.theme.css
git commit -m "feat: add kami-rainbow theme CSS"
```

---

### Task 4: Create Prism syntax highlighting themes

**Files:**
- Create: `packages/desktop/src/renderer/src/assets/themes/prismjs/kami.theme.css`
- Create: `packages/desktop/src/renderer/src/assets/themes/prismjs/kami-yami.theme.css`
- Create: `packages/desktop/src/renderer/src/assets/themes/prismjs/kami-rainbow.theme.css`

- [ ] **Step 1: Write prismjs/kami.theme.css**

```css
/*
 * Prism.js Kami Theme
 * Warm parchment background with ink-blue accents
 */

code[class*='language-'],
pre.ag-paragraph {
  color: #3d3d3a;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  overflow: visible;
}

pre.ag-paragraph {
  padding: 1em;
  margin: 1em 0;
  border-radius: 0.3em;
}

:not(pre) > code[class*='language-'],
pre.ag-paragraph {
  background: #faf9f5;
}

:not(pre) > code[class*='language-'] {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #8a8882;
}

.token.punctuation {
  color: #3d3d3a;
}

.namespace {
  opacity: 0.7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #8b4513;
}

.token.boolean,
.token.number {
  color: #6b4d8a;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #3d7a5a;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #2D5A8A;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
  color: #8a7520;
}

.token.keyword {
  color: #1B365D;
}

.token.regex,
.token.important,
.token.variable {
  color: #b35d3d;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
```

- [ ] **Step 2: Write prismjs/kami-yami.theme.css**

```css
/*
 * Prism.js Kami Yami Theme
 * Warm dark background with ink-blue-light accents
 */

code[class*='language-'],
pre.ag-paragraph {
  color: #d0cec8;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  overflow: visible;
}

pre.ag-paragraph {
  padding: 1em;
  margin: 1em 0;
  border-radius: 0.3em;
}

:not(pre) > code[class*='language-'],
pre.ag-paragraph {
  background: #242422;
}

:not(pre) > code[class*='language-'] {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #6b6a64;
}

.token.punctuation {
  color: #b8b5ae;
}

.namespace {
  opacity: 0.7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #d4845a;
}

.token.boolean,
.token.number {
  color: #a088c0;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #6ba88a;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #5a9ec8;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
  color: #c4a840;
}

.token.keyword {
  color: #4d8ac8;
}

.token.regex,
.token.important,
.token.variable {
  color: #d4845a;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
```

- [ ] **Step 3: Write prismjs/kami-rainbow.theme.css**

Since kami-rainbow shares the same background as kami, reuse the kami Prism theme:

```css
/*
 * Prism.js Kami Rainbow Theme
 * Same as kami — warm parchment background
 */

code[class*='language-'],
pre.ag-paragraph {
  color: #3d3d3a;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  overflow: visible;
}

pre.ag-paragraph {
  padding: 1em;
  margin: 1em 0;
  border-radius: 0.3em;
}

:not(pre) > code[class*='language-'],
pre.ag-paragraph {
  background: #faf9f5;
}

:not(pre) > code[class*='language-'] {
  padding: 0.1em;
  border-radius: 0.3em;
  white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #8a8882;
}

.token.punctuation {
  color: #3d3d3a;
}

.namespace {
  opacity: 0.7;
}

.token.property,
.token.tag,
.token.constant,
.token.symbol,
.token.deleted {
  color: #8b4513;
}

.token.boolean,
.token.number {
  color: #6b4d8a;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
  color: #3d7a5a;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #2D5A8A;
}

.token.atrule,
.token.attr-value,
.token.function,
.token.class-name {
  color: #8a7520;
}

.token.keyword {
  color: #1B365D;
}

.token.regex,
.token.important,
.token.variable {
  color: #b35d3d;
}

.token.important,
.token.bold {
  font-weight: bold;
}

.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/desktop/src/renderer/src/assets/themes/prismjs/kami.theme.css \
        packages/desktop/src/renderer/src/assets/themes/prismjs/kami-yami.theme.css \
        packages/desktop/src/renderer/src/assets/themes/prismjs/kami-rainbow.theme.css
git commit -m "feat: add kami Prism syntax highlighting themes"
```

---

### Task 5: Register in common/theme.ts (dark theme classification)

**Files:**
- Modify: `packages/desktop/src/common/theme.ts`

- [ ] **Step 1: Add 'kami-yami' to railscastsThemes array**

Read the file first, then edit. The `railscastsThemes` array needs `'kami-yami'` added in alphabetical order between `'horizon-dark'` and `'kanagawa'`.

```typescript
export const railscastsThemes: readonly string[] = Object.freeze([
  'dark',
  'material-dark',
  // New gogh dark themes
  'dracula',
  'nord',
  'catppuccin-mocha',
  'gruvbox-dark',
  'tokyo-night',
  'tokyo-night-storm',
  'solarized-dark',
  'ayu-dark',
  'ayu-mirage',
  'everforest-dark',
  'rose-pine',
  'rose-pine-moon',
  'monokai-pro',
  'synthwave-84',
  'horizon-dark',
  'kami-yami',
  'kanagawa',
  'nightfox',
  'cyberdream'
])
```

The edit: insert `'kami-yami',` on a new line between `'horizon-dark',` and `'kanagawa',`.

- [ ] **Step 2: Commit**

```bash
git add packages/desktop/src/common/theme.ts
git commit -m "feat: register kami-yami as dark theme"
```

---

### Task 6: Register in themeColor.ts (CSS imports and export functions)

**Files:**
- Modify: `packages/desktop/src/renderer/src/util/themeColor.ts`

- [ ] **Step 1: Add imports for the 6 new theme CSS files**

Insert after the existing gogh light theme imports (after line 36, the `rosePineDawnTheme` import) and before the Prism imports section:

```typescript
// Kami themes
import kamiTheme from '../assets/themes/kami.theme.css?inline'
import kamiYamiTheme from '../assets/themes/kami-yami.theme.css?inline'
import kamiRainbowTheme from '../assets/themes/kami-rainbow.theme.css?inline'
```

Insert after the existing gogh Prism imports (after the `ulyssesPrismTheme` import at line 69):

```typescript
import kamiPrismTheme from '../assets/themes/prismjs/kami.theme.css?inline'
import kamiYamiPrismTheme from '../assets/themes/prismjs/kami-yami.theme.css?inline'
import kamiRainbowPrismTheme from '../assets/themes/prismjs/kami-rainbow.theme.css?inline'
```

- [ ] **Step 2: Add export functions after the existing light theme functions (after rosePineDawn at line 200)**

```typescript
// Kami themes
export const kami = (): string => {
  return kamiTheme + '\n' + kamiPrismTheme
}

export const kamiYami = (): string => {
  return kamiYamiTheme + '\n' + kamiYamiPrismTheme
}

export const kamiRainbow = (): string => {
  return kamiRainbowTheme + '\n' + kamiRainbowPrismTheme
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/src/renderer/src/util/themeColor.ts
git commit -m "feat: add kami theme CSS imports and exports"
```

---

### Task 7: Register in util/theme.ts (addThemeStyle switch cases)

**Files:**
- Modify: `packages/desktop/src/renderer/src/util/theme.ts`

- [ ] **Step 1: Add imports for kami, kamiYami, kamiRainbow**

In the import block from `./themeColor` (lines 8-43), add the three new function imports. Insert after the existing light theme imports (after `rosePineDawn`):

```typescript
  // Kami themes
  kami,
  kamiYami,
  kamiRainbow
```

- [ ] **Step 2: Add switch cases in addThemeStyle()**

In the switch statement inside `addThemeStyle()`, add after the `rose-pine-dawn` case (after line 169). These go in the Light section, alphabetically by theme id — `kami` and `kami-rainbow` before `light`, and `kami-yami` in the dark section before `kanagawa`:

```typescript
    // Kami themes - Light
    case 'kami':
      themeStyleEle.innerHTML = patchTheme(kami())
      break
    case 'kami-rainbow':
      themeStyleEle.innerHTML = patchTheme(kamiRainbow())
      break
    case 'kami-yami':
      themeStyleEle.innerHTML = patchTheme(kamiYami())
      break
```

Insert the light cases (`kami`, `kami-rainbow`) after the `gruvbox-light` case and before the `solarized-light` case. Insert the dark case (`kami-yami`) after the `horizon-dark` case and before the `kanagawa` case.

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/src/renderer/src/util/theme.ts
git commit -m "feat: add kami theme switch cases"
```

---

### Task 8: Register in config.ts (theme list)

**Files:**
- Modify: `packages/desktop/src/renderer/src/prefComponents/theme/config.ts`

- [ ] **Step 1: Add 3 entries to the themes array**

Insert `{ name: 'kami' }` and `{ name: 'kami-rainbow' }` in the Light section between `{ name: 'gruvbox-light' }` and `{ name: 'rose-pine-dawn' }`. Insert `{ name: 'kami-yami' }` in the Dark section between `{ name: 'horizon-dark' }` and `{ name: 'kanagawa' }`.

```typescript
export const themes: ReadonlyArray<ThemeDescriptor> = [
  // Light Themes (alphabetical)
  { name: 'ayu-light' },
  { name: 'light' },
  { name: 'catppuccin-latte' },
  { name: 'everforest-light' },
  { name: 'graphite' },
  { name: 'gruvbox-light' },
  { name: 'kami' },
  { name: 'kami-rainbow' },
  { name: 'rose-pine-dawn' },
  { name: 'solarized-light' },
  { name: 'tokyo-night-light' },
  { name: 'ulysses' },
  // Dark Themes (alphabetical)
  { name: 'ayu-dark' },
  { name: 'ayu-mirage' },
  { name: 'dark' },
  { name: 'catppuccin-mocha' },
  { name: 'cyberdream' },
  { name: 'dracula' },
  { name: 'everforest-dark' },
  { name: 'gruvbox-dark' },
  { name: 'horizon-dark' },
  { name: 'kami-yami' },
  { name: 'kanagawa' },
  { name: 'material-dark' },
  { name: 'monokai-pro' },
  { name: 'nightfox' },
  { name: 'nord' },
  { name: 'one-dark' },
  { name: 'oxocarbon-dark' },
  { name: 'palenight' },
  { name: 'rose-pine' },
  { name: 'rose-pine-moon' },
  { name: 'solarized-dark' },
  { name: 'synthwave-84' },
  { name: 'tokyo-night' },
  { name: 'tokyo-night-storm' }
]
```

- [ ] **Step 2: Commit**

```bash
git add packages/desktop/src/renderer/src/prefComponents/theme/config.ts
git commit -m "feat: add kami themes to config list"
```

---

### Task 9: Register in menu template (Electron menu)

**Files:**
- Modify: `packages/desktop/src/main/menu/templates/theme.ts`

- [ ] **Step 1: Add kami light theme menu items**

Insert after the `gruvboxLight` entry and before the `rosePineDawn` entry (after the gruvbox-light block ending around line 93):

```typescript
    {
      label: t('menu.theme.kami'),
      type: 'radio',
      id: 'kami',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'kami',
      click() {
        actions.selectTheme('kami')
      }
    },
    {
      label: t('menu.theme.kamiRainbow'),
      type: 'radio',
      id: 'kami-rainbow',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'kami-rainbow',
      click() {
        actions.selectTheme('kami-rainbow')
      }
    },
```

- [ ] **Step 2: Add kami-yami dark theme menu item**

Insert after the `horizonDark` entry and before the `kanagawa` entry (after the horizon-dark block):

```typescript
    {
      label: t('menu.theme.kamiYami'),
      type: 'radio',
      id: 'kami-yami',
      enabled: isThemeSelectionEnabled,
      checked: theme === 'kami-yami',
      click() {
        actions.selectTheme('kami-yami')
      }
    },
```

- [ ] **Step 3: Commit**

```bash
git add packages/desktop/src/main/menu/templates/theme.ts
git commit -m "feat: add kami themes to view menu"
```

---

### Task 10: Register window background colors

**Files:**
- Modify: `packages/desktop/src/main/windows/base.ts`

- [ ] **Step 1: Add cases to _getPreferredBackgroundColor()**

In the switch statement at line 158, add cases for the three kami themes:

```typescript
      case 'kami':
      case 'kami-rainbow':
        return '#f5f4ed'
      case 'kami-yami':
        return '#1a1a18'
```

Insert after the existing cases (after `'one-dark'`) and before the `'light'` default case.

- [ ] **Step 2: Commit**

```bash
git add packages/desktop/src/main/windows/base.ts
git commit -m "feat: add kami theme window background colors"
```

---

### Task 11: Add i18n labels

**Files:**
- Modify: `packages/desktop/static/locales/en.json`
- Modify: `packages/desktop/static/locales/zh-CN.json`
- Modify: `packages/desktop/static/locales/zh-TW.json`
- Modify: `packages/desktop/static/locales/ja.json`
- Modify: `packages/desktop/static/locales/ko.json`
- Modify: `packages/desktop/static/locales/de.json`
- Modify: `packages/desktop/static/locales/fr.json`
- Modify: `packages/desktop/static/locales/es.json`
- Modify: `packages/desktop/static/locales/pt.json`

- [ ] **Step 1: Add menu.theme keys to en.json**

In the `menu.theme` section, add after `gruvboxLight` and before `horizonDark`:

```json
      "kami": "Kami",
      "kamiRainbow": "Kami Rainbow",
      "kamiYami": "Kami Yami",
```

Position: `kami` and `kamiRainbow` go after `gruvboxLight` in the light section, `kamiYami` goes after `horizonDark` in the dark section.

- [ ] **Step 2: Add menu.theme keys to zh-CN.json**

```json
      "kami": "紙",
      "kamiRainbow": "紙虹",
      "kamiYami": "紙闇",
```

- [ ] **Step 3: Add to zh-TW.json**

```json
      "kami": "紙",
      "kamiRainbow": "紙虹",
      "kamiYami": "紙闇",
```

- [ ] **Step 4: Add to remaining locale files (ja, ko, de, fr, es, pt)**

For all non-Chinese locales, use English names (same as en.json):

```json
      "kami": "Kami",
      "kamiRainbow": "Kami Rainbow",
      "kamiYami": "Kami Yami",
```

- [ ] **Step 5: Commit**

```bash
git add packages/desktop/static/locales/
git commit -m "feat: add kami theme i18n labels"
```

---

### Task 12: Build verification

- [ ] **Step 1: Run typecheck**

```bash
pnpm run typecheck
```

Expected: No new type errors. The task should complete with exit code 0.

- [ ] **Step 2: Run lint**

```bash
pnpm run lint
```

Expected: No new lint errors. All files pass.

- [ ] **Step 3: Build the app**

```bash
pnpm run build:unpack
```

Expected: Build succeeds. The `out/` directory is created with all assets bundled, including the 6 new CSS files inlined into the JS bundle via the `?inline` imports.

- [ ] **Step 4: Commit if build succeeds**

If build passes:

```bash
git commit --allow-empty -m "chore: build verification passed for kami themes"
```

If build fails, fix errors before proceeding.
