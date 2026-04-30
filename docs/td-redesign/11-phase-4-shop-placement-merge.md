# 11 阶段 4：英雄商店、放置、三合一

## 阶段目标

玩家能购买英雄、放置到塔位、在准备阶段三合一升星。此阶段仍可只做逻辑，不必完成 Cocos UI。


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
assets/scripts/td/config/td-hero-config.ts
assets/scripts/td/config/td-shop-config.ts
assets/scripts/td/systems/td-economy-system.ts
assets/scripts/td/systems/td-shop-system.ts
assets/scripts/td/systems/td-roster-system.ts
assets/scripts/td/systems/placement-system.ts
```

## 英雄池

MVP 实现：

- archer
- mage
- warrior
- knight
- assassin
- priest

每个英雄配置：

- cost
- hp
- attackDamage
- attackInterval
- attackRange
- armor
- tags
- canAttackAir
- blockCount
- damageType
- skill ids

## 商店规则

- 3 格商店。
- 新波准备阶段自动刷新。
- 可花金币刷新。
- 购买失败不移除商店项。
- 购买成功移除该商店项，并加入 bench。
- bench 初始容量 8，可配置。

## 放置规则

- 只有 prep 阶段能放置。
- 空塔位可放。
- 已占塔位不可放。
- 可从塔位撤回 bench。
- 可出售 bench 或塔位英雄。
- 战斗中不能换位，后续可扩展。

## 三合一规则

- 3 个同职业 1 星 -> 1 个 2 星。
- 3 个同职业 2 星 -> 1 个 3 星。
- 3 星封顶。
- 优先保留已在塔位的实例。
- 合成后保留塔位。
- 合成在准备阶段自动触发。
- 队长不参与合成。

## 测试任务

- 金币足够购买成功。
- 金币不足购买失败。
- 买失败不移除商店格。
- 放到空塔位成功。
- 放到占用塔位失败。
- 3 个 archer 1 星合成 archer 2 星。
- 3 个 archer 2 星合成 archer 3 星。
- 3 星不继续合成。
- 合成保留塔位实例。

## 验收

纯逻辑测试能构造：购买 3 个弓箭手 -> 自动 2 星 -> 放置塔位 -> 快照显示 2 星弓箭手。
