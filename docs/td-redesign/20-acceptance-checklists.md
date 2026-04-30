# 20 阶段验收 Checklist

## 阶段 0：设计冻结

- [ ] `00-repo-audit-and-goal.md` 存在
- [ ] `01-product-gdd-core-loop.md` 存在
- [ ] `02-technical-architecture.md` 存在
- [ ] `03-art-style-and-ai-asset-pipeline.md` 存在
- [ ] `04-hero-character-spec.md` 存在
- [ ] `05-enemy-and-boss-spec.md` 存在
- [ ] `06-stage-map-and-wave-design.md` 存在
- [ ] `07-phase-0-design-lock.md` 存在
- [ ] `18-ai-task-prompts.md` 存在
- [ ] `20-acceptance-checklists.md` 存在
- [ ] `tools/verify-td-design-docs.ts` 存在
- [ ] `npx tsx tools/verify-td-design-docs.ts` 通过
- [ ] 没有修改 `assets/scripts/squad/**`

## 阶段 1：Runtime 核心

- [ ] `assets/scripts/td/types.ts`
- [ ] `assets/scripts/td/td-session.ts`
- [ ] `tools/verify-td-rules.ts`
- [ ] 新局 10 生命
- [ ] 新局 phase 为 prep
- [ ] startNextWave 改变 phase
- [ ] damageLife 到 0 进入 defeat

## 阶段 2：地图路径生命

- [ ] 第一关地图配置
- [ ] 地面路径
- [ ] 飞行路径
- [ ] 8 个塔位
- [ ] 敌人能移动
- [ ] 漏怪扣血
- [ ] Boss 漏怪扣 3

## 阶段 3：波次循环

- [ ] 10 波配置
- [ ] 按间隔出怪
- [ ] 清波奖励
- [ ] 第 10 波胜利
- [ ] 生命归零失败

## 阶段 4：商店放置三合一

- [ ] 商店 3 格
- [ ] 购买
- [ ] 刷新
- [ ] 放置塔位
- [ ] 召回
- [ ] 出售
- [ ] 1 星三合一到 2 星
- [ ] 2 星三合一到 3 星

## 阶段 5：战斗职业

- [ ] 弓箭手对空
- [ ] 法师 AOE
- [ ] 战士阻挡
- [ ] 骑士嘲讽/高阻挡
- [ ] 刺客侦测/爆发
- [ ] 牧师治疗
- [ ] 护甲和魔抗生效

## 阶段 6：Cocos UI

- [ ] 塔防模式入口
- [ ] 地图显示
- [ ] HUD 生命/金币/波次
- [ ] 商店面板
- [ ] 塔位点击
- [ ] 开波按钮
- [ ] 胜负显示

## 阶段 7：AI 资源

- [ ] 地图背景
- [ ] 英雄头像
- [ ] 英雄 idle/attack/hurt/death
- [ ] 敌人 move/hit/death
- [ ] UI 图标
- [ ] manifest
- [ ] 资源校验通过
