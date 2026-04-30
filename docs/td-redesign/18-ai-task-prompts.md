# 18 AI 分阶段任务提示词

## 使用方式

每次只复制一个阶段给 AI。要求 AI 先列计划，再改代码，再补测试，最后给验收说明。

## 通用前置提示词

```text
你正在开发 Cocos Creator + TypeScript 项目 divine-tower-chess。当前主线是 squad 小队战斗，塔防改造必须新增 assets/scripts/td/**，不要删除或重写 squad 主线。每次开发必须补测试，保证 npm test 通过。AI 生成资源必须原创，不复制任何商业游戏。
```

## 阶段 1 提示词

```text
请新增塔防 runtime 核心。创建 assets/scripts/td/types.ts、td-session.ts、config/td-game-config.ts、config/td-stage-ids.ts、systems/td-id.ts，以及 tools/verify-td-rules.ts。实现 startNewRun、getSnapshot、startNextWave、tick、damageLife、addGold、isTerminal。只做状态机，不接 UI，不改 squad。补测试：新局 10 生命、准备阶段、开波切状态、扣生命到 0 失败。
```

## 阶段 2 提示词

```text
请实现塔防地图、路径、塔位和漏怪扣血。新增 td-map-config、td-enemy-config、enemy-path-system、life-system、td-stage-loader。第一关 stage_1_forest_loop 使用 1280x720、1 条地面路径、1 条飞行路径、8 个塔位。敌人实现 slime、shieldling、bat、gate_golem。补测试：路径长度、入口出口、软泥漏怪扣 1、Boss 漏怪扣 3、生命归零失败。
```

## 阶段 3 提示词

```text
请实现波次系统。新增 td-wave-config 和 wave-system。第一关 10 波固定配置，支持出怪间隔、spawn queue、清波奖励、第 10 波胜利。接入 TowerDefenseSession.tick。补测试：第一波数量、出怪间隔、清波奖励、第 10 波 victory、非 prep 不能重复开波。
```

## 阶段 4 提示词

```text
请实现英雄商店、背包、塔位放置和三合一。新增 td-hero-config、td-shop-config、td-economy-system、td-shop-system、td-roster-system、placement-system。实现 6 职业 archer/mage/warrior/knight/assassin/priest。商店 3 格，购买失败不移除，金币不足失败。三合一：3 个同职业同星级合成下一星，3 星封顶。补测试。
```

## 阶段 5 提示词

```text
请实现战斗系统。新增 td-combat-system、targeting-system、blocking-system、td-projectile-system、td-damage-config。实现攻击范围、攻速、索敌、护甲、魔抗、对空、AOE、阻挡、治疗。弓箭手能对空，法师 AOE，战士阻挡 1，骑士阻挡 2，刺客优先辅助，牧师治疗。补完整规则测试。
```

## 阶段 6 提示词

```text
请把 TD 逻辑接入 Cocos UI。新增 td-map-controller、td-hud-controller、td-prep-panel-controller、td-command-bar-controller、td-result-controller，以及 td-hero-view、td-enemy-view、td-projectile-view、td-vfx-view。在主菜单加塔防入口，MVP 直接进入第一关。实现买英雄、选英雄、点塔位放置、开波、HUD、胜负弹窗。按钮同时绑定 CLICK 和 TOUCH_END。
```

## 阶段 7 提示词

```text
请实现 TD 美术资源管线。新增 td-art-manifest、td-sprite-resolvers、tools/generate-td-placeholder-art.ts、tools/verify-td-art-resources.ts。生成所有 MVP 资源的占位 PNG，并按 manifest 加载。英雄需要 portrait、star1-3、idle、attack、skill、hurt、death；骑士加 block，刺客加 teleport。敌人需要 move、hit、death，Boss 加 cast/phase。补资源校验。
```

## 阶段 8 提示词

```text
请实现队长英雄和技能。新增 td-captain-config、td-skill-config、captain-system、td-skill-system。实现游侠队长、圣骑队长、奥术队长。支持 XP、等级、主动技能、被动光环、技能冷却、VFX 状态。补测试：升级、冷却、伤害、减伤、光环。
```

## 阶段 9 提示词

```text
请扩展到五关 Alpha。实现 stage_1 到 stage_5 的地图配置、路径、塔位和 50 波。新增 boneguard、shadehound、warlock、spore。每个敌人都有机制测试。关卡选择 UI 可进入五关。确保每关能 victory/defeat。
```

## 阶段 10 提示词

```text
请做收口：TD 存档、自动化测试、Web 冒烟、性能优化。新增 td-save-system，扩展 local-profile-storage。完善 verify-td-rules、verify-td-art-resources、run-td-web-e2e。实现敌人/弹道/VFX 对象池、SpriteFrame 缓存、坏档保护。最终 npm test、verify:td、verify:td-art、verify:td-web 通过。
```
