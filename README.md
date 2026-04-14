# divine-tower-chess

Cocos Creator + TypeScript 单机原型。当前版本已将战斗系统重构为**连续二维空间自动战斗**（2D横版/伪纵深），并保留商店、升星、神品任务、波次与水晶防守闭环。

## 当前完成状态（v0.3.0）

### 已完成
- 新战场：逻辑空间 1000x800，单位/敌人都使用连续 `(x,y)`。
- 新索敌：`detectionRange` + `attackRange` + `moveSpeed` 驱动搜敌/追击/输出。
- 敌人：从右向左推进，靠近我方单位时攻击，贴近水晶造成伤害。
- 单位行为：
  - 近战追击
  - 远程保持距离输出
  - 牧师按真实治疗量治疗
  - 法师局部AOE
- 轻量分离：敌人之间有基础 anti-overlap，减少重叠穿模。
- 准备阶段仍可购买、摆放、移动，并保留实例身份。
- 神品任务体系保持实例绑定与并行推进：
  - 战士->狂战士（击杀）
  - 牧师->光法师（真实治疗）

### 保留规则
- 自动刷新商店（3格）
- 购买/刷新/摆放/移动/开战仅准备阶段
- 三合一升星（含备战区+上阵区混合）
- 3星后只能神品化，不走普通升星
- 多个3星实例可同时独立接任务

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
1. 进入游戏后选 `新手`。
2. `全买` -> `自动上阵` -> `开战`。
3. 观察单位在战场中自由移动、索敌、追击、治疗、AOE。
4. 每波结束回到准备阶段继续操作，直至胜利/失败。
