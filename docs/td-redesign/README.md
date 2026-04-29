# 放置合成塔防改造文档索引

本目录用于指导 `divine-tower-chess` 从当前小队实时战斗原型，逐步改造为“放置 + 三合一 + 路径塔防 + 英雄队长 + AI 生成帧动画资源”的混合塔防游戏。

当前仓库主线仍以 `assets/scripts/squad/*` 为核心。塔防改造不要直接删除旧主线，建议新增 `assets/scripts/td/*`、`assets/scripts/ui/controllers/td-*`、`assets/resources/textures/td/**`，用新模式逐步接入主流程。

## 文档列表

| 文件 | 用途 |
|---|---|
| `00-complete-transformation-plan.md` | 完整游戏设计、系统架构、职业、敌人、关卡和资源总计划 |
| `01-phase-0-design-lock.md` | 阶段 0：设计冻结、技术边界、AI 开发约束 |
| `02-phase-1-core-architecture.md` | 阶段 1：塔防运行时核心、类型、状态机、快照 |
| `03-phase-2-map-path-life.md` | 阶段 2：地图、路径、塔位、漏怪扣血 |
| `04-phase-3-wave-loop.md` | 阶段 3：波次生成、出怪队列、清波奖励、胜负闭环 |
| `05-phase-4-heroes-shop-merge.md` | 阶段 4：英雄商店、背包、塔位放置、三合一升星 |
| `06-phase-5-combat-targeting-classes.md` | 阶段 5：战斗、索敌、护甲、魔抗、职业差异 |
| `07-phase-6-cocos-ui-scene.md` | 阶段 6：Cocos UI、地图表现层、交互闭环 |
| `08-phase-7-ai-art-animation-pipeline.md` | 阶段 7：AI 占位图、帧动画、地图元素、资源校验 |
| `09-phase-8-captain-skills-vfx.md` | 阶段 8：队长英雄、主动技能、全局法术、VFX |
| `10-phase-9-five-stages-content.md` | 阶段 9：五关内容、完整敌人体系、数值平衡 |
| `11-phase-10-save-test-release.md` | 阶段 10：存档、自动化测试、Web 冒烟、性能收口 |
| `12-ai-task-template.md` | 给 AI 分阶段写代码/资源/测试的标准任务模板 |

## 开发总原则

1. 不破坏现有 `squad` 主线；塔防先作为独立模式接入。
2. 每阶段必须包含代码、测试、资源或文档验收项。
3. AI 生成图片只能生成原创占位资源，不复制 BTD6、Kingdom Rush 或其他商业作品。
4. 所有帧动画使用明确命名规范，优先先跑通资源链，再追求美术质量。
5. 每次阶段提交都必须能通过 `npm test`；涉及 UI 的阶段还要更新 Web 冒烟脚本。
6. AI 开发时必须先做最小可运行版本，再逐步扩展复杂机制。

## 推荐分支策略

- 设计文档分支：`codex/td-design-roadmap`
- MVP 代码分支：`codex/td-mvp-runtime`
- UI 接入分支：`codex/td-cocos-ui`
- 资源管线分支：`codex/td-ai-art-pipeline`
- 五关内容分支：`codex/td-five-stages-alpha`

本分支只提交设计和开发计划文档，不直接修改玩法代码。