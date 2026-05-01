# Notice for this i18n edition of MarkText

<h1 align="center">MarkText</h1>
<div align="center">
  Translations also available in:
  <a href="docs/i18n/README-zh_cn.md">CN</a>
  <a href="docs/i18n/README-zh_tw.md">TW</a>
  <a href="docs/i18n/README-de.md">DE</a>
  <a href="docs/i18n/README-es.md">ES</a>
  <a href="docs/i18n/README-fr.md">FR</a>
  <a href="docs/i18n/README-jp.md">JP</a>
  <a href="docs/i18n/README-kr.md">KR</a>
  <a href="docs/i18n/README-pt.md">PT</a>
  &nbsp;|&nbsp;
  <a href="README_zh.md">中文说明</a>
</div>

## Merged Community PRs (v260501)

54 upstream community PRs from [marktext](https://github.com/marktext/marktext) merged in 2026-05, covering the following improvements:

**Editor Fixes & Enhancements (Muya):**
- PR #3007, #3010, #3051, #3108 — Image loading/rendering/icon fixes, image controller improvements
- PR #3122, #4152 — Markdown import optimization, editor tab state fixes
- PR #3125, #3129 — Source code mode UI fixes, CSS styling improvements
- PR #3128, #3721 — Keyboard event handling, shortcut configuration fixes
- PR #3272, #3621, #4150 — Paste controller enhancements, auto-link extension regex fix
- PR #3275, #3298, #3544 — Tab/backspace/enter key controller improvements
- PR #3751 — Drag-and-drop image handling, image path preferences, editor focus fixes
- PR #4135 — Table drag bar, slugger heading anchors, editor rendering fixes
- PR #4145 — View action menus, source code/typewriter/focus mode toggles
- PR #4157, #4183 — HTML export refactoring, Pandoc export support

**Filesystem & Watcher:**
- PR #3132 — File watcher refactoring, inotify exhaustion prevention, window management
- PR #3269, #3295, #3296, #3366, #4178 — Filesystem utility fixes
- PR #4172 — .gitignore rule improvements

**Menus & Keybindings:**
- PR #3230 — Quick tab switching (1-10), menu action enhancements
- PR #3319 — Editor context menu enhancements, spellcheck menu items
- PR #4134 — Keybinding configurator improvements, custom key bindings
- PR #4177 — File menu action enhancements

**Preferences:**
- PR #3141, #3335, #3279 — Theme selector improvements, follow system theme, auto-save config
- PR #4146 — Editor tab LRU management, max open tabs limit

**Build & CI/CD:**
- PR #4025 — Build config modernization, electron-vite support
- PR #4075, #4093 — GitHub Actions CI/release workflows, cross-platform builds
- PR #4183 — electron-builder config updates

**CLI & Main Process:**
- PR #3136 — Window management enhancements, new window/folder support
- PR #4070 — CLI command-line interface improvements, file/folder path resolution

**Documentation:**
- PR #3381, #3683, #3867 — Build documentation updates
- PR #3525 — Architecture docs, IPC docs, icon resources
- PR #3916 — Markdown syntax documentation update
- PR #3928 — i18n Arabic documentation
- PR #3939 — Editor feature documentation update

**i18n Internationalization:**
- PR #2773 — 9-language translation system refactoring (en/zh-CN/zh-TW/de/es/fr/ja/ko/pt)

**Misc:**
- PR #3215 — Emoji picker style fix
- PR #3952 — Electron accelerator matching utilities
- PR #4154 — Exception handler improvements

---

<div align="center">
  <strong>🔆 Next generation markdown editor 🌙</strong><br>
  A simple and elegant open-source markdown editor that focused on speed and usability.<br>
</div>

<div align="center">
  <!-- Latest Release Version -->
  <a href="https://github.com/Tkaixiang/marktext/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/tkaixiang/marktext">
  </a>
  <!-- Downloads total -->
  <a href="https://github.com/Tkaixiang/marktext/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/total">
  </a>
  <!-- Downloads latest release -->
  <a href="https://github.com/Tkaixiang/marktext/releases/latest">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/latest/total">
  </a>
</div>

- [MarkText](https://github.com/marktext/marktext) is a free and open source markdown editor originally written by [Jocs](https://github.com/Jocs) and [contributors](https://github.com/marktext/marktext/graphs/contributors).

- Sadly, the core repository became unmaintained since about 3 years ago, but various Quality of Life issues remained that I noticed in my daily usage.

- This repository serves as an attempt at modernising my favourite Markdown Editor, and is a fork based off [Jacob Whall's Fork](https://github.com/jacobwhall/marktext)

  - See [my motivation below](#1-soo-is-this-fork-any-different-from-the-countless-others)

# 1. Installing

> ⚠️ These releases are still in **beta** (since I do not know how much stuff I might have broken during the migration). Please report any bugs in the [issue tracker](https://github.com/Tkaixiang/marktext/issues)

## Windows

- Simply check out the [Releases Page](https://github.com/Tkaixiang/marktext/releases)!

- Tested on:

  - `Windows 11`

## Linux

- Simply check out the [Releases Page](https://github.com/Tkaixiang/marktext/releases)
- Tested on: `Ubuntu 24.0.2`, `Ubuntu 22.04.5`
  -   _Would love some help in testing the other Linux packages!_

### Linux Package Managers

##### 1. Arch Linux [![AUR version](https://img.shields.io/aur/version/marktext-tkaixiang-bin)](https://aur.archlinux.org/packages/marktext-tkaixiang-bin)

- Available on [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) thanks to [@kromsam](https://github.com/kromsam)

## MacOS

> ⚠️ MacOS releases will show a "`MarkText is damaged and can't be opened`" due to a **lack of notorisation**.
> Please see [this fix here](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300) (which also applies to any other app that lacks a Developer Account signing)

- Available on the [Releases Page](https://github.com/Tkaixiang/marktext/releases)

# 2. Screenshots

![](docs/marktext.png?raw=true)

# 3. ✨Features ⭐

- 🆕 Now available in **9 languages** from the `Preferences` editor (Special thanks to [@hubo1989](https://github.com/hubo1989))

  - `English` 🇺🇸
  - `简体中文` 🇨🇳
  - `繁體中文` 🇹🇼
  - `Deutsch` 🇩🇪
  - `Español` 🇪🇸
  - `Français` 🇫🇷
  - `日本語` 🇯🇵
  - `한국어` 🇰🇷
  - `Português` 🇵🇹

- Realtime preview (WYSIWYG) and a clean and simple interface to get a distraction-free writing experience.

- Support [CommonMark Spec](https://spec.commonmark.org/0.29/), [GitHub Flavored Markdown Spec](https://github.github.com/gfm/) and selective support [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown).

- Markdown extensions such as math expressions (KaTeX), front matter and emojis.

- Support paragraphs and inline style shortcuts to improve your writing efficiency.

- Output **HTML** and **PDF** files.

- **33 built-in themes** including popular schemes like **Dracula**, **Nord**, **Catppuccin**, **Tokyo Night**, **Gruvbox**, and more.

- Various editing modes: **Source Code mode**, **Typewriter mode**, **Focus mode**.

- Paste images directly from clipboard.

## 3.1 🌙 Themes🔆

MarkText includes **33 built-in themes** - 10 light and 23 dark themes:

**Light**: Ayu Light, Cadmium Light, Catppuccin Latte, Everforest Light, Graphite Light, Gruvbox Light, Rosé Pine Dawn, Solarized Light, Tokyo Night Light, Ulysses Light

**Dark**: Ayu Dark, Ayu Mirage, Cadmium Dark, Catppuccin Mocha, cyberdream, Dracula, Everforest Dark, Gruvbox Dark, Horizon Dark, Kanagawa, Material Dark, Monokai Pro, Nightfox, Nord, One Dark, Oxocarbon Dark, Palenight, Rosé Pine, Rosé Pine Moon, Solarized Dark, Synthwave '84, Tokyo Night, Tokyo Night Storm

| Cadmium Light                                     | Dark                                            |
| ------------------------------------------------- | ----------------------------------------------- |
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                    | Material Dark                                   |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                     | One Dark                                        |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

> 📖 See [docs/THEMES.md](docs/THEMES.md) for the complete theme list with descriptions and screenshots.

## 3.2 😸Edit Modes🐶

| Source Code          | Typewriter               | Focus               |
|:--------------------:|:------------------------:|:-------------------:|
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. Contributors

<a href="https://github.com/Tkaixiang/marktext/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Tkaixiang/marktext" />
</a>

# 5. Motivation

## 1. Soo is this fork any different from the countless others?

- A main gripe I had when looking into `marktext` was that the development framework + environment was aging badly and took forever to compile

  - Most libraries were outdated and some couldn't even be installed with modern versions of Node.JS/Python

- Hence, this fork is a major "re-write" that makes use of [electron-vite](https://electron-vite.org/) instead of the old `Babel + Webpack` setup

  - The goal here is to give `marktext` a **fresh start** using **modern frameworks and libraries as much as possible**
  - Everything has also been migrated to `Vue 3` and `Pinia` with all libraries updated to their latest possible versions

- The `main` and `preload` processes are still compiled to `CommonJS`, but the `renderer` is now fully **`ESModules` only** (_which posed some interesting issues during migration_)

## 2. That's cool! How can I help?

- Any form of:

  1. Testing for bugs (Bug-Reports)

  2. Pull Requests

  Are more than welcome!

- You can find a basic list of commands for getting around this repo below, but otherwise - the file structure should be **very similar to the original marktext**

## 3. Tech Stack Refactoring (electron-vite + npm)

This project has been fully migrated from the old `Babel + Webpack + Yarn` build system to a modern toolchain:

| Area | Old | New |
|------|-----|-----|
| Build Tool | Webpack 4 + Babel | **Vite 7** (electron-vite) |
| Package Manager | Yarn | **npm** |
| Frontend Framework | Vue 2 + Vuex | **Vue 3.5** + **Pinia** |
| UI Library | Element UI | **Element Plus** |
| Electron | v18 | **v41** |
| Node.js | v16 | **v24** |
| Process Compilation | CJS (all) | CJS (main/preload) + **ESM (renderer)** |

### Install

```bash
# 1. Clone the repo
git clone https://github.com/Tkaixiang/marktext.git
cd marktext

# 2. Install dependencies
npm install
```

### Development

```bash
# Start dev mode (with hot reload for renderer)
npm run dev

# Preview production build
npm run start
```

### Build & Package

```bash
# Compile only (no packaging)
npm run build

# Package for specific platforms
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

See [docs/dev/README.md](docs/dev/README.md) for detailed developer documentation.

> 📖 For Chinese instructions, see [README_zh.md](README_zh.md)
