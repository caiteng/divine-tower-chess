# PLANS.md

## 当前状态（2026-04-27）

- 项目名为《角斗场：试炼之环》，主线是 Cocos Creator + TypeScript 可玩原型：Battleheart 风格 2D 小队实时命令战斗 + 商店 / 金币 / 3 合 1 升星 / 实例级神品任务。
- 正式入口流程：`主菜单 -> 难度选择 -> 职业选择 -> 准备阶段 -> 战斗阶段`。
- 逻辑主链：
  - `assets/scripts/squad/squad-battle-session.ts`
  - `assets/scripts/squad/systems/*`
- Cocos UI 主链：
  - `assets/scripts/ui/battle-scene-controller.ts`
  - `assets/scripts/ui/squad-battle-ui.ts`
  - `assets/scripts/ui/controllers/*`
  - `assets/scripts/ui/views/*`
- 配置与资源主链：
  - `assets/scripts/config/unit-config.ts`
  - `assets/scripts/config/art-resource-manifest.ts`
  - `assets/scripts/config/unit-star-sprite-config.ts`
  - `assets/scripts/squad/config/squad-battle-config.ts`
  - `assets/resources/textures/**`

## 当前可玩状态

- 主菜单、开始新局、职业选择、准备阶段、购买、上阵、开波、战斗命令链路可运行。
- 难度已接通：新手 10 波、普通 20 波、困难 30 波、无尽模式。无尽模式 HUD 显示 `当前波/∞`，清波后回准备阶段继续推进。
- 经济闭环已接通：清波奖励为 `4 + 当前波数 + 完美奖励 + Boss 波奖励`，清波后自动刷新商店。
- 当前基础职业为 6 个：战士、盾卫、猎人、法师、牧师、枪兵；骑兵已移出职业池和资源清单。
- 神品职业为 2 个：狂战士、圣谕者。圣谕者是牧师神品路线，避免和法师职业线混淆。
- 单位与敌人已加入护甲、穿甲、攻速和碰撞半径配置；伤害按护甲和攻击方穿甲结算，战场碰撞按配置半径推开，减少角色重叠。
- 商店硬规则已覆盖：回合开始自动刷新、每次 3 个单位、购买失败不吞槽位。
- 升星硬规则已覆盖：1 星 3 合 1 到 2 星，2 星 3 合 1 到 3 星，3 星不再普通合成。
- 神品任务硬规则已覆盖：实例级任务、实例级进度、每个 3 星非神品单位独立 10% 掷点、带任务单位不被普通合成消耗。
- 牧师行为已保持命令驱动：不攻击，只在显式命令友军后持续治疗；治疗上限使用星级最大生命，治疗进度只统计实际恢复 HP。
- 法师已接入真实 AOE 溅射伤害，不再只是配置里写 `aoe`。
- 战场表现已接入职业/敌人贴图、动作帧、选中光圈、命令线、目标点和准备面板战斗阶段隐藏；移动时会播放动作帧，idle 无资源时回退 move。
- 战斗目标确定为小队生存制：敌人以击倒我方小队为目标，不引入水晶防守目标。
- 盾卫已接入嘲讽权重：敌人索敌时会更倾向选择盾卫。
- 战斗反馈已接入命中飘字、远程弹道、牧师治疗线和 Boss 入场提示；闪白暂不接入。

## 工程清洁规则

- 不入库目录：
  - `node_modules/`
  - `build/`
  - `dist/`
  - `library/`
  - `temp/`
  - `local/`
  - `tmp/`
  - `coverage/`
- `build/web-mobile/` 是 Cocos 构建产物，不作为源码管理。
- `tmp/web-e2e/` 是 Web e2e 截图、summary 和浏览器 profile 输出，不作为源码管理。
- `assets/**.meta` 是 Cocos 真实资源元数据，和对应资源一起入库。
- `tools/**` 是 Node/脚本验证工具，不放进 `assets/scripts/**`，避免被 Cocos 当作运行时代码打包。

## 验证命令

```bash
npm test
```

`npm test` 当前串联：

- `npm run typecheck`
- `npm run verify:rules`
- `npm run verify:art`

可选 Web e2e：

```bash
npm run verify:web
```

`verify:web` 会写入 `tmp/web-e2e/`，该目录已被忽略。

## 本轮整理记录（2026-04-27）

- 已按恢复约定先执行 `npm test`，结果通过：
  - `tsc --noEmit`
  - `verify-squad-rules`
  - `verify-art`
- 已确认版本控制中存在不应入库的生成产物：
  - `build/web-mobile/`
  - `tmp/web-e2e/`
- 已将临时/构建/缓存目录补充到 `.gitignore`。
- 已整理文档，移除当前主线不再使用的职业说明、旧验证脚本路径和过期的环境失败状态。

## 本轮游戏性调整（2026-04-27）

- 移除骑兵：从 `UnitId`、商店池、职业选择池、战斗数值、角色定位、资源 manifest、头像 fallback 和美术目录说明中清理。
- 改名：
  - `archer` 玩家显示名从弓箭手改为猎人。
  - `light_mage` 玩家显示名从光法师改为圣谕者。
  - 主菜单标题改为《角斗场：试炼之环》。
- 初版数值方向：
  - 盾卫：最高血量和护甲，低攻击、低攻速、低移速，负责前排承伤。
  - 战士：血量、护甲、攻击、攻速、穿甲都保持中位，作为平衡近战基准。
  - 枪兵：中距离输出，中等血量、低护甲，较高比例穿甲。
  - 猎人：最高攻速和最长射程，低血量低护甲，低星穿甲能力弱。
  - 法师：高单击伤害和高穿甲，慢攻速、低血量、低护甲。
  - 牧师：中护甲、中血量，无攻击，命令驱动治疗；圣谕者继续作为治疗神品路线。
- 新增规则校验覆盖护甲 + 穿甲结算和同阵营单位碰撞分离。

## 本轮闭环修复（2026-04-27）

- 波次：将真实战斗波次从 3 波演示扩展为配置生成，新手 10 波、普通 20 波、困难 30 波，并接入无尽模式。
- 经济：每次清波都会发金币奖励，奖励包含基础波次奖励、完美存活奖励和 Boss 波奖励。
- 治疗：修复 2 星 / 3 星单位只能被治疗到 1 星基础血量的问题，统一使用星级放大后的最大生命。
- 法师：实现 AOE 溅射伤害，主目标全额伤害，附近敌人按配置比例吃溅射。
- 神品：战士任务降到 35 击杀，牧师任务降到 1800 实际治疗量，让一局内有机会看到神品转化。
- 动画：移动状态不再跳过动作帧；新增 idle/hurt clip 类型，当前缺 idle 资源时回退 move 帧。
- 资源：运行时 UI icon manifest 只保留 `assets/resources/**` 下已有资源，避免把 `assets/art/**` 当运行时资源加载。
- 工程：确认 `build/` 与 `tmp/` 当前未被 Git 跟踪。

## 本轮手感反馈（2026-04-27）

- 按决策保留小队生存制，不做水晶防守。
- 盾卫获得轻量嘲讽：敌人目标评分会显著偏向 `shield_guard`，让前排价值更可感知。
- 新增战斗短事件 `battleEffects`，用于 UI 表现但不污染持久战斗状态。
- 命中飘字：
  - 玩家攻击和敌人攻击都会产生伤害数字。
  - 牧师实际治疗会产生绿色治疗数字。
- 远程弹道：远程攻击产生短生命周期弹道线和飞行点。
- 牧师治疗线：持续治疗会显示蓝色治疗连线。
- Boss 入场提示：生成 Boss 时显示 Boss 文本和扩散圆环。
- 新增规则校验覆盖盾卫嘲讽优先级、远程弹道事件和伤害飘字事件。

## 本轮战斗反馈资源接入（2026-04-27）

- 已从 `Downloads/divine_tower_chess_feedback_assets.zip` 接入运行时资源：
  - `assets/resources/textures/ui/combat_numbers/damage/`
  - `assets/resources/textures/ui/combat_numbers/heal/`
  - `assets/resources/textures/vfx/hit_flash/`
  - `assets/resources/textures/vfx/knockback_dust/`
  - `assets/resources/textures/vfx/death_smoke/`
  - `assets/resources/textures/ui/boss_banner/`
- 新增 `CombatFeedbackResolver`，统一使用 `resources.load(path, ImageAsset, ...)` 加载 PNG，路径不带 `assets/resources` 前缀和 `.png` 后缀。
- 战斗表现事件扩展为 `damage` / `heal` / `death` / `boss_enter`：
  - 普通伤害显示红橙色 PNG 数字，并在受击位置播放 `hit_flash_01~06` 与脚底 `knockback_dust_01~06`。
  - 牧师实际治疗显示带 `heal_plus` 的绿色 PNG 数字，继续只统计实际恢复 HP。
  - 敌人死亡在最后位置播放 `death_smoke_01~06`。
  - Boss 出现时在战场中央偏上显示 `boss_entrance_banner`，带淡入淡出和轻微缩放。
- 表现层只消费 `battleEffects`，不改变伤害、治疗、死亡、奖励和胜负结算。
- 验证：`npm test` 已通过。

## 本轮战士资源与目录整理（2026-04-27）

- 已接入 `Downloads/warrior_asset_pack_v2.zip`，普通战士运行时资源统一在：
  - `assets/resources/textures/units/warrior/`
- 已删除普通战士旧资源：
  - `warrior_move_*`
  - `warrior_attack_*`
  - `warrior_death_fall_*`
  - `warrior_corpse_fade_*`
  - `warrior_portrait.png`
- 已接入新战士资源：
  - `portrait.png`
  - `warrior_star1.png` / `warrior_star2.png` / `warrior_star3.png`
  - `idle_01~04`
  - `move_01~06`
  - `attack_01~06`
  - `hurt_01~03`
  - `death_01~06`
- 已把神品职业拆到独立运行时目录，避免和来源职业混放：
  - `assets/resources/textures/units/berserker/`
  - `assets/resources/textures/units/light_mage/`
- 已删除重复嵌套目录：
  - `assets/resources/textures/units/<unit>/<unit>/`
- 已删除不再使用的 staging 副本：
  - `assets/art/units/`
- 已删除旧的批量 stickman 生成脚本：
  - `tools/generate_stickman_action_frames.ps1`
- 当前目录规则：后续升级某个单位美术，只改 `assets/resources/textures/units/<unit>/` 和 `art-resource-manifest.ts`。
- 验证：`npm test` 已通过。

## 本轮 assets 全量清理（2026-04-27）

- `assets/` 当前只保留 Cocos 必需内容：
  - `Main.scene`
  - `assets/scripts/`
  - `assets/resources/`
- 已删除未接入运行时的参考图目录：
  - `art_reference/`
- 已删除历史 staging / 重复目录：
  - `assets/art/`
  - `assets/textures/`
  - `assets/resources/textures/board.png`
  - `assets/resources/textures/tile.png`
  - `assets/resources/textures/unit.png`
  - `assets/resources/textures/enemy.png`
  - `assets/resources/textures/crystal.png`
- 已删除未接入运行时的反馈包 sheet / 额外图：
  - `*_sheet.png`
  - `*_sheet_transparent.png`
  - `damage_crit.png`
  - `damage_minus.png`
- 已删除旧生成脚本：
  - `tools/generate_placeholder_textures.py`
- 已确认无孤立 `.meta`、无 `assets/resources/textures/units/<unit>/<unit>/` 嵌套目录。
- 验证：`npm test` 已通过。

## 手动验证步骤

1. 在 Cocos Creator 中打开项目并执行 Preview。
2. 从主菜单点击开始，选择任意职业进入准备阶段。
3. 在主菜单分别选择新手、普通、困难、无尽，确认进入战斗后 HUD 波次显示正确，无尽显示 `∞`。
4. 确认商店显示 3 个单位，金币、备战区、上阵区显示正常。
5. 购买并上阵至少 1 名单位，开始下一波。
6. 战斗中点击己方单位，分别点地面、敌人、友军，确认移动 / 集火 / 治疗命令反馈正常。
7. 清完一波，确认金币增加、商店自动刷新、回到准备阶段。
8. 观察多个近战单位或敌人聚集时不会长时间完全重叠，会按体积互相推开。
9. 使用法师攻击聚集敌人，确认附近敌人也会掉血。
10. 上阵盾卫和战士，确认敌人更容易攻击盾卫。
11. 使用猎人/法师攻击，确认有弹道、红橙色 PNG 伤害数字、命中闪光和脚底尘土。
12. 牧师治疗受伤友军，确认有治疗线、`+` 号绿色 PNG 治疗数字，并且满血目标不会产生治疗数字。
13. 击杀敌人，确认敌人最后位置播放死亡烟尘。
14. 进入 Boss 波，确认战场中央偏上显示 Boss 入场横幅。

## 下一步

1. 在 Cocos 编辑器 Preview 中手动跑完新手前 3 波，确认金币、商店和波次推进节奏。
2. 在 Cocos 编辑器 Preview 中确认战斗反馈资源的实际尺寸和遮挡关系，如有需要再微调帧尺寸。
3. 继续补素材规范：优先战士、盾卫、猎人的 idle / move / attack / hurt / death_fall。
