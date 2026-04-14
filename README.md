# divine-tower-chess

Cocos Creator + TypeScript 原型项目。当前版本定位为：**2D 横版 / 伪纵深的自动战斗原型**，并保留准备阶段养成闭环（商店、金币、三合一升星、实例级神品任务、波次推进与水晶防守）。

## 当前真实状态（统一口径）

### 战斗模型（已落地）
- 战场为二维连续空间（`x/y`），单位与敌人都使用连续坐标。
- 索敌与行为由半径机制驱动：`detectionRange` / `attackRange` / `moveSpeed`。
- 敌人从右侧出生区域进入战场，向左侧水晶推进；接战后会攻击单位。
- 单位行为已具备：
  - 近战追击
  - 远程保持距离输出
  - 牧师治疗（按真实恢复量统计）
  - 法师局部 AOE

### 准备阶段（已落地）
- 回合开始自动刷新商店（3格）。
- 购买、手动刷新、部署、调位、开战仅允许在准备阶段执行。
- 部署基于**部署区域内的 deployment anchors（候选落点）**。
  - 这些落点仅用于部署，不是 lane/tile 棋盘系统。

### 成长与任务（已落地）
- 三合一升星：3个1星→2星，3个2星→3星。
- 升星候选可来自备战区 + 已部署区。
- 有神品任务的实例不会被普通升星消耗。
- 神品任务为实例级独立规则：
  - 每个符合条件的3星非神品单位实例独立 10% 判定
  - 多实例可并行持有任务
  - 进度绑定 unit instance ID，跨回合累计
  - 牧师任务按真实治疗量累计（不计溢出/满血）

## 关键目录

```text
assets/scripts/
  config/
    battlefield-config.ts
    difficulty-config.ts
    divine-task-config.ts
    enemy-config.ts
    unit-config.ts
    wave-config.ts
  systems/
    battle-system.ts
    divine-task-system.ts
    economy-system.ts
    shop-system.ts
    unit-system.ts
    wave-system.ts
  core/
    game-controller.ts
    game-session.ts
    verify-divine-task-rules.ts
  ui/
    cocos-game-controller.ts
```

## 本地验证

```bash
npm install
npm test
```

`npm test` 包含：
1. `tsc --noEmit`
2. `tsx assets/scripts/core/verify-divine-task-rules.ts`

## 手动游玩建议
1. 进入游戏后选择 `新手`。
2. `全买` -> `自动上阵` -> `开战`。
3. 观察单位在二维空间中移动、索敌、追击、治疗、AOE。
4. 每波结束回到准备阶段继续招募/调位，直至胜利或失败。


## 贴图资源管线（v1 占位流程）

- 参考图目标路径：`assets/art/reference/unit_star_progression.png`（仓库当前追踪文本占位 `unit_star_progression.placeholder.txt`）
- 规格文档：`docs/art/unit_star_progression_spec.md`
- 星级贴图路径映射：`assets/scripts/config/unit-star-sprite-config.ts`

当前运行时策略：
1. 优先按 `unitId + star` 路径加载（如 `textures/avatars/warrior/star2`）
2. 若缺失则回退到单位基础路径（如 `textures/avatars/warrior`）
3. 保持 2D sprite 工作流，不引入 3D 管线

