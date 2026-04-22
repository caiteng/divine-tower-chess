# PLANS.md

## 当前状态（2026-04-16）

- 正式入口已调整为：`主菜单 -> 战斗场景`。
- 正式 Cocos UI 场景主链入口：`assets/scripts/ui/battle-scene-controller.ts`。
- 逻辑主链保持不变：`assets/scripts/squad/squad-battle-session.ts` + `assets/scripts/squad/systems/*`。
- `assets/scripts/ui/squad-battle-ui.ts` 已收口为稳定场景入口组件；不再承担兼容 shim 语义。
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

## 当前状态补充（2026-04-22）

- 已将第一套正式职业图接入 `paladin`：
  - 来源：`C:\Users\xx\Downloads\knight_2d_assets`
  - 落地目录：`assets/resources/textures/units/paladin/`
  - 当前运行时静态展示先使用 `move_01`，并重命名为：
    - `paladin_star1.png`
    - `paladin_star2.png`
    - `paladin_star3.png`
- 同批次动作帧已一并迁入项目并完成统一命名，供后续动画接线使用：
  - `paladin_move_*`
  - `paladin_slash_*`
  - `paladin_block_*`
  - `paladin_death_fall_*`
  - `paladin_corpse_fade_*`
- `paladin` 角色选择页已新增专用原画插画：
  - 来源：`C:\Users\xx\Downloads\ChatGPT Image 2026年4月22日 11_46_26.png`
  - 文件名：`assets/resources/textures/units/paladin/paladin_portrait.png`
  - 当前仅用于初始职业选择预览，不影响战场小体型表现
- 已固化后续美术接入约定：
  - 同一职业的原画插画、战场静态图、连续动作帧必须归档在同一个职业目录下
  - 你后续继续上传动画和插画时，默认按“同风格同职业打包放一起”的方式整理并接线
- 资源解析已修正为：
  - `paladin` 优先读取新的 `assets/resources/textures/units/paladin/*`
  - 其他职业暂时继续走旧头像回退，避免“只补第一套图后其余职业全部空白”
- `UnitView` 已取消对存在正式贴图单位的运行时染色，避免新导入立绘被选中/职业色覆盖。

## 停机前状态固化（2026-04-22）

- `npm test` 已执行，但当前环境仍缺少 `node_modules` 内的 `tsc`，所以无法在本机完成绿线确认。
- 第一套职业美术已正式落地到主线，可在角色选择和战场中的 `paladin` 身上看到。
- 下一步优先事项：
  1. 在 Cocos 编辑器中触发新 PNG 的 `.meta` 生成并确认资源导入正常。
  2. 继续补第二套职业图。
  3. 再决定是否移除旧 `textures/avatars` 回退资源。
