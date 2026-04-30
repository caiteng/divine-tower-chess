# 03 美术风格与 AI 资源管线

## 1. 美术目标

原创 2D 中世纪奇幻卡通风格。参考方向是“可读性强的塔防角色和地图”，不是复制任何已有游戏。

关键词：

- 卡通中世纪
- 英雄轮廓清晰
- 小屏幕可读
- 高饱和但不刺眼
- 明确阵营色
- 俯视/斜俯视塔防地图
- 角色朝右，Cocos 内可镜像

## 2. 禁止事项

AI 生成图片时禁止：

- 使用具体商业游戏角色名称。
- 使用 BTD6、Kingdom Rush、Warcraft、Diablo 等受版权保护角色或图标。
- 直接要求“画得像某游戏里的某角色”。
- 使用水印、logo、UI 商标。
- 生成含文字的技能图标，避免乱码。

## 3. 资源尺寸

| 类型 | 尺寸 | 背景 | 用途 |
|---|---:|---|---|
| 地图背景 | 1280x720 | 不透明 | 单屏地图 |
| 路径叠加层 | 1280x720 | 透明 | 可选，用于高亮路径 |
| 塔位图标 | 128x128 | 透明 | 普通/悬停/占用 |
| 英雄头像 | 256x256 | 透明 | 商店/背包 |
| 英雄帧图 | 256x256 | 透明 | 战场动画 |
| 小型敌人帧 | 192x192 | 透明 | 敌人动画 |
| Boss 帧 | 320x320 | 透明 | Boss 动画 |
| 技能图标 | 128x128 | 透明 | 技能栏 |
| VFX 帧 | 256x256 | 透明 | 命中特效 |

## 4. 目录规范

```text
assets/resources/textures/td/
  maps/
    stage_1_forest_loop/
      background.png
      path_overlay.png
      slot_normal.png
      slot_hover.png
      slot_occupied.png
      exit_gate.png
  heroes/
    archer/
      portrait.png
      star1.png
      star2.png
      star3.png
      idle_01.png ... idle_04.png
      attack_01.png ... attack_06.png
      skill_01.png ... skill_06.png
      hurt_01.png ... hurt_03.png
      death_01.png ... death_06.png
    mage/
    warrior/
    knight/
    assassin/
    priest/
  enemies/
    slime/
      move_01.png ... move_06.png
      hit_01.png ... hit_03.png
      death_01.png ... death_06.png
    shieldling/
    bat/
    gate_golem/
  ui/
    icon_gold.png
    icon_life.png
    icon_star.png
    icon_refresh.png
    icon_sell.png
    icon_wave.png
  vfx/
    hit_physical_01.png ... hit_physical_04.png
    hit_magic_01.png ... hit_magic_06.png
    heal_01.png ... heal_06.png
    slow_01.png ... slow_06.png
```

## 5. 动画帧标准

### 5.1 英雄动画

| 动作 | 帧数 | FPS | 说明 |
|---|---:|---:|---|
| idle | 4 | 6 | 呼吸/轻微晃动 |
| attack | 6 | 12 | 出手、命中点、收招 |
| skill | 6 | 10 | 技能释放 |
| hurt | 3 | 12 | 受击 |
| death | 6 | 10 | 倒地/消散 |
| block | 4 | 8 | 骑士/战士专用 |
| teleport | 6 | 12 | 刺客专用 |

### 5.2 敌人动画

| 动作 | 帧数 | FPS | 说明 |
|---|---:|---:|---|
| move | 6 | 10 | 行走/飞行 |
| hit | 3 | 12 | 受击闪烁 |
| death | 6 | 10 | 死亡 |
| cast | 6 | 10 | 术士/Boss 专用 |
| phase | 8 | 8 | Boss 阶段转换 |

## 6. AI 生成策略

### 6.1 首版策略

阶段 7 前，可以用脚本生成简单占位资源：

- 彩色圆形敌人。
- 方形塔位。
- 简单英雄剪影。
- 简单地图底图。
- 简单帧动画通过颜色/位移变化模拟。

阶段 7 起，生成 AI 原创帧图：

- 先生成角色设计稿。
- 再基于同一角色描述生成各动作帧。
- 所有帧保持同一画布、同一朝向、同一比例。
- 不要求每帧完美连续，但必须可读。

### 6.2 英雄通用 Prompt 模板

```text
Original 2D fantasy tower defense hero sprite, transparent background, facing right, three-quarter top-down view, cute stylized medieval cartoon, clean silhouette, readable on mobile screen, consistent color palette, no text, no logo, no watermark, centered full body, 256x256 canvas. Character: {职业描述}. Animation frame: {动作帧描述}.
```

### 6.3 敌人通用 Prompt 模板

```text
Original 2D fantasy tower defense enemy sprite, transparent background, facing right, three-quarter top-down view, stylized cartoon monster, clear silhouette, readable at small size, no text, no logo, no watermark, centered full body, {尺寸} canvas. Enemy: {敌人描述}. Animation frame: {动作帧描述}.
```

### 6.4 地图 Prompt 模板

```text
Original 2D fantasy tower defense map background, 1280x720, horizontal mobile game layout, three-quarter top-down view, clean readable path, medieval fantasy environment, empty tower build spots visible but no UI, no text, no logo, no characters. Stage theme: {关卡描述}.
```

## 7. 资源 Manifest

新增：

```text
assets/scripts/td/config/td-art-manifest.ts
```

结构建议：

```ts
export const TD_ART_MANIFEST = {
  heroes: {
    archer: {
      portrait: 'textures/td/heroes/archer/portrait',
      idle: ['textures/td/heroes/archer/idle_01', ...],
      attack: [...],
      skill: [...],
      hurt: [...],
      death: [...],
    }
  },
  enemies: {},
  maps: {},
  ui: {},
  vfx: {},
} as const;
```

## 8. 校验脚本

新增：

```text
tools/verify-td-art-resources.ts
```

必须检查：

- manifest 中所有资源路径存在。
- 每个 PNG 有 `.meta`。
- 英雄帧数满足最低要求。
- 敌人帧数满足最低要求。
- 图片尺寸符合规范。
- 没有未被 manifest 引用的 `td` 资源。
- 文件名没有空格、大写混乱和中文。

## 9. Cocos 动画实现方式

首版不要依赖复杂 AnimationClip 编辑器，直接在 `td-hero-view.ts` 和 `td-enemy-view.ts` 中按帧切换 SpriteFrame：

```ts
elapsed += dt;
frameIndex = Math.floor(elapsed * fps) % frames.length;
sprite.spriteFrame = frames[frameIndex];
```

优点：

- AI 可以直接写代码。
- 不需要编辑 Cocos 动画资源。
- 资源替换简单。
- 易测试。

## 10. 资源验收标准

阶段 7 验收：

- 6 个基础英雄都有 portrait、idle、attack、skill、hurt、death。
- 骑士有 block。
- 刺客有 teleport。
- 4 个 MVP 敌人都有 move、hit、death。
- 第一关地图有 background、path_overlay、slot 三态、exit_gate。
- UI 有金币、生命、星级、刷新、售出、波次图标。
- `verify-td-art-resources.ts` 通过。
