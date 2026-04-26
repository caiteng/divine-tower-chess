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

- 曾接入一套外部正式职业图作为首批风格验证资源；该资源后续因风格不一致已从主线移除。
- 已固化后续美术接入约定：
  - 同一职业的原画插画、战场静态图、连续动作帧必须归档在同一个职业目录下
  - 你后续继续上传动画和插画时，默认按“同风格同职业打包放一起”的方式整理并接线
- 资源解析已修正为：
  - 职业贴图优先读取 `assets/resources/textures/units/*`
  - 缺资源职业继续走旧头像回退，避免“只补第一套图后其余职业全部空白”
- `UnitView` 已取消对存在正式贴图单位的运行时染色，避免新导入立绘被选中/职业色覆盖。

## 停机前状态固化（2026-04-22）

- `npm test` 已执行，但当前环境仍缺少 `node_modules` 内的 `tsc`，所以无法在本机完成绿线确认。
- 第一套职业美术曾用于验证接入流程，后续已从主线移除。
- 下一步优先事项：
  1. 在 Cocos 编辑器中触发新 PNG 的 `.meta` 生成并确认资源导入正常。
  2. 继续补第二套职业图。
  3. 再决定是否移除旧 `textures/avatars` 回退资源。

## 当前状态补充（2026-04-24）

- 已新增一批“低美术依赖”的 2D 火柴人单位资源，作为主线可落地占位美术方案：
  - 目录：`assets/art/units/warrior/`
  - 目录：`assets/art/units/mage/`
  - 目录：`assets/art/units/priest/`
  - 目录：`assets/art/units/archer/`
  - 目录：`assets/art/units/shield_guard/`
  - 目录：`assets/art/units/cavalry/`
  - 目录：`assets/art/units/spearman/`
- 当前每个基础职业已具备：
  - `*_star1.png`
  - `*_star2.png`
  - `*_star3.png`
- 当前 7 个基础职业已补齐选择页 portrait：
  - `warrior_portrait.png`
  - `mage_portrait.png`
  - `priest_portrait.png`
  - `archer_portrait.png`
  - `shield_guard_portrait.png`
  - `cavalry_portrait.png`
  - `spearman_portrait.png`
- 当前 3 个敌人已补齐统一火柴人风格主图：
  - `assets/art/enemies/grunt.png`
  - `assets/art/enemies/brute.png`
  - `assets/art/enemies/boss.png`
- 已为火柴人资源补齐一套程序化动作帧，占位但可批量复用：
  - 覆盖单位：`warrior` `mage` `priest` `archer` `shield_guard` `cavalry` `spearman`
  - 覆盖神品：`berserker` `light_mage`
  - 当前帧组：
    - `*_move_01..05`
    - `*_attack_01..05`
    - `*_death_fall_01..05`
    - `*_corpse_fade_01..05`
  - 生成脚本：`tools/generate_stickman_action_frames.ps1`
- 当前动作帧方案不是手绘逐帧，而是基于主战场图做统一程序化派生：
  - 优点是风格稳定、批量快、后续可重跑调参
  - 缺点是动作表演强度弱于正式逐帧动画，更适合原型阶段
- 神品演化资源已补入：
  - `assets/art/units/warrior/berserker_divine.png`
  - `assets/art/units/priest/light_mage_divine.png`
- 本次资源策略是“先统一风格并保证接线”，不是一次性追求高资产量：
  - `star1` 保持基础版
  - `star2` 使用冷色强化描边/能量
  - `star3` 使用金色高阶光效/徽记
- 现阶段项目对“大量正式美术”的依赖已下降：
  - 主线职业现在至少都有一套统一风格的战场透明 PNG 可接入
  - 角色选择、战场单位、敌人基础表现现在都已有统一风格落点
  - 可以继续围绕玩法验证推进，而不是被“职业资源全空”卡死
- 当前本地验证仍受环境限制：
  - 本次未恢复 `npm test` 绿线
  - 原因仍是工作区缺少 `node_modules`，`tsc` 不可用
  - 本次也尚未把动作帧真正接入运行时播放，当前仍是资源先落地

## 下一步（更新）

1. 在 Cocos 编辑器中为本次新增 PNG 生成 `.meta` 并确认 runtime resolver 命中这些新资源。
2. 决定是否把 `UnitView` / `EnemyView` 升级为按状态轮播动作帧，而不是继续只显示静态 `star` 图。
3. 修复商店失败购买不应吞槽位、神品任务单位不得参与普通合成这两个硬规则问题。
4. 为上述硬规则补 `verify-squad-rules` 回归，恢复可执行基线。

## 当前状态补充（2026-04-24 晚）

- 已优先完成硬规则修复：
  - 商店购买流程改为“确认扣款 + 确认进背包成功后再移除商店槽位”，背包满等失败购买不会吞槽位。
  - 普通升星合成候选会排除带 `assignedTaskId` 的实例，带神品任务的 1 星 / 2 星单位不会被普通合成消耗。
- `verify-squad-rules` 已补回归：
  - 背包满导致购买失败时，金币回滚且商店槽位保持不变。
  - 带神品任务的 1 星单位不参与 1->2 合成。
  - 带神品任务的 2 星单位不参与 2->3 合成。
- 已恢复本地依赖并完成验证：
  - `npm test` 通过。
  - 覆盖 `tsc --noEmit` 与 `verify-squad-rules`。
- 已处理 runtime resolver 命中新资源的问题：
  - 新增职业和敌人 PNG 已镜像到 `assets/resources/textures/...`，避免 `resources.load` 无法读取 `assets/art/...`。
  - `ART_RESOURCE_MANIFEST` 已切到运行时可加载路径。
  - `assets/art/...` 继续保留为源资产归档区。
- 已接入战场动作帧播放：
  - `UnitView` / `EnemyView` 支持传入帧组并按时间轮播。
  - `BattlefieldController` 会按移动、攻击/治疗、死亡状态选择动作帧。
  - 缺少帧组时仍回退到静态主图。
- 已扩展 `tools/generate_stickman_action_frames.ps1`：
  - 增加 `-OnlyEnemies` 参数。
  - 敌人现在也能生成 `move / attack / death_fall / corpse_fade` 四组动作帧。

## 下一步（更新 2）

1. 打开 Cocos 编辑器，让 `assets/resources/textures/units/*` 与 `assets/resources/textures/enemies/*` 生成 `.meta`。
2. 在编辑器里实际跑一局，确认职业、敌人静态图和动作帧均能显示。
3. 观察战场性能；当前 `BattlefieldController` 每帧重建节点，动作帧已可用，但后续应改为复用节点以减少 UI 创建成本。

## 当前状态补充（2026-04-25）

- 已将运行时资源目录的 PNG 全部补齐 Cocos `.meta`：
  - 覆盖 `assets/resources/textures/units/**`
  - 覆盖 `assets/resources/textures/enemies/**`
  - 覆盖运行时贴图目录中已有的背景、头像、基础贴图
  - Cocos 构建导入过程中也为 `assets/art/**` 源资产补齐了 `.meta`
- 已新增资源回归脚本：
  - `npm run verify:art`
  - 脚本位置：`tools/verify-art-resources.ts`，不放在 `assets/scripts`，避免被 Cocos 当作游戏脚本打包
  - 检查 `ART_RESOURCE_MANIFEST` 指向的单位静态图、portrait、神品图、单位动作帧、敌人静态图、敌人动作帧是否存在
  - 检查 `assets/resources/textures/**.png` 是否都有对应 `.png.meta`
  - 可用 `npm run verify:art -- --write-meta` 为缺失资源生成 Cocos importer 形态的 meta
- `npm test` 已串联：
  - `tsc --noEmit`
  - `verify-squad-rules`
  - `verify-art`
- 本地验证结果：
  - `npm test` 通过
  - `verify-art` 通过，当前 `assets/resources/textures` 下 `528` 个 PNG 均有对应 `.png.meta`
  - 当前 `assets/art` + `assets/resources/textures` 下 `803` 个 PNG 均有对应 `.png.meta`
- Cocos 命令行 Web 构建尝试结果：
  - 首次误用 `--path` 时进程停在 Editor 初始化阶段，未产出新包
  - 改用 `--project /Users/caiteng/project/divine-tower-chess --build "platform=web-mobile;debug=true"` 后构建通过
  - 最新成功日志：`temp/builder/log/web-mobile2026-4-25 17-43.log`
  - 构建日志确认 `Asset Bundle(resources) handle assets: 1058`
  - 构建日志确认脚本数从 40 降到 39，`verify-art-resources` 未再被 Cocos 游戏脚本加载
  - 构建后检查 `build/web-mobile/assets/resources/config.json`，`warrior_move_01`、`berserker_move_01`、`light_mage_move_01`、`grunt_attack_01`、`boss_death_fall_05`、`priest_portrait`、`berserker_divine` 均已进入 resources bundle
  - Headless Chrome 可加载构建包基础 JS / bundle / resources 配置，但截图仍停在灰底，不能替代编辑器内肉眼跑局确认
- 代码链路复核：
  - `BattlefieldController` 会按移动、攻击/治疗、死亡状态选择 `move / attack / death_fall`
  - `UnitView` / `EnemyView` 会对传入动作帧按 120ms 间隔轮播
  - 缺帧时仍回退静态图

## 下一步（更新 3）

1. 在编辑器里直接预览一局，确认角色选择 portrait、战场单位、敌人和动作帧显示。
2. 如果浏览器运行仍灰屏，优先看 Chrome 控制台与 Cocos Preview 控制台，而不是继续依赖 headless 截图。
3. 后续性能优化仍是将 `BattlefieldController` 每帧重建节点改为节点复用。

## 当前状态补充（2026-04-25 晚）

- 已按“以远端为准”重置本地后重新挂资源并调试 Preview 报错链路。
- 已把只用于 Node 回归的脚本移出 Cocos runtime 脚本目录：
  - `assets/scripts/core/verify-squad-rules.ts` -> `tools/verify-squad-rules.ts`
  - `assets/scripts/core/simulate-squad-battle.ts` -> `tools/simulate-squad-battle.ts`
  - `package.json` 的 `verify:rules` 已改为执行 `tools/verify-squad-rules.ts`
- 已清理旧脚本和旧不存在资源留下的 `.meta`，避免 Cocos Preview 继续尝试加载已删除的 `verify-squad-rules`、`simulate-squad-battle`、`enemy-config`、`wave-config` 等路径。
- 已把运行时代码中的纯类型依赖改为 `import type`，减少 Cocos SystemJS 把 TS 类型模块错误打进运行时依赖表导致的 `__unresolved_*` 预览错误。
- 已修复角色选择界面图形比例：
  - `CharacterSelectController` 的预览图改为 `Sprite.SizeMode.CUSTOM`
  - 预览图按职业资源比例约束在固定框内，避免 portrait 被拉伸变形
- 已修复进入游戏后战场黑屏风险：
  - `BattlefieldController` 改为加载 `battlefield_01` 背景资源
  - 背景资源加载失败时也保留可见的蓝绿色底色
  - 战场暗色遮罩层级调整到背景之上、单位/敌人之下，避免遮罩盖住全部战场内容
- 本地验证结果：
  - `npm test` 通过
  - 已重启 Cocos 编辑器并清理 Preview 编译缓存，避免旧内存 import-map 继续引用已移动的 Node 回归脚本
  - Cocos Web Mobile 命令行构建通过，最新日志：`temp/builder/log/web-mobile2026-4-25 18-06.log`
  - 构建日志确认 `Number of all scripts: 37`
  - 构建日志确认 `Asset Bundle(resources) handle assets: 1058`
  - 构建日志确认 `build success in 11921 ms!`
  - 重新生成后的 `temp/programming` import-map 已不再包含 `verify-squad-rules`、`simulate-squad-battle`、`enemy-config`、`wave-config` 旧引用

## 下一步（更新 4）

1. 在已打开的 Cocos 编辑器里执行一次 Preview；当前旧缓存已清理，若仍看到旧 `verify-squad-rules.js` 报错，需要直接收集最新 Preview 控制台和项目日志时间段。
2. 试玩检查角色选择页 portrait 是否不再变形，进入战斗后战场是否显示背景、单位、敌人和动作帧。
3. 如果实机 Preview 仍有新报错，下一轮直接看最新 Cocos Preview 控制台和 `local/logs/project.log` 的新增时间段。

## 当前状态补充（2026-04-26）

- 已按恢复约定先执行 `npm test`，当前通过：
  - `tsc --noEmit`
  - `verify-squad-rules`
  - `verify-art`
- 已继续 interaction/readability polish 范围内的性能整理，未扩展新玩法系统：
  - `BattlefieldController` 不再每帧重建全部己方/敌方节点。
  - 己方单位和敌人现在按 `instanceId` 复用 `UnitView` / `EnemyView`。
  - 本帧消失的单位/敌人会被隐藏，后续同实例再次出现时复用节点。
  - 命令线、目标点、移动提示、背景、遮罩和动作帧选择逻辑保持原行为。
- 变更文件：
  - `assets/scripts/ui/controllers/battlefield-controller.ts`
  - `PLANS.md`
- 当前可玩状态：
  - 规则与资源回归通过，战斗主链可继续按主菜单、职业选择、准备、开波流程推进。
  - 战场单位/敌人节点生命周期更稳定，预计降低战斗中 UI 节点反复创建成本。
  - Cocos 编辑器 Preview 肉眼试玩仍未由本次命令行流程替代。
- 手动验证步骤：
  1. 在 Cocos 编辑器执行 Preview。
  2. 从主菜单点击开始，选择任意职业进入准备阶段。
  3. 购买并上阵至少 1 名单位，开始下一波。
  4. 确认战场背景、己方单位、敌人、HP 条和动作帧显示正常。
  5. 选中己方单位后分别点地面、敌人、友军，确认移动/集火/治疗命令反馈线和标签正常。
  6. 等一波结束后进入下一波，确认旧单位/敌人没有残留可见节点。

## 下一步（更新 5）

1. 在 Cocos 编辑器里实际 Preview 一局，确认角色选择 portrait、战场单位、敌人、动作帧和命令反馈均可见。
2. 如果 Preview 仍有灰屏或旧 import 报错，直接收集最新 Chrome 控制台、Cocos Preview 控制台，以及 `local/logs/project.log` 的新增时间段。
3. 若 Preview 正常，再继续处理剩余 UI polish：准备面板节点复用、HUD 层级视觉节奏、战斗交互自动化回归样例。

## 当前状态补充（2026-04-26 午）

- 已继续完成多轮自测与显示修复：
  - `UnitView` / `EnemyView` 的战场 Sprite 改为 `Sprite.SizeMode.CUSTOM`，避免 250px/1000px 原图按原尺寸盖住战场。
  - `EnemyView` 在命中真实贴图时改为白色原色渲染，不再叠加红色占位 tint。
  - 对运行时 `assets/resources/textures/units/**` 与 `assets/resources/textures/enemies/**` 下 PNG 做了浅灰/白棋盘背景透明化处理，解决角色/敌人显示出棋盘底的问题。
  - 曾有一次中断批处理导致 `mage_attack_03.png` 截断，已从源资产恢复，并完成全量 PNG 可读性扫描。
- 已加强自动化回归：
  - `tools/run-web-e2e.js` 改为用 Cocos 节点名驱动主菜单、职业选择、上阵、开波、选中单位、点敌人等关键交互，降低坐标漂移导致的误判。
  - `verify:web` 当前覆盖：菜单进入、职业选择、上阵、开波、地面移动、敌人集火、控制台严重错误扫描、截图产出。
  - `tools/verify-art-resources.ts` 新增 PNG 结构完整性检查，资源存在但 PNG 截断时会让 `npm test` 失败。
- 最新验证结果：
  - `npm test` 通过。
  - Cocos Web Mobile 命令行构建完成，日志：`temp/builder/log/web-mobile2026-4-26 10-57.log`，日志内显示 `build success in 12558 ms`；Cocos CLI 仍返回 exit code 36，但产物可运行。
  - `npm run verify:web` 通过，最终停在 battle 阶段，起始单位已上阵，移动命令与集火命令均已下达，浏览器控制台无严重错误。
  - 截图目录：`tmp/web-e2e/`，当前 `06-focus-command.png` 已确认单位/敌人不再巨大化、不再显示棋盘底块。
- 变更文件补充：
  - `assets/scripts/ui/views/unit-view.ts`
  - `assets/scripts/ui/views/enemy-view.ts`
  - `tools/run-web-e2e.js`
  - `tools/verify-art-resources.ts`
  - `assets/resources/textures/units/**.png`
  - `assets/resources/textures/enemies/**.png`

## 下一步（更新 6）

1. 在 Cocos 编辑器 Preview 中肉眼复核与 Web e2e 一致：主菜单、职业选择、准备面板、战场贴图、动作帧、命令线均正常。
2. 继续 UI polish 时优先做准备面板节点复用，减少每次 render 全量重建。
3. 后续美术导入时避免使用带“透明棋盘格”的位图源；如果继续导入这类图，需要先做透明化处理再接入运行时资源。

## 当前状态补充（2026-04-26 下午）

- 已按本轮需求继续 interaction/readability polish，未扩展新玩法系统：
  - 全局战斗节奏下调：己方和敌方移动速度降低，攻击间隔整体拉长。
  - 战场角色/敌人显示尺寸放大，站位间距同步拉开，角色动作更容易看清。
  - 移动表现从“快速切帧抖动”改为静态贴图叠加轻微步行动势、压缩/倾斜/上下起伏，攻击/治疗保留短促反馈。
  - 己方选中态改为脚下金色光圈，战斗中能明确看出当前选中单位。
  - 备战区、上阵区、商店卡片改为显示职业贴图图标；金币读数新增金币贴图。
  - 开始战斗后备战/购买面板会下滑隐藏并失活；回到准备阶段时再上滑显示并恢复操作。
  - 已移除风格不一致的职业：类型、单位配置、商店池、战斗配置、资源 manifest、星级贴图 fallback、资源校验脚本和相关文档均不再引用；对应运行时单位贴图与头像文件已删除。
- 变更文件补充：
  - `assets/scripts/models/types.ts`
  - `assets/scripts/config/unit-config.ts`
  - `assets/scripts/config/art-resource-manifest.ts`
  - `assets/scripts/config/unit-star-sprite-config.ts`
  - `assets/scripts/squad/config/squad-battle-config.ts`
  - `assets/scripts/ui/views/unit-view.ts`
  - `assets/scripts/ui/views/enemy-view.ts`
  - `assets/scripts/ui/controllers/prep-panel-controller.ts`
  - `assets/scripts/ui/controllers/battle-hud-controller.ts`
  - `assets/scripts/ui/controllers/wave-transition-controller.ts`
  - `assets/scripts/ui/resources/sprite-resolvers.ts`
  - `tools/run-web-e2e.js`
  - `tools/verify-art-resources.ts`
  - `assets/resources/textures/ui/gold.png`
  - `assets/resources/textures/ui/gold.png.meta`
  - `assets/art/README.md`
  - `assets/resources/textures/avatars/ATTRIBUTION.md`
  - 已删除被移除职业对应的运行时单位贴图与头像资源
- 当前可玩状态：
  - 主菜单 -> 职业选择 -> 准备阶段 -> 购买/上阵 -> 开波 -> 战斗命令链路可运行。
  - Web e2e 已验证准备面板贴图、金币贴图、开波后面板隐藏、战场单位/敌人显示、选中光圈、地面移动命令和敌人集火命令。
  - 风格不一致的职业已从当前可选/可购买/可生成资源链路移除。
- 手动验证步骤：
  1. 在 Cocos 编辑器 Preview 或 `build/web-mobile` 中从主菜单开始新游戏。
  2. 进入准备阶段，确认商店 3 个单位卡片、上阵区、备战区均有职业贴图图标，金币位置有金币贴图。
  3. 购买一个单位，确认购买失败时商店槽位不会消失；购买成功后可上阵/撤回。
  4. 点击开始下一波，确认备战/购买面板下滑隐藏且不再遮挡战斗操作。
  5. 战斗中点击己方单位，确认脚下金色光圈明显；点地面和敌人，确认移动/集火命令线和状态文字正常。
  6. 观察己方/敌人移动速度和攻击节奏是否明显慢于旧版本，角色尺寸是否足够看清动作。
- 最新验证结果：
  - `npm test` 通过。
  - Cocos Web Mobile 命令行构建完成，日志显示 `build success`；Cocos CLI 仍返回工程既有的 exit code 36，但产物可运行。
  - `npm run verify:web` 通过，最终停在 battle 阶段，移动命令与集火命令均已下达，浏览器控制台无严重错误。
  - 活动代码、资源和文档中已无被移除职业的标识引用。

## 下一步（更新 7）

1. 在 Cocos 编辑器 Preview 中手动跑完至少一波完整胜负循环，确认战斗结束后备战/购买面板会上滑恢复操作。
2. 后续继续 polish 时优先做准备面板节点复用，避免准备阶段每帧全量重建 UI。
3. 若继续改善战斗画面，可把隐藏备战面板后的黑色下半屏改成战场扩展或战斗日志区。
