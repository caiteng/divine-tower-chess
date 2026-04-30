# 04 英雄职业、技能、动作帧详细规格

## 1. 通用角色规格

| 项 | 规格 |
|---|---|
| 画布 | 256x256 PNG |
| 背景 | 透明 |
| 朝向 | 默认朝右 |
| 视角 | 斜俯视 2D |
| 风格 | 原创卡通中世纪奇幻 |
| 轮廓 | 小屏幕可读，职业一眼能区分 |
| 星级表现 | 1 星朴素、2 星增加肩甲/光效、3 星增加披风/发光边/武器强化 |
| 命名 | `<action>_<index>.png`，如 `attack_01.png` |

## 2. 基础数值表

| 职业 | 生命 | 攻击 | 攻速 | 射程 | 护甲 | 对空 | 阻挡 | 伤害类型 |
|---|---:|---:|---:|---:|---:|---|---:|---|
| archer 弓箭手 | 160 | 24 | 0.78s | 220 | 4 | 是 | 0 | 物理 |
| mage 法师 | 140 | 34 | 1.25s | 200 | 2 | 部分 | 0 | 魔法 AOE |
| warrior 战士 | 260 | 30 | 1.00s | 65 | 12 | 否 | 1 | 物理近战 |
| knight 骑士 | 340 | 22 | 1.35s | 60 | 20 | 否 | 2 | 物理近战 |
| assassin 刺客 | 180 | 42 | 0.95s | 80 | 6 | 否 | 0 | 物理爆发 |
| priest 牧师 | 170 | 0 | 1.10s | 190 | 5 | 否 | 0 | 治疗/辅助 |
| spearman 枪兵 | 220 | 28 | 0.95s | 95 | 10 | 否 | 1 | 穿刺 |
| alchemist 炼金师 | 150 | 18 | 1.40s | 180 | 3 | 否 | 0 | 毒/火 DOT |
| cannoneer 炮手 | 190 | 58 | 1.80s | 240 | 6 | 是 | 0 | 爆炸 |
| druid 德鲁伊 | 180 | 20 | 1.20s | 190 | 5 | 是 | 0 | 自然/控场 |

MVP 只实现前 6 个，其余作为 Alpha 扩展。

## 3. 星级倍率

| 星级 | 攻击倍率 | 生命倍率 | 技能状态 |
|---|---:|---:|---|
| 1 星 | 1.00 | 1.00 | 基础攻击 |
| 2 星 | 1.72 | 1.45 | 解锁核心技能/被动 |
| 3 星 | 2.95 | 2.10 | 解锁终极强化 |

## 4. 弓箭手 archer

### 定位

单体持续输出，对空核心，前期最可靠输出。

### 技能

| 星级 | 能力 | 说明 |
|---|---|---|
| 1 | 快速射击 | 普通箭，能攻击地面和飞行 |
| 2 | 破甲箭 | 每第 5 次攻击附加 25% 穿甲 |
| 3 | 多重箭 | 攻击主目标时额外射向 2 个附近目标 |

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| idle | 4 | 站立、弓轻微上下移动 |
| attack | 6 | 抬弓、拉弦、满弦、放箭、回收 |
| skill | 6 | 抬弓向上，多支箭发光射出 |
| hurt | 3 | 身体后仰、短暂闪白 |
| death | 6 | 弓掉落、跪倒、消失 |
| portrait | 1 | 半身头像，绿色兜帽，木弓 |

### AI 图像提示词

```text
Original 2D fantasy tower defense archer hero sprite, transparent background, facing right, three-quarter top-down view, cute stylized medieval cartoon, green hood, leather armor, wooden bow, slim silhouette, readable on mobile, 256x256, no text, no logo. Animation frame: {idle/attack/skill/hurt/death}.
```

## 5. 法师 mage

### 定位

魔法 AOE，重甲解法，慢攻速高影响。

### 技能

| 星级 | 能力 | 说明 |
|---|---|---|
| 1 | 奥术弹 | 单体魔法弹 |
| 2 | 爆裂奥术 | 命中后半径 55 像素 AOE |
| 3 | 陨火 | 每 8 秒对最密集区域落火 |

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| idle | 4 | 法杖浮光、袍子轻摆 |
| attack | 6 | 聚能、法球生成、抛出 |
| skill | 6 | 举杖、魔法阵、陨火预兆 |
| hurt | 3 | 抱杖后退 |
| death | 6 | 法杖熄灭、倒下化光 |
| portrait | 1 | 蓝紫法袍、长杖、水晶帽饰 |

### AI 提示词

```text
Original 2D fantasy tower defense mage hero sprite, transparent background, facing right, three-quarter top-down, blue purple robe, glowing staff, arcane crystal, stylized cartoon, 256x256. Animation frame: {frame}.
```

## 6. 战士 warrior

### 定位

近战输出，轻阻挡，适合清地面小怪。

### 技能

| 星级 | 能力 | 说明 |
|---|---|---|
| 1 | 斩击 | 单体近战 |
| 2 | 顺劈 | 同时伤害主目标附近 2 个敌人 |
| 3 | 旋风斩 | 每 10 秒旋转 1.2 秒，范围伤害 |

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| idle | 4 | 持剑待机 |
| attack | 6 | 起手、横斩、命中、收剑 |
| skill | 6 | 旋转挥剑 |
| block | 4 | 举剑抵挡 |
| hurt | 3 | 后退 |
| death | 6 | 剑落地、倒下 |

### AI 提示词

```text
Original 2D fantasy tower defense warrior sprite, transparent background, facing right, three-quarter top-down, broad sword, red cloth, light armor, heroic cartoon style, 256x256. Animation frame: {frame}.
```

## 7. 骑士 knight

### 定位

主坦，高阻挡，嘲讽和保护。

### 技能

| 星级 | 能力 | 说明 |
|---|---|---|
| 1 | 盾击 | 近战低伤，短暂停顿敌人 |
| 2 | 嘲讽 | 周围敌人优先攻击骑士，持续 3 秒 |
| 3 | 圣盾领域 | 8 秒内减少自身和附近友军 35% 伤害 |

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| idle | 4 | 盾牌前置 |
| attack | 6 | 盾击/剑刺 |
| block | 4 | 盾牌发光、防御姿势 |
| skill | 6 | 举盾释放金色护罩 |
| hurt | 3 | 盾牌震动 |
| death | 6 | 盾牌落地、跪倒 |

### AI 提示词

```text
Original 2D fantasy tower defense knight sprite, transparent background, facing right, three-quarter top-down, silver armor, large blue shield, short sword, sturdy silhouette, stylized cartoon, 256x256. Animation frame: {frame}.
```

## 8. 刺客 assassin

### 定位

爆发输出，优先术士/辅助/高价值目标，后续可侦测潜行。

### 技能

| 星级 | 能力 | 说明 |
|---|---|---|
| 1 | 背刺 | 对非 Boss 高额单体伤害 |
| 2 | 毒刃 | 造成 4 秒持续伤害，并可侦测潜行 |
| 3 | 处决瞬移 | 瞬移到低血精英身后造成斩杀 |

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| idle | 4 | 低姿态持匕首 |
| attack | 6 | 快速突刺 |
| teleport | 6 | 黑烟出现、消失、现身 |
| skill | 6 | 双刃交叉、紫色毒光 |
| hurt | 3 | 闪避失败 |
| death | 6 | 化作烟雾 |

### AI 提示词

```text
Original 2D fantasy tower defense assassin sprite, transparent background, facing right, three-quarter top-down, dark cloak, twin daggers, purple accent, agile silhouette, stylized cartoon, 256x256. Animation frame: {frame}.
```

## 9. 牧师 priest

### 定位

治疗和增益，不直接攻击。提升近战阵线稳定性。

### 技能

| 星级 | 能力 | 说明 |
|---|---|---|
| 1 | 治疗术 | 治疗血量百分比最低友军 |
| 2 | 治疗链 | 跳跃治疗 3 个友军 |
| 3 | 守护结界 | 范围内友军持续回血并减伤 |

### 动作帧

| 动作 | 帧数 | 描述 |
|---|---:|---|
| idle | 4 | 手持圣杖 |
| attack | 6 | 治疗施法动作，仍命名 attack 便于通用播放 |
| skill | 6 | 金色法阵扩散 |
| hurt | 3 | 后仰 |
| death | 6 | 光芒消散 |
| portrait | 1 | 白金法袍、圣杖 |

### AI 提示词

```text
Original 2D fantasy tower defense priest healer sprite, transparent background, facing right, three-quarter top-down, white and gold robe, holy staff, gentle silhouette, stylized cartoon, 256x256. Animation frame: {frame}.
```

## 10. 扩展职业

### 枪兵 spearman

中距离穿刺，适合窄路。2 星破甲刺，3 星直线贯穿。

### 炼金师 alchemist

持续伤害和减甲。2 星酸雾，3 星爆燃连锁。

### 炮手 cannoneer

慢速高伤和大范围爆炸。能对空但攻速慢。2 星震荡，3 星重炮。

### 德鲁伊 druid

控场和召唤。2 星荆棘减速，3 星树人短暂阻挡。

## 11. 角色资源验收

每个 MVP 职业必须有：

```text
portrait.png
star1.png
star2.png
star3.png
idle_01.png ... idle_04.png
attack_01.png ... attack_06.png
skill_01.png ... skill_06.png
hurt_01.png ... hurt_03.png
death_01.png ... death_06.png
```

骑士额外：

```text
block_01.png ... block_04.png
```

刺客额外：

```text
teleport_01.png ... teleport_06.png
```
