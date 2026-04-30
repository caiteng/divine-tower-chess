# 08 阶段 1：塔防 Runtime 核心

## 阶段目标

新增独立 `TowerDefenseSession`，建立状态机、基础类型和快照。此阶段不接 Cocos UI，不做地图渲染。


## 每阶段固定要求

每个阶段提交必须包含：

1. 代码或文档变更清单。
2. 自动化测试。
3. 人工验收步骤。
4. 回退方案。
5. 下一阶段前置条件。
6. 不修改无关旧主线。


## 新增文件

```text
assets/scripts/td/types.ts
assets/scripts/td/td-session.ts
assets/scripts/td/config/td-game-config.ts
assets/scripts/td/config/td-stage-ids.ts
assets/scripts/td/systems/td-id.ts
tools/verify-td-rules.ts
```

## 代码任务

### types.ts

定义：

- `TDPhase`
- `TDStageId`
- `TDDifficultyId`
- `TDVec2`
- `TDSnapshot`
- `TDHeroId`
- `TDEnemyId`
- `TDHeroInstanceState`
- `TDEnemyInstanceState`
- `TDTowerSlotState`

### td-session.ts

实现：

| 方法 | 说明 |
|---|---|
| `startNewRun(stageId, difficulty)` | 初始化一局 |
| `getSnapshot()` | 返回快照 |
| `startNextWave()` | 准备阶段进入波次 |
| `tick(dt)` | 推进逻辑 |
| `damageLife(amount)` | 扣生命 |
| `addGold(amount)` | 加金币 |
| `isTerminal()` | 胜负结束判断 |

## 测试任务

`verify-td-rules.ts` 覆盖：

- 新局生命为 10。
- 新局金币为配置值。
- 新局 phase 为 prep。
- `startNextWave` 改变 phase。
- 扣生命到 0 后 phase 为 defeat。

## 验收命令

```bash
npx tsx tools/verify-td-rules.ts
npm test
```

## 回退

删除 `assets/scripts/td/**` 与 `tools/verify-td-rules.ts`。
