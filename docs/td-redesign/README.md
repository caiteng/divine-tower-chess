# 放置合成塔防改造计划文档包

本目录是一套可交给 AI 分阶段执行的完整 Markdown 计划，用于把当前 `divine-tower-chess` 从小队实时战斗原型，改造成“放置 + 三合一 + 路径塔防 + 英雄队长 + AI 生成帧动画资源”的混合塔防游戏。

## 重要前提

当前仓库真实主线仍是：

- 逻辑主链：`assets/scripts/squad/*`
- 会话入口：`assets/scripts/squad/squad-battle-session.ts`
- Cocos 场景编排入口：`assets/scripts/ui/battle-scene-controller.ts`
- 当前流程：`主菜单 -> 难度选择 -> 职业选择 -> 准备阶段/战斗阶段`
- 已有能力：商店、金币、3 合 1 升星、准备/战斗阶段切换、资源 resolver、本地存档、规则测试、资源校验、Web 冒烟

塔防改造必须新增 `assets/scripts/td/*`，不要一开始直接重写或删除 `squad/*`。旧主线是回退基线。

## 文档索引

| 文件 | 作用 |
|---|---|
| `00-repo-audit-and-goal.md` | 仓库现状、可复用模块、改造目标 |
| `01-product-gdd-core-loop.md` | 核心玩法 GDD、循环、经济、三合一、胜负 |
| `02-technical-architecture.md` | 技术架构、目录、类型、模块依赖 |
| `03-art-style-and-ai-asset-pipeline.md` | 美术风格、AI 生成规范、资源目录、校验 |
| `04-hero-character-spec.md` | 10 个职业的数值、技能、动作帧、AI 图像提示词 |
| `05-enemy-and-boss-spec.md` | 8 类敌人、Boss、动作帧、AI 图像提示词 |
| `06-stage-map-and-wave-design.md` | 5 个关卡、地图元素、路径、塔位、50 波 |
| `07-phase-0-design-lock.md` | 阶段 0：设计冻结 |
| `08-phase-1-runtime-core.md` | 阶段 1：塔防 runtime 核心 |
| `09-phase-2-map-path-life.md` | 阶段 2：地图、路径、生命 |
| `10-phase-3-wave-loop.md` | 阶段 3：波次循环 |
| `11-phase-4-shop-placement-merge.md` | 阶段 4：商店、放置、三合一 |
| `12-phase-5-combat-classes.md` | 阶段 5：战斗系统和职业差异 |
| `13-phase-6-cocos-ui-scene.md` | 阶段 6：Cocos UI 和场景接入 |
| `14-phase-7-ai-art-animation.md` | 阶段 7：AI 图片、帧动画、地图元素 |
| `15-phase-8-captain-skills-vfx.md` | 阶段 8：队长英雄、技能、VFX |
| `16-phase-9-five-stages-alpha.md` | 阶段 9：五关 Alpha 内容 |
| `17-phase-10-save-test-performance-release.md` | 阶段 10：存档、测试、性能、发布收口 |
| `18-ai-task-prompts.md` | 每阶段可复制给 AI 的任务提示词 |
| `19-local-git-commit-steps.md` | 本地生成文件、提交、分支、PR 的完整步骤 |
| `20-acceptance-checklists.md` | 所有阶段验收 checklist |

## 推荐执行方式

1. 先读 `00` 到 `06`，确认产品和资源标准。
2. 从 `07` 开始按阶段交给 AI 写代码。
3. 每个阶段只做该阶段目标，不跨阶段扩功能。
4. 每个阶段必须补测试。
5. 阶段 7 前允许使用程序生成的简单占位图；阶段 7 起必须把原创 AI 帧图接入资源管线。
