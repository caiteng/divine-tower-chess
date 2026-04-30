# 00 仓库现状与改造目标

## 1. 当前仓库状态

当前项目已经不是空仓库。它已有一条可运行的小队实时战斗主线：

```text
assets/scripts/squad/*
assets/scripts/squad/squad-battle-session.ts
assets/scripts/ui/battle-scene-controller.ts
assets/scripts/ui/controllers/*
assets/scripts/ui/resources/sprite-resolvers.ts
tools/verify-squad-rules.ts
tools/verify-art-resources.ts
tools/run-web-e2e.js
```

当前能力：

| 能力 | 当前状态 | 塔防改造价值 |
|---|---|---|
| 主菜单 | 已有 | 可扩展模式选择 |
| 职业选择 | 已有 | 可复用为队长选择 |
| 准备/战斗阶段 | 已有 | 可迁移为塔防准备/开波 |
| 商店 | 已有 | 迁移为守卫英雄商店 |
| 金币 | 已有 | 迁移为局内经济 |
| 三合一 | 已有 | 作为塔防升星核心 |
| 本地存档 | 已有 | 扩展 TD 存档 |
| 资源 resolver | 已有 | 扩展 td 资源路径 |
| 规则校验 | 已有 | 新增 verify-td-rules |
| Web 冒烟 | 已有 | 新增 run-td-web-e2e |

## 2. 当前不能直接复用的内容

现有战斗是“小队生存制”，不是塔防。以下必须重写或新增：

| 系统 | 原状态 | TD 目标 |
|---|---|---|
| 敌人目标 | 攻击我方小队 | 沿路径到终点漏怪 |
| 地图 | 自由战场 | 固定路径 + 塔位 |
| 生命 | 我方单位生命 | 关卡 10 点生命 |
| 波次 | 敌人批量生成 | 队列出怪 + 清波奖励 |
| 放置 | 上阵区/备战区 | 塔位放置 |
| 战斗 | 自由移动接敌 | 范围索敌、阻挡、对空 |
| 胜负 | 小队死光/杀光敌人 | 生命归零/第 10 波清完 |

## 3. 改造目标

目标产品是横屏 2D 放置合成塔防：

- 单屏固定镜头。
- 1280x720 逻辑分辨率。
- 每关 10 点生命。
- 每关 10 波。
- 敌人沿路径推进。
- 玩家在塔位放置英雄。
- 三个同职业同星级英雄合成一个高星英雄。
- 队长英雄负责主动技能和全局战术。
- 守卫英雄自动攻击。
- AI 生成原创占位图与帧动画，后续可逐步替换为精修美术。

## 4. 改造边界

必须新建：

```text
assets/scripts/td/**
assets/scripts/ui/controllers/td-*.ts
assets/scripts/ui/views/td-*.ts
assets/resources/textures/td/**
tools/verify-td-rules.ts
tools/verify-td-art-resources.ts
tools/generate-td-placeholder-art.ts
tools/run-td-web-e2e.js
```

阶段 0 到阶段 5 禁止删除：

```text
assets/scripts/squad/**
assets/scripts/ui/controllers/prep-panel-controller.ts
assets/scripts/ui/controllers/battlefield-controller.ts
tools/verify-squad-rules.ts
```

## 5. MVP 成功定义

MVP 完成时，玩家应能进入塔防模式、选择第一关、获得 10 点生命和起始金币、购买英雄、把英雄放到塔位、三合一升星、点击开始下一波、看见敌人沿路径移动、英雄自动攻击、漏怪扣血、第 10 波清完胜利、生命归零失败。
