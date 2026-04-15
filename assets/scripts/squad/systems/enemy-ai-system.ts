import { ENEMY_STATS } from '../config/squad-battle-config';
import { EnemyUnitState, SquadUnitState } from '../types';
import { distance, normalize } from './math';

export class EnemyAiSystem {
  public tick(enemies: EnemyUnitState[], allies: SquadUnitState[], dt: number): void {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      enemy.attackCooldownLeft = Math.max(0, enemy.attackCooldownLeft - dt);

      const target = this.pickNearestAliveAlly(enemy, allies);
      if (!target) {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        continue;
      }

      const cfg = ENEMY_STATS[enemy.enemyType];
      const dist = distance(enemy.position, target.position);
      if (dist <= cfg.attackRange) {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        if (enemy.attackCooldownLeft <= 0) {
          target.currentHp = Math.max(0, target.currentHp - cfg.attackDamage);
          target.alive = target.currentHp > 0;
          enemy.attackCooldownLeft = cfg.attackInterval;
        }
      } else {
        const dir = normalize(enemy.position, target.position);
        enemy.velocity.x = dir.x * cfg.moveSpeed;
        enemy.velocity.y = dir.y * cfg.moveSpeed;
        enemy.position.x += enemy.velocity.x * dt;
        enemy.position.y += enemy.velocity.y * dt;
      }
    }
  }

  private pickNearestAliveAlly(enemy: EnemyUnitState, allies: SquadUnitState[]): SquadUnitState | undefined {
    return allies
      .filter((ally) => ally.alive)
      .map((ally) => ({ ally, dist: distance(enemy.position, ally.position) }))
      .sort((a, b) => a.dist - b.dist)[0]?.ally;
  }
}
