# 17 阶段 10：存档、测试、性能、发布收口

## 阶段目标

把 Alpha 从“能玩”变成“稳定可迭代”。重点是存档、自动化测试、Web 冒烟、性能优化和发布检查。


## 每阶段固定要求

每个阶段提交必须包含：

1. 代码或文档变更清单。
2. 自动化测试。
3. 人工验收步骤。
4. 回退方案。
5. 下一阶段前置条件。
6. 不修改无关旧主线。


## 存档任务

新增或扩展：

```text
assets/scripts/td/systems/td-save-system.ts
assets/scripts/core/local-profile-storage.ts
```

存档字段：

- schemaVersion
- stageId
- difficulty
- phase
- life
- gold
- waveIndex
- shop
- bench
- deployed
- towerSlots
- captain
- cooldowns
- unlockedStages
- bestScores

要求：

- 版本不兼容时安全丢弃，不崩溃。
- 保存失败时提示但不阻塞游戏。
- 刷新页面后能恢复关卡。

## 测试任务

`verify-td-rules.ts` 最终覆盖：

- 路径。
- 生命。
- 波次。
- 商店。
- 放置。
- 三合一。
- 战斗。
- 对空。
- AOE。
- 阻挡。
- 治疗。
- 队长。
- 技能冷却。
- 存档。
- 五关配置。

## Web 冒烟

`run-td-web-e2e.js` 覆盖：

1. 打开游戏。
2. 进入塔防模式。
3. 选择第一关。
4. 购买英雄。
5. 放置塔位。
6. 开始第一波。
7. 等待敌人出现。
8. 截图。
9. 触发一波结束或失败。
10. 验证没有 console error。

## 性能任务

- 敌人 view 对象池。
- 弹道 view 对象池。
- VFX view 对象池。
- SpriteFrame 缓存。
- 死亡敌人延迟释放。
- 最大同屏敌人 80。
- 最大同屏弹道 120。
- VFX TTL 自动清理。

## 性能指标

| 平台 | 目标 |
|---|---|
| Web Chrome | 60 FPS，80 敌人不卡死 |
| 中端 Android | 30 FPS 以上 |
| 低端机 | 降低 VFX 后可玩 |

## 发布检查

- `npm test` 通过。
- `verify:td` 通过。
- `verify:td-art` 通过。
- `verify:td-web` 通过。
- 资源无未引用大文件。
- 存档可升级。
- 无明显 UI 裁切。
- 无按钮点击失效。
- 无波次卡死。
