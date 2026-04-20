# PLANS.md

## 当前主线状态

- 唯一战斗主链：`assets/scripts/squad/*`
- 唯一核心会话入口：`assets/scripts/squad/squad-battle-session.ts`
- 当前 UI 入口：`assets/scripts/ui/squad-battle-ui.ts`（DOM 原型实现）
- 项目已达到可玩的原型闭环：准备阶段（商店/购买/上阵/升星）⇄ 战斗阶段（命令驱动）
- 波次推进：`prep -> battle -> prep/victory/defeat`
- 成长保留：实例级神品任务进度跨波累计

## 当前阶段已完成

1. README 已按当前真实状态重写，移除过时阶段表述，仅保留项目定义、当前状态、核心规则、当前 UI、完成度、运行验证、项目结构与下一步重点。
2. `SquadBattleUi` 已完成原型风险清扫：
   - 默认难度为 beginner（不再写死 hard）
   - `bootstrapPrepSquad()` 改为 prototype flag 且默认关闭
   - 用 `update(dt)` 驱动 tick，移除固定 `setInterval`
   - 准备面板事件改为单次绑定 + 事件委托
   - 血条按真实 maxHp（含星级倍率）计算
3. `assets/Main.scene` 已直接挂载 `SquadBattleUi`，并改为显式顶层 `GameRoot` 节点承载入口；默认场景顶层仅保留 `Canvas` 与 `GameRoot` 两个 2D 相关节点，默认可通过 Cocos Web Preview 启动当前 DOM 原型玩法验证。
4. 已清理 4 个无源码残留脚本 `.meta`（旧 `cocos-game-controller` / `main-menu-controller` / `unit-system` / `wave-system`），降低 Cocos 资产库 `missing script` 干扰。
5. 已清理可再生缓存目录 `library/` 与 `temp/`，强制 Cocos 下次启动时重新导入资产与脚本缓存。
6. 已修复 `assets/Main.scene` 的对象 `__id__` 错位引用：`GameRoot` 顶层 children、节点组件列表、`SquadBattleUi.node` 绑定均已对齐，避免 `MissingScript` 检查期间的场景反序列化崩溃。
7. 已将 `assets/Main.scene` 中 `SquadBattleUi` 的场景组件类型从脚本资源 UUID 形式修正为运行时注册 class id，避免 `Missing class` / `initialize of undefined`。
8. 已修复 `assets/Main.scene` 的 `Scene._globals` 与 `SceneGlobals` 子引用错位，确保场景全局对象正确指向 `SceneGlobals / AmbientInfo / ShadowsInfo / SkyboxInfo / FogInfo / OctreeInfo`。
9. `SquadBattleUi` 已补充原型级交互反馈：
   - 顶部新增瞬时提示条，覆盖购买/上阵/撤回/卖出/刷新/开波与战斗命令结果
   - HUD 与准备面板新增当前选中单位说明
   - 候补区与上阵区按钮按当前选中态高亮
   - 组件销毁时会清理 DOM 根节点，避免重开场景后原型 UI 残留
10. 已开始正式 Cocos 节点 UI 迁移：
   - `SquadBattleUi` 改为过渡态“DOM 战场 + Cocos 节点 HUD/准备面板”
   - 顶部状态、任务、提示条与准备阶段按钮已由 Cocos `Node + Graphics + Label + Button` 构建
   - 战场单位点位、血条、命令连线与地面点击仍暂留 DOM，实现连续迁移而不破坏当前可玩性
11. 已建立第一批美术资源接入骨架：
   - 创建 `assets/art/` 目录说明与单位 / 敌人 / UI / 背景目录结构
   - 新增 `assets/scripts/config/art-resource-manifest.ts` 作为工程内资源清单
   - 当前阶段仅建立目录和清单，不强制运行时加载；资源缺失不会导致报错
12. 已接入首张战场背景：
   - 原图保留在 `assets/art/backgrounds/battlefield_01.png`
   - 运行时预览副本放入 `assets/resources/textures/backgrounds/battlefield_01.png`
   - 当前战场 DOM 热区已挂背景图样式，缺图时仍回退到原有渐变背景
13. 已补充战场体积碰撞 / 分离：
   - 新增 `assets/scripts/squad/systems/collision-system.ts`
   - 每帧对友军、敌军以及双方接触进行位置松弛，避免人物长期重叠成一团
   - 采用不同体型权重：boss / brute 更重，近战更稳，远程与牧师更容易被挤开
14. 战场交互层已迁到纯 Cocos 输入：
   - 删除 DOM 战场点击热区，战场不再依赖 `document`
   - 友军 / 敌军标记节点已支持直接点击发命令
   - 地面移动改为透明网格按钮承接点击
   - 战场背景、命令线、血条、提示圈与输入层现均在 Cocos 节点内

## 停机前状态固化（2026-04-15）

- `npm test` 当前通过：`tsc --noEmit` + `tsx assets/scripts/core/verify-squad-rules.ts`
- `README.md` 已明确：
  - 不再保留“阶段 2 文档统一”等过时描述
  - `assets/scripts/ui/squad-battle-ui.ts` 是原型级 DOM UI，不是最终 Cocos 节点 UI
  - 当前唯一真实主链仍是 `assets/scripts/squad/*`
- `assets/Main.scene` 当前默认入口已切到 `SquadBattleUi`，无需手动再挂一次组件
- 工程内孤儿脚本 `.meta` 已移除，减少编辑器错误与脏缓存干扰
- `library/` 与 `temp/` 已清理，后续首次打开工程会发生一次完整重导入
- `assets/Main.scene` 曾出现 `__id__` 错位，报错表现为 `Unexpected token u in JSON at position 0` / `_onBatchCreated is not a function`；现已修正场景引用
- `assets/Main.scene` 中 `SquadBattleUi` 组件类型已对齐到 Cocos 编译注册的 class id，避免 `Missing class: d0d41...`
- `assets/Main.scene` 的全局场景引用已重新对齐；本地语义校验结果为 `scene-semantic-refs-ok`
- 下次继续应优先处理“交互/可读性打磨”与正式 UI 迁移，不扩展新玩法系统

## 当前待办

1. 将 DOM 原型 UI 迁移为正式 Cocos 节点 UI（不改核心玩法规则）。
2. 完成 UI 可读性与反馈打磨（选择反馈、命令反馈、失败提示）。
3. 接入正式贴图资源并做最小回归验证。
4. 补充自动化回归样例（波次推进、胜败分支、神品并行实例）。

## 后续优先级

- P0：交互/可读性打磨 + 正式 Cocos 节点 UI 迁移设计
- P1：贴图与表现资源接线（不改核心规则）
- P2：自动化回归补强与工程稳定性治理

## 关键已知问题

1. `assets/scripts/ui/squad-battle-ui.ts` 仍是 DOM 原型 UI，不是最终 UI 架构。
2. 当前 UI 主要用于玩法验证，视觉与可维护性仍需后续工程化。
3. 资源接入链路尚未完整覆盖正式美术资产加载与降级策略。
