# 18 AI 分阶段任务提示词

## 阶段 1：Runtime 核心

```text
请基于 docs/td-redesign/08-phase-1-runtime-core.md，实现塔防 Runtime 核心。新增 assets/scripts/td/types.ts、td-session.ts、config/td-game-config.ts、config/td-stage-ids.ts、systems/td-id.ts、tools/verify-td-rules.ts。不要修改 squad 主线。所有文件必须完整可用。完成后 npm run typecheck 和 npx tsx tools/verify-td-rules.ts 必须通过。
```

## 阶段 2：地图路径生命

```text
请实现地图配置、路径推进、塔位数据和漏怪扣血。新增 td-map-config、td-enemy-config、enemy-path-system、life-system。第一关使用 1280x720 坐标、1 条地面路径、1 条飞行路径、8 个塔位。补充 verify-td-rules 测试。
```

## 阶段 3：波次循环

```text
请实现 wave-system 和 td-wave-config。第一关 10 波，支持按间隔出怪、出怪结束、敌人全部清除、发放奖励、进入下一准备阶段、第 10 波胜利。
```

## 阶段 4：商店放置三合一

```text
请实现 td-shop-system、td-roster-system、placement-system 和 td-hero-config。支持金币购买、刷新、背包、塔位放置、召回、出售、3 同职业同星级合成。
```

## 阶段 5：战斗职业差异

```text
请实现 td-combat-system 和 targeting-system。支持射程、攻速、最前索敌、对空、AOE、护甲、魔抗、阻挡、潜行侦测。6 个基础职业必须有差异。
```

## 阶段 6：Cocos UI 接入

```text
请新增 td-map-controller、td-hud-controller、td-prep-panel-controller、td-command-bar-controller、td-hero-view、td-enemy-view。接入模式选择，但保留 squad 旧主线。玩家可通过 UI 完成第一关基本流程。
```

## 阶段 7：AI 美术与帧动画

```text
请新增 assets/resources/textures/td/** 的原创占位资源，生成 td-art-manifest，新增 verify-td-art-resources。每个 MVP 英雄和敌人至少有 portrait/idle/attack/move/hit/death 等阶段要求帧。允许用脚本生成占位 PNG，但命名、尺寸和 manifest 必须完整。
```

## 阶段 8：队长技能 VFX

```text
请实现 captain-system、td-skill-config、td-command-bar 技能释放。先做游侠队长、圣骑队长、奥术队长。新增基础 VFX 帧与校验。
```

## 阶段 9：五关 Alpha

```text
请扩展 5 关地图配置、50 波波次、8 类敌人完整机制。补足数值测试和平衡测试，确保每关都能进入、开波、胜利或失败。
```

## 阶段 10：存档测试性能发布

```text
请实现 td-save-system、本地存档版本、Web 冒烟、对象池和性能收口。确保 npm test、verify:td、verify:td-art、verify:web 均可运行。
```
