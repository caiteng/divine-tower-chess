# 10 阶段 3：波次循环

## 阶段目标

实现出怪队列、波次推进、清波奖励、10 波胜利。此阶段可以没有英雄，测试可直接清空敌人或用调试伤害。


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
assets/scripts/td/config/td-wave-config.ts
assets/scripts/td/systems/wave-system.ts
```

## 波次系统任务

`WaveSystem` 负责：

- 读取当前关卡波次配置。
- 按 `spawnDelay` 和 `interval` 生成敌人。
- 支持地面 lane 和 air lane。
- 标记 `spawning`、`active`、`cleared`。
- 清波后发奖励。
- 第 10 波清完胜利。

## 第一关 10 波

必须实现 `06-stage-map-and-wave-design.md` 中林地外环 10 波。

## Session 接入

`td-session.tick(dt)`：

1. 如果 phase 是 spawning，调用 waveSystem。
2. 生成敌人加入 enemies。
3. 所有出怪完成且敌人清空，进入 prep。
4. 第 10 波清空进入 victory。
5. 清波奖励加金币。

## UI 预留

快照中返回：

- `waveIndex`
- `totalWaves`
- `nextWavePreview`
- `isSpawning`
- `remainingEnemies`
- `spawnQueueLeft`

## 测试任务

- 第一波能按数量生成 slime。
- 出怪间隔正确。
- 清波奖励正确。
- 第 10 波后 victory。
- 非 prep 状态不能重复开波。
- 开波按钮防重复逻辑有效。

## 验收

`verify-td-rules.ts` 能模拟第一关 10 波完整推进。
