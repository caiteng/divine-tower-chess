# divine-tower-chess

## 项目定义

`divine-tower-chess` 是一个基于 Cocos Creator + TypeScript 的可玩原型项目。当前唯一主方向是：**Battleheart 风格 2D 小队实时命令战斗**，并保留轻成长闭环（商店、金币、3 合 1 升星、3 星实例级神品任务）。

## 当前状态

- 当前已形成可玩的单局多波原型闭环：准备阶段（商店/购买/上阵）⇄ 战斗阶段（命令驱动）
- 当前唯一战斗主链是 `assets/scripts/squad/*`
- 当前唯一核心会话入口是 `assets/scripts/squad/squad-battle-session.ts`
- 当前验证重点仍是玩法可运行、规则正确、结构可继续扩展

## 核心规则

- 战斗是 2D 连续空间小队战斗，不使用棋盘格路径语义
- 每场最多上阵 5 名角色，敌人主要从右侧刷新，少量可从左侧随机反压
- 回合开始时商店自动刷新，且每次固定展示 3 个单位
- 单位购买消耗金币，购买失败时不能移除商店条目
- 3 个相同 1 星单位可合成 1 个 2 星单位；3 个相同 2 星单位可合成 1 个 3 星单位
- 3 星单位不会继续参与普通升星合成
- 普通升星可从候补区和已上阵单位中找合成候选
- 持有神品任务的单位实例不能被普通升星消耗
- 神品任务按单位实例独立分配与累计，不是职业共享状态
- 每个符合条件的 3 星非神品单位实例会在回合开始时独立进行 10% 神品任务判定
- 牧师没有攻击行为，只能在玩家明确下令后对友军持续治疗
- 无指令状态不能退化为全图自动战斗；远程不会自动前压，近战只做短距离反应与有限追击

## 当前 UI 说明

- 当前 UI 入口文件是 `assets/scripts/ui/squad-battle-ui.ts`
- `squad-battle-ui.ts` 是**原型级 DOM UI**，用于当前玩法验证和调试，不是最终 Cocos 节点 UI
- 当前正式游戏逻辑仍以 `assets/scripts/squad/squad-battle-session.ts` 与相关 systems 为主，UI 只是挂接和展示层

## 已完成 / 未完成

已完成：
- 单局多波战斗流程、胜败分支与跨波重置
- 商店、金币购买、上阵/候补管理
- 1→2→3 星普通升星规则
- 实例级神品任务分配、进度累计与规则校验
- 命令驱动战斗约束（近战/远程/牧师行为边界）
- `npm test` 基线：TypeScript 类型检查 + squad 规则验证

未完成：
- 将 `squad-battle-ui.ts` 原型 DOM UI 迁移为正式 Cocos 节点 UI
- 正式美术资源接入与最小表现统一
- 交互可读性、失败反馈、命令反馈等打磨
- 更多自动化回归样例与工程级稳定性补强

## 运行与验证

```bash
npm install
npm test
```

- `npm test` 会执行 `tsc --noEmit` 与 `tsx assets/scripts/core/verify-squad-rules.ts`
- 若需在当前场景中查看原型玩法 UI，可挂载 `SquadBattleUi` 组件运行
- 当前 `SquadBattleUi` 仅用于原型验证，不能视为最终 UI 架构验收结果

## 项目结构

- `assets/scripts/squad/`：当前主战斗链，包含 `squad-battle-session.ts`、战斗类型与 command-driven systems
- `assets/scripts/ui/`：当前 UI 接入层，`squad-battle-ui.ts` 为原型级 DOM UI
- `assets/scripts/config/`：单位、敌人、波次、难度、神品任务等配置
- `assets/scripts/core/`：规则验证、模拟与旧主链遗留核心脚本
- `assets/scripts/utils/`：ID、随机数等通用工具
- `assets/scripts/models/`、`assets/scripts/types/`：基础模型与类型声明

## 下一步重点

1. 先继续做“交互 / 可读性打磨”，不扩展新玩法系统。
2. 规划并执行 `squad-battle-ui.ts` 向正式 Cocos 节点 UI 的迁移。
3. 在不改核心规则的前提下补资源接线与最小回归验证。
