# PLANS.md

## 当前主线状态

- 唯一战斗主链：`assets/scripts/squad/*`
- 唯一核心会话入口：`assets/scripts/squad/squad-battle-session.ts`
- 当前 UI 入口：`assets/scripts/ui/squad-battle-ui.ts`（DOM 原型实现）
- 项目已达到可玩的原型闭环：准备阶段（商店/购买/上阵/升星）⇄ 战斗阶段（命令驱动）
- 波次推进：`prep -> battle -> prep/victory/defeat`
- 成长保留：实例级神品任务进度跨波累计

## 当前阶段已完成

1. README 已同步为当前真实状态（主链、入口、完成度、运行验证、下一步）。
2. `SquadBattleUi` 已完成原型风险清扫：
   - 默认难度为 beginner（不再写死 hard）
   - `bootstrapPrepSquad()` 改为 prototype flag 且默认关闭
   - 用 `update(dt)` 驱动 tick，移除固定 `setInterval`
   - 准备面板事件改为单次绑定 + 事件委托
   - 血条按真实 maxHp（含星级倍率）计算

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
