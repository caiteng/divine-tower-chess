# PLANS.md

## 当前状态（2026-04-16）

- 正式 Cocos UI 场景主链入口：`assets/scripts/ui/battle-scene-controller.ts`。
- 逻辑主链保持不变：`assets/scripts/squad/squad-battle-session.ts` + `assets/scripts/squad/systems/*`。
- `assets/scripts/ui/squad-battle-ui.ts` 已降级为兼容 shim，并标记 `@deprecated`，仅用于旧场景绑定过渡。
- 现有 Cocos 表现层拆分：
  - `BattleHudController`
  - `PrepPanelController`
  - `BattlefieldController`
  - `CommandOverlayController`
  - `WaveTransitionController`
  - `UnitView` / `EnemyView`
- 资源解析接口已建立：
  - `UnitSpriteResolver.resolve(unitId, star, divineState)`
  - `EnemySpriteResolver.resolve(enemyType)`
  - `UiIconResolver.resolve(iconId)`
  - `BackgroundResolver.resolve(sceneId)`

## 下一步

1. 将按钮与战场节点改为预制体化，减少运行时动态创建成本。
2. 将命令反馈从文本升级为线段与图标叠层（不改玩法逻辑）。
3. 扩展 `assets/resources` 贴图接入，完善 resolver 回退策略。
4. 增加战斗 UI 交互自动化回归样例（开波过渡、指令链、神品进度展示）。

## 历史迁移记录

- 历史阶段记录已迁移到：`docs/migration-log.md`。
