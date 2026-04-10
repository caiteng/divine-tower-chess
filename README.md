# divine-tower-chess

Cocos Creator + TypeScript 单机塔防原型（第一版骨架）。

## 当前完成状态（v0.1）
已落地从主菜单到回合战斗的最小可玩闭环，重点覆盖：

- 难度：新手(10波) / 普通(30波) / 困难(60波)
- 回合开始自动刷新商店（3格）
- 金币购买、手动刷新商店
- 棋子购买、上阵、战斗自动攻击
- 怪物按固定双路线前进，抵达水晶造成伤害
- 击杀返还金币
- 三合一升星（1星->2星，2星->3星）
- 3星棋子10%概率触发神品任务（战士/牧师）
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
2. 进入准备阶段（自动刷新商店）
3. 玩家购买棋子 -> 放置棋子
4. 开始战斗
5. 生成怪物并沿路径移动
6. 棋子自动攻击/施法
7. 波次结束后进入下一回合，直到胜利或失败

## 手动验证（当前阶段）

> 以下是逻辑层验证流程，适合先验证“能玩通新手10波”的闭环。

1. 新建 Cocos Creator 场景，将 `GameController` 挂到一个空节点。
2. UI 按钮分别绑定：
   - 选择难度 -> `startGame('beginner')`
   - 刷新商店 -> `refreshShop()`
   - 购买按钮 -> `buy(slotIndex)`
   - 开战按钮 -> `beginBattle()`
3. 在场景 `update(dt)` 调用 `tick(dt)`。
4. 通过 `snapshot()` 把关键数据打印到控制台（金币、商店、棋盘、波次、水晶血量）。
5. 连续进行10波，确认可到达 `phase = 'win'` 或水晶归零 `phase = 'lose'`。
6. 重复购买同类型单位，确认自动发生 3 合 1 升星。
7. 在有3星战士/牧师时反复过回合，观察是否出现神品任务进度与进阶。

## 下一步建议

1. 把 `GameController` 正式改造成 `cc.Component`，并连上真实 Cocos UI 节点。
2. 增加可视化棋盘、怪物预制体、路线 gizmo。
3. 为技能补基础演出（投射物、AOE圈、治疗数字）。
4. 引入简单结算面板与重开流程。
5. 做第一轮数值平衡，确保新手10波通关率合理。
