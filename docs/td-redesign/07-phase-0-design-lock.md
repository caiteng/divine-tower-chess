# 07 阶段 0：设计冻结

## 阶段目标

冻结塔防改造的范围、目录、资源规范、角色规格、敌人规格、地图规格和 AI 执行模板。此阶段不写玩法代码，不接 UI，不生成运行时资源。

## 本阶段交付物

| 文件 | 目的 |
|---|---|
| `00-repo-audit-and-goal.md` | 明确仓库现状和 TD 改造边界 |
| `01-product-gdd-core-loop.md` | 固定核心玩法循环 |
| `02-technical-architecture.md` | 固定代码目录与模块边界 |
| `03-art-style-and-ai-asset-pipeline.md` | 固定美术尺寸、帧数、命名 |
| `04-hero-character-spec.md` | 固定英雄职业规格 |
| `05-enemy-and-boss-spec.md` | 固定敌人与 Boss 规格 |
| `06-stage-map-and-wave-design.md` | 固定 5 关地图与波次方向 |
| `18-ai-task-prompts.md` | 固定后续 AI 开发提示词 |
| `20-acceptance-checklists.md` | 固定阶段验收清单 |
| `tools/verify-td-design-docs.ts` | 校验阶段 0 文档完整性 |

## AI 开发约束

- 每次只做一个阶段。
- 不允许直接删除 `assets/scripts/squad/**`。
- 不允许复制商业竞品美术。
- 不允许给半截文件。
- 每次交付必须包含完整文件内容。
- 每次交付必须附测试步骤。
- 代码阶段必须能通过 `npm test` 或对应阶段的验证脚本。
- 资源阶段必须附 manifest 和校验脚本。

## 阶段 0 验收命令

```bash
npx tsx tools/verify-td-design-docs.ts
```

## 人工验收

打开 `docs/td-redesign/00` 到 `06`，确认职业、敌人、地图、资源尺寸都写清楚；打开 `18-ai-task-prompts.md`，确认每阶段提示词可以复制给 AI；运行文档校验脚本；确认没有修改旧主线代码。

## 回退方案

删除 `docs/td-redesign/**` 和 `tools/verify-td-design-docs.ts`，不会影响现有游戏运行。
