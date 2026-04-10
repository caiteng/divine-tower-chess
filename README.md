# divine-tower-chess

Cocos Creator + TypeScript 单机塔防原型（第一版骨架）。

## 当前完成状态（v0.2.4）
已落地从主菜单到回合战斗的最小可玩闭环，重点覆盖：

- 难度：新手(10波) / 普通(30波) / 困难(60波)
- 回合开始自动刷新商店（3格）
- 金币购买、手动刷新商店
- 手动刷新、购买、摆放、移动、开战均限制在准备阶段
- 金币不足购买失败时不会吞掉商店格子
- 棋子购买、上阵、战斗自动攻击
- 怪物按固定双路线前进，抵达水晶造成伤害
- 击杀返还金币
- 三合一升星（1星->2星，2星->3星）
- 升星支持备战区和已上阵棋子共同参与，优先保留已上阵主体
- 3星棋子不能继续普通合并，只能通过神品任务升阶
- 已接神品任务的棋子不会被普通升星消耗
- 神品任务按“棋子实例”独立触发与累计（战士/牧师）
- 每个符合条件的3星非神品实例在回合开始独立进行10%任务判定
- 同回合可存在多个神品任务，且互不共享进度
- 每个棋子实例同时最多持有1个未完成任务
- 准备阶段支持移动已上阵棋子（`movePlaced(instanceId, lane, tileIndex)`）
- 移动已接任务棋子时保留 `instanceId/star/unitId/assignedTaskId/divine progress`
- 牧师与光法治疗均按真实治疗量结算（仅统计实际恢复的生命值）
- 棋子生命归零后本回合死亡失效，不能继续攻击或治疗
- 下一轮准备阶段会恢复死亡棋子的生命状态
- 任务进度跨回合累计，完成后自动进阶为神品
- 提供 `CocosGameController` 试玩组件，可运行时生成按钮和状态面板
- Cocos 场景内会绘制棋盘格子、路线、棋子、敌人和水晶
- HTML 覆盖层默认关闭，可通过 `toggleHtmlDebug()` 作为兜底调试面板打开

> 美术/UI 目前均为占位逻辑层实现，便于后续直接挂接 Cocos 节点与预制体。

## 目录结构

```text
assets/scripts/
  config/
    difficulty-config.ts
    divine-task-config.ts
    enemy-config.ts
    unit-config.ts
    wave-config.ts
  core/
    game-controller.ts
    game-session.ts
    simulate-run.ts
    verify-divine-task-rules.ts
  models/
    types.ts
  systems/
    battle-system.ts
    divine-task-system.ts
    economy-system.ts
    shop-system.ts
    unit-system.ts
    wave-system.ts
  ui/
    cocos-game-controller.ts
    main-menu-controller.ts
  utils/
    id.ts
    random.ts
```

## 核心流程

1. 主菜单选择难度
2. 进入准备阶段（自动刷新商店，并对所有符合条件的3星实例进行神品任务判定）
3. 玩家购买棋子 -> 放置棋子 -> 可移动已上阵棋子
4. 开始战斗
5. 生成怪物并沿路径移动，怪物对前排施加持续压力
6. 棋子自动攻击/施法；治疗单位仅在友军真实受伤时产生真实治疗量
7. 生命归零的棋子当前回合失效，不能继续攻击或治疗
8. 波次结束后进入下一回合，死亡棋子在准备阶段恢复生命，直到胜利或失败

## 本地 Cocos Creator 3.4.0 快速试玩

当前仓库提供脚本和运行时 UI 组件，并包含 `project.json` 标识为 Creator 3.4.0 项目。最快试玩方式：

1. 打开 Cocos Dashboard。
2. 确认已安装 `Cocos Creator 3.4.0`。
3. 在项目页点击导入，选择本目录：`/Users/caiteng/project/divine-tower-chess`。
4. 用 Creator 3.4.0 打开项目。
5. 在 `assets` 下新建一个 2D 场景，例如 `Main.scene`。
6. 打开 `Main.scene`。
7. 在层级面板创建 `UI -> Canvas`。
8. 选中 Canvas，在 Inspector 点击 `Add Component`，搜索并添加 `CocosGameController`。
9. 点击预览运行。
10. Cocos 场景里会生成按钮、状态文本和棋盘。

如果需要重新打开 HTML 兜底面板，可在按钮事件或控制台调用 `toggleHtmlDebug()`。

如果浏览器还是黑屏，说明 `CocosGameController` 没有执行，或 Canvas/Camera 配置仍异常：

1. 确认组件挂在当前场景的 Canvas 或节点上。
2. 确认当前预览的是保存后的 `Main.scene`。
3. 打开浏览器开发者工具或 Creator Console，查找 `[CocosGameController] onLoad`。
4. 如果没有这行日志，说明脚本没有挂载或场景没有运行到该节点。

如果 Dashboard 仍提示缺失编辑器：

1. 在 Dashboard 的编辑器页确认 `3.4.0` 已安装完成。
2. 回到项目卡片，手动选择 Creator `3.4.0` 打开。
3. 如果仍打不开，先用 Dashboard 新建一个 `2D Empty Project`，再把本项目的 `assets/scripts` 复制到新项目的 `assets/scripts`。

推荐试玩流程：

1. 点击 `新手`。
2. 点击 `全买`，金币不足时会自动停止且不会吞商店格子。
3. 点击 `自动上阵`。
4. 点击 `开战`。
5. 战斗中观察波次、金币、水晶、敌人、上阵棋子生命变化。
6. 回到准备阶段后继续购买、自动上阵、开战。

面板按钮说明：

- `新手/普通/困难`：重开对应难度。
- `刷新`：准备阶段消耗金币刷新商店。
- `买1/买2/买3`：购买对应商店格子。
- `全买`：从左到右尽量购买当前商店单位。
- `自动上阵`：把备战区棋子放到第一个空格。
- `移动首个`：把第一个上阵棋子移动到第一个空位，用于验证实例状态保留。
- `开战`：从准备阶段进入战斗。
- `速度`：切换 x1 / x3 战斗速度。
- `HTML调试`：打开/关闭浏览器左上角兜底调试面板。

棋子摆放与移动：

- 点击备战区棋子，再点击棋盘空格，可把棋子放到该格。
- 点击棋盘上已上阵棋子，再点击另一个空格，可移动棋子。
- 只有准备阶段可以摆放和移动。
- 当前选中的棋子会显示为浅黄色。

棋盘说明：

- Cocos 场景和 HTML 面板都会渲染棋盘。
- 两条灰色横线是怪物路线。
- 虚线方格是可上阵格子，编号格式为 `路线-格子`。
- 白色棋子块显示单位名、星级和当前生命。
- 橙色圆点是敌人。
- 右侧蓝色方块是水晶。

## 导入贴图

项目已经生成一套默认 PNG 贴图，位置是：

```text
assets/resources/textures
```

`CocosGameController` 会自动加载这些默认贴图，不需要手动拖。

你也可以把自己的 PNG 直接替换到这个目录。

推荐先准备这些图片：

- `board.png`：棋盘背景，720x260
- `tile.png`：格子底图，64x64
- `unit.png`：通用棋子图标，128x128
- `enemy.png`：通用敌人图标，64x64
- `crystal.png`：水晶图标，128x256

如果想手动指定别的图片：

1. 在 Cocos 里选中挂了 `CocosGameController` 的 Canvas。
2. 看 Inspector 里的组件属性。
3. 把图片资源的 `SpriteFrame` 拖到：
   - `Board Sprite`
   - `Tile Sprite`
   - `Unit Sprite`
   - `Enemy Sprite`
   - `Crystal Sprite`
4. 保存场景并预览。

如果某个贴图槽为空，会继续使用当前纯色占位图形。

## 手动验证（神品任务与移动）

1. 新建 Cocos Creator 场景，将 `CocosGameController` 挂到 Canvas 或一个空节点。
2. UI 按钮分别绑定：
   - 选择新手 -> `startBeginner()`
   - 选择普通 -> `startNormal()`
   - 选择困难 -> `startHard()`
   - 刷新商店 -> `refreshShop()`
   - 购买按钮 -> `buySlot0()` / `buySlot1()` / `buySlot2()`
   - 上阵 -> `place(instanceId, lane, tileIndex)`
   - 移动 -> `movePlaced(instanceId, lane, tileIndex)`
   - 开战 -> `beginBattle()`
3. 如果使用运行时生成面板，不需要手动绑定按钮。
4. `CocosGameController.update(dt)` 已自动推进战斗 tick。
5. 通过状态面板或 `snapshot()` 观察 `placed` 与 `divineTasks`。
6. 验证两名3星战士：
   - 同时上阵两个3星战士，连续过回合直到两者都拿到任务。
   - 观察 `divineTasks` 中出现两个不同 `unitInstanceId` 的战士任务。
   - 进入战斗后确认两条任务的 `progress` 各自增长且互不影响。
7. 验证两名3星牧师：
   - 同时上阵两个3星牧师，连续过回合直到两者都拿到任务。
   - 观察 `divineTasks` 中两个牧师实例任务独立增长。
   - 确认仅在友军掉血并被恢复时进度增长；满血期间不增长。
8. 验证位置调整：
   - 某个已接任务棋子在准备阶段执行 `movePlaced(...)`。
   - 确认该棋子的 `instanceId/star/assignedTaskId` 不变。
   - 下一场战斗中任务进度继续累计。
9. 验证进阶：
   - 将任务进度刷满后，确认该实例单位 `unitId` 变为目标神品（狂战士/光法师）。
10. 验证死亡重置：
   - 让前排棋子在战斗中被怪物压力打到 `currentHp <= 0`。
   - 确认该棋子在本回合后续 tick 不再攻击或治疗。
   - 下一轮进入准备阶段后，确认死亡棋子 `currentHp` 恢复到该单位最大生命。
   - 同时确认仍存活但受伤的棋子不会因为该规则被自动补满。

## 规则验证脚本

`assets/scripts/core/verify-divine-task-rules.ts` 覆盖以下规则：

- 两个3星战士可同时各自持有 `warrior_to_berserker`。
- 两个3星牧师可同时各自持有 `priest_to_light_mage`。
- 已接任务棋子移动后，实例ID、星级、单位ID、任务ID和任务进度保持不变。
- 战士任务完成后进阶为狂战士，牧师任务完成后进阶为光法师。
- 治疗任务只统计真实恢复量，满血目标不会产生虚拟治疗进度。
- 死亡棋子当前回合不攻击，进入下一轮准备阶段后恢复生命。
- 准备阶段之外不能刷新、购买、摆放或重复开战。
- 已上阵棋子和备战区棋子可以共同触发三合一升星。
- 已接神品任务的棋子不会被后续普通升星消耗。

项目提供脚本入口：

```bash
npm run typecheck
npm run verify:rules
npm test
```

首次使用前需要安装依赖：

```bash
npm install
```

也可以直接运行：

```bash
tsc --noEmit
```

```bash
tsx assets/scripts/core/verify-divine-task-rules.ts
```

## 下一步建议

1. 提交固定 Cocos `.scene` 文件，打开项目即可直接预览。
2. 增加可视化棋盘、怪物预制体、路线 gizmo。
3. 为技能补基础演出（投射物、AOE圈、治疗数字）。
4. 引入简单结算面板与重开流程。
5. 把验证脚本拆成更正式的测试套件。
6. 做第一轮数值平衡，确保新手10波通关率合理。
