# 22 阶段 1-10 一体化实现说明

## 实现范围

本包实现了可测试的塔防模式骨架，覆盖阶段 1 到阶段 10：

1. Runtime 核心。
2. 地图、路径、生命。
3. 波次循环。
4. 商店、放置、三合一。
5. 战斗系统和职业差异。
6. Cocos UI 控制器与视图。
7. 占位 PNG、帧动画目录和资源校验。
8. 队长技能和 VFX 事件。
9. 五关和 50 波配置。
10. 存档、测试、性能基础收口。

## 关键入口

```ts
import { TowerDefenseSession } from './assets/scripts/td/td-session';

const session = new TowerDefenseSession({
  stageId: 'stage_1_forest_loop',
  difficulty: 'normal',
  captainId: 'archer',
});

session.startNextWave();
session.tick(1 / 60);
const snapshot = session.getSnapshot();
```

## 资源说明

`assets/resources/textures/td/**` 下的 PNG 是程序生成的原创占位图，主要用于跑通资源链、manifest 和 Cocos resources 目录结构。后续阶段可以保持同名替换为 AI 精修帧图。

## 测试命令

```bash
npm run typecheck
npm run verify:td
npm run verify:td-art
npm test
```

## 未强制做的事情

本包不强制修改已有 Cocos 场景和旧的 `BattleSceneController`。这是为了避免直接破坏现有小队战斗主线。TD UI 控制器已经提供，可在 Cocos 场景里新建节点挂载或后续再接入主菜单模式选择。
