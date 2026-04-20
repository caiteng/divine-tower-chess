# PLANS.md

## 当前状态（2026-04-16）

- 正式入口已调整为：`主菜单 -> 战斗场景`。
- 正式 Cocos UI 场景主链入口：`assets/scripts/ui/battle-scene-controller.ts`。
- 逻辑主链保持不变：`assets/scripts/squad/squad-battle-session.ts` + `assets/scripts/squad/systems/*`。
- `assets/scripts/ui/squad-battle-ui.ts` 已降级为兼容 shim，并标记 `@deprecated`，仅用于旧场景绑定过渡。
- 现有 Cocos 表现层拆分：
  - `MainMenuController`
  - `BattleHudController`
  - `PrepPanelController`
  - `BattlefieldController`
  - `CommandOverlayController`
  - `WaveTransitionController`
  - `UnitView` / `EnemyView`
- 资源解析接口已建立：
  - `UnitSpriteResolver.resolve(unitId, star, divineState)`
  - `EnemySpriteResolver.resolve(enemyType)`
  - `UiIconResolver.resolve(iconId)`
  - `BackgroundResolver.resolve(sceneId)`

## 当前状态补充（2026-04-20）

- 主菜单功能已扩展：
  - `设置` 已接入本地持久化音量配置（总音量 / 音乐 / 音效）。
  - `载入` 已接入本地自动存档恢复，不再只是占位入口。
  - `鸣谢` 已替换为正式说明面板。
  - 右上角新增 `成就` 入口，当前接入 1 个基础成就：`初次通关`。
- 战斗主链已接入自动存档：
  - 新开局、购买、上阵、撤回、卖出、刷新、开波、下达命令、波次推进、阶段切换都会刷新本地运行存档。
  - 当前存档目标是“继续原型流程”，不是完整发布版存档系统。
- 成就持久化已接入：
  - 当前唯一成就会在进入 `victory` 时解锁并持久化到本地。
- 已接入正式标题菜单：
  - 打开游戏默认先显示主菜单，而不是立即进入战斗。
  - 菜单提供 `开始 / 载入 / 设置 / 鸣谢` 四个入口。
  - `开始` 会初始化新 run 并切入准备阶段。
- 已完成一轮 interaction/readability polish，未扩展新玩法系统：
  - `BattleSceneController` 会在渲染前同步清理失效选中实例，避免卖出、合成、开波后残留脏选择。
  - HUD / notice 文案已改为更明确的中文阶段提示，并按准备阶段 / 战斗阶段输出不同操作引导。
  - `PrepPanelController` 已补上当前选中实例高亮、神品任务 `✦` 标记、底部上下文提示。
  - `BattlefieldController` 已将命令反馈从纯文本升级为线段 + 目标点标记 + 标签，可直接看清移动 / 集火 / 治疗目标。
  - `UnitView` 已补充命令态短标签（`MOVE` / `FOCUS` / `HEAL` / `DIVINE`），提高战场可读性。
- 当前本地验证受环境限制：
  - 已按恢复约定先执行 `npm test`
  - 但当前工作区缺少 `node_modules/`，`tsc` 不可用，因此今天无法在本机复现 `npm test` 绿线
  - 历史冻结记录中的 `2026-04-15` baseline 仍为通过

## 下一步

1. 将按钮与战场节点改为预制体化，减少运行时动态创建成本。
2. 继续打磨主菜单和战斗 HUD 的层级与视觉节奏，减少“全代码拼节点”痕迹。
3. 扩展 `assets/resources` 贴图接入，完善 resolver 回退策略。
4. 增加战斗 UI 交互自动化回归样例（开波过渡、指令链、神品进度展示、存档恢复）。

## 历史迁移记录

- 历史阶段记录已迁移到：`docs/migration-log.md`。
