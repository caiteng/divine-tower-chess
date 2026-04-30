# 23 TD 入口修复说明

## 问题

阶段 1-10 完整包提供了 TD runtime、系统、配置、资源和 TD UI 控制器，但为了避免直接破坏旧 squad 主线，没有强制改写现有 `BattleSceneController` 的主菜单流程。因此应用后仍会看到旧菜单，且“开始”仍进入旧的小队职业选择流程。

## 本次修复

本次修复包把现有场景入口改成优先进入塔防模式：

- 主菜单显示“塔防模式”。
- 点击后直接创建 `TowerDefenseSession`。
- 创建 TD 地图、HUD、准备面板和技能栏节点。
- 右侧可购买英雄。
- 选中英雄后点击地图塔位可放置。
- 点击开始下一波后敌人沿路径推进。
- 地图上可看到路径、塔位、英雄和敌人。

## 保留内容

- 不删除 `assets/scripts/squad/**`。
- 不删除旧规则测试。
- 不删除旧资源。
- 如果需要恢复旧入口，可以从 Git 里还原 `assets/scripts/ui/battle-scene-controller.ts` 和 `assets/scripts/ui/controllers/main-menu-controller.ts`。
