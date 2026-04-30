# 12 阶段 5：战斗、索敌、职业差异

## 阶段目标

让塔位上的英雄能自动攻击敌人，并让 6 个基础职业有明显差异。


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
assets/scripts/td/systems/td-combat-system.ts
assets/scripts/td/systems/targeting-system.ts
assets/scripts/td/systems/blocking-system.ts
assets/scripts/td/systems/td-projectile-system.ts
assets/scripts/td/config/td-damage-config.ts
```

## 战斗规则

### 伤害公式

```text
raw = heroAttack * starMultiplier * skillMultiplier
afterArmor = max(1, raw - enemyArmor * (1 - armorPierce))
final = round(afterArmor * elementModifier * tagModifier)
```

### 星级倍率

| 星级 | 攻击 | 生命 |
|---|---:|---:|
| 1 | 1.00 | 1.00 |
| 2 | 1.72 | 1.45 |
| 3 | 2.95 | 2.10 |

## 职业实现

| 职业 | MVP 行为 |
|---|---|
| archer | 高攻速，能打飞行，单体 |
| mage | 慢攻速，魔法 AOE，破重甲 |
| warrior | 近战，阻挡 1 个地面敌人，顺劈 |
| knight | 阻挡 2 个地面敌人，高生命，低伤害 |
| assassin | 优先 warlock/shadehound，爆发高 |
| priest | 治疗血量百分比最低的友方 |

## 阻挡规则

- 只有地面敌人可被阻挡。
- 飞行敌人不可阻挡。
- 战士 blockCount=1。
- 骑士 blockCount=2。
- 被阻挡敌人速度变 0 或降低 80%。
- 阻挡者死亡或敌人死亡后释放阻挡。

## 对空规则

- `bat` 只能被 canAttackAir 的英雄攻击。
- MVP 中 archer 能对空，mage 2 星后可对空，cannoneer 后续对空。
- 近战不可对空。

## AOE 规则

- 法师 2 星后攻击半径 55 像素。
- AOE 不伤害友方。
- 对主目标造成 100%，副目标 60%。

## 牧师治疗

- 不攻击敌人。
- 每次治疗选择血量百分比最低的阻挡英雄。
- 治疗不能超过目标最大生命。
- 如果没有受伤友方，则待机。

## 测试任务

- 弓箭手能打 bat。
- 战士不能打 bat。
- 法师 AOE 伤害多个敌人。
- 骑士阻挡 2 个地面敌人。
- 牧师治疗受伤骑士。
- 护甲降低物理伤害。
- 魔法对 boneguard 有优势。
- 敌人死亡后给金币。

## 验收

构造一组塔位英雄和敌人，tick 10 秒后敌人血量减少，部分死亡，金币增加，漏怪减少。
