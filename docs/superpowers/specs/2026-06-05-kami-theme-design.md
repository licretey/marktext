# Kami Theme Series — Design Spec

> 纸 (kami): warm parchment canvas, ink-blue restraint, serif carries authority

**Date:** 2026-06-05
**Source:** `/home/de/Downloads/test/themes/kami/DESIGN.md`

## Overview

Add 3 editor themes to MarkText based on the Kami design system, a warm-toned, typography-first visual language built on a single constraint: one chromatic accent (Ink Blue `#1B365D`), warm-gray text hierarchy, no synthetic bold, no hard drop shadows.

## Theme Matrix

| Theme ID      | Mode  | Canvas              | Heading Strategy                                  |
|---------------|-------|---------------------|---------------------------------------------------|
| `kami`        | Light | `#f5f4ed` Parchment | h1=ink blue, h2–h6=warm-gray scale       |
| `kami-yami`   | Dark  | `#1a1a18`           | h1=brand-light, h2–h6=warm-light scale (mirrors kami) |
| `kami-rainbow`| Light | `#f5f4ed` Parchment | h1–h6 low-saturation warm rainbow derived from Kami palette |

## Color Mappings

### kami (Light)

```css
:root {
  --themeColor:          #1B365D;   /* brand */
  --themeColor90–10:     rgba(27,54,93, 0.9–0.1);
  --highlightColor:      rgba(27,54,93,0.2);
  --selectionColor:      rgba(27,54,93,0.15);
  --editorColor:         #3d3d3a;   /* dark-warm */
  --editorBgColor:       #f5f4ed;   /* parchment */
  --deleteColor:         #8b4513;   /* breaking-fg */
  --iconColor:           #6b6a64;   /* stone at ~0.7 opacity */
  --codeBgColor:         #faf9f5;   /* ivory */
  --codeBlockBgColor:    #faf9f5;   /* ivory */
  --footnoteBgColor:     rgba(80,78,73,0.04);
  --inputBgColor:        #faf9f5;   /* ivory */
  --focusColor:          var(--themeColor);

  /* Buttons */
  --buttonBgColor:       #e8e6dc;   /* warm-sand */
  --buttonBorder:        1px solid #e8e6dc;
  --buttonPrimaryBgColor: var(--themeColor);
  --buttonPrimaryFontColor: #faf9f5;
  --tableBorderColor:    #e8e6dc;

  /* Headings — warm-gray scale with ink-blue h1 */
  --headingColor:        #141413;   /* near-black */
  --h1Color:             #1B365D;   /* brand — only chromatic heading */
  --h2Color:             #141413;   /* near-black */
  --h3Color:             #3d3d3a;   /* dark-warm */
  --h4Color:             #504e49;   /* olive */
  --h5Color:             #6b6a64;   /* stone */
  --h6Color:             #6b6a64;   /* stone */

  --blockquoteTextColor:  #504e49;
  --blockquoteBorderColor:#1B365D;
  --linkColor:            #1B365D;
  --strongColor:          #141413;
  --emColor:              #504e49;
  --listMarkerColor:      #1B365D;
  --hrColor:              #e8e6dc;

  /* Sidebar */
  --sideBarBgColor:       #faf9f5;
  --sideBarColor:         #504e49;
  --sideBarTitleColor:    #3d3d3a;
  --sideBarTextColor:     #6b6a64;
  --itemBgColor:          #e8e6dc;

  /* Float elements */
  --floatBgColor:         #faf9f5;
  --floatBorderColor:     #e8e6dc;
  --floatShadow:          rgba(0,0,0,0.06);
  --maskColor:            rgba(0,0,0,0.2);
}
```

### kami-yami (Dark)

```css
:root {
  --themeColor:          #2D5A8A;   /* brand-light */
  --editorBgColor:       #1a1a18;   /* deep-dark + breathing room */
  --editorColor:         #d0cec8;   /* warm light */
  --deleteColor:         #d4845a;   /* warm coral */
  --iconColor:           #8a8882;
  --codeBgColor:         #242422;
  --codeBlockBgColor:    #242422;
  --inputBgColor:        #242422;

  /* Sidebar */
  --sideBarBgColor:      #30302e;   /* dark-surface */
  --sideBarColor:        #b8b5ae;
  --sideBarTitleColor:   #d0cec8;
  --sideBarTextColor:    #8a8882;
  --itemBgColor:         #3d3d3a;

  /* Headings — mirrored warm-light scale */
  --headingColor:        #e8e6dc;
  --h1Color:             #2D5A8A;   /* brand-light */
  --h2Color:             #e8e6dc;
  --h3Color:             #d0cec8;
  --h4Color:             #b8b5ae;
  --h5Color:             #8a8882;
  --h6Color:             #8a8882;

  --blockquoteBorderColor: #2D5A8A;
  --linkColor:             #2D5A8A;
  --listMarkerColor:       #2D5A8A;
}
```

### kami-rainbow (Light) — Heading overrides only

All variables identical to `kami` except headings. Derive hue-separated warm colors from Kami palette with ≥40° hue spacing for pre-attentive distinguishability:

| Variable    | Value      | Hue name        |
|-------------|------------|-----------------|
| `--h1Color` | `#1B365D`  | ink blue        |
| `--h2Color` | `#b35d3d`  | warm terracotta |
| `--h3Color` | `#8a7520`  | warm gold       |
| `--h4Color` | `#3d7a5a`  | warm sage       |
| `--h5Color` | `#6b4d8a`  | warm violet     |
| `--h6Color` | `#4d6a8a`  | warm slate      |

## File Changes

### New Files (6)

| File | Purpose |
|------|---------|
| `packages/desktop/src/renderer/src/assets/themes/kami.theme.css` | Light theme CSS |
| `packages/desktop/src/renderer/src/assets/themes/kami-yami.theme.css` | Dark theme CSS |
| `packages/desktop/src/renderer/src/assets/themes/kami-rainbow.theme.css` | Rainbow variant (reuses kami Prism) |
| `packages/desktop/src/renderer/src/assets/themes/prismjs/kami.theme.css` | Prism syntax for kami/kami-rainbow |
| `packages/desktop/src/renderer/src/assets/themes/prismjs/kami-yami.theme.css` | Prism syntax for kami-yami |
| `packages/desktop/src/renderer/src/assets/themes/prismjs/kami-rainbow.theme.css` | Prism syntax for kami-rainbow |

### Modified Files (7)

| # | File | Change |
|---|------|--------|
| 1 | `packages/desktop/src/common/theme.ts` | Add `'kami-yami'` to `railscastsThemes` |
| 2 | `packages/desktop/src/renderer/src/util/themeColor.ts` | Add 6 `?inline` imports + 3 export functions |
| 3 | `packages/desktop/src/renderer/src/util/theme.ts` | Add 3 `case` branches in `addThemeStyle()` |
| 4 | `packages/desktop/src/renderer/src/prefComponents/theme/config.ts` | Append 3 entries to `themes[]`: kami (light section), kami-rainbow (light section), kami-yami (dark section) |
| 5 | `packages/desktop/src/main/menu/templates/theme.ts` | Add 3 menu radio items |
| 6 | `packages/desktop/src/main/windows/base.ts` | Add 3 cases in `_getPreferredBackgroundColor()` |
| 7 | I18n locale file(s) | Add `menu.theme.kami`, `menu.theme.kamiYami`, `menu.theme.kamiRainbow` keys |

## Dark Theme Classification

- `kami` → **Light** (not in `railscastsThemes`)
- `kami-rainbow` → **Light** (not in `railscastsThemes`)
- `kami-yami` → **Dark** (in `railscastsThemes`, triggers `body.dark` + `cm-s-railscasts`)

## Window Background Colors

| Theme | Background |
|-------|-----------|
| `kami` | `#f5f4ed` |
| `kami-rainbow` | `#f5f4ed` |
| `kami-yami` | `#1a1a18` |

## Ordering Convention

All kami themes sorted alphabetically within sections:

- **Light**: `kami` before `kami-rainbow` (alphabetical), between `graphite` and `light`
- **Dark**: `kami-yami` between `kanagawa` and `material-dark`

## Prism Theme Strategy

- `kami` and `kami-rainbow` share the same background (`#f5f4ed`) → can use identical Prism tokens. `kami-rainbow.prism` imports same file as `kami.prism`.
- `kami-yami` gets its own Prism theme with warm-toned syntax colors on `#1a1a18` background.
