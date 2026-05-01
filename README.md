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
</div>

## 合并社区 PR 汇总 (v260501)

基于上游 [marktext](https://github.com/marktext/marktext) 社区未合并 PR，2026-05 批量合并 54 个有效 PR 至本仓库，涵盖以下改进：

**编辑器修复与增强 (Muya):**
- PR #3007, #3010, #3051, #3108 — 图片加载/渲染/图标修复，图片控制器改进
- PR #3122, #4152 — Markdown 导入优化，编辑器标签页状态修复
- PR #3125, #3129 — 源码模式 UI 改进，CSS 样式修复
- PR #3128, #3721 — 键盘事件处理，快捷键配置修复
- PR #3272, #3621, #4150 — 粘贴控制器增强，自动链接扩展正则修复
- PR #3275, #3298, #3544 — Tab/退格/回车键控制器改进
- PR #3751 — 拖放图片处理、图片路径偏好设置、编辑器焦点修复
- PR #4135 — 表格拖拽栏、slugger 标题锚点、编辑器渲染修复
- PR #4145 — 视图操作菜单，源码模式/打字机模式/专注模式切换
- PR #4157, #4183 — HTML 导出重构，支持 Pandoc 导出

**文件系统与监视器:**
- PR #3132 — 文件监视器重构，防止 inotify 耗尽，窗口管理优化
- PR #3269, #3295, #3296, #3366, #4178 — 文件系统工具函数修复
- PR #4172 — .gitignore 规则改进

**菜单与快捷键:**
- PR #3230 — 标签页间快速切换 (1-10)，菜单操作增强
- PR #3319 — 编辑器右键菜单增强，拼写检查菜单项
- PR #4134 — 快捷键配置器改进，自定义按键绑定
- PR #4177 — 文件菜单操作增强

**偏好设置:**
- PR #3141, #3335, #3279 — 主题选择器改进，跟随系统主题、自动保存配置
- PR #4146 — 编辑器标签页 LRU 管理，最大打开标签数

**构建与 CI/CD:**
- PR #4025 — 构建配置现代化，支持 electron-vite
- PR #4075, #4093 — GitHub Actions CI/release 工作流，跨平台构建
- PR #4183 — electron-builder 配置更新

**CLI 与主进程:**
- PR #3136 — 窗口管理增强，新建窗口/文件夹支持
- PR #4070 — CLI 命令行接口完善，文件/文件夹路径解析

**文档完善:**
- PR #3381, #3683, #3867 — 构建文档完善
- PR #3525 — 架构文档、IPC 文档、图标资源更新
- PR #3916 — Markdown 语法文档更新
- PR #3928 — i18n 阿拉伯语文档
- PR #3939 — 编辑器功能文档更新

**i18n 国际化:**
- PR #2773 — 9 语言翻译系统重构，支持 en/zh-CN/zh-TW/de/es/fr/ja/ko/pt

**其他:**
- PR #3215 — 表情选择器样式修复
- PR #3952 — Electron 快捷键匹配工具函数
- PR #4154 — 异常处理器改进

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
  
  - Most libaries were outdated and some couldn't even be installed with modern versions of Node.JS/Python

- Hence, this fork is kind of a major "re-write" that makes use of [electron-vite](https://electron-vite.org/) instead of the old `Babel + Webpack` setup
  
  - The goal here is to give `marktext` a **fresh start** using **modern frameworks and libraries as much as possible**
  - Everything has also been migrated to `Vue3` and `Pinia` with all libraries updated to their latest possible versions

- The `main` and `preload` processes are still compiled to `CommonJS`, but the `renderer` is now fully **`ESModules` only** (_which posed some interesting issues during migration_)

## 2. That's cool! How can I help?

- Any form of:
  
  1. Testing for bugs (Bug-Reports)
  
  2. Pull Requests
  
  Are more than welcome!

- You can find a basic list of commands for getting around this repo below, but otherwise - the file structure should be **very similar to the original marktext**

## 3. Project Setup

- See [Developer Documentation](docs/dev/README.md)
