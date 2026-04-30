# 09 阶段 2：地图、路径、塔位、生命

## 阶段目标

让敌人能够沿路径移动并漏怪扣血。此阶段可通过测试直接生成敌人，不需要 UI。


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
assets/scripts/td/config/td-map-config.ts
assets/scripts/td/config/td-enemy-config.ts
assets/scripts/td/systems/enemy-path-system.ts
assets/scripts/td/systems/life-system.ts
assets/scripts/td/systems/td-stage-loader.ts
```

## 地图任务

实现第一关 `stage_1_forest_loop`：

- 1280x720。
- 1 条地面路径。
- 1 条飞行路径。
- 8 个塔位。
- 3 个队长驻守点。
- 入口和出口标记。

## 敌人任务

先实现：

- `slime`
- `shieldling`
- `bat`
- `gate_golem`

每个敌人包含生命、速度、护甲、魔抗、是否飞行、漏怪扣血。

## 路径任务

实现：

- 路径长度计算。
- 进度到坐标。
- 敌人按速度推进。
- 飞行敌人走飞行路径。
- 地面敌人走地面路径。
- 到达终点后漏怪。

## 测试任务

- progress=0 是入口。
- progress=1 是出口。
- slime 漏怪扣 1。
- gate_golem 漏怪扣 3。
- 多敌人连续漏怪扣血正确。
- 生命归零失败。

## 验收

`verify-td-rules.ts` 中可以模拟 60 秒 tick，让敌人从入口走到出口并扣血。
