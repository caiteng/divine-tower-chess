import { SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import type { EnemyUnitState, SquadUnitState } from '../types';
import { distance } from './math';

export class AttackSystem {
  public attackIfPossible(attacker: SquadUnitState, target: EnemyUnitState): { attacked: boolean; killed: boolean } {
    if (!attacker.alive || !target.alive) return { attacked: false, killed: false };

    const cfg = SQUAD_UNIT_STATS[attacker.unitId];
    const scaledDamage = cfg.attackDamage * (1 + (attacker.star - 1) * 0.8);
    if (scaledDamage <= 0) return { attacked: false, killed: false };
    if (attacker.attackCooldownLeft > 0) return { attacked: false, killed: false };

    const dist = distance(attacker.position, target.position);
    if (dist > cfg.attackRange) return { attacked: false, killed: false };

    target.currentHp = Math.max(0, target.currentHp - scaledDamage);
    target.alive = target.currentHp > 0;
    attacker.attackCooldownLeft = cfg.attackInterval;
    return { attacked: true, killed: !target.alive };
  }
}
