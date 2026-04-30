# 14 阶段 7：AI 图片、帧动画、地图元素、资源校验

## 阶段目标

把占位资源升级为完整原创 AI 帧动画资源，并接入 Cocos 资源加载和校验。此阶段的核心是“资源链跑通”，不是追求最终美术质量。


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
assets/scripts/td/config/td-art-manifest.ts
assets/scripts/ui/resources/td-sprite-resolvers.ts
tools/generate-td-placeholder-art.ts
tools/verify-td-art-resources.ts
```

## 资源目录

```text
assets/resources/textures/td/maps/stage_1_forest_loop/
assets/resources/textures/td/heroes/archer/
assets/resources/textures/td/heroes/mage/
assets/resources/textures/td/heroes/warrior/
assets/resources/textures/td/heroes/knight/
assets/resources/textures/td/heroes/assassin/
assets/resources/textures/td/heroes/priest/
assets/resources/textures/td/enemies/slime/
assets/resources/textures/td/enemies/shieldling/
assets/resources/textures/td/enemies/bat/
assets/resources/textures/td/enemies/gate_golem/
assets/resources/textures/td/ui/
assets/resources/textures/td/vfx/
```

## 必须生成的英雄资源

每个 MVP 英雄：

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

额外：

- 骑士：`block_01.png ... block_04.png`
- 刺客：`teleport_01.png ... teleport_06.png`

## 必须生成的敌人资源

```text
slime/move_01..06 hit_01..03 death_01..06
shieldling/move_01..06 hit_01..03 death_01..06
bat/move_01..06 hit_01..03 death_01..06
gate_golem/move_01..08 hit_01..04 cast_01..08 phase_01..08 death_01..10
```

## 地图资源

第一关：

```text
background.png
path_overlay.png
slot_normal.png
slot_hover.png
slot_occupied.png
exit_gate.png
```

## UI 资源

```text
icon_gold.png
icon_life.png
icon_star.png
icon_refresh.png
icon_sell.png
icon_wave.png
icon_lock.png
icon_air.png
icon_armor.png
```

## VFX 资源

```text
hit_physical_01..04
hit_magic_01..06
arrow_trail_01..04
heal_01..06
shield_01..06
explosion_01..08
boss_warning_01..08
```

## AI 生成流程

1. 先用 `generate-td-placeholder-art.ts` 生成所有缺失资源的简单占位图。
2. 接入 manifest，保证游戏能跑。
3. 对每个英雄生成原创 AI 角色设计稿。
4. 基于同一设计稿生成动作帧。
5. 替换占位图。
6. 运行 `verify-td-art-resources.ts`。
7. Cocos Preview 中查看动画帧播放。

## 帧动画代码任务

`td-hero-view.ts` 和 `td-enemy-view.ts` 实现：

- 动作状态：idle、attack、skill、hurt、death。
- 按动作取 manifest 帧数组。
- 按 fps 切换 SpriteFrame。
- 死亡动画播放完后隐藏节点。
- 同一 view 不重复加载已缓存帧。

## 资源校验任务

`verify-td-art-resources.ts` 检查：

- manifest 路径全部存在。
- PNG 尺寸符合规范。
- 帧数达标。
- 每个 PNG 有 `.meta`。
- 没有未引用资源。
- 没有空文件。
- 文件名小写、无空格。

## 验收

- 第一关地图显示为原创背景。
- 6 个职业有可播放动画。
- 4 个敌人有移动、受击、死亡动画。
- `verify-td-art-resources.ts` 通过。
