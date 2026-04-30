# PR 合并操作指南

本文档说明如何从上游仓库 `marktext/marktext` 拉取并合并尚未被官方合入的 PR 到自己的 fork 仓库。

---

## 1. 前置准备

### 1.1 确保上游远程已配置

```bash
# 添加上游仓库（仅需一次）
git remote add upstream https://github.com/marktext/marktext.git

# 验证远程配置
git remote -v
# origin    git@github.com:licretey/marktext (fetch)
# origin    git@github.com:licretey/marktext (push)
# upstream  https://github.com/marktext/marktext.git (fetch)
# upstream  https://github.com/marktext/marktext.git (push)
```

> 注意：上游仓库仅用于拉取数据，推送只会写入 `origin`（你的 fork）。

### 1.2 保持本地 develop 同步

```bash
git checkout develop
git fetch upstream develop
git merge upstream/develop
git push origin develop
```

---

## 2. 查找待合并的 PR

### 2.1 通过 GitHub API 列出所有开放 PR

```bash
# 列出最早的 30 个开放 PR
curl -s "https://api.github.com/repos/marktext/marktext/pulls?state=open&sort=created&direction=asc&per_page=30" \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for pr in data:
    labels = [l['name'] for l in pr.get('labels', [])]
    print(f\"#{pr['number']} | {pr['created_at'][:10]} | {pr['user']['login']:20} | {pr['title'][:80]}\")
    print(f\"       branch: {pr['head']['ref']:40} | labels: {', '.join(labels) if labels else 'none'}\")
    print()
"

# 翻页（第 2 页）
curl -s "https://api.github.com/repos/marktext/marktext/pulls?state=open&sort=created&direction=asc&per_page=30&page=2" \
  | python3 -c "..."

# 翻页（第 3 页）
curl -s "...&page=3" | python3 -c "..."
```

### 2.2 通过 gh CLI 列出（需认证）

```bash
gh pr list --repo marktext/marktext --state open --limit 50 --sort created
```

---

## 3. 拉取指定 PR 到本地

### 3.1 单个 PR 拉取

```bash
# 语法：git fetch upstream pull/<PR编号>/head:pr-<PR编号>

# 示例：拉取 #4001
git fetch upstream pull/4001/head:pr-4001

# 拉取 #4145
git fetch upstream pull/4145/head:pr-4145
```

拉取后，`pr-<编号>` 是一个本地分支，指向该 PR 的最新提交。

### 3.2 批量拉取多个 PR

```bash
# 拉取编号列表中的所有 PR
for pr in 4001 4145 4150; do
  echo "Fetching #$pr..."
  git fetch upstream "pull/$pr/head:pr-$pr"
done
```

### 3.3 查看 PR 分支内容

```bash
# 查看 PR 包含哪些提交（相对于当前 develop）
git log --oneline pr-4001 --not develop

# 查看 PR 改动了哪些文件
git diff --stat develop..pr-4001

# 查看具体改动
git diff develop..pr-4001
```

---

## 4. 检查可合并性

### 4.1 快速检查（dry-run，不产生任何修改）

```bash
# 尝试 cherry-pick 所有提交，但不真正执行
range="$(git merge-base develop pr-4001)..pr-4001"
git cherry-pick --no-commit --strategy=recursive -X theirs "$range" 2>&1

# 如果成功（没有 "CONFLICT" 字样），说明可以干净合并
# 如果有冲突，查看冲突文件列表
git diff --name-only --diff-filter=U

# 清理
git cherry-pick --abort
git checkout -- .
git clean -fd
```

### 4.2 详细检查（模拟 merge）

```bash
# 尝试合并但不提交
git merge --no-commit --no-ff pr-4001 2>&1

# 如果输出包含 "自动合并失败"，查看冲突文件
git diff --name-only --diff-filter=U

# 清理
git merge --abort
```

---

## 5. 合并 PR 到 develop

### 5.1 无冲突合并（推荐方式）

```bash
# 确保在 develop 分支且工作区干净
git checkout develop
git status   # 应显示 "nothing to commit, working tree clean"

# 合并（-X theirs 表示冲突时优先采用 PR 的版本）
git merge --no-ff --no-edit -X theirs pr-4001
```

### 5.2 有冲突时手动解决

当出现冲突时，git 会提示类似：

```
冲突（修改/删除）：src/main/filesystem/watcher.js 在 HEAD 中被删除，在 pr-3335 中被修改
自动合并失败，修正冲突然后提交修正的结果。
```

#### 冲突类型 1：修改/删除冲突

某个文件在你这边被删除了，但 PR 修改了它。

```bash
# 方案 A：保留你的删除（选择 "ours"）
git rm <冲突文件路径>

# 方案 B：采用 PR 的修改（选择 "theirs"）
git checkout --theirs <冲突文件路径>
git add <冲突文件路径>

# 确认解决后提交
git commit --no-edit
```

#### 冲突类型 2：内容冲突

同一个文件两边都修改了，标记为 `<<<<<<<` / `=======` / `>>>>>>>`。

```bash
# 查看所有冲突文件
git diff --name-only --diff-filter=U

# 逐个文件手动编辑，搜索冲突标记
grep -rn "<<<<<<" <冲突文件路径>
# 编辑文件，删除 <<<<<<< ======= >>>>>>> 标记，保留需要的代码

# 标记已解决
git add <冲突文件路径>

# 全部解决后提交
git commit --no-edit
```

#### 冲突类型 3：放弃重来

```bash
# 放弃本次合并，恢复到合并前状态
git merge --abort
git checkout -- .
git clean -fd
```

### 5.3 完整冲突解决流程示例

```bash
# 1. 尝试合并
git checkout develop
git merge --no-ff --no-edit -X theirs pr-3335

# 2. git 报告冲突，查看冲突文件
git diff --name-only --diff-filter=U
# src/main/filesystem/watcher.js （修改/删除冲突）

# 3. 检查该文件状态
git status
#   deleted by us:   src/main/filesystem/watcher.js
#   modified by them: src/main/filesystem/watcher.js

# 4. 决定：watcher.js 在另一个 PR #3132 中已被重构删除
#    此 PR 的修改针对旧架构，不再适用 → 保留删除
git rm src/main/filesystem/watcher.js

# 5. 完成合并
git commit --no-edit
```

---

## 6. 合并后操作

### 6.1 验证

```bash
# 查看合并历史
git log --oneline --merges -10

# 确认没有遗留的未提交文件
git status
```

### 6.2 推送

```bash
git push origin develop
```

### 6.3 清理本地 PR 分支

```bash
# 删除单个已合并的 PR 分支
git branch -D pr-4001

# 批量删除所有 PR 分支
git branch | grep "^..pr-" | xargs git branch -D
```

---

## 7. #4001 专项处理指南

### 7.1 背景

| 项目 | 说明 |
|------|------|
| PR 编号 | #4001 |
| 标题 | Re-Factor MarkText with electron-vite |
| 分支 | `pr-4001`（已在本地） |
| 冲突文件 | 10+ 个，含 `.electron-vue/`、`src/index.ejs`、多个 `.vue` 组件 |
| 风险 | 极高 — 替换整个构建系统（webpack → vite） |

### 7.2 主要冲突分类

| 冲突类型 | 涉及文件 | 说明 |
|----------|---------|------|
| webpack → vite 替换 | `.electron-vue/postinstall.js`, `thirdPartyChecker.js`, `webpack.renderer.config.js` | PR 删除 webpack 配置 |
| 入口文件替换 | `src/index.ejs` | PR 用 vite 入口替换 |
| 组件删除 | `src/renderer/components/editorWithTabs/editor.vue` 等 | PR 大量重构组件 |
| 架构变化 | `src/renderer/commands/index.js` | 命令系统改写 |
| 旧文件残留 | `src/main/filesystem/watcher.js` | PR 修改了已被删除的旧文件 |

### 7.3 建议的处理方案

由于 #4001 与我们制定的方案 A（保持 webpack + Vue 3 渐进升级）存在根本性冲突，建议以下处理方式：

**方案 1：提取其中独立有价值的改动**

```bash
# 查看 PR 中哪些提交不涉及构建系统
git log --oneline pr-4001 --not develop -- \
  ':!.electron-vue/*' \
  ':!src/index.ejs' \
  ':!package.json'
# 如果存在独立改动，单独 cherry-pick 这些提交
```

**方案 2：在独立分支上评估**

```bash
# 创建实验分支
git checkout -b experiment/vite-migration develop
git merge pr-4001

# 手动解决所有冲突后，在开发环境中测试
# 但不要合并回 develop，除非决定全面拥抱 vite
```

**方案 3：等待上游处理**

如果上游 marktext/marktext 最终合并了 #4001，届时可以通过正常的 `git merge upstream/develop` 获取，并已在正确的上下文（上游 develop）中解决了冲突。

---

## 8. 常见问题速查

| 问题 | 解决方案 |
|------|---------|
| `fatal: refusing to merge unrelated histories` | `git merge --allow-unrelated-histories pr-XXXX` |
| 合并提交太多，想撤销整批 | `git reset --hard origin/develop`（注意：会丢失所有本地修改） |
| 撤销最近一次合并 | `git revert -m 1 HEAD` |
| 想回到合并前状态但还没 push | `git reset --hard HEAD~1` |
| 本地有很多 .orig 文件 | `git clean -fd` |
| 不确定是否已合并某 PR | `git log --oneline --all --grep="pr-XXXX"` |
| 忘了合并时用了什么选项 | `git log --merges -1` 查看最近合并提交 |
