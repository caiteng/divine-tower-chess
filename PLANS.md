# PLANS.md

## 阶段进度（2026-04-14）

- [x] 阶段 1（本次）：仓库审查与重构计划细化（仅分析，不做大规模实现）。
- [ ] 阶段 2：建立 BattleWorld / Entity 基础骨架，彻底去除 lane/tile 作为战斗核心。
- [ ] 阶段 3：落地移动 + 索敌（detectionRange / attackRange / moveSpeed）。
- [ ] 阶段 4：职业行为（近战追击 / 远程拉扯 / 牧师真实治疗 / 法师AOE）与任务统计对齐。
- [ ] 阶段 5：准备阶段部署区域化（坐标/部署点），支持重摆且保持实例身份。
- [ ] 阶段 6：最简可视化与新手10波可玩性验收。
- [ ] 文档收敛：README / docs/game-design / AGENTS（如需）去除残留误导描述。

## 阶段 1 审查结论（保留 / 替换边界）

### 可直接保留（不推倒）
1. 经济与商店闭环：金币消耗/收益、3格商店刷新、失败购买不移除条目逻辑可继续沿用。
2. 升星与实例规则：`bench + placed` 混合三合一、3星封顶、任务实例不可被普通合成消耗规则可继续沿用。
3. 神品任务主干：按实例绑定、独立10%判定、多任务并行、按单位实例累计 metric 的设计可继续沿用。
4. 难度/波次配置结构：difficulty + wave entry + spawnInterval 的数据驱动方向可继续沿用。
5. Unit/Enemy 配置字段：`detectionRange / attackRange / moveSpeed / attackInterval` 等字段已具备新系统所需输入。

### 必须替换（旧模型残留）
1. `lane/tile` 仍进入运行时主状态（`PlacedUnitState`、`PlacementPoint`、`GameController.place/movePlaced` 参数）。
2. `BATTLEFIELD_CONFIG.placementPoints` 仍是双lane网格锚点模型，不符合“二维部署区域”目标。
3. `WaveSystem.tickSpawn` 通过 `%2` 生成 lane 行偏移，属于旧双路线生成思维。
4. UI 与控制器接口仍以 lane/tile 驱动，不利于后续做自由拖拽或坐标部署。

### 复用评估（按模块）
- `BattleSystem`：核心战斗循环、距离计算、敌我行为框架可复用；但要拆分为 `Targeting/Movement/Combat/Healing/Crystal/Spawn` 子系统。
- `UnitSystem`：实例管理、升星、任务绑定字段维护可复用；摆放接口需改为坐标/部署点，不再暴露 lane/tile。
- `WaveSystem`：波次游标与节拍可复用；出生点扰动逻辑需改为二维随机带而非 lane 偏移。
- `GameSession`：phase 流程（menu/prep/battle/win/lose）可复用；调用接口需迁移到新 Placement/BattleWorld API。

## 阶段 1 输出：重构执行计划

### 阶段 2：新战场模型
- 新增 `BattleWorld`（二维边界、实体容器、时间步推进）。
- 新增 `BattleEntity / UnitEntity / EnemyEntity` 运行时结构，避免把配置字段散落在系统间。
- 将 `PlacedUnitState` 从 `lane/tile/placementPointId` 迁移为 `deployPosition`（或 `deploymentSlotId + position`）。

### 阶段 3：移动与索敌
- 拆分 `TargetingSystem` 与 `MovementSystem`：
  - 感知内选目标；
  - 超出攻击范围则追近/拉扯；
  - 到攻击范围后停身输出。
- 敌人主逻辑：无目标则向水晶推进；有目标时切换战斗。

### 阶段 4：职业行为与统计
- `CombatSystem` 处理单体/范围伤害。
- `HealingSystem` 处理真实治疗并返回 `actualHeal`。
- `BattleMetrics` 统一输出 `killsByUnitInstance` 与 `healingByUnitInstance`，确保神品统计不回归。

### 阶段 5：准备阶段部署重构
- 新增 `PlacementSystem`：部署区域校验（左侧区域、多点可放、支持重摆）。
- `place/move` 入参改为坐标或部署位ID，移动后必须保留 instance/task/progress/divine/star。

### 阶段 6：最简表现 + 验收
- Cocos 映射连续坐标，区分敌我、水晶、受击/治疗反馈。
- 跑通新手10波，验证完整流程与失败/胜利分支。

## 文档过时项（待后续阶段同步）
1. README 与 game-design 整体方向已更新为二维连续战斗，但“部署锚点 + lane/tile 索引兼容 UI”描述仍会误导为旧模型，应在阶段5后彻底替换为“部署区域/坐标”。
2. 代码注释中仍保留 `place(instanceId, lane, tileIndex)` 形式，需与新接口一致化。

## 后续待办（阶段 2+）
1. 完成数据结构迁移后补 `npm test` 与模拟回归。
2. 补充“多3星并行任务 + 重摆不丢任务”的集成测试样例。
3. 将 battle 相关系统从单文件拆分为多系统文件，降低耦合。
4. 在 UI 层增加部署区域可视化，替代 lane/tile 按钮语义。
