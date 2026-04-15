import { EnemyUnitState, SquadUnitState } from '../types';
import { distance } from './math';

export class TargetingSystem {
  public findNearestEnemyInRange(unit: SquadUnitState, enemies: EnemyUnitState[], range: number): EnemyUnitState | undefined {
    return enemies
      .filter((enemy) => enemy.alive)
      .map((enemy) => ({ enemy, dist: distance(unit.position, enemy.position) }))
      .filter((entry) => entry.dist <= range)
      .sort((a, b) => a.dist - b.dist)[0]?.enemy;
  }

  public findEnemyById(enemyId: string, enemies: EnemyUnitState[]): EnemyUnitState | undefined {
    return enemies.find((enemy) => enemy.instanceId === enemyId && enemy.alive);
  }

  public findAllyById(allyId: string, allies: SquadUnitState[]): SquadUnitState | undefined {
    return allies.find((ally) => ally.instanceId === allyId && ally.alive);
  }
}
