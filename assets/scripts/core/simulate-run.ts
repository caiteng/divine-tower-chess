import { GameController } from './game-controller';

declare const require: { main?: unknown } | undefined;
declare const module: unknown;

export function simulateBeginnerRun(): ReturnType<GameController['snapshot']> {
  const controller = new GameController();
  controller.startGame('beginner');

  for (let safety = 0; safety < 200 && ['win', 'lose'].includes(controller.snapshot().phase) === false; safety += 1) {
    const prep = controller.snapshot();
    if (prep.phase === 'prep') {
      // 简单自动化策略：尽量买，按部署锚点顺序铺满可用部署位。
      for (let i = 0; i < 3; i += 1) {
        controller.buy(0);
      }

      const bench = controller.snapshot().bench;
      for (const unit of bench) {
        const anchors = controller.snapshot().deploymentAnchors;
        for (const anchor of anchors) {
          if (controller.place(unit.instanceId, anchor.id)) {
            break;
          }
        }
      }
      controller.beginBattle();
    }

    if (controller.snapshot().phase === 'battle') {
      for (let i = 0; i < 1000 && controller.snapshot().phase === 'battle'; i += 1) {
        controller.tick(0.2);
      }
    }
  }

  return controller.snapshot();
}

if (typeof require !== 'undefined' && require.main === module) {
  console.log(JSON.stringify(simulateBeginnerRun(), null, 2));
}
