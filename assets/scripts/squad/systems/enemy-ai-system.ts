import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import type { BattleEffectState, EnemyUnitState, SquadUnitState } from '../types';
import { applyArmor } from './attack-system';
import { distance, normalize } from './math';

export class EnemyAiSystem {
  public tick(enemies: EnemyUnitState[], allies: SquadUnitState[], dt: number): Omit<BattleEffectState, 'id' | 'age'>[] {
    const effects: Omit<BattleEffectState, 'id' | 'age'>[] = [];
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
          const targetArmor = SQUAD_UNIT_STATS[target.unitId].armor;
          const damage = applyArmor(cfg.attackDamage, targetArmor);
          target.currentHp = Math.max(0, target.currentHp - damage);
          target.hurtTimeLeft = 0.34;
          target.alive = target.currentHp > 0;
          enemy.attackCooldownLeft = cfg.attackInterval;
          effects.push({ kind: 'damage', to: { ...target.position }, value: damage, ttl: 0.7 });
        }
      } else {
        const dir = normalize(enemy.position, target.position);
        enemy.velocity.x = dir.x * cfg.moveSpeed;
        enemy.velocity.y = dir.y * cfg.moveSpeed;
        enemy.position.x += enemy.velocity.x * dt;
        enemy.position.y += enemy.velocity.y * dt;
      }
    }
    return effects;
  }

  private pickNearestAliveAlly(enemy: EnemyUnitState, allies: SquadUnitState[]): SquadUnitState | undefined {
    return allies
      .filter((ally) => ally.alive)
      .map((ally) => ({ ally, score: distance(enemy.position, ally.position) * this.getTauntMultiplier(ally) }))
      .sort((a, b) => a.score - b.score)[0]?.ally;
  }

  private getTauntMultiplier(ally: SquadUnitState): number {
    if (ally.unitId === 'shield_guard') return 0.52;
    if (ally.role === 'priest') return 1.18;
    if (ally.role === 'ranged') return 1.08;
    return 1;
  }
}
