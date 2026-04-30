# 02 技术架构与目录边界

## 1. 架构原则

塔防系统以新命名空间实现，不原地重写旧 `squad`。

核心原则：

1. `td-session.ts` 是塔防会话唯一入口。
2. UI 只能读取 `TDSnapshot`，不能直接改内部数组。
3. 配置与逻辑分离。
4. 规则必须有脚本测试。
5. 资源必须有 manifest 和校验脚本。
6. 每阶段都能回退。

## 2. 目标目录

```text
assets/scripts/td/
  types.ts
  td-session.ts
  config/
    td-game-config.ts
    td-stage-ids.ts
    td-map-config.ts
    td-wave-config.ts
    td-hero-config.ts
    td-enemy-config.ts
    td-skill-config.ts
    td-art-manifest.ts
  systems/
    td-id.ts
    enemy-path-system.ts
    wave-system.ts
    life-system.ts
    td-economy-system.ts
    td-shop-system.ts
    td-roster-system.ts
    placement-system.ts
    td-combat-system.ts
    targeting-system.ts
    captain-system.ts
    td-save-system.ts
```

UI：

```text
assets/scripts/ui/controllers/td-map-controller.ts
assets/scripts/ui/controllers/td-hud-controller.ts
assets/scripts/ui/controllers/td-prep-panel-controller.ts
assets/scripts/ui/controllers/td-command-bar-controller.ts
assets/scripts/ui/views/td-hero-view.ts
assets/scripts/ui/views/td-enemy-view.ts
```

工具：

```text
tools/verify-td-rules.ts
tools/verify-td-art-resources.ts
tools/generate-td-placeholder-art.ts
tools/run-td-web-e2e.js
tools/verify-td-design-docs.ts
```

## 3. 模块依赖

```text
TowerDefenseSession
  -> WaveSystem
  -> EnemyPathSystem
  -> LifeSystem
  -> EconomySystem
  -> ShopSystem
  -> RosterSystem
  -> PlacementSystem
  -> CombatSystem
  -> CaptainSystem
```

UI 依赖：

```text
TDMapController -> TDSnapshot
TDHudController -> TDSnapshot
TDPrepPanelController -> TDSnapshot + callbacks
TDCommandBarController -> TDSnapshot + callbacks
```

## 4. 核心类型

`assets/scripts/td/types.ts` 必须定义：`TDPhase`、`TDDifficultyId`、`TDStar`、`TDVec2`、`TDStageId`、`TDHeroId`、`TDEnemyId`、`TDHeroInstanceState`、`TDEnemyInstanceState`、`TDTowerSlotState`、`TDSnapshot`。

## 5. Session API

```ts
startNewRun(stageId: TDStageId, difficulty: TDDifficultyId): void
startNextWave(): boolean
tick(dt: number): TDOutcome
getSnapshot(): TDSnapshot
buyShopHero(slotIndex: number): boolean
placeHero(heroInstanceId: string, towerSlotId: string): boolean
recallHero(heroInstanceId: string): boolean
sellHero(heroInstanceId: string): boolean
castCaptainSkill(skillId: string, target?: TDVec2): boolean
exportSaveData(): TDSaveData
loadFromSaveData(data: TDSaveData): boolean
```

阶段 1 只实现前 5 个基础方法。

## 6. 测试策略

| 系统 | 测试 |
|---|---|
| Session | phase、life、gold、snapshot |
| Path | 进度转坐标、漏怪 |
| Wave | 出怪队列、清波 |
| Shop | 金币不足、背包满、刷新 |
| Merge | 3 合 1、锁定保护 |
| Combat | 对空、AOE、护甲、阻挡 |
| Art | manifest、PNG、meta |
| UI | 冒烟点击链路 |

## 7. 回退策略

- 阶段 1-5：删除 `assets/scripts/td/**` 和 `tools/verify-td-rules.ts`。
- 阶段 6：删除 `td-*` UI 控制器和主菜单接入。
- 阶段 7：删除 `assets/resources/textures/td/**`。
- 旧 `squad` 主线始终保留，可直接切回。
