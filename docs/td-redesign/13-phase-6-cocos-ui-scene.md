# 13 阶段 6：Cocos UI 和场景接入

## 阶段目标

把 TD 逻辑接入 Cocos 画面，让玩家能通过 UI 完成第一关：买英雄、放塔位、开波、看敌人移动和战斗、胜利或失败。


## 每阶段固定要求

每个阶段提交必须包含：

1. 代码或文档变更清单。
2. 自动化测试。
3. 人工验收步骤。
4. 回退方案。
5. 下一阶段前置条件。
6. 不修改无关旧主线。


## 新增文件

```text
assets/scripts/ui/controllers/td-map-controller.ts
assets/scripts/ui/controllers/td-hud-controller.ts
assets/scripts/ui/controllers/td-prep-panel-controller.ts
assets/scripts/ui/controllers/td-command-bar-controller.ts
assets/scripts/ui/controllers/td-result-controller.ts
assets/scripts/ui/views/td-hero-view.ts
assets/scripts/ui/views/td-enemy-view.ts
assets/scripts/ui/views/td-projectile-view.ts
assets/scripts/ui/views/td-vfx-view.ts
```

## 主流程接入

在 `battle-scene-controller.ts` 或主菜单控制器中加：

```text
开始小队模式
开始塔防模式
```

MVP 可直接进入第一关，不做关卡选择。

## UI 布局

1280x720 横屏：

| 区域 | 位置 | 内容 |
|---|---|---|
| 顶部 HUD | y=660 | 生命、金币、波次、下一波预告 |
| 地图区 | 中央 | 背景、路径、塔位、敌人、英雄 |
| 左侧/底部面板 | 下方 | 商店 3 格、刷新、出售 |
| 右侧技能栏 | 右侧 | 队长技能、法术 |
| 结果层 | 居中 | 胜利/失败 |

## 交互规则

1. 点击商店英雄购买。
2. 点击背包英雄选中。
3. 点击空塔位放置。
4. 点击塔位英雄选中。
5. 点击出售按钮出售。
6. 点击开始下一波。
7. 战斗中禁用放置和出售。
8. 按钮绑定同时使用 `Button.EventType.CLICK` 和 `Node.EventType.TOUCH_END`，防点击失效。

## 视图任务

### td-map-controller

负责：

- 绘制地图背景。
- 绘制路径可选 overlay。
- 绘制塔位。
- 根据 snapshot 创建/更新敌人 view。
- 根据 snapshot 创建/更新英雄 view。
- 绘制弹道和 VFX。

### td-hud-controller

显示：

- 生命。
- 金币。
- 当前波次。
- 剩余敌人。
- phase 文案。
- 下一波预告。

### td-prep-panel-controller

显示：

- 商店 3 格。
- 背包。
- 当前选中英雄信息。
- 刷新、出售、撤回。
- 三合一提示。

## 测试任务

新增 `tools/run-td-web-e2e.js`：

- 打开 Web。
- 点击塔防模式。
- 购买第一个英雄。
- 点击第一个塔位。
- 点击开始下一波。
- 等待敌人出现。
- 截图保存。
- 验证 HUD 有生命/金币/波次。

## 验收

玩家不看控制台，能完整玩第一关。
