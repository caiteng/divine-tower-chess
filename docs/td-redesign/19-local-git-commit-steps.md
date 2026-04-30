# 19 本地生成文件、提交、分支、PR 步骤

## 1. 推荐本地工作流

```bash
git checkout main
git pull origin main
git checkout -b codex/td-design-roadmap
mkdir -p docs/td-redesign
# 把本 zip 内的 md 文件复制到 docs/td-redesign/
git add docs/td-redesign
git commit -m "Add detailed tower defense redesign roadmap"
git push -u origin codex/td-design-roadmap
```

## 2. 如果分支已经存在

```bash
git fetch origin
git checkout codex/td-design-roadmap
git pull origin codex/td-design-roadmap
cp -R td-redesign-detailed-md/* docs/td-redesign/
git add docs/td-redesign
git commit -m "Complete detailed TD redesign phase docs"
git push
```

## 3. 创建 PR

```bash
gh pr create \
  --base main \
  --head codex/td-design-roadmap \
  --title "Add detailed tower defense redesign roadmap" \
  --body "Adds full GDD, technical architecture, art pipeline, hero/enemy specs, stage plans, and phase-by-phase AI implementation docs."
```

如果不用 GitHub CLI，就在网页上打开仓库，选择 Compare & pull request。

## 4. 后续每阶段代码分支

阶段 1：

```bash
git checkout main
git pull
git checkout -b codex/td-phase-1-runtime-core
# AI 写代码
npm test
git add assets/scripts/td tools/verify-td-rules.ts
git commit -m "Add tower defense runtime core"
git push -u origin codex/td-phase-1-runtime-core
```

阶段 2：

```bash
git checkout main
git pull
git checkout -b codex/td-phase-2-map-path-life
# AI 写代码
npm test
git add assets/scripts/td tools/verify-td-rules.ts
git commit -m "Add TD map path and life systems"
git push -u origin codex/td-phase-2-map-path-life
```

每阶段一个分支，PR 合并后再开始下一阶段。

## 5. 提交规范

提交信息格式：

```text
Add TD runtime core
Add TD map path and life systems
Add TD wave spawning loop
Add TD hero shop placement and merge
Add TD combat and class roles
Add TD Cocos UI integration
Add TD art animation pipeline
Add TD captain skills and VFX
Add TD five-stage alpha content
Add TD save tests and performance polish
```

## 6. 每次提交前检查

```bash
npm install
npm run typecheck
npm test
```

如果已添加 TD 脚本：

```bash
npx tsx tools/verify-td-rules.ts
npx tsx tools/verify-td-art-resources.ts
```

如果已接 UI：

```bash
npm run verify:web
node tools/run-td-web-e2e.js
```

## 7. 回退某阶段

如果 PR 未合并：

```bash
git checkout main
git branch -D codex/td-phase-x
git push origin --delete codex/td-phase-x
```

如果 PR 已合并：

```bash
git revert <merge_commit_sha>
```

## 8. 不建议的做法

- 不要直接在 main 上大改。
- 不要把 10 个阶段混在一个 PR。
- 不要先做美术再做 runtime。
- 不要删除 `squad` 主线。
- 不要把 AI 生成的未校验图片直接塞进资源目录。
