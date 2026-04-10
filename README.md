# divine-tower-chess

Cocos Creator + TypeScript 单机塔防原型（第一版骨架）。

## 当前完成状态（v0.2）
已落地从主菜单到回合战斗的最小可玩闭环，重点覆盖：

- 难度：新手(10波) / 普通(30波) / 困难(60波)
- 回合开始自动刷新商店（3格）
- 金币购买、手动刷新商店
- 棋子购买、上阵、战斗自动攻击
- 怪物按固定双路线前进，抵达水晶造成伤害
- 击杀返还金币
- 三合一升星（1星->2星，2星->3星）
- 神品任务按“棋子实例”独立触发与累计（战士/牧师）
- 同回合可存在多个神品任务，且互不共享进度
- 准备阶段支持移动已上阵棋子（`movePlaced(instanceId, lane, tileIndex)`）
- 神品治疗任务按真实治疗量累计（仅统计实际恢复的生命值）
- 任务进度跨回合累计，完成后自动进阶为神品

> 美术/UI 目前均为占位逻辑层实现，便于后续直接挂接 Cocos 节点与预制体。

## 目录结构

```text
assets/scripts/
  config/
    difficulty-config.ts
    divine-task-config.ts
    enemy-config.ts
    unit-config.ts
    wave-config.ts
  core/
    game-controller.ts
    game-session.ts
    simulate-run.ts
  models/
    types.ts
  systems/
    battle-system.ts
    divine-task-system.ts
    economy-system.ts
    shop-system.ts
    unit-system.ts
    wave-system.ts
  ui/
    main-menu-controller.ts
  utils/
    id.ts
    random.ts
```

## 核心流程

1. 主菜单选择难度
2. 进入准备阶段（自动刷新商店，并对所有符合条件的3星实例进行神品任务判定）
3. 玩家购买棋子 -> 放置棋子 -> 可移动已上阵棋子
4. 开始战斗
5. 生成怪物并沿路径移动，怪物对前排施加持续压力
6. 棋子自动攻击/施法；治疗单位仅在友军真实受伤时产生真实治疗量
7. 波次结束后进入下一回合，直到胜利或失败

## 手动验证（神品任务与移动）

1. 新建 Cocos Creator 场景，将 `GameController` 挂到一个空节点。
2. UI 按钮分别绑定：
   - 选择难度 -> `startGame('beginner')`
   - 刷新商店 -> `refreshShop()`
   - 购买按钮 -> `buy(slotIndex)`
   - 上阵 -> `place(instanceId, lane, tileIndex)`
   - 移动 -> `movePlaced(instanceId, lane, tileIndex)`
   - 开战 -> `beginBattle()`
3. 在场景 `update(dt)` 调用 `tick(dt)`。
4. 通过 `snapshot()` 打印并观察 `placed` 与 `divineTasks`。
5. 验证两名3星战士：
   - 同时上阵两个3星战士，连续过回合直到两者都拿到任务。
   - 观察 `divineTasks` 中出现两个不同 `unitInstanceId` 的战士任务。
   - 进入战斗后确认两条任务的 `progress` 各自增长且互不影响。
6. 验证两名3星牧师：
   - 同时上阵两个3星牧师，连续过回合直到两者都拿到任务。
   - 观察 `divineTasks` 中两个牧师实例任务独立增长。
   - 确认仅在友军掉血并被恢复时进度增长；满血期间不增长。
7. 验证位置调整：
   - 某个已接任务棋子在准备阶段执行 `movePlaced(...)`。
   - 确认该棋子的 `instanceId/star/assignedTaskId` 不变。
   - 下一场战斗中任务进度继续累计。
8. 验证进阶：
   - 将任务进度刷满后，确认该实例单位 `unitId` 变为目标神品（狂战士/光法师）。

## 下一步建议

1. 把 `GameController` 正式改造成 `cc.Component`，并连上真实 Cocos UI 节点。
2. 增加可视化棋盘、怪物预制体、路线 gizmo。
3. 为技能补基础演出（投射物、AOE圈、治疗数字）。
4. 引入简单结算面板与重开流程。
5. 做第一轮数值平衡，确保新手10波通关率合理。
