# divine-tower-chess

## 项目定义

`divine-tower-chess` 是一个基于 Cocos Creator + TypeScript 的可玩项目。当前唯一方向是 **Battleheart 风格 2D 小队实时命令战斗** + 轻成长（商店、金币、3 合 1 升星、3 星实例级神品任务）。

## 当前真实主链

- 逻辑主链（唯一）：`assets/scripts/squad/*`
- 会话入口（唯一）：`assets/scripts/squad/squad-battle-session.ts`
- 正式 Cocos 场景编排入口：`assets/scripts/ui/battle-scene-controller.ts`

## 当前 UI 架构

- 正式 Cocos 表现层组件：
  - `assets/scripts/ui/controllers/battle-hud-controller.ts`
  - `assets/scripts/ui/controllers/prep-panel-controller.ts`
  - `assets/scripts/ui/controllers/battlefield-controller.ts`
  - `assets/scripts/ui/controllers/command-overlay-controller.ts`
  - `assets/scripts/ui/controllers/wave-transition-controller.ts`
  - `assets/scripts/ui/views/unit-view.ts`
  - `assets/scripts/ui/views/enemy-view.ts`
- `assets/scripts/ui/squad-battle-ui.ts` 已标记为 `@deprecated`，仅作为旧场景绑定兼容 shim，不再承载主实现。

## 核心规则（保持）

- 5 人上阵、8 格备战、3 格商店
- 商店回合开始自动刷新，购买失败不移除商店条目
- 3 同 1 星合 2 星，3 同 2 星合 3 星，3 星不再普通合成
- 神品任务为实例级独立分配和累计，且只对 3 星单位触发
- 牧师无攻击，只能被命令后持续治疗
- 无命令时远程不主动前压；近战仅近距离有限反应
- 波间保留准备面板上滑/下沉与战场暗亮过渡

## 资源接入接口

- `assets/scripts/ui/resources/sprite-resolvers.ts`
  - `UnitSpriteResolver.resolve(unitId, star, divineState)`
  - `EnemySpriteResolver.resolve(enemyType)`
  - `UiIconResolver.resolve(iconId)`
  - `BackgroundResolver.resolve(sceneId)`

## 运行与验证

```bash
npm install
npm test
```

- `npm test` 会执行：
  - `tsc --noEmit`
  - `tsx assets/scripts/core/verify-squad-rules.ts`

## 历史记录

- 历史阶段日志：`docs/migration-log.md`
- 当前状态与下一步：`PLANS.md`
