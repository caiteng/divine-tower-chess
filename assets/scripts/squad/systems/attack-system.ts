import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import type { EnemyUnitState, SquadUnitState } from '../types';
import { distance } from './math';

const clampPierce = (pierceRatio: number): number => Math.max(0, Math.min(0.9, pierceRatio));

export function scaleArmorPierce(basePierceRatio: number, star: 1 | 2 | 3): number {
  return clampPierce(basePierceRatio + (star - 1) * 0.12);
}

export function applyArmor(rawDamage: number, armor: number, armorPierceRatio = 0): number {
  if (rawDamage <= 0) return 0;
  const effectiveArmor = armor * (1 - clampPierce(armorPierceRatio));
  return Math.max(1, Math.round(rawDamage - effectiveArmor));
}

export class AttackSystem {
  public attackIfPossible(attacker: SquadUnitState, target: EnemyUnitState): { attacked: boolean; killed: boolean } {
    if (!attacker.alive || !target.alive) return { attacked: false, killed: false };

    const cfg = SQUAD_UNIT_STATS[attacker.unitId];
    const scaledDamage = cfg.attackDamage * (1 + (attacker.star - 1) * 0.8);
    if (scaledDamage <= 0) return { attacked: false, killed: false };
    if (attacker.attackCooldownLeft > 0) return { attacked: false, killed: false };

    const dist = distance(attacker.position, target.position);
    if (dist > cfg.attackRange) return { attacked: false, killed: false };

    const targetArmor = ENEMY_STATS[target.enemyType].armor;
    const finalDamage = applyArmor(scaledDamage, targetArmor, scaleArmorPierce(cfg.armorPierceRatio, attacker.star));
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    target.alive = target.currentHp > 0;
    attacker.attackCooldownLeft = cfg.attackInterval;
    return { attacked: true, killed: !target.alive };
  }
}
