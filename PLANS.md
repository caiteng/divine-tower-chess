# PLANS.md

## 阶段进度（2026-04-10）

- [x] 第一步：建立项目目录结构与核心模块设计
- [x] 第二步：实现配置系统、商店系统、金币系统、棋子基础数据结构
- [x] 第三步：实现地图（逻辑路径）、敌人路径移动、水晶、防守战斗最小闭环
- [x] 第四步：实现棋子摆放、攻击、简单技能
- [x] 第五步：实现升星系统
- [x] 第六步：实现神品进阶任务系统（战士->狂战士、牧师->光法师）
- [x] 第七步：实现三种难度和基础UI流程（逻辑层）
- [x] 第八步：补充 README 和手动验证说明
- [x] 第九步：修正神品任务实例化规则、位置调整与真实治疗统计
- [x] 第十步：补充神品任务规则验证脚本，并明确移动保留与真实治疗边界
- [x] 第十一步：实现棋子死亡本回合失效与回合结束生命重置
- [x] 第十二步：补齐阶段限制、购买失败回滚、跨区域升星和 npm 验证脚本
- [x] 第十三步：补充 Cocos Creator 组件适配层
- [x] 第十四步：将 Cocos 组件升级为运行时生成 UI 的可试玩面板
- [x] 第十五步：补充 Creator 3.4.0 `project.json` 和新手导入说明
- [x] 第十六步：调整试玩面板坐标与 UI 根节点尺寸，降低预览空白概率
- [x] 第十七步：增加浏览器 HTML 覆盖试玩面板，绕开 Canvas/Camera 渲染配置问题
- [x] 第十八步：在浏览器试玩面板中增加棋盘格子、路线、棋子、敌人和水晶显示
- [x] 第十九步：在 Cocos 场景内增加原生 Graphics 棋盘渲染
- [x] 第二十步：修复试玩组件误删 Canvas 子节点 Camera 导致 Cocos 画面不显示的问题
- [x] 第二十一步：默认关闭 HTML 兜底面板，保留 `toggleHtmlDebug` 调试入口
- [x] 第二十二步：压缩 Cocos 试玩界面到 960x540，避免底部内容裁切
- [x] 第二十三步：增加点击式棋子上阵与移动交互
- [x] 第二十四步：增加 SpriteFrame 贴图槽位和 `assets/textures` 导入说明
- [x] 第二十五步：生成默认 PNG 贴图并支持 resources 自动加载
- [x] 第二十六步：完成本地 Web 预览与 npm 规则验证调试
- [x] 第二十七步：压缩 Cocos 状态栏文本，修复 960x540 预览底部裁切
- [x] 第二十八步：增加盾卫全体阻挡、近战单体仇恨与远程不吸引普通小怪规则
- [x] 第二十九步：增加首页、地图/难度确认流程、设置/鸣谢入口，并压缩游戏内按钮
- [x] 第三十步：生成圆形职业头像、星级边框与神品金边闪烁效果

## 当前可玩范围

- 可完成一局新手难度 10 波完整流程（准备 -> 战斗 -> 下一波 -> 结算）。
- 手动刷新、购买、摆放、移动、开始战斗均限制在准备阶段。
- 购买会先检查金币，金币不足不会移除商店格子。
- 升星支持备战区与已上阵区域共同参与，优先保留已上阵棋子作为升星主体。
- 3星棋子不能继续普通合并，只能通过神品任务升阶。
- 已持有神品任务的棋子不会被普通升星消耗。
- 神品任务以棋子实例为粒度独立触发与累积，可并行推进多个任务。
- 每个符合条件的3星非神品实例在每个回合开始独立进行10%判定。
- 同一棋子实例同时最多持有1个未完成神品任务。
- 准备阶段支持移动已上阵棋子位置，不丢失实例任务绑定信息。
- 移动已接任务棋子时保留实例ID、单位ID、星级、任务ID、任务进度和神品状态。
- 治疗任务仅统计真实治疗量（目标受伤且实际回血时才计入，满血和溢出治疗不计入）。
- 上阵棋子生命降至0后当前战斗回合失效，不能继续攻击或治疗。
- 进入下一轮准备阶段时，死亡棋子恢复到最大生命值；存活但受伤的棋子不会被该规则补满。
- 盾卫会阻挡同路线范围内所有普通小怪，直到盾卫死亡。
- 其他近战棋子每个实例最多吸引同路线范围内1个普通小怪攻击。
- 与近战互殴的小怪死亡后，同路线范围内未被吸引的小怪会在下一次战斗 tick 中补位。
- 远程棋子不会吸引普通小怪仇恨，普通小怪会继续沿路线前进。
- `CocosGameController` 可挂到 Cocos Creator 节点，运行时生成基础按钮和状态面板。
- Cocos 场景内会用 `Graphics` 渲染棋盘背景、路线、格子、棋子、敌人和水晶。
- HTML 覆盖面板默认关闭，可通过 `toggleHtmlDebug()` 打开作为兜底。
- HTML 面板已包含两条路线、12个棋盘格、棋子块、敌人点和水晶显示。
- 试玩面板支持难度选择、购买、全买、自动上阵、移动首个棋子、开战、速度切换、状态查看。
- 启动后先进入首页，包含大标题、开始、设置、鸣谢。
- 点击开始后进入地图选择界面；当前只有一张地图，下方选择难度，点击 `✔` 后正式进入游戏。
- 设置界面支持音量数值调整；鸣谢界面展示基础制作信息。
- 正式进入游戏后不再显示难度选择按钮，游戏内按钮已缩小以保证一屏展示。
- 支持点击备战区棋子后点击棋盘格上阵，点击已上阵棋子后点击空格移动。
- 点击已有棋子的格子也能选中该棋子，减少移动时点到文字层或格子层无响应的问题。
- 支持给棋盘、格子、棋子、敌人、水晶绑定 PNG 贴图；未绑定时保留 Graphics 占位图形。
- 棋子默认使用圆形职业头像；1星灰边、2星绿边、3星紫边，神品职业使用独立头像配色和金色闪烁边框。
- 已生成默认贴图：`board.png`、`tile.png`、`unit.png`、`enemy.png`、`crystal.png`。
- 试玩界面按 960x540 紧凑布局，底部状态栏使用摘要文本。
- 960x540 Web 预览下状态栏不再裁切，能完整看到商店、备战区、上阵区、敌人与神品任务摘要。
- 本地 `build/web-mobile` 可通过静态服务预览，已在 `http://localhost:8088` 验证首屏非空白。
- 命令行验证已恢复，`npm test` 可通过 TypeScript 检查与神品规则脚本。
- 项目根目录提供 `project.json`，标识 Creator 版本为 3.4.0，便于 Dashboard 导入。
- 普通/困难波次数据已配置，可用于后续平衡测试。
- 逻辑层已具备可扩展结构：配置、系统、核心流程分层。

## 本次实现文件摘要

- `project.json`
  - 新增 Creator 3.4.0 项目标识，减少 Dashboard 导入时提示缺失编辑器的概率。
- `tsconfig.json`
  - 启用 `experimentalDecorators`，支持 Cocos 组件装饰器。
- `assets/scripts/ui/cocos-game-controller.ts`
  - 新增 Cocos Creator 组件包装层，内部复用纯逻辑 `GameController`。
  - 运行时生成试玩按钮和状态文本，不依赖美术资源或手工 UI 预制体。
  - 新增首页、设置、鸣谢、地图/难度选择和确认开始流程。
  - 游戏内移除难度按钮，并缩小顶部操作按钮。
  - 浏览器 DOM 覆盖层默认关闭，用于必要时绕开相机/Canvas 配置错误导致的空白画面。
  - DOM 覆盖层包含可视化棋盘，实时渲染上阵棋子、敌人位置和水晶。
  - Cocos 原生层也会实时渲染同一套棋盘信息，HTML 面板只作为兜底调试入口。
  - 不再清空 Canvas 原有子节点，避免删除 Canvas 下的 UI Camera。
  - 布局压缩为顶部操作区、中部棋盘、底部摘要状态，减少预览窗口裁切。
  - 增加备战区卡片栏与棋盘格点击事件，支持准备阶段手动选择、上阵和移动棋子。
  - 暴露 `Board Sprite`、`Tile Sprite`、`Unit Sprite`、`Enemy Sprite`、`Crystal Sprite` 属性，可在 Inspector 拖入贴图。
  - 若未手动绑定贴图，会从 `resources/textures` 自动加载默认贴图。
  - 将底部状态栏压缩为 5 行摘要，并调整字体、行高和位置，避免 960x540 预览裁切。
  - 新增运行时圆形职业头像；按星级生成灰/绿/紫边框，神品单位使用金色闪烁边框。
  - 棋盘格文字、棋子文字、备战区文字都绑定点击事件，提高选择和移动命中率。
- `assets/scripts/models/types.ts`
  - `UnitConfig` 新增 `aggroRole`，用配置区分盾卫阻挡、近战吸引、远程单位和无仇恨单位。
- `assets/scripts/config/unit-config.ts`
  - 为所有棋子补充仇恨角色：盾卫为 `blocker`，战士/圣骑士/骑兵/枪兵/狂战士为 `melee`，弓箭手/法师/牧师/光法师为 `ranged`。
- `assets/scripts/systems/battle-system.ts`
  - 新增每帧交战分配：盾卫吸引范围内全部敌人，其他近战每人最多吸引1个，远程不吸引。
  - 被吸引的敌人停止推进并攻击对应棋子；未被吸引的敌人继续向水晶前进。
  - 敌人死亡、棋子死亡或位置范围变化后重新分配交战目标，实现补位。
- `assets/scripts/core/verify-divine-task-rules.ts`
  - 增加仇恨规则验证，覆盖盾卫全拦、近战单体吸引、死亡补位、远程不吸引普通小怪。
- `assets/resources/textures/`
  - 新增默认棋盘、格子、棋子、敌人、水晶 PNG 贴图。
- `assets/textures/README.md`
  - 新增贴图文件建议尺寸和导入绑定说明。
- `assets/scripts/types/cc.d.ts`
  - 新增轻量 Cocos `cc` 模块类型声明，用于本地 `tsc --noEmit` 在非 Creator 环境下完成类型检查。
- `assets/scripts/core/verify-divine-task-rules.ts`
  - 修正 `requireValue` 泛型返回收窄，避免严格模式下类型检查失败。
- `package-lock.json`
  - 记录 `typescript` 与 `tsx` 开发依赖解析结果，保证本地验证环境可复现。
- `tools/generate_placeholder_textures.py`
  - 新增无第三方依赖的默认贴图生成脚本。
  - 提供 `startBeginner/startNormal/startHard`、`refreshShop`、`buySlot0/1/2`、`buyAll`、`autoPlaceBench`、`moveFirstPlaced`、`beginBattle`、`toggleSpeed`、`snapshot` 等入口。
  - 启动时为挂载节点补 `UITransform`，并将按钮与文本放到 960x640 中心区域。
- `package.json`
  - 新增 `typecheck`、`verify:rules`、`test` 脚本，并声明 `typescript` / `tsx` 开发依赖。
- `assets/scripts/systems/shop-system.ts`
  - 新增 `peek`，用于购买前检查商品，避免金币不足时先移除商店格子。
- `assets/scripts/core/game-session.ts`
  - 为手动刷新、购买、摆放、开战增加准备阶段限制。
  - 购买流程改为先检查金币再移除商品。
- `assets/scripts/core/game-controller.ts`
  - `beginBattle` 改为返回是否成功进入战斗。
- `assets/scripts/systems/unit-system.ts`
  - 升星候选扩展到备战区和已上阵区域。
  - 合并时优先保留已上阵主体，重置其生命和冷却。
  - 已接神品任务棋子不参与普通升星消耗。
- `assets/scripts/systems/unit-system.ts`
  - 新增 `resetDefeatedPlacedUnits`，用于在回合结束后恢复死亡上阵棋子生命并重置其冷却。
- `assets/scripts/core/game-session.ts`
  - 在进入准备阶段时调用死亡棋子生命重置流程。
- `assets/scripts/config/unit-config.ts`
  - 将光法师调整为治疗型神品单位，使其 `healPower` 与战斗行为一致。
- `assets/scripts/core/verify-divine-task-rules.ts`
  - 新增规则验证入口，覆盖多实例战士任务、多实例牧师任务、移动保留、完成进阶、真实治疗统计、死亡失效与死亡重置、阶段限制、跨区域升星、任务棋子合并保护。
- `assets/scripts/systems/divine-task-system.ts`
  - 任务分配输入改为实例视角，支持每个3星实例独立判定与并行任务。
- `assets/scripts/systems/divine-task-system.ts`
  - 增加神品单位兜底过滤（`isDivine`）与“同实例仅1个未完成任务”保护，防止重复分配。
  - 忽略0或负数进度增量，避免无效击杀/治疗值污染任务进度。
- `assets/scripts/systems/unit-system.ts`
  - 新增 `movePlacedUnit`，并提供回合开始任务判定所需的实例列表。
- `assets/scripts/core/game-session.ts`
  - 神品任务判定时机前移到每回合准备阶段开始。
  - 新增 `movePlacedUnit` 对外流程（仅准备阶段可移动）。
- `assets/scripts/core/game-controller.ts`
  - 暴露 `movePlaced` 给 UI 层。
- `assets/scripts/systems/battle-system.ts`
  - 牧师治疗改为真实治疗统计。
  - 增加敌人对前排单位的持续压力，形成可被治疗的真实受伤场景。
- 文档同步：`AGENTS.md`、`README.md`、`docs/game-design.md`、`PLANS.md`。

## 手动验证步骤（本轮）

1. 两个3星战士独立任务与击杀累计
   - 准备两个3星战士并上阵，持续过回合直到两者都触发任务。
   - 观察 `snapshot().divineTasks` 存在两个不同 `unitInstanceId`。
   - 进入战斗后确认两者 `progress` 各自增长，互不覆盖。

2. 两个3星牧师独立任务与治疗累计
   - 准备两个3星牧师并上阵，持续过回合直到两者都触发任务。
   - 观察 `divineTasks` 中两个牧师任务独立累计。
   - 满血场景下进度不增长，只有友军受伤后被治疗才增长。

3. 调整已接任务棋子位置后任务保持
   - 在准备阶段调用 `movePlaced(instanceId, lane, tileIndex)`。
   - 核对移动前后该单位 `instanceId/star/assignedTaskId` 不变。
   - 开战后同一任务继续累积。

4. 完成任务后正确进阶
   - 让带任务实例达到任务阈值。
   - 确认该实例 `unitId` 切换为 `berserker` 或 `light_mage`。

5. 规则脚本验证
   - 执行 `npm install` 安装开发依赖。
   - 执行 `npm test`，或单独运行 `npm run typecheck` 与 `npm run verify:rules`。
   - 期望输出 `Divine task rules verified.`。
   - 当前本机已验证通过；如果 `tsx` 在沙箱中报 `listen EPERM`，需要在普通终端或带权限环境执行 `npm test`。

6. 死亡棋子本回合失效与回合结束恢复
   - 让任意上阵棋子在战斗中被敌人压力打到 `currentHp <= 0`。
   - 继续 tick 本回合，确认该棋子不再造成伤害或产生治疗。
   - 清完本波进入准备阶段后，确认该死亡棋子的 `currentHp` 恢复到最大生命且 `cooldownLeft` 为0。
   - 确认仍存活但受伤的棋子不会被该重置逻辑补满。

7. 阶段限制与购买回滚
   - 战斗阶段调用 `refreshShop()`、`buy(...)`、`place(...)`、`movePlaced(...)`、`beginBattle()`，应返回失败。
   - 金币不足时购买应返回失败，且对应商店格子仍保留。

8. 跨区域升星
   - 将一个2星棋子上阵，再在备战区凑出两个同名2星棋子。
   - 确认三者合并为上阵区的3星棋子，位置不变，生命和冷却重置。
   - 已接神品任务的3星棋子继续保留，不会被后续同名普通升星消耗。

9. 本地 Web 预览
   - 在 `build/web-mobile` 目录执行 `python3 -m http.server 8088`。
   - 打开 `http://localhost:8088`。
   - 确认首屏显示 Cocos 原生 UI、两条路线、12个格子、水晶、商店、状态栏，状态栏显示 `贴图: 5/5`。

10. Cocos 命令行构建与 960x540 截图验证
   - 执行 `/Applications/CocosCreator/Creator/3.4.0/CocosCreator.app/Contents/MacOS/CocosCreator --project /Users/caiteng/project/divine-tower-chess --build 'platform=web-mobile;debug=true'`。
   - 期望日志出现 `Build success`；当前 Creator 3.4.0 在本机仍会以退出码 36 结束，但构建产物正常刷新。
   - 在 `build/web-mobile` 启动静态服务后，用 960x540 视口打开页面，等待资源加载完成。
   - 确认底部状态栏 5 行摘要完整显示，没有被浏览器底部裁切。

11. 浏览器交互自测
   - 打开 `http://localhost:8088`，等待 Cocos 场景加载完成。
   - 点击 `全买`、`自动上阵`、`开战`。
   - 确认状态进入 `battle`，上阵棋子、敌人、水晶和状态摘要持续刷新。
   - 当前本机 Playwright 自测未发现 `pageerror` 或 fatal console error。

12. 仇恨规则验证
   - 执行 `npm test`，期望输出 `Divine task rules verified.`。
   - 验证脚本会断言盾卫被同范围内3个敌人同时攻击，普通近战只被1个敌人攻击。
   - 验证脚本会断言互殴敌人死亡后另一个范围内敌人补位攻击。
   - 验证脚本会断言弓箭手不会吸引普通小怪，敌人继续移动。

13. 首页与地图选择流程
   - 打开 Web 预览后确认首先显示首页：`神塔棋兵`、`开始`、`设置`、`鸣谢`。
   - 点击 `开始`，进入地图选择界面。
   - 点击 `新手/普通/困难` 切换难度，再点击 `✔`。
   - 确认正式进入游戏界面，顶部不显示难度选择按钮。

14. 圆形头像与移动手感
   - 买入并上阵棋子，确认棋子显示为圆形职业头像。
   - 观察不同星级边框：1星灰色、2星绿色、3星紫色。
   - 神品单位出现后确认使用独立头像配色和金色闪烁边框。
   - 点击已上阵棋子或所在格子可选中，再点击空格可移动。

## 下阶段计划（v0.3）

1. 提交固定 Cocos `.scene` 文件，打开项目即可直接预览。
2. 增加可视化棋盘、怪物预制体、路线 gizmo。
3. 增加战斗表现层（子弹、技能动画、受击反馈）。
4. 增加基础撤回与重新上阵交互（可与当前移动能力互补）。
5. 增加基础结算 UI（胜利/失败页 + 重开）。
6. 把验证脚本拆成更正式的测试套件。
7. 新手难度体验调优（金币曲线、怪物强度、单位费用）。
