# PLANS.md

## 阶段进度（2026-04-14）

- [x] 阶段 1：统一文档口径（README / docs/game-design / AGENTS）。
- [x] 阶段 2：迁移类型与部署接口（types / unit-system）。
- [x] 阶段 3：迁移战场配置与出怪逻辑（battlefield-config / wave-system）。
- [x] 阶段 4：适配会话与控制器接口（game-session / game-controller）。
- [x] 阶段 5：联动 UI 与脚本验证入口（cocos-game-controller / simulate-run / verify-divine-task-rules）。
- [ ] 阶段 6：后续优化（部署区域可视化细节、更多自动化回归样例）。

## 本轮完成摘要（统一方向）

1. 明确项目唯一方向为二维连续空间自动战斗，不再使用 fixed lane/fixed route/tile board 作为核心设计。
2. `PlacedUnitState` 与部署接口完成迁移：主字段改为 `deploymentAnchorId + position`，旧字段仅保留 `@deprecated` 兼容注释。
3. 战场配置改为：`width/height/crystal/allyDeploymentRegion/allyDeploymentAnchors/enemySpawnRegion`。
4. 出怪逻辑改为右侧出生区域分布式生成，不再使用 lane/rowOffset 双路线生成。
5. `GameSession` / `GameController` 对外接口改为 `place(instanceId, deploymentAnchorId)` 与 `movePlaced(instanceId, deploymentAnchorId)`。
6. 保留并复用核心可玩主干：商店、经济、升星、神品任务实例规则、二维战斗行为。

## 验收对照（本轮）

- [x] README / docs / AGENTS / PLANS 口径统一
- [x] 项目不再自我描述为固定双路线塔防
- [x] 类型层不再以 lane/tile 作为核心战斗模型
- [x] 部署接口不再要求 lane/tileIndex
- [x] 出怪逻辑不再模拟双路线
- [x] battle-system 二维连续战斗行为保持可用
- [x] 神品任务系统保持实例级与并行规则
- [x] 调整部署后任务绑定与进度保留

## 后续未完成项（非本轮目标）

1. 增加更完整的部署区域可视化提示（如高亮不可放区域、拖拽吸附反馈）。
2. 补充更多端到端自动化回归（波次完成、胜败分支、多实例神品并行压力样例）。
