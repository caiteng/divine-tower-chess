# PLANS.md

## 阶段进度（2026-04-14）

- [x] 阶段 1：统一文档口径（README / docs/game-design / AGENTS）。
- [x] 阶段 2：迁移类型与部署接口（types / unit-system）。
- [x] 阶段 3：迁移战场配置与出怪逻辑（battlefield-config / wave-system）。
- [x] 阶段 4：适配会话与控制器接口（game-session / game-controller）。
- [x] 阶段 5：联动 UI 与脚本验证入口（cocos-game-controller / simulate-run / verify-divine-task-rules）。

- [x] 阶段 6（本次推进）：补充关键回归样例（敌人出生区域校验）并修正文案残留。
- [x] 阶段 7（本次推进）：接入星级贴图路径规范与文档规格。
- [x] 阶段 8（本次推进）：补充部署区域可视化提示（Cocos 部署区高亮 + 占位状态色）。
- [x] 阶段 9（本次推进）：提供冲突恢复脚本与操作文档（保留 Codex 最终态）。
- [ ] 阶段 10：后续优化（更多端到端自动化回归样例）。


## 本轮完成摘要（统一方向）

1. 明确项目唯一方向为二维连续空间自动战斗，不再使用 fixed lane/fixed route/tile board 作为核心设计。
2. `PlacedUnitState` 与部署接口完成迁移：主字段改为 `deploymentAnchorId + position`，旧字段仅保留 `@deprecated` 兼容注释。
3. 战场配置改为：`width/height/crystal/allyDeploymentRegion/allyDeploymentAnchors/enemySpawnRegion`。
4. 出怪逻辑改为右侧出生区域分布式生成，不再使用 lane/rowOffset 双路线生成。
5. `GameSession` / `GameController` 对外接口改为 `place(instanceId, deploymentAnchorId)` 与 `movePlaced(instanceId, deploymentAnchorId)`。
6. 保留并复用核心可玩主干：商店、经济、升星、神品任务实例规则、二维战斗行为。

## 验收对照（本轮）

- [x] README / docs / AGENTS / PLANS 口径统一
- [x] 项目不再自我描述为固定双路线塔防
- [x] 类型层不再以 lane/tile 作为核心战斗模型
- [x] 部署接口不再要求 lane/tileIndex
- [x] 出怪逻辑不再模拟双路线
- [x] battle-system 二维连续战斗行为保持可用
- [x] 神品任务系统保持实例级与并行规则
- [x] 调整部署后任务绑定与进度保留

## 后续未完成项（下一步）

1. 补充更多端到端自动化回归（波次完成、胜败分支、多实例神品并行压力样例）。
2. 用户在家里电脑重传真实 `unit_star_progression.png` 后，用本地 git 客户端补提二进制文件并做一次资源加载回归。


## 本次补充（贴图接入）

- 新增 `assets/art/reference/unit_star_progression.placeholder.txt`（二进制 PNG 由本地 git 客户端后续补提）。
- 新增 `docs/art/unit_star_progression_spec.md`，将图像参考转为可执行文字规格。
- 新增 `assets/scripts/config/unit-star-sprite-config.ts`，提供 `unitId + star -> sprite path` 映射。
- `CocosGameController` 运行时改为优先加载星级贴图，缺失时回退基础头像路径。

## 本次补充（部署可视化）

- Cocos 战场加入部署区高亮区域提示。
- 部署锚点加入占位状态色：空位与已占位颜色区分，便于准备阶段调位操作。


## 本次补充（冲突恢复）

- 新增 `docs/ops/merge-recovery.md`，给出从最新目标分支恢复并应用 `88e7330` 的步骤。
- 新增 `scripts/apply_codex_final_state.sh`，一键执行 `cherry-pick -X ours 88e7330` + `npm test`。

---

## 方向重置（2026-04-15）阶段 1：废弃/保留/迁移计划

> 目标切换为：**Battleheart 风格 2D 小队实时战斗 + 商店/3合1升星/实例级神品任务**。  
> 本阶段只做仓库审计与迁移规划，不做全量代码重构。

### A. 需要彻底废弃或重写的旧设计（按模块）

1. **水晶/基地防守主循环（必须移除）**
   - 旧胜负依赖 `crystalHp`、敌人触晶扣血、守晶失败。
   - 代表文件：
     - `assets/scripts/core/game-session.ts`
     - `assets/scripts/systems/battle-system.ts`
     - `assets/scripts/config/battlefield-config.ts`
     - `assets/scripts/config/difficulty-config.ts`
     - `assets/scripts/config/enemy-config.ts`

2. **“敌人向左推进压水晶”的行为基线（必须改）**
   - 旧敌人默认目标是水晶，不是“最近我方单位”。
   - 需要改为：最近目标追击与攻击；无核心目标逻辑。

3. **旧文档中的塔防口径（必须全量替换）**
   - 包含 “tower defense / 水晶防守 / 固定推进守点” 等叙述。
   - 代表文件：
     - `README.md`
     - `AGENTS.md`
     - `docs/game-design.md`
     - `PLANS.md`（历史条目需标注为旧方向）

4. **旧 UI 的守晶表达与自动化战斗引导（必须重做）**
   - 含水晶贴图、守晶文案、偏自动战斗按钮语义（如“自动上阵”用于旧流程）。
   - 代表文件：
     - `assets/scripts/ui/cocos-game-controller.ts`
     - `assets/scripts/ui/main-menu-controller.ts`
     - `assets/resources/textures/crystal.png`（资源可保留但不再作为核心机制）

5. **旧波次定义（需重做节奏）**
   - 旧波次按守晶压力曲线设计，缺少 Battleheart 风格指令对抗节奏与 Boss 波定义。
   - 代表文件：
     - `assets/scripts/config/wave-config.ts`
     - `assets/scripts/systems/wave-system.ts`

6. **与新规则冲突的“全自动倾向”单位行为（需重写）**
   - 需要改为“命令驱动优先 + 克制自动反应”，特别是：
     - 远程：不主动前压
     - 近战：仅近距有限反应
     - 牧师：只按玩家指定目标持续治疗，不自动全队智能治疗
   - 代表文件：
     - `assets/scripts/systems/battle-system.ts`
     - `assets/scripts/models/types.ts`（补充命令状态结构）

### B. 明确保留并复用的核心（方向不变）

1. **商店 + 金币经济闭环（保留）**
   - `assets/scripts/systems/shop-system.ts`
   - `assets/scripts/systems/economy-system.ts`

2. **3 合 1 升星（保留，接口可调整）**
   - `assets/scripts/systems/unit-system.ts`（合成主逻辑可复用）

3. **3 星后实例级神品任务（强制保留）**
   - `assets/scripts/systems/divine-task-system.ts`
   - `assets/scripts/config/divine-task-config.ts`
   - 关键规则：实例独立分配、并行任务、跨波累计、非职业共享。

4. **基础数据配置与单位职业池（保留并重标定）**
   - `assets/scripts/config/unit-config.ts`
   - `assets/scripts/models/types.ts`
   - 保留职业集合与神品映射，重做战斗行为字段以匹配指令系统。

### C. 新架构迁移计划（阶段 2~5 执行）

1. **新核心会话层**
   - 新建 `SquadBattleSession`（替代旧 `GameSession` 主循环）
   - 状态机：`prep -> battle -> prep`，失败条件改为“上阵 5 人全灭”

2. **命令驱动系统**
   - 新建 `UnitCommandSystem`
   - 命令类型：
     - `MoveToPosition`
     - `FocusTargetEnemy`
     - `ChannelHealTargetAlly`
     - `CastSkillAtUnit/Area`
   - 单位默认行为仅做有限反应，不可退化为全图自动索敌

3. **战斗子系统拆分**
   - `MovementSystem`
   - `TargetingSystem`
   - `AttackSystem`
   - `HealingSystem`
   - `SkillSystem`
   - 明确“命令优先级 > 默认行为反应”

4. **敌人波次系统重做**
   - `EnemyWaveSystem` 支持：
     - 主要右侧刷怪
     - 条件触发少量左侧反制刷怪
     - Boss 波（至少 1 个 Boss + 1 个特殊节奏/技能）

5. **准备阶段系统**
   - `RoundPreparationSystem`：
     - 自动刷新商店（每波开始）
     - 购买/刷新/合成/上阵（最多 5 人）
     - 下一波开战时默认中场一字排开
     - 回合开始重置生命/普通战斗态，但保留神品任务进度

6. **成长系统回接**
   - `ShopSystem` / `MergeSystem` / `DivineTaskSystem` 与新会话层对接
   - 确保神品进度继续以 `unit instance id` 绑定

### D. 分阶段落地检查点

- 阶段 2：文档全量重写，清除旧塔防口径。
- 阶段 3：战斗骨架与命令系统可跑通（无守晶逻辑）。
- 阶段 4：商店/升星/神品任务回接到新循环。
- 阶段 5：可完成一整局多波（含 Boss）最小可玩验证。

---

## 方向重置（2026-04-15）阶段 2：文档统一完成

### 本阶段改动文件
- `README.md`
- `AGENTS.md`
- `docs/game-design.md`

### 统一结果
- 项目口径统一为：Battleheart 风格 2D 小队实时命令战斗 + 商店/升星/实例级神品任务。
- 文档已移除旧方向叙述：不再使用旧守点防守、固定路线、或 lane-tile 语义作为项目定义。
- 明确写入新胜负规则：
  - 5 人全灭才失败
  - 仍有 1 人存活且清空敌人可进入下一轮
  - 下一轮开始时除神品任务进度外战斗状态重置
- 明确写入命令驱动硬约束：
  - 无命令不全图自动索敌
  - 远程不主动前压
  - 近战仅近距有限反应
  - 牧师无攻击且仅按命令持续治疗（目标满血仍持续）

### 下一阶段
- 阶段 3：重建战斗系统骨架（会话、命令、移动、索敌、攻击、治疗、技能、波次）。


---

## 方向重置（2026-04-15）阶段 3：战斗骨架最小回路

### 本阶段改动文件
- `assets/scripts/squad/types.ts`
- `assets/scripts/squad/config/squad-battle-config.ts`
- `assets/scripts/squad/systems/math.ts`
- `assets/scripts/squad/systems/unit-command-system.ts`
- `assets/scripts/squad/systems/movement-system.ts`
- `assets/scripts/squad/systems/targeting-system.ts`
- `assets/scripts/squad/systems/attack-system.ts`
- `assets/scripts/squad/systems/healing-system.ts`
- `assets/scripts/squad/systems/enemy-ai-system.ts`
- `assets/scripts/squad/squad-battle-session.ts`
- `assets/scripts/core/simulate-squad-battle.ts`

### 已落地
- 新建 `SquadBattleSession` 状态机：`prep -> battle -> prep/victory/defeat`。
- 落地 5 人小队上限与中场默认排布。
- 落地命令链路：选中角色 -> 点地移动 / 点敌聚焦 / 牧师点友军持续治疗。
- 落地行为约束：
  - 近战仅近距有限反应
  - 远程无命令不主动前压
  - 牧师无攻击，按命令持续治疗（满血仍保持动作节奏）
  - 敌人默认追击最近我方并攻击
- 落地胜负与跨波重置：
  - 全灭失败
  - 存活>=1 且清敌进入下一波
  - 下一波重置生命与普通战斗状态
- 预留后续扩展点：`getPersistentUnitProgress()` 用于阶段 4 对接升星/神品任务。

### 未纳入本阶段
- 完整技能系统（仅保留骨架与后续扩展位）。
- 商店、升星、神品任务正式接回新回路（阶段 4 再做）。
- 完整美术资源与完整交互界面（阶段 5 后持续迭代）。


---

## 方向重置（2026-04-15）阶段 4：成长系统接回新会话

### 本阶段改动目标
- 将商店 / 金币 / 备战区 / 上阵区 / 3合1 升星 / 实例级神品任务，正式接入 `SquadBattleSession`。
- 不扩展装备、羁绊、复杂技能树与完整 UI/美术。

### 已完成
- `SquadBattleSession` 接入 `EconomySystem` + `ShopSystem` + `RosterSystem` + `DivineTaskSystem`。
- 新增准备阶段接口：`startNewRun` / `refreshShopByCost` / `buyShopUnit` / `deployFromBench` / `recallFromDeployed`。
- 新增 roster 结构：bench + deployed（上阵上限 5 人）并接入 3 合 1 升星。
- 升星候选可跨 bench / deployed，且带任务实例不会被普通升星吞并。
- 战斗内统计并回写神品任务指标：
  - 近战/远程击杀计入 warrior 路线
  - 牧师真实治疗量计入 priest 路线
- 神品完成时按实例进阶并同步更新 roster 与当前战斗单位表现。
- 波次结束保留实例成长与任务进度，仅重置普通战斗状态并回到准备阶段。

### 未纳入本阶段
- 完整技能系统、完整 UI 与美术重制。
- 商店/升星/神品任务的完整前端可视化交互（当前以脚本与会话接口验证）。


---

## 方向重置（2026-04-15）阶段 4 补充：规则校验 + 旧系统清理审计

### 规则校验修正
- 修正合成候选过滤中的错误前提：移除“1/2 星可能带任务”的隐含保护条件。
- 现合成逻辑仅基于 `unitId + star(1/2)`，严格符合“任务仅属于 3 星实例”的规则。

### 本次已执行清理
- 删除旧入口脚本：`assets/scripts/core/simulate-run.ts`（旧 `GameController/GameSession` 自动流程）。

### 可直接删除项（审计结论）
- `assets/scripts/core/game-session.ts`
- `assets/scripts/core/game-controller.ts`
- `assets/scripts/core/verify-divine-task-rules.ts`
- `assets/scripts/systems/battle-system.ts`
- `assets/scripts/systems/wave-system.ts`
- `assets/scripts/config/battlefield-config.ts`
- `assets/resources/textures/crystal.png`（若 UI 不再引用后可删）

### 暂保留但后续必须删除（兼容项）
- `assets/scripts/models/types.ts` 中 `lane / tileIndex / placementPointId` 的 `@deprecated` 字段。
- `assets/scripts/ui/cocos-game-controller.ts` 中旧守点/水晶相关绘制与文案逻辑。
- `assets/scripts/config/difficulty-config.ts` 中 `crystalHp` 字段。
- `assets/scripts/config/enemy-config.ts` 中 `crystalDamage` 字段。

### 暂不能立即删除原因
- 旧 UI 仍引用部分旧会话/旧配置链路，直接删除会导致当前 Cocos 入口不可编译或不可运行。
- 阶段 5 尚未完成“波间交互 UI + 新会话完整前端接线”，需在替换入口后统一清除。

### 预计删除阶段
- 阶段 5：完成新 UI 入口与波间面板接线后，批量移除旧会话与旧战斗主循环。


---

## 方向重置（2026-04-15）阶段 5 准备：旧系统实删 + 新入口唯一化 + UI 接口预留

### 已实际删除（实删）
- `assets/scripts/core/game-session.ts`
- `assets/scripts/core/game-controller.ts`
- `assets/scripts/core/verify-divine-task-rules.ts`
- `assets/scripts/systems/battle-system.ts`
- `assets/scripts/systems/wave-system.ts`
- `assets/scripts/config/battlefield-config.ts`
- `assets/scripts/systems/unit-system.ts`
- `assets/scripts/ui/cocos-game-controller.ts`
- `assets/scripts/ui/main-menu-controller.ts`

### 新入口唯一化
- 唯一会话入口：`assets/scripts/squad/squad-battle-session.ts`
- 唯一战斗主链：`assets/scripts/squad/*`
- 规则校验入口切换到：`assets/scripts/core/verify-squad-rules.ts`

### 为阶段 5 UI 预留的最小接口/常量
- 新增 `assets/scripts/squad/config/squad-ui-layout-config.ts`：
  - `SQUAD_DEPLOY_SLOTS = 5`
  - `SQUAD_BENCH_SLOTS = 8`
  - `SQUAD_SHOP_SLOTS = 3`
  - 波间 UI 状态枚举：`prepPanel` / `battlefieldLighting` / `transitionProgress` / `nextWaveReady`
- `SquadBattleSnapshot` 增补：
  - `currentWave`
  - `slotConfig`
  - `uiState`
- `ShopSystem` 改为使用 `SQUAD_SHOP_SLOTS` 统一商店位数量。
- `RosterSystem` 改为使用 `SQUAD_DEPLOY_SLOTS` / `SQUAD_BENCH_SLOTS` 统一席位限制。

### 暂保留但后续清理
- `assets/scripts/models/types.ts` 中旧 `lane/tile` 兼容字段仍在（当前未被新主链路引用）。
- `assets/scripts/config/difficulty-config.ts` 的 `crystalHp` 与 `assets/scripts/config/enemy-config.ts` 的 `crystalDamage` 仍在（当前仅历史配置残留）。


---

## 方向重置（2026-04-15）阶段 5：最小可视化与波间交互（首版）

### 本阶段完成
- 新增最小可视化 UI 入口：`assets/scripts/ui/squad-battle-ui.ts`（仅连接新主链 `SquadBattleSession`）。
- 在同一战斗场景容器内承载准备阶段与战斗阶段，不做复杂切场。
- 波间准备面板实现：
  - 上滑出现（`prepPanel: rising -> visible`）
  - 包含商店区(3)、上阵区(5)、备战区(8)、卖出、刷新、开始下一波
- 开始下一波交互实现：
  - 点击后面板下沉（`prepPanel: falling -> hidden`）
  - 战场亮度渐变（`battlefieldLighting: dim -> brightening -> bright`）
  - 仅在过渡完成后正式开战（`pendingBattleStart` + `transitionProgress`）
- 新增 `sellUnit` 接口，准备阶段支持卖出（bench/deployed）。

### 语义清理补充
- `models/types.ts` 删除旧 lane/tile 兼容字段与旧部署/战场类型。
- `difficulty-config.ts` 删除 `crystalHp`。
- `enemy-config.ts` 删除 `crystalDamage`。

### 暂未完成
- 完整美术替换与复杂特效。
- 高级动画系统与复杂技能可视化。


---

## 方向重置（2026-04-15）阶段 5.1：交互与可读性打磨

### 已优化
- 波间面板与战场亮度过渡节奏改为更平滑的时序与 easing。
- HUD 信息重排：波次、金币、上阵人数、备战人数常驻显示。
- 命令反馈增强：
  - 选中态高亮
  - 集火目标虚线指示
  - 牧师持续治疗连线与状态标签
  - 地面移动目标短时标记
- 单位基础血条可视化（简化版）。
- 神品任务进度条目化文本展示（最小可读版）。

### 暂未完成
- 更精细的动画曲线与拖拽交互。
- 更准确的动态血量比例（当前为简化比率）。
- 高级战斗日志与详细伤害飘字。


---

## 停机前状态固化（2026-04-15）

### A. 当前已完成内容（可审阅基线）
- 项目主方向已切换为 Battleheart 风格 2D 小队实时指挥战斗。
- 旧主链（旧会话/旧战斗/旧波次/旧战场配置）已实删并完成入口切换。
- 新主链（`squad-battle-session + squad/*`）已可跑通：准备阶段、战斗阶段、波次推进、成长回接（商店/金币/升星/神品任务）。
- 阶段 5 首版可视化已落地：同场景承载 prep+battle、波间面板上滑/下沉、战场亮度渐变、最小操作反馈。

### B. 当前唯一主链
- 会话入口：`assets/scripts/squad/squad-battle-session.ts`
- 战斗子系统：`assets/scripts/squad/systems/*`
- UI 入口：`assets/scripts/ui/squad-battle-ui.ts`
- 规则校验入口：`assets/scripts/core/verify-squad-rules.ts`

### C. 下一步待做内容（下次恢复后）
1. 继续“交互与可读性打磨”而非功能扩展：
   - 动画细节与交互手感（拖拽/反馈时序）
   - 信息展示准确性（血量比例/反馈细节）
2. 再做一次 UI 结构整理，降低 `squad-battle-ui.ts` 内联 DOM 渲染复杂度（拆分渲染函数与样式常量）。
3. 在不扩玩法前提下补一轮可玩性回归清单（prep 操作、命令反馈、波间过渡）。

### D. 当前未解决的小问题（已知）
- 血条目前为简化比例算法，非严格按单位动态最大生命比率显示。
- 命令反馈仍以最小实现为主，缺少更细粒度战斗日志与飘字。
- 当前 UI 代码以内联样式与单文件渲染为主，后续需要拆分以便维护。
