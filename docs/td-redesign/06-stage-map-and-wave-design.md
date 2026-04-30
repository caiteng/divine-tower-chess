# 06 五关地图、场景元素和波次设计

## 1. 地图通用规格

| 项 | 规格 |
|---|---|
| 画布 | 1280x720 |
| 视角 | 斜俯视 |
| UI 安全区 | 中心 960x540 优先放主要交互 |
| 路径宽度 | 80-110 像素 |
| 塔位半径 | 48-64 像素 |
| 出口 | 必须清晰显示城门/水晶/核心 |
| 入口 | 每条路径必须有入口标记 |
| 飞行路线 | 可以没有实体路，但要有视觉提示 |

## 2. 关卡 1：林地外环

### 目标

教学关。教会放置、开波、对空、三合一。

### 地图元素

- 森林小路。
- 木桥。
- 石头高台。
- 城门出口。
- 8 个塔位。
- 1 条飞行捷径。

### 路径

地面：`(0,430) -> (220,430) -> (320,250) -> (620,250) -> (760,500) -> (1040,500) -> (1280,360)`

飞行：`(0,180) -> (480,220) -> (920,300) -> (1280,260)`

### 波次

| 波 | 敌人 | 奖励 |
|---|---|---:|
| 1 | slime Lv1 x12 | 5 |
| 2 | slime Lv1 x16 | 6 |
| 3 | shieldling Lv1 x6 + slime Lv1 x10 | 7 |
| 4 | slime Lv2 x18 + bat Lv1 x4 | 8 |
| 5 | shieldling Lv2 x8 + slime Lv2 x12 | 9 |
| 6 | boneguard Lv1 x4 + slime Lv2 x16 | 10 |
| 7 | shadehound Lv1 x8 + shieldling Lv2 x10 | 11 |
| 8 | bat Lv2 x10 + boneguard Lv1 x6 | 12 |
| 9 | shadehound Lv2 x10 + shieldling Lv3 x10 | 14 |
| 10 | gate_golem Lv1 x1 + slime Lv3 x18 + bat Lv2 x6 | 18 |

## 3. 关卡 2：双桥峡谷

### 目标

多线压力。玩家要学会队长驻守点切换和分散布防。

### 地图元素

- 上下双入口。
- 两座桥。
- 中央汇合口。
- 峡谷出口。
- 10 个塔位。

### 路径

上路：`(0,520) -> (260,520) -> (420,420) -> (620,360) -> (1280,360)`

下路：`(0,210) -> (260,210) -> (420,300) -> (620,360) -> (1280,360)`

飞行：`(0,120) -> (640,220) -> (1280,250)`

### 波次

| 波 | 敌人 | 奖励 |
|---|---|---:|
| 1 | slime Lv2 x14 + bat Lv1 x4 | 6 |
| 2 | shieldling Lv2 x10 | 7 |
| 3 | 上路 shadehound Lv1 x6，下路 slime Lv2 x14 | 8 |
| 4 | 上路 bat Lv2 x8，下路 shieldling Lv2 x8 | 9 |
| 5 | boneguard Lv2 x6 + slime Lv3 x10 | 10 |
| 6 | shadehound Lv2 x10 + bat Lv2 x10 | 12 |
| 7 | warlock Lv1 x3 + shieldling Lv3 x12 | 13 |
| 8 | 上路 boneguard Lv2 x6，下路 shadehound Lv3 x8 | 14 |
| 9 | bat Lv3 x12 + spore Lv1 x10 | 16 |
| 10 | gate_golem Lv1 x1 + warlock Lv2 x4 + shadehound Lv3 x10 | 20 |

## 4. 关卡 3：失落回廊

### 目标

长路径和集火点。考验物理线、魔法线、对空线同时存在。

### 地图元素

- 废墟回廊。
- 中央遗迹。
- 内外折返。
- 10 个塔位。

### 路径

地面：`(0,560) -> (1130,560) -> (1130,160) -> (260,160) -> (260,380) -> (1280,380)`

飞行：`(0,100) -> (640,260) -> (1280,120)`

### 波次

| 波 | 敌人 | 奖励 |
|---|---|---:|
| 1 | shieldling Lv2 x8 + slime Lv3 x10 | 7 |
| 2 | bat Lv2 x10 + shadehound Lv2 x6 | 8 |
| 3 | boneguard Lv2 x8 | 9 |
| 4 | warlock Lv1 x4 + shieldling Lv3 x12 | 10 |
| 5 | spore Lv2 x12 + slime Lv4 x16 | 11 |
| 6 | bat Lv3 x12 + boneguard Lv3 x6 | 13 |
| 7 | shadehound Lv3 x12 + warlock Lv2 x4 | 14 |
| 8 | boneguard Lv3 x8 + spore Lv2 x12 | 16 |
| 9 | bat Lv4 x14 + shadehound Lv4 x10 | 18 |
| 10 | gate_golem Lv2 x1 + shieldling Lv4 x14 + warlock Lv2 x5 | 22 |

## 5. 关卡 4：熔炉十字

### 目标

多入口爆发。考验 AOE、阻挡和技能释放时机。

### 地图元素

- 熔岩沟。
- 十字路口。
- 熔炉门。
- 高温环境 VFX。
- 12 个塔位。

### 路径

左路：`(0,360) -> (460,360) -> (680,360) -> (1280,360)`

上路：`(640,720) -> (640,500) -> (680,360) -> (1280,360)`

侧路：`(300,0) -> (480,180) -> (680,360)`

飞行：`(0,120) -> (760,240) -> (1280,180)`

### 波次

按完整报告中的熔炉十字 10 波配置实现。MVP 不实现本关，Alpha 阶段实现。

## 6. 关卡 5：天穹圣坛

### 目标

最终综合考验。要求 3 星输出线、稳定主坦、对空核心、功能队长。

### 地图元素

- 天空圣坛。
- 螺旋路。
- 空桥。
- 圣门出口。
- 12 个塔位。
- Boss 入场专属镜头或警告。

### 路径

地面：`(0,620) -> (1120,620) -> (1120,120) -> (180,120) -> (180,420) -> (980,420) -> (1280,320)`

飞行：`(0,80) -> (640,160) -> (1280,80)`

### 波次

按完整报告中的天穹圣坛 10 波配置实现。Alpha 后期实现。

## 7. 地图 AI 生成 Prompt

### 林地外环

```text
Original 2D fantasy tower defense map background, 1280x720, horizontal mobile game layout, three-quarter top-down view, bright forest path, winding dirt road, wooden bridge, small stone highgrounds, visible empty tower spots, clear entrance on left and castle gate exit on right, no UI, no text, no characters, stylized cartoon.
```

### 双桥峡谷

```text
Original 2D fantasy tower defense map, 1280x720, canyon with two bridges, two left entrances merging into one road, clear tower build pads, warm daylight, readable path, no UI, no text, no characters, stylized cartoon.
```

### 失落回廊

```text
Original 2D fantasy tower defense map, 1280x720, ancient ruined corridor, rectangular looping road, central stone ruins, mossy tiles, clear tower pads, no UI, no text, no characters, stylized cartoon.
```

### 熔炉十字

```text
Original 2D fantasy tower defense map, 1280x720, volcanic forge crossroads, lava channels, stone bridges, multiple entrances, glowing furnace gate exit, clear tower pads, no UI, no text, no characters, stylized cartoon.
```

### 天穹圣坛

```text
Original 2D fantasy tower defense map, 1280x720, sky temple, spiral stone road, floating platforms, sacred gate exit, clouds below, clear tower pads, no UI, no text, no characters, stylized cartoon.
```
