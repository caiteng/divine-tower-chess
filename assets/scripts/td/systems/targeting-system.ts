import type { TDEnemyInstanceState, TDHeroConfig, TDTargetPriority, TDTowerSlotState, TDVec2 } from '../types';

function dist(a: TDVec2, b: TDVec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class TDTargetingSystem {
  public findTarget(
    heroConfig: TDHeroConfig,
    heroPosition: TDVec2,
    enemies: TDEnemyInstanceState[],
    priority: TDTargetPriority,
  ): TDEnemyInstanceState | undefined {
    const candidates = enemies.filter((enemy) => {
      if (!enemy.alive || enemy.leaked) return false;
      if (enemy.tags.includes('air') && !heroConfig.canAttackAir) return false;
      return dist(heroPosition, enemy.position) <= heroConfig.attackRange;
    });

    if (!candidates.length) return undefined;

    return [...candidates].sort((a, b) => {
      if (priority === 'last') return a.pathProgress - b.pathProgress;
      if (priority === 'strong') return b.currentHp - a.currentHp;
      if (priority === 'fast') return b.speed - a.speed;
      if (priority === 'air') {
        const airDiff = Number(b.tags.includes('air')) - Number(a.tags.includes('air'));
        if (airDiff !== 0) return airDiff;
      }
      return b.pathProgress - a.pathProgress;
    })[0];
  }

  public findSlotForHero(slots: TDTowerSlotState[], heroInstanceId: string): TDTowerSlotState | undefined {
    return slots.find((slot) => slot.occupiedBy === heroInstanceId);
  }

  public distance(a: TDVec2, b: TDVec2): number {
    return dist(a, b);
  }
}
