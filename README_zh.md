<h1 align="center">MarkText</h1>
<div align="center">
  <a href="README.md">English</a>
  &nbsp;|&nbsp;
  其他语言翻译：
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

基于上游 [marktext](https://github.com/marktext/marktext) 社区未合并 PR，2026-05 批量合并 54 个有效 PR，涵盖以下改进：

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
  <strong>🔆 下一代 Markdown 编辑器 🌙</strong><br>
  简洁优雅的开源 Markdown 编辑器，专注于速度和可用性。<br>
</div>

<div align="center">
  <a href="https://github.com/Tkaixiang/marktext/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/tkaixiang/marktext">
  </a>
  <a href="https://github.com/Tkaixiang/marktext/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/total">
  </a>
  <a href="https://github.com/Tkaixiang/marktext/releases/latest">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/tkaixiang/marktext/latest/total">
  </a>
</div>

- [MarkText](https://github.com/marktext/marktext) 是一款免费开源的 Markdown 编辑器，最初由 [Jocs](https://github.com/Jocs) 和[贡献者们](https://github.com/marktext/marktext/graphs/contributors)共同开发。

- 遗憾的是，原仓库已经大约 3 年没有维护了，但日常使用中仍有许多体验问题需要解决。

- 本仓库尝试对我最喜爱的 Markdown 编辑器进行现代化改造，基于 [Jacob Whall 的 Fork](https://github.com/jacobwhall/marktext)
  - 详见[我的动机说明](#1-这个-fork-和其他无数-fork-有什么不同)

# 1. 安装

> ⚠️ 这些发布版本仍处于 **beta** 阶段。如有问题请在 [issue tracker](https://github.com/Tkaixiang/marktext/issues) 报告

## Windows

- 访问 [Releases 页面](https://github.com/Tkaixiang/marktext/releases) 下载安装包。
- 已在 `Windows 11` 上测试。

## Linux

- 访问 [Releases 页面](https://github.com/Tkaixiang/marktext/releases) 下载安装包。
- 已在 `Ubuntu 24.0.2`、`Ubuntu 22.04.5` 上测试。

### Linux 包管理器

##### 1. Arch Linux [![AUR version](https://img.shields.io/aur/version/marktext-tkaixiang-bin)](https://aur.archlinux.org/packages/marktext-tkaixiang-bin)

- 可在 [AUR](https://aur.archlinux.org/packages/marktext-tkaixiang-bin) 获取，感谢 [@kromsam](https://github.com/kromsam)

## MacOS

> ⚠️ macOS 版本可能因缺少签名而提示"`MarkText is damaged and can't be opened`"。
> 请查看[此修复方法](https://github.com/marktext/marktext/issues/3004#issuecomment-1038207300)

- 访问 [Releases 页面](https://github.com/Tkaixiang/marktext/releases) 下载安装包。

# 2. 截图

![](docs/marktext.png?raw=true)

# 3. ✨功能特性 ⭐

- 🆕 现已支持 **9 种语言**，在 `偏好设置` 中切换（特别感谢 [@hubo1989](https://github.com/hubo1989)）
  - `English` 🇺🇸 | `简体中文` 🇨🇳 | `繁體中文` 🇹🇼 | `Deutsch` 🇩🇪 | `Español` 🇪🇸 | `Français` 🇫🇷 | `日本語` 🇯🇵 | `한국어` 🇰🇷 | `Português` 🇵🇹

- 实时预览（所见即所得）和简洁清爽的界面，带来无干扰的写作体验。

- 支持 [CommonMark Spec](https://spec.commonmark.org/0.29/)、[GitHub Flavored Markdown Spec](https://github.github.com/gfm/) 和选择性 [Pandoc markdown](https://pandoc.org/MANUAL.html#pandocs-markdown)。

- Markdown 扩展：数学表达式（KaTeX）、前言（front matter）、表情符号。

- 支持段落和内联样式快捷键，提升写作效率。

- 输出 **HTML** 和 **PDF** 文件。

- **33 款内置主题**，包括 **Dracula**、**Nord**、**Catppuccin**、**Tokyo Night**、**Gruvbox** 等热门方案。

- 多种编辑模式：**源码模式**、**打字机模式**、**专注模式**。

- 从剪贴板直接粘贴图片。

## 3.1 🌙 主题🔆

MarkText 内置 **33 款主题** — 10 款浅色 + 23 款深色：

**浅色**: Ayu Light, Cadmium Light, Catppuccin Latte, Everforest Light, Graphite Light, Gruvbox Light, Rosé Pine Dawn, Solarized Light, Tokyo Night Light, Ulysses Light

**深色**: Ayu Dark, Ayu Mirage, Cadmium Dark, Catppuccin Mocha, cyberdream, Dracula, Everforest Dark, Gruvbox Dark, Horizon Dark, Kanagawa, Material Dark, Monokai Pro, Nightfox, Nord, One Dark, Oxocarbon Dark, Palenight, Rosé Pine, Rosé Pine Moon, Solarized Dark, Synthwave '84, Tokyo Night, Tokyo Night Storm

> 📖 完整主题列表见 [docs/THEMES.md](docs/THEMES.md)

## 3.2 😸编辑模式🐶

| 源码模式              | 打字机模式               | 专注模式               |
|:--------------------:|:------------------------:|:-------------------:|
| ![](docs/source.gif) | ![](docs/typewriter.gif) | ![](docs/focus.gif) |

# 4. 贡献者

<a href="https://github.com/Tkaixiang/marktext/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Tkaixiang/marktext" />
</a>

# 5. 动机

## 1. 这个 Fork 和其他无数 Fork 有什么不同？

- 我对 `marktext` 最大的不满是其开发框架和环境严重老化，编译耗时过长。
  - 大多数依赖库已过时，部分甚至无法在较新版本的 Node.js/Python 下安装。

- 因此，这个 Fork 是一次"大重写"，使用 [electron-vite](https://electron-vite.org/) 替代了旧的 `Babel + Webpack` 构建系统。
  - 目标是让 `marktext` **重新出发**，尽可能使用**现代框架和库**。
  - 所有内容已迁移至 `Vue 3` 和 `Pinia`，所有依赖库已更新至最新版本。

- `main` 和 `preload` 进程仍编译为 `CommonJS`，但 `renderer` 现已完全采用 **`ESModules`**（迁移过程中产生了一些有趣的问题）。

## 2. 如何贡献？

- 欢迎任何形式的贡献：
  1. Bug 测试和报告
  2. Pull Requests

## 3. 技术栈重构 (electron-vite + npm)

本项目已从旧的 `Babel + Webpack + Yarn` 构建体系全面迁移至现代化工具链：

| 项目 | 旧技术 | 新技术 |
|------|--------|--------|
| 构建工具 | Webpack 4 + Babel | **Vite 7** (electron-vite) |
| 包管理 | Yarn | **npm** |
| 前端框架 | Vue 2 + Vuex | **Vue 3.5** + **Pinia** |
| UI 组件库 | Element UI | **Element Plus** |
| Electron | v18 | **v41** |
| Node.js | v16 | **v24** |
| 进程编译 | CJS（全部） | CJS（main/preload）+ **ESM（renderer）** |

### 安装

```bash
# 1. 克隆仓库
git clone https://github.com/Tkaixiang/marktext.git
cd marktext

# 2. 安装依赖
npm install
```

### 开发运行

```bash
# 启动开发模式（renderer 热重载）
npm run dev

# 预览生产构建
npm run start
```

### 构建打包

```bash
# 仅编译代码（不打包）
npm run build

# 平台打包
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

详细开发者文档见 [docs/dev/README.md](docs/dev/README.md)

> 📖 English instructions: [README.md](README.md)
