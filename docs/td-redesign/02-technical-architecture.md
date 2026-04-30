# 02 技术架构设计

## 1. 总体原则

新增塔防主线，不破坏现有小队战斗主线。所有 TD 代码独立放在 `assets/scripts/td/**`，UI 使用 `td-*` 前缀，资源使用 `assets/resources/textures/td/**`。

## 2. 目录结构

```text
assets/scripts/td/
  types.ts
  td-session.ts
  config/
    td-game-config.ts
    td-map-config.ts
    td-wave-config.ts
    td-hero-config.ts
    td-enemy-config.ts
    td-captain-config.ts
    td-skill-config.ts
    td-art-manifest.ts
  systems/
    enemy-path-system.ts
    wave-system.ts
    life-system.ts
    td-economy-system.ts
    td-shop-system.ts
    td-roster-system.ts
    placement-system.ts
    td-combat-system.ts
    targeting-system.ts
    blocking-system.ts
    captain-system.ts
    skill-system.ts
    td-save-system.ts
    td-id.ts

assets/scripts/ui/controllers/
  td-map-controller.ts
  td-hud-controller.ts
  td-prep-panel-controller.ts
  td-command-bar-controller.ts
  td-stage-select-controller.ts
  td-result-controller.ts

assets/scripts/ui/views/
  td-hero-view.ts
  td-enemy-view.ts
  td-projectile-view.ts
  td-vfx-view.ts

tools/
  verify-td-rules.ts
  verify-td-art-resources.ts
  generate-td-placeholder-art.ts
  run-td-web-e2e.js
```

## 3. 核心数据流

```text
Cocos UI -> 用户点击 -> TD Controller -> TowerDefenseSession 方法
TowerDefenseSession.tick -> 各系统更新 -> TDSnapshot
TDSnapshot -> TD Map/HUD/Panel Controller -> 节点渲染
```

## 4. TowerDefenseSession 职责

`TowerDefenseSession` 是唯一玩法状态源。

必须负责：

- 关卡开始。
- 波次开始。
- 每帧 tick。
- 生命、金币、波次、胜负。
- 敌人、英雄、塔位、技能状态。
- 快照导出。
- 存档导出/读取。

不负责：

- Cocos 节点创建。
- 图片加载。
- 音效播放。
- 具体按钮布局。

## 5. TDSnapshot 最小字段

```ts
interface TDSnapshot {
  phase: TDPhase;
  stageId: TDStageId;
  difficulty: TDDifficultyId;
  life: number;
  maxLife: number;
  gold: number;
  waveIndex: number;
  totalWaves: number;
  shop: TDShopEntry[];
  bench: TDHeroInstanceState[];
  deployed: TDHeroInstanceState[];
  towerSlots: TDTowerSlotState[];
  enemies: TDEnemyInstanceState[];
  projectiles: TDProjectileState[];
  effects: TDVfxState[];
  captain?: TDCaptainState;
  selectedHeroId?: string;
  selectedSlotId?: string;
  notice?: string;
}
```

## 6. 模块边界

| 模块 | 输入 | 输出 | 禁止做的事 |
|---|---|---|---|
| `enemy-path-system` | 路径、敌人、dt | 位置、progress | 不处理伤害 |
| `wave-system` | 波次配置、时间 | spawn 事件 | 不处理移动 |
| `td-combat-system` | 英雄、敌人、塔位 | 伤害、弹道、VFX | 不创建 Cocos 节点 |
| `placement-system` | 塔位、英雄 | 放置结果 | 不扣金币 |
| `td-shop-system` | 权重池、金币检查结果 | 商店项 | 不渲染 UI |
| `td-roster-system` | 背包/部署英雄 | 合成结果 | 不播放动画 |
| `captain-system` | XP、技能输入 | 技能效果 | 不控制普通守卫 |
| `td-save-system` | snapshot/state | JSON | 不直接读 UI |

## 7. 类型命名规范

| 类型 | 示例 |
|---|---|
| 职业 id | `archer`, `mage`, `warrior` |
| 敌人 id | `slime`, `shieldling`, `bat` |
| 关卡 id | `stage_1_forest_loop` |
| 塔位 id | `stage_1_slot_01` |
| 英雄实例 id | `td_hero_0001` |
| 敌人实例 id | `td_enemy_0001` |
| 弹道 id | `td_projectile_0001` |
| VFX id | `td_vfx_0001` |

## 8. 配置驱动

所有玩法数值都必须来自配置，不要硬编码在系统内。

配置包括：

- 职业基础属性。
- 星级倍率。
- 技能参数。
- 敌人基础属性。
- 敌人等级倍率。
- 地图路径和塔位。
- 波次编成。
- 商店权重。
- 难度倍率。

## 9. Cocos 接入方式

当前仓库已经有 `battle-scene-controller.ts` 作为场景编排入口。建议新增模式选择：

```text
主菜单
  -> 小队模式：走旧 SquadBattleSession
  -> 塔防模式：走 TowerDefenseSession
```

第一版接入可以简单粗暴：

- 在主菜单加“塔防模式”按钮。
- 点击后直接进入第一关。
- 暂不做完整关卡选择。
- 后续阶段再加 `td-stage-select-controller.ts`。

## 10. 测试架构

新增 `tools/verify-td-rules.ts`，覆盖所有纯逻辑规则。资源阶段新增 `tools/verify-td-art-resources.ts`。UI 阶段新增 `tools/run-td-web-e2e.js`。

`package.json` 后续可增加：

```json
{
  "scripts": {
    "verify:td": "tsx tools/verify-td-rules.ts",
    "verify:td-art": "tsx tools/verify-td-art-resources.ts",
    "verify:td-web": "node tools/run-td-web-e2e.js"
  }
}
```

MVP 完成后再把 `verify:td` 加入 `npm test`。

## 11. 回退策略

任何阶段都必须能通过以下方式回退：

- 删除 `assets/scripts/td/**`。
- 删除 `assets/scripts/ui/controllers/td-*`。
- 删除 `assets/scripts/ui/views/td-*`。
- 删除 `assets/resources/textures/td/**`。
- 删除 `tools/verify-td-*`。
- 主菜单隐藏塔防入口。

旧 `squad` 主线必须仍能运行。
