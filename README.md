# 角斗场：试炼之环

## 项目定义

《角斗场：试炼之环》是一个基于 Cocos Creator + TypeScript 的可玩项目。当前唯一方向是 **Battleheart 风格 2D 小队实时命令战斗** + 轻成长（商店、金币、3 合 1 升星、3 星实例级神品任务）。

## 当前真实主链

- 逻辑主链（唯一）：`assets/scripts/squad/*`
- 会话入口（唯一）：`assets/scripts/squad/squad-battle-session.ts`
- 正式 Cocos 场景编排入口：`assets/scripts/ui/battle-scene-controller.ts`
- 默认打开流程：`主菜单 -> 难度选择 -> 职业选择 -> 准备阶段/战斗阶段`

## 当前 UI 架构

- 正式 Cocos 表现层组件：
  - `assets/scripts/ui/controllers/main-menu-controller.ts`
  - `assets/scripts/ui/controllers/battle-hud-controller.ts`
  - `assets/scripts/ui/controllers/prep-panel-controller.ts`
  - `assets/scripts/ui/controllers/battlefield-controller.ts`
  - `assets/scripts/ui/controllers/command-overlay-controller.ts`
  - `assets/scripts/ui/controllers/wave-transition-controller.ts`
  - `assets/scripts/ui/views/unit-view.ts`
  - `assets/scripts/ui/views/enemy-view.ts`
- 场景入口组件：`assets/scripts/ui/squad-battle-ui.ts`
  - 仅负责场景挂载入口，实际编排逻辑由 `assets/scripts/ui/battle-scene-controller.ts` 承载

## 核心规则（保持）

- 5 人上阵、8 格备战、3 格商店
- 商店回合开始自动刷新，购买失败不移除商店条目
- 3 同 1 星合 2 星，3 同 2 星合 3 星，3 星不再普通合成
- 神品任务为实例级独立分配和累计，且只对 3 星单位触发
- 牧师无攻击，只能被命令后持续治疗
- 无命令时远程不主动前压；近战仅近距离有限反应
- 波间保留准备面板上滑/下沉与战场暗亮过渡
- 难度支持新手、普通、困难、无尽；过波会发放金币奖励并自动刷新商店
- 法师攻击为溅射伤害；牧师治疗上限使用星级放大后的真实最大生命
- 战斗目标确定为小队生存制：敌人目标是击倒我方小队，不加入水晶防守目标
- 盾卫带有目标吸引权重，敌人会更倾向攻击盾卫
- 战斗反馈包含命中飘字、远程弹道、牧师治疗线和 Boss 入场提示

## 资源接入接口

- `assets/scripts/ui/resources/sprite-resolvers.ts`
  - `UnitSpriteResolver.resolve(unitId, star, divineState)`
  - `UnitSpriteResolver.resolvePortrait(unitId, star, divineState)`
  - `EnemySpriteResolver.resolve(enemyType)`
  - `UiIconResolver.resolve(iconId)`
  - `BackgroundResolver.resolve(sceneId)`

## 美术接入规则

- 运行时资源放在 `assets/resources/textures/**`，由 Cocos `resources.load` 加载。
- 当前主线基础职业为 `warrior` 战士、`shield_guard` 盾卫、`archer` 猎人、`mage` 法师、`priest` 牧师、`spearman` 枪兵；神品职业为 `berserker` 狂战士、`light_mage` 圣谕者。
- 角色选择页优先读取 `portrait`，战场内优先读取 `star1/2/3` 和动作帧；缺资源时 resolver 必须保持可用回退。
- 不保留未接入运行时的参考图、sheet 或临时生成素材；后续升级美术直接替换 `assets/resources/textures/**` 下对应职业目录并更新 manifest。
- 详细目录规范见：`PLANS.md`。

## 运行与验证

```bash
npm install
npm test
```

- `npm test` 会执行：
  - `tsc --noEmit`
  - `tsx tools/verify-squad-rules.ts`
  - `tsx tools/verify-art-resources.ts`
- `npm run verify:web` 会运行 Web 端 e2e 检查，输出截图和浏览器档案到 `tmp/web-e2e/`，该目录不入库。
- 当前状态与下一步：`PLANS.md`
