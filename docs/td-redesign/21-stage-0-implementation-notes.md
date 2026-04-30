# 21 阶段 0 实施说明

## 本次包的作用

本包把塔防改造的设计规范完整落地到仓库文档中，为后续阶段提供统一依据。后续 AI 写代码时，应优先读取这些文档，不再临时发明职业、敌人、地图、资源尺寸和目录。

## 为什么阶段 0 不写玩法代码

如果阶段 0 直接写代码，后续会出现：

- 英雄动作帧命名不统一。
- 敌人机制前后冲突。
- 地图坐标和 UI 不匹配。
- AI 生成资源尺寸混乱。
- 三合一和队长成长边界不清楚。
- 测试不知道按什么规则断言。

所以阶段 0 只做设计冻结和验证脚本。

## 和阶段 1 的关系

阶段 1 读取本阶段文档后，只实现 Runtime 核心：`types.ts`、`td-session.ts`、基础配置、基础测试。阶段 1 不应该做地图、不应该做资源、不应该做 UI。

## 本地提交建议

```bash
git checkout -b td-stage-00-design-lock
cp -R repo-files/* .
npx tsx tools/verify-td-design-docs.ts
git add docs/td-redesign tools/verify-td-design-docs.ts
git commit -m "Add tower defense design lock docs"
```
