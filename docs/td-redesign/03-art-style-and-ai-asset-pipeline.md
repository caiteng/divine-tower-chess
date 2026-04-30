# 03 美术风格与 AI 资源管线

## 1. 总风格

原创中世纪奇幻卡通风格，强调塔防可读性：高饱和但不过度花哨；角色轮廓清晰；职业识别强；敌人体型差异明显；地图路径和塔位一眼可读；UI 图标简洁。

禁止在 prompt 中要求生成任何现有商业游戏的具体角色、图标、地图或 UI。

## 2. 资源尺寸

| 类型 | 尺寸 | 背景 | 用途 |
|---|---:|---|---|
| 地图背景 | 1280x720 | 不透明 | 单屏地图 |
| 路径覆盖 | 1280x720 | 透明 | 调试/半透明路面 |
| 塔位标记 | 128x128 | 透明 | normal/hover/locked |
| 英雄头像 | 256x256 | 透明 | 商店/背包 |
| 英雄帧 | 256x256 | 透明 | 战场动画 |
| 小敌人帧 | 192x192 | 透明 | 战场动画 |
| Boss 帧 | 320x320 | 透明 | 战场动画 |
| 技能图标 | 128x128 | 透明 | 技能栏 |
| VFX 帧 | 256x256 | 透明 | 特效动画 |

## 3. 英雄帧动画规格

| 动作 | 帧数 | 命名 | 说明 |
|---|---:|---|---|
| idle | 4 | `idle_01.png` - `idle_04.png` | 轻微呼吸 |
| attack | 6 | `attack_01.png` - `attack_06.png` | 前摇、命中、回收 |
| skill | 6 | `skill_01.png` - `skill_06.png` | 2 星或队长技能 |
| hurt | 3 | `hurt_01.png` - `hurt_03.png` | 受击 |
| death | 6 | `death_01.png` - `death_06.png` | 倒地或消散 |
| portrait | 1 | `portrait.png` | 商店头像 |

特殊动作：骑士 `block_01` - `block_04`；刺客 `teleport_01` - `teleport_06`；牧师 `heal_01` - `heal_06`；法师 `cast_01` - `cast_06`。

## 4. 敌人帧动画规格

| 动作 | 帧数 | 命名 |
|---|---:|---|
| move | 6 | `move_01.png` - `move_06.png` |
| hit | 3 | `hit_01.png` - `hit_03.png` |
| death | 6 | `death_01.png` - `death_06.png` |
| skill | 6 | 精英/Boss 才需要 |
| phase | 6 | Boss 阶段变化 |

## 5. 目录规范

```text
assets/resources/textures/td/maps/stage_1_forest_loop/background.png
assets/resources/textures/td/heroes/archer/portrait.png
assets/resources/textures/td/heroes/archer/idle_01.png
assets/resources/textures/td/enemies/slime/move_01.png
assets/resources/textures/td/ui/gold.png
assets/resources/textures/td/vfx/arrow_hit_01.png
```

## 6. AI 图片 Prompt 模板

英雄：

```text
原创中世纪奇幻卡通塔防游戏角色，职业：[职业名]，朝右站立，透明背景，清晰轮廓，2D sprite，统一画布 256x256，动作：[idle/attack/skill/hurt/death] 第 [N] 帧，保持同一角色服装、武器、比例和色板，不要文字，不要水印，不要现有游戏角色。
```

敌人：

```text
原创中世纪奇幻卡通塔防敌人，[敌人描述]，朝右移动，透明背景，2D sprite，统一画布 192x192，动作：[move/hit/death] 第 [N] 帧，轮廓清晰，适合小尺寸游戏显示，不要文字，不要水印，不要现有游戏角色。
```

地图：

```text
原创中世纪奇幻卡通塔防地图，1280x720，横屏单屏，清晰蜿蜒道路，左右入口和右侧出口，8 个可放置塔位区域，森林外环主题，路径和塔位清晰可读，无文字，无水印，不要参考任何现有商业游戏地图。
```

## 7. 程序占位图

阶段 1-6 可以使用程序生成占位图：简单色块角色、几何图形敌人、纯色地图背景、线条路径、圆形塔位。阶段 7 开始替换为 AI 帧图。

## 8. 资源校验

`verify-td-art-resources.ts` 必须检查 manifest 中引用的文件都存在、PNG 文件非空、每个英雄有 portrait/idle/attack、每个敌人有 move/hit/death、地图有 background/slot_normal、命名连续不能缺帧。
