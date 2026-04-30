
# 21 阶段 1 交付说明：塔防 Runtime 核心

## 本包目标

本包实现 `docs/td-redesign/08-phase-1-runtime-core.md` 对应的第一阶段：新增独立 `TowerDefenseSession`、基础类型、配置和规则测试。

## 本包不做

- 不接入 Cocos UI。
- 不生成图片资源。
- 不实现路径、塔位、波次、英雄商店和战斗。
- 不删除或重写 `assets/scripts/squad/**`。

## 新增能力

- `TowerDefenseSession.startNewRun()` 初始化塔防局。
- `TowerDefenseSession.getSnapshot()` 返回 UI 可用快照。
- `TowerDefenseSession.startNextWave()` 从准备阶段进入出怪阶段。
- `TowerDefenseSession.tick()` 推进 phase-1 stub 逻辑。
- `damageLife()`、`addGold()`、`spendGold()`、`isTerminal()` 可测试。
- `tools/verify-td-rules.ts` 覆盖阶段 1 核心规则。

## 文件清单

```text
package.json
assets/scripts/td/types.ts
assets/scripts/td/td-session.ts
assets/scripts/td/config/td-game-config.ts
assets/scripts/td/config/td-stage-ids.ts
assets/scripts/td/systems/td-id.ts
tools/verify-td-rules.ts
docs/td-redesign/21-stage-1-implementation-notes.md
```

## 本地测试

```bash
npm install
npm run typecheck
npm run verify:td
npm test
```

## 下一阶段入口

阶段 2 应在此基础上新增：

```text
assets/scripts/td/config/td-map-config.ts
assets/scripts/td/config/td-enemy-config.ts
assets/scripts/td/systems/enemy-path-system.ts
assets/scripts/td/systems/life-system.ts
```

并让 `td-session.tick()` 开始推进敌人沿路径移动、漏怪扣生命。
