# 01 阶段 0：设计冻结、技术边界、AI 开发约束

## 阶段目标

在写任何塔防代码之前，先把玩法范围、技术路线、目录边界、资源规范、AI 任务格式固定下来。目标是避免后续 AI 每次开发时改变系统定义。

## 当前仓库前提

- 现有主线仍是 `assets/scripts/squad/*`。
- 塔防必须先作为新模式接入，不删除旧玩法。
- 文档、代码、资源、测试必须可分阶段提交。

## 本阶段要完成的事情

### 1. 确认玩法边界

固定 MVP 只包含：

- 1 张地图。
- 10 波。
- 10 点生命。
- 6 个基础英雄。
- 4 类敌人。
- 商店 3 格。
- 三合一升星。
- 基础战斗和漏怪扣血。
- 原创 AI 占位图和帧动画资源链。

明确暂不做：联网、排行榜、装备、抽卡、付费、剧情、复杂养成、多人模式。

### 2. 确认技术命名空间

新增塔防代码只放：

```text
assets/scripts/td/**
assets/scripts/ui/controllers/td-*.ts
assets/scripts/ui/views/td-*.ts
assets/resources/textures/td/**
tools/verify-td-*.ts
tools/generate-td-placeholder-art.ts
tools/run-td-web-e2e.js
```

禁止在 MVP 前删除或重写：

```text
assets/scripts/squad/**
assets/scripts/ui/controllers/battle-*.ts
assets/scripts/ui/controllers/prep-panel-controller.ts
```

除非任务明确要求接入主菜单。

### 3. 确认资源规范

AI 生成图必须是原创奇幻卡通风格。禁止生成具体竞品角色、地图、图标或 UI。所有帧图必须透明背景。地图背景可以不透明。

推荐尺寸：

| 资源 | 尺寸 | 背景 |
|---|---:|---|
| 地图背景 | 1280x720 | 不透明 |
| 角色帧 | 256x256 | 透明 |
| 敌人帧 | 192x192 | 透明 |
| Boss 帧 | 320x320 | 透明 |
| UI 图标 | 128x128 | 透明 |
| VFX 帧 | 256x256 | 透明 |

### 4. 确认测试原则

每一阶段必须至少新增或更新一个测试：

- 纯逻辑阶段：`tools/verify-td-rules.ts`。
- 资源阶段：`tools/verify-td-art-resources.ts`。
- UI 阶段：`tools/run-td-web-e2e.js`。

任何 AI 代码提交必须能解释：

- 新增了哪些文件。
- 修改了哪些旧文件。
- 为什么不会破坏旧主线。
- 如何运行测试。

## 具体任务清单

| 编号 | 任务 | 文件 | 验收 |
|---|---|---|---|
| 0.1 | 创建文档目录 | `docs/td-redesign/**` | 所有阶段文档存在 |
| 0.2 | 固定目录边界 | `00-complete-transformation-plan.md` | 有明确禁止改动范围 |
| 0.3 | 固定资源规范 | `08-phase-7-ai-art-animation-pipeline.md` | 有命名、尺寸、帧数 |
| 0.4 | 固定 AI 任务模板 | `12-ai-task-template.md` | 可直接复制给 AI 开发 |
| 0.5 | 生成阶段验收表 | 所有阶段文档 | 每阶段有验收标准 |

## AI 执行提示词

```text
你现在只做设计冻结，不写玩法代码。请在 docs/td-redesign 下补齐塔防改造设计文档、阶段文档、AI 任务模板。要求每个阶段都有目标、文件清单、代码任务、资源任务、测试任务、验收标准和回退策略。不要修改 assets/scripts/squad 主线。
```

## 阶段验收标准

- `docs/td-redesign/README.md` 存在。
- `00` 到 `12` 所有 Markdown 存在。
- 每个阶段都写明：目标、要做的事情、文件清单、资源清单、测试、人工验收、回退方案。
- 没有修改现有玩法代码。

## 回退策略

如果阶段 0 文档方向不满意，只需要删除 `docs/td-redesign/**` 或重写文档，不影响任何运行时代码。
