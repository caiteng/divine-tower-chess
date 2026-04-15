# divine-tower-chess

Cocos Creator + TypeScript 原型项目。当前唯一主方向是：**Battleheart 风格 2D 小队实时命令战斗**，并保留成长闭环（商店、金币、3 合 1 升星、3 星实例级神品任务）。

## 项目当前定义

- 唯一战斗主链：`assets/scripts/squad/*`
- 唯一核心会话入口：`assets/scripts/squad/squad-battle-session.ts`
- 当前 UI 入口：`assets/scripts/ui/squad-battle-ui.ts`
- 当前 UI 形态：**原型级浏览器 DOM UI（用于玩法验证）**，不是最终 Cocos 节点 UI 架构

## 当前已完成内容

- 可玩的单局多波原型闭环：准备阶段（商店/购买/上阵）⇄ 战斗阶段（命令驱动）
- 5 人小队上阵上限与跨波流程
- 命令驱动行为约束（远程不前压、近战有限反应、牧师仅按命令持续治疗）
- 商店刷新与金币消耗流程
- 3 合 1 升星（1→2、2→3，3 星不再普通合成）
- 神品任务实例级分配与跨波累计进度
- 规则校验脚本：`assets/scripts/core/verify-squad-rules.ts`

## 当前未完成内容

- 正式 Cocos 节点 UI（替换现有 DOM 原型 UI）
- 正式美术资源接入与表现统一
- 交互手感、反馈细节、可读性打磨
- 更多端到端自动化回归样例

## 如何运行 / 如何验证

```bash
npm install
npm test
```

说明：
- `npm test` 会执行 TypeScript 类型检查 + squad 规则验证脚本。
- 若要在 Cocos 场景里查看当前玩法验证 UI，请挂载 `SquadBattleUi` 组件运行。

## 下一步重点

1. 继续做“交互/可读性打磨”，不扩展新玩法系统。
2. 将 `SquadBattleUi` 从 DOM 原型迁移到正式 Cocos 节点 UI。
3. 在不改变核心规则的前提下接入贴图资源与反馈表现。
