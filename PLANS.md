# PLANS.md

## 阶段进度（2026-04-14）

- [x] 阶段 1：统一文档口径（README / docs/game-design / AGENTS）。
- [x] 阶段 2：迁移类型与部署接口（types / unit-system）。
- [x] 阶段 3：迁移战场配置与出怪逻辑（battlefield-config / wave-system）。
- [x] 阶段 4：适配会话与控制器接口（game-session / game-controller）。
- [x] 阶段 5：联动 UI 与脚本验证入口（cocos-game-controller / simulate-run / verify-divine-task-rules）。
- [x] 阶段 6（本次推进）：补充关键回归样例（敌人出生区域校验）并修正文案残留。
- [x] 阶段 7（本次推进）：接入星级贴图路径规范与文档规格。
- [x] 阶段 8（本次推进）：补充部署区域可视化提示（Cocos 部署区高亮 + 占位状态色）。
- [x] 阶段 9（本次推进）：提供冲突恢复脚本与操作文档（保留 Codex 最终态）。
- [ ] 阶段 10：后续优化（更多端到端自动化回归样例）。

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

## 后续未完成项（下一步）

1. 补充更多端到端自动化回归（波次完成、胜败分支、多实例神品并行压力样例）。
2. 用户在家里电脑重传真实 `unit_star_progression.png` 后，用本地 git 客户端补提二进制文件并做一次资源加载回归。


## 本次补充（贴图接入）

- 新增 `assets/art/reference/unit_star_progression.placeholder.txt`（二进制 PNG 由本地 git 客户端后续补提）。
- 新增 `docs/art/unit_star_progression_spec.md`，将图像参考转为可执行文字规格。
- 新增 `assets/scripts/config/unit-star-sprite-config.ts`，提供 `unitId + star -> sprite path` 映射。
- `CocosGameController` 运行时改为优先加载星级贴图，缺失时回退基础头像路径。

## 本次补充（部署可视化）

- Cocos 战场加入部署区高亮区域提示。
- 部署锚点加入占位状态色：空位与已占位颜色区分，便于准备阶段调位操作。


## 本次补充（冲突恢复）

- 新增 `docs/ops/merge-recovery.md`，给出从最新目标分支恢复并应用 `88e7330` 的步骤。
- 新增 `scripts/apply_codex_final_state.sh`，一键执行 `cherry-pick -X ours 88e7330` + `npm test`。
