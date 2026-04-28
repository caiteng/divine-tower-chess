import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import type { BattleEffectState, EnemyUnitState, SquadUnitState } from '../types';
import { distance } from './math';

const clampPierce = (pierceRatio: number): number => Math.max(0, Math.min(0.9, pierceRatio));
const ATTACK_RELEASE_FEEDBACK_TIME = 0.22;

export function scaleArmorPierce(basePierceRatio: number, star: 1 | 2 | 3): number {
  return clampPierce(basePierceRatio + (star - 1) * 0.12);
}

export function applyArmor(rawDamage: number, armor: number, armorPierceRatio = 0): number {
  if (rawDamage <= 0) return 0;
  const effectiveArmor = armor * (1 - clampPierce(armorPierceRatio));
  return Math.max(1, Math.round(rawDamage - effectiveArmor));
}

export class AttackSystem {
  public attackIfPossible(attacker: SquadUnitState, target: EnemyUnitState, enemies: EnemyUnitState[] = []): { attacked: boolean; killed: boolean; kills: number; effects: Omit<BattleEffectState, 'id' | 'age'>[] } {
    if (!attacker.alive || !target.alive) return { attacked: false, killed: false, kills: 0, effects: [] };

    const cfg = SQUAD_UNIT_STATS[attacker.unitId];
    const scaledDamage = cfg.attackDamage * (1 + (attacker.star - 1) * 0.8);
    if (scaledDamage <= 0) return { attacked: false, killed: false, kills: 0, effects: [] };
    if (attacker.attackCooldownLeft > 0) return { attacked: false, killed: false, kills: 0, effects: [] };

    const dist = distance(attacker.position, target.position);
    if (dist > cfg.attackRange) return { attacked: false, killed: false, kills: 0, effects: [] };

    const effects: Omit<BattleEffectState, 'id' | 'age'>[] = [];
    if (attacker.role === 'ranged') {
      effects.push({ kind: 'projectile', from: { ...attacker.position }, to: { ...target.position }, ttl: 0.22, variant: attacker.unitId === 'archer' ? 'archer_normal' : undefined });
    }

    const primary = this.applyDamage(target, scaledDamage, scaleArmorPierce(cfg.armorPierceRatio, attacker.star));
    effects.push({ kind: 'damage', to: { ...target.position }, value: primary.damage, ttl: 0.75 });
    if (attacker.unitId === 'archer') {
      effects.push({ kind: 'archer_hit', to: { ...target.position }, ttl: 0.32, variant: 'archer_normal' });
    }
    const killedPrimary = primary.killed;
    if (killedPrimary) {
      effects.push({ kind: 'death', to: { ...target.position }, ttl: 0.62 });
    }
    let kills = killedPrimary ? 1 : 0;
    if ((cfg.splashRadius ?? 0) > 0 && (cfg.splashDamageRatio ?? 0) > 0) {
      for (const enemy of enemies) {
        if (enemy === target || !enemy.alive) continue;
        if (distance(target.position, enemy.position) > (cfg.splashRadius ?? 0)) continue;
        const splash = this.applyDamage(enemy, scaledDamage * (cfg.splashDamageRatio ?? 0), scaleArmorPierce(cfg.armorPierceRatio, attacker.star));
        effects.push({ kind: 'damage', to: { ...enemy.position }, value: splash.damage, ttl: 0.75 });
        if (splash.killed) {
          effects.push({ kind: 'death', to: { ...enemy.position }, ttl: 0.62 });
          kills += 1;
        }
      }
    }
    attacker.attackCooldownLeft = cfg.attackInterval;
    attacker.attackReleaseTimeLeft = ATTACK_RELEASE_FEEDBACK_TIME;
    return { attacked: true, killed: killedPrimary, kills, effects };
  }

  private applyDamage(target: EnemyUnitState, rawDamage: number, armorPierceRatio: number): { killed: boolean; damage: number } {
    const targetArmor = ENEMY_STATS[target.enemyType].armor;
    const finalDamage = applyArmor(rawDamage, targetArmor, armorPierceRatio);
    target.currentHp = Math.max(0, target.currentHp - finalDamage);
    target.alive = target.currentHp > 0;
    return { killed: !target.alive, damage: finalDamage };
  }
}
