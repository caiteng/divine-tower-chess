# 02 阶段 1：塔防核心架构

## 阶段目标

建立独立塔防 runtime。此阶段只做逻辑骨架，不接复杂 UI，不生成美术。目标是让 AI 能在不破坏旧 `squad` 主线的前提下，创建可测试的 `TowerDefenseSession`。

## 本阶段完成后应该具备

```ts
const session = new TowerDefenseSession();
session.startNewRun('stage_1_forest_loop', 'normal');
session.getSnapshot();
session.startNextWave();
session.tick(0.016);
```

## 新增文件清单

```text
assets/scripts/td/types.ts
assets/scripts/td/td-session.ts
assets/scripts/td/config/td-game-config.ts
assets/scripts/td/config/td-stage-ids.ts
assets/scripts/td/systems/td-random.ts
assets/scripts/td/systems/td-id.ts
tools/verify-td-rules.ts
```

## 类型设计任务

在 `types.ts` 中定义：

- `TDPhase = 'prep' | 'spawning' | 'battle' | 'victory' | 'defeat'`
- `TDStageId`
- `TDDifficultyId`
- `TDVec2`
- `TDPathPoint`
- `TDTowerSlotState`
- `TDHeroInstanceState`
- `TDEnemyInstanceState`
- `TDWaveState`
- `TDPlayerState`
- `TDSnapshot`
- `TDStartRunOptions`

最小快照字段：

```ts
interface TDSnapshot {
  phase: TDPhase;
  stageId: TDStageId;
  difficulty: TDDifficultyId;
  life: number;
  gold: number;
  waveIndex: number;
  totalWaves: number;
  towerSlots: TDTowerSlotState[];
  bench: TDHeroInstanceState[];
  deployed: TDHeroInstanceState[];
  enemies: TDEnemyInstanceState[];
  notice?: string;
}
```

## Session 任务

`td-session.ts` 必须实现：

| 方法 | 作用 |
|---|---|
| `startNewRun(stageId, difficulty)` | 初始化塔防关卡 |
| `getSnapshot()` | 返回 UI 快照 |
| `startNextWave()` | 从准备阶段进入出怪阶段 |
| `tick(dt)` | 推进逻辑 |
| `addGold(amount)` | 测试与经济系统预留 |
| `damageLife(amount)` | 生命扣减预留 |
| `isTerminal()` | 是否胜利/失败 |

阶段 1 暂时不实现真实路径和战斗，只要状态机正确。

## 配置任务

`td-game-config.ts` 定义：

```ts
export const TD_DEFAULT_LIFE = 10;
export const TD_STARTING_GOLD = 20;
export const TD_TOTAL_WAVES = 10;
export const TD_LOGIC_FPS = 60;
```

`td-stage-ids.ts` 定义第一关 id：

```ts
export const TD_STAGE_IDS = ['stage_1_forest_loop'] as const;
```

## 测试任务

在 `tools/verify-td-rules.ts` 中加入：

1. 新局默认 10 生命。
2. 新局默认准备阶段。
3. `startNextWave()` 后进入 `spawning` 或 `battle`。
4. 生命扣到 0 后进入 `defeat`。
5. 第 10 波结束后进入 `victory` 的接口可以先留 TODO，但不要误触发。

## AI 代码提示词

```text
请新增 assets/scripts/td/types.ts、td-session.ts、config/td-game-config.ts、config/td-stage-ids.ts 和 tools/verify-td-rules.ts。只实现塔防状态机骨架，不接 UI，不改 squad。要求 npm test 仍然通过，verify-td-rules 可单独运行。
```

## 人工验收

```bash
npm install
npm run typecheck
npx tsx tools/verify-td-rules.ts
npm test
```

## 回退策略

删除 `assets/scripts/td/**` 和 `tools/verify-td-rules.ts` 即可回退，不影响旧玩法。

## 下一阶段前置条件

- `TowerDefenseSession` 能创建。
- `TDSnapshot` 字段稳定。
- 测试能跑通。
