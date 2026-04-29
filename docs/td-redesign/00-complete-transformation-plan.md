# 00 完整改造计划：放置合成塔防

## 项目目标

把当前 Battleheart 风格小队实时战斗原型，改造成横屏 2D 放置合成塔防。核心体验是：固定轨道出怪、玩家在塔位放置英雄、英雄自动攻击和阻挡、三同职业同星级合成升星、队长英雄释放主动技能、每关 10 点生命、每关 10 波。

## 不直接照搬竞品

参考方向是 BTD6 的局内构筑深度和 Kingdom Rush 的英雄、阻挡、关卡读图感，但美术、角色、地图、图标、敌人必须全部原创。AI 生成素材只能作为原创占位图或自有风格资源，不能复制任何商业游戏角色或界面。

## 当前仓库复用策略

保留现有 `assets/scripts/squad/*` 作为旧主线。新增塔防主线：

```text
assets/scripts/td/
assets/scripts/td/config/
assets/scripts/td/systems/
assets/scripts/ui/controllers/td-*.ts
assets/scripts/ui/views/td-*.ts
assets/resources/textures/td/**
tools/verify-td-rules.ts
tools/verify-td-art-resources.ts
tools/generate-td-placeholder-art.ts
tools/run-td-web-e2e.js
```

可复用：金币、商店、三合一思想、准备/战斗阶段切换、HUD、资源 resolver、本地存档、规则测试、Web 冒烟、美术资源校验。

必须重写：路径行走、塔位系统、漏怪扣血、敌人波次、敌人属性、塔防战斗、塔防 UI、地图表现、帧动画资源规范。

## 最终核心循环

```text
主菜单 -> 选择塔防模式 -> 选择关卡 -> 选择队长 -> 准备阶段 -> 购买英雄 -> 放置塔位 -> 三合一升星 -> 开始波次 -> 敌人沿路径推进 -> 英雄自动攻击/阻挡 -> 队长/法术手动释放 -> 清波奖励 -> 下一准备阶段 -> 第 10 波胜利或生命归零失败
```

## MVP 范围

MVP 只做第一关“林地外环”：

- 单地面路径 + 单飞行捷径。
- 8 个塔位。
- 10 波。
- 10 点生命。
- 6 个基础英雄：弓箭手、法师、战士、骑士、刺客、牧师。
- 4 个敌人：软泥仔、木盾兵、火羽蝠、城门魔像。
- 商店 3 格。
- 三合一升星到 3 星。
- 基础攻击、对空、AOE、阻挡、漏怪扣血。
- 原创 AI 占位帧图与地图背景。
- Cocos UI 完整跑通。
- `npm test` + `verify-td-rules` 通过。

## Alpha 范围

- 5 关、50 波。
- 8 类敌人。
- 3 个队长英雄。
- 每个基础职业至少 1 个 2 星能力和 1 个 3 星强化。
- 全局法术：冰霜术、炎爆术。
- 本地存档恢复。
- Web 冒烟覆盖完整第一关。

## 职业设计

| 职业 | 定位 | 攻击 | 特性 | 1 星 | 2 星 | 3 星 |
|---|---|---|---|---|---|---|
| 弓箭手 | 单体、对空 | 物理远程 | 高攻速 | 普通箭 | 破甲箭 | 多重箭/箭雨 |
| 法师 | 群伤、破重甲 | 魔法远程 | AOE | 奥术弹 | 爆炸弹 | 陨火/冰环 |
| 战士 | 地面输出 | 物理近战 | 小范围阻挡 | 斩击 | 顺劈 | 旋风斩 |
| 骑士 | 主坦 | 物理近战 | 高阻挡 | 盾击 | 嘲讽 | 圣盾领域 |
| 刺客 | 爆发、侦测 | 物理近战 | 打后排 | 背刺 | 毒刃 | 处决瞬移 |
| 牧师 | 辅助 | 治疗/增益 | 保前排 | 治疗 | 群疗 | 守护结界 |
| 枪兵 | 中距穿刺 | 物理 | 破甲线 | 穿刺 | 破甲刺 | 直线贯穿 |
| 炼金师 | DOT | 毒/火 | 持续伤害 | 毒瓶 | 酸雾 | 爆燃 |
| 炮手 | 高爆发 | 爆炸 | 慢攻速 | 炮弹 | 震荡 | 重炮 |
| 德鲁伊 | 控场 | 自然 | 召唤/缠绕 | 缠绕 | 荆棘 | 树人 |

MVP 只实现前 6 个。

## 敌人设计

| 敌人 | 定位 | 机制 | 漏怪扣血 |
|---|---|---|---:|
| 软泥仔 | 快速小怪 | 无 | 1 |
| 木盾兵 | 前排 | 物抗 35% | 1 |
| 骨甲卫 | 重甲 | 物抗 55%，魔法额外 +10% | 2 |
| 火羽蝠 | 飞行 | 只能被对空攻击 | 1 |
| 幽影犬 | 潜行 | 未侦测时减伤 70% | 1 |
| 诅咒术士 | 后排辅助 | 给前排加速/护盾 | 2 |
| 爆裂孢子 | 自爆 | 死亡或漏怪触发范围伤害 | 1 |
| 城门魔像 | Boss | 重甲、减速抗性、阶段技 | 3 |

## 五关设计

| 关卡 | 名称 | 路线 | 教学目标 |
|---|---|---|---|
| 1 | 林地外环 | 单路 + 飞行捷径 | 放置、对空、合成 |
| 2 | 双桥峡谷 | 双入口汇合 | 多线补防、队长调度 |
| 3 | 失落回廊 | 回字长线 | 集火点、物理/魔法搭配 |
| 4 | 熔炉十字 | 多入口十字 | AOE、阻挡、技能时机 |
| 5 | 天穹圣坛 | 螺旋 + 空中捷径 | 完整阵容、Boss 处理 |

## 资源规范

```text
assets/resources/textures/td/maps/<stage_id>/background.png
assets/resources/textures/td/maps/<stage_id>/path_overlay.png
assets/resources/textures/td/maps/<stage_id>/slot_normal.png
assets/resources/textures/td/maps/<stage_id>/slot_hover.png
assets/resources/textures/td/heroes/<hero_id>/portrait.png
assets/resources/textures/td/heroes/<hero_id>/idle_01.png ... idle_04.png
assets/resources/textures/td/heroes/<hero_id>/attack_01.png ... attack_06.png
assets/resources/textures/td/heroes/<hero_id>/skill_01.png ... skill_06.png
assets/resources/textures/td/heroes/<hero_id>/hurt_01.png ... hurt_03.png
assets/resources/textures/td/heroes/<hero_id>/death_01.png ... death_06.png
assets/resources/textures/td/enemies/<enemy_id>/move_01.png ... move_06.png
assets/resources/textures/td/enemies/<enemy_id>/hit_01.png ... hit_03.png
assets/resources/textures/td/enemies/<enemy_id>/death_01.png ... death_06.png
assets/resources/textures/td/ui/*.png
assets/resources/textures/td/vfx/*.png
```

## AI 资源生成原则

- 透明背景 PNG。
- 角色朝右，Cocos 内需要朝左时镜像。
- 每个职业统一色板和轮廓。
- 每组动画统一画布尺寸，推荐角色 256x256，敌人 192x192，图标 128x128，地图 1280x720。
- 占位图可由脚本生成简单像素/矢量风格，但后续可替换为 AI 生成精细帧。
- 所有资源必须被 `td-art-manifest` 引用，并被 `verify-td-art-resources.ts` 校验。

## 阶段总览

| 阶段 | 目标 | 交付物 |
|---|---|---|
| 0 | 设计冻结 | 文档、边界、验收标准 |
| 1 | 核心架构 | `td-session`、类型、状态机、测试 |
| 2 | 地图路径生命 | 地图配置、路径移动、漏怪扣血 |
| 3 | 波次循环 | 出怪队列、10 波、清波奖励 |
| 4 | 英雄商店合成 | 买英雄、放置、三合一 |
| 5 | 战斗职业 | 索敌、伤害、阻挡、对空 |
| 6 | Cocos UI | 地图层、HUD、商店、开波 |
| 7 | AI 美术动画 | 帧图、动画、地图元素、资源校验 |
| 8 | 队长技能 VFX | 队长、法术、技能特效 |
| 9 | 五关内容 | 5 关 50 波、完整敌人 |
| 10 | 收口发布 | 存档、测试、性能、Web 冒烟 |
