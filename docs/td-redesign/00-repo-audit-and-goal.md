# 00 仓库现状与改造目标

## 1. 当前仓库进展判断

当前项目不是空壳，而是已经具备一条可运行的 Cocos + TypeScript 游戏主线。现有主线是 Battleheart 风格小队实时战斗，不是塔防。仓库当前值得保留的资产包括：

| 已有资产 | 当前作用 | 塔防改造价值 |
|---|---|---|
| `assets/scripts/squad/squad-battle-session.ts` | 运行时会话、阶段、tick、快照、保存/读取 | 设计思想可复用，但塔防战斗目标要重写 |
| `assets/scripts/ui/battle-scene-controller.ts` | 主菜单、职业选择、准备页、战场 HUD 编排 | 可以加“塔防模式”入口 |
| `assets/scripts/ui/controllers/prep-panel-controller.ts` | 商店、备战、上阵、按钮保护 | 可改造成塔防商店/背包/放置面板 |
| `assets/scripts/ui/controllers/battlefield-controller.ts` | 战场背景、单位/敌人视图、点击 | 可改造成地图/路径/塔位渲染 |
| `assets/scripts/systems/economy-system.ts` | 金币加减 | 可复用 |
| `assets/scripts/systems/shop-system.ts` | 三格商店刷新 | 可复用或复制为 TD 版 |
| `assets/scripts/squad/systems/roster-system.ts` | 备战区、上阵区、3 合 1 | 高度适合塔防三合一 |
| `tools/verify-squad-rules.ts` | 规则回归测试 | 建议复制思想为 `verify-td-rules.ts` |
| `tools/verify-art-resources.ts` | 资源校验 | 建议扩展为 TD 资源校验 |
| `tools/run-web-e2e.js` | Web 冒烟 | 后续加 TD 冒烟链路 |
| `assets/scripts/ui/resources/sprite-resolvers.ts` | 资源加载 resolver | 保留路径协议，扩展 TD 资源 |

## 2. 不能直接复用的内容

当前系统缺少塔防核心概念：

- 固定路径
- 路径进度
- 漏怪扣生命
- 塔位
- 飞行路线
- 波次出怪队列
- 敌人抗性体系
- 对空/潜行/重甲
- 半固定英雄驻守
- 队长英雄驻守点
- 地图背景和关卡元素

因此改造不是“修补当前战斗”，而是新增 `td` 主线。

## 3. 新玩法目标

目标产品是“放置合成塔防”：

```text
选择关卡 -> 选择队长 -> 准备阶段购买英雄 -> 放置到塔位 -> 三合一升星 -> 开始波次 -> 敌人沿路径推进 -> 英雄自动攻击/阻挡 -> 队长/法术手动释放 -> 清波结算 -> 第 10 波胜利或生命归零失败
```

## 4. 核心特色

| 特色 | 说明 |
|---|---|
| 10 点生命制 | 每关固定 10 点生命，漏怪扣血 |
| 三合一升星 | 三个同职业同星级合成下一星 |
| 半固定塔位 | 地图上固定 8-12 个塔位，保留读图策略 |
| 英雄职业 | 弓箭手、法师、战士、骑士、刺客、牧师等 |
| 队长英雄 | 队长不占塔位，可释放主动技能 |
| AI 美术管线 | 由 AI 生成原创占位角色帧、敌人帧、地图元素 |
| 自动校验 | 所有规则和资源必须可脚本验证 |

## 5. 分支建议

```text
main                      当前稳定主线
codex/td-design-roadmap   文档设计
codex/td-mvp-runtime      阶段 1-5 逻辑
codex/td-cocos-ui         阶段 6 UI
codex/td-ai-art-pipeline  阶段 7 资源
codex/td-alpha-content    阶段 8-10 内容与收口
```

## 6. 成功标准

MVP 成功标准：

- 第一关能完整玩。
- 10 波敌人能出完。
- 敌人能沿路径移动并漏怪扣血。
- 玩家能购买英雄、放置塔位、三合一升星。
- 英雄能攻击、阻挡、对空、AOE。
- 能胜利或失败。
- 有原创占位帧图和地图背景。
- `npm test` 和 TD 规则测试通过。

Alpha 成功标准：

- 5 关、50 波、8 类敌人。
- 3 个队长英雄。
- 所有基础职业有帧动画。
- 第一轮数值平衡完成。
- Web 冒烟覆盖 TD 主流程。
