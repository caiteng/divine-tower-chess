# PLANS.md

## 当前状态（2026-04-27）

- 项目主线是 Cocos Creator + TypeScript 可玩原型：Battleheart 风格 2D 小队实时命令战斗 + 商店 / 金币 / 3 合 1 升星 / 实例级神品任务。
- 正式入口流程：`主菜单 -> 职业选择 -> 准备阶段 -> 战斗阶段`。
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
- 商店硬规则已覆盖：回合开始自动刷新、每次 3 个单位、购买失败不吞槽位。
- 升星硬规则已覆盖：1 星 3 合 1 到 2 星，2 星 3 合 1 到 3 星，3 星不再普通合成。
- 神品任务硬规则已覆盖：实例级任务、实例级进度、每个 3 星非神品单位独立 10% 掷点、带任务单位不被普通合成消耗。
- 牧师行为已保持命令驱动：不攻击，只在显式命令友军后持续治疗；治疗进度只统计实际恢复 HP。
- 战场表现已接入职业/敌人贴图、动作帧、选中光圈、命令线、目标点和准备面板战斗阶段隐藏。

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

## 手动验证步骤

1. 在 Cocos Creator 中打开项目并执行 Preview。
2. 从主菜单点击开始，选择任意职业进入准备阶段。
3. 确认商店显示 3 个单位，金币、备战区、上阵区显示正常。
4. 购买并上阵至少 1 名单位，开始下一波。
5. 战斗中点击己方单位，分别点地面、敌人、友军，确认移动 / 集火 / 治疗命令反馈正常。
6. 跑完至少一波，确认战斗结束后回到准备阶段且准备面板恢复可操作。

## 下一步

1. 在 Cocos 编辑器 Preview 中手动跑完至少一波完整胜负循环。
2. 若 Preview 正常，继续做准备面板节点复用，减少准备阶段 UI 全量重建。
3. 若继续改善战斗画面，优先处理隐藏准备面板后的下半屏表现和战斗日志区。
