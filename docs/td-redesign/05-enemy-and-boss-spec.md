# 05 敌人与 Boss 详细规格

## 1. 通用敌人规格

| 项 | 规格 |
|---|---|
| 小怪画布 | 192x192 |
| Boss 画布 | 320x320 |
| 背景 | 透明 |
| 朝向 | 默认朝右 |
| 视角 | 斜俯视 |
| 风格 | 原创卡通奇幻怪物 |
| 路径 | 地面或飞行 |
| 动画 | move、hit、death，特殊敌人加 cast，Boss 加 phase |

## 2. 敌人数值表

| id | 名称 | 生命 | 速度 | 护甲 | 魔抗 | 路径 | 漏怪扣血 | 赏金 |
|---|---|---:|---:|---:|---:|---|---:|---:|
| slime | 软泥仔 | 55 | 90 | 0 | 0 | 地面 | 1 | 1 |
| shieldling | 木盾兵 | 140 | 68 | 12 | 0 | 地面 | 1 | 2 |
| boneguard | 骨甲卫 | 220 | 55 | 26 | -10% | 地面 | 2 | 3 |
| bat | 火羽蝠 | 85 | 120 | 0 | 20% | 飞行 | 1 | 2 |
| shadehound | 幽影犬 | 95 | 135 | 4 | 0 | 地面 | 1 | 2 |
| warlock | 诅咒术士 | 160 | 62 | 2 | 40% | 地面 | 2 | 4 |
| spore | 爆裂孢子 | 70 | 115 | 0 | 0 | 地面 | 1 | 2 |
| gate_golem | 城门魔像 | 1600 | 42 | 35 | 15% | 地面 | 3 | 12 |

## 3. 等级倍率

```text
等级生命 = 基础生命 * (1 + 0.16 * (level - 1))
等级速度 = 基础速度 * (1 + 0.02 * (level - 1))
等级赏金 = ceil(基础赏金 * (1 + 0.08 * (level - 1)))
```

## 4. 软泥仔 slime

### 定位

基础快速小怪。用于测试补刀密度。

### 机制

无特殊机制，低血高数量。

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| move | 6 | 软泥弹跳前进 |
| hit | 3 | 被击中压扁、闪白 |
| death | 6 | 爆成液滴 |

### AI 提示词

```text
Original cute green slime monster sprite, transparent background, facing right, three-quarter top-down, stylized fantasy tower defense enemy, jelly body, readable silhouette, 192x192, no text. Animation frame: {frame}.
```

## 5. 木盾兵 shieldling

### 定位

中血前排，物理抗性入门。

### 机制

持木盾，物理伤害减少。魔法无惩罚。

### 动作帧

move 6 帧：举盾小步走。hit 3 帧：盾牌震动。death 6 帧：盾碎倒下。

### AI 提示词

```text
Original small goblin shield bearer enemy, wooden shield, leather straps, transparent background, facing right, three-quarter top-down, stylized cartoon tower defense, 192x192. Animation frame: {frame}.
```

## 6. 骨甲卫 boneguard

### 定位

高甲重兵，逼迫玩家使用法师或破甲。

### 机制

高护甲，受魔法额外 10% 伤害。

### 动作帧

move 6 帧：沉重步伐。hit 3 帧：骨甲碎片。death 6 帧：骨架散落。

### AI 提示词

```text
Original armored skeleton guard enemy, heavy bone armor, large shoulder plates, transparent background, facing right, three-quarter top-down, stylized cartoon, 192x192. Animation frame: {frame}.
```

## 7. 火羽蝠 bat

### 定位

飞行单位，考验对空。

### 机制

走飞行路径，不被近战阻挡，只能被对空单位攻击。

### 动作帧

move 6 帧：翅膀扇动。hit 3 帧：羽毛散落。death 6 帧：坠落消散。

### AI 提示词

```text
Original fiery bat flying enemy sprite, orange wings, small fantasy monster, transparent background, facing right, top-down tower defense view, 192x192. Animation frame: {frame}.
```

## 8. 幽影犬 shadehound

### 定位

快速潜行单位，要求侦测。

### 机制

未被侦测时受到 70% 减伤。刺客 2 星、德鲁伊、特定队长技能可侦测。

### 动作帧

move 6 帧：黑雾奔跑。hit 3 帧：影子闪烁。death 6 帧：烟雾散开。

### AI 提示词

```text
Original shadow hound enemy, dark smoky wolf-like creature, glowing eyes, transparent background, facing right, stylized fantasy tower defense, 192x192. Animation frame: {frame}.
```

## 9. 诅咒术士 warlock

### 定位

后排辅助，应被刺客优先击杀。

### 机制

每 5 秒给前方敌人施加护盾或加速。魔抗高。漏怪扣 2。

### 动作帧

move 6 帧，cast 6 帧，hit 3 帧，death 6 帧。

### AI 提示词

```text
Original goblin warlock support enemy, purple robe, crooked staff, glowing curse orb, transparent background, facing right, stylized tower defense, 192x192. Animation frame: {frame}.
```

## 10. 爆裂孢子 spore

### 定位

自爆单位，制造阵地压力。

### 机制

死亡时对附近近战英雄造成少量伤害。漏怪时本波额外灼烧计数，最多额外扣 2 点生命。

### 动作帧

move 6 帧，hit 3 帧，death 6 帧，爆裂 VFX 6 帧。

### AI 提示词

```text
Original explosive mushroom spore enemy, red cap, glowing cracks, transparent background, facing right, stylized fantasy tower defense, 192x192. Animation frame: {frame}.
```

## 11. 城门魔像 gate_golem

### 定位

Boss。低速高血，压迫最终波。

### 机制

- 高护甲。
- 减速抗性 60%。
- 生命降到 50% 时进入二阶段，召唤 6 个软泥仔。
- 漏怪扣 3 点生命。
- Boss 入场显示警告。

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| move | 8 | 重步行走，地面震动 |
| hit | 4 | 石块崩裂 |
| cast | 8 | 抬手召唤 |
| phase | 8 | 核心发红，进入二阶段 |
| death | 10 | 石块坍塌、核心熄灭 |

### AI 提示词

```text
Original stone gate golem boss, medieval fantasy construct, glowing orange core, heavy stone arms, transparent background, facing right, three-quarter top-down, stylized cartoon tower defense, 320x320. Animation frame: {frame}.
```

## 12. 敌人资源验收

MVP 敌人必须有：

```text
slime/move_01..06 hit_01..03 death_01..06
shieldling/move_01..06 hit_01..03 death_01..06
bat/move_01..06 hit_01..03 death_01..06
gate_golem/move_01..08 hit_01..04 cast_01..08 phase_01..08 death_01..10
```

Alpha 再补齐其他敌人。
