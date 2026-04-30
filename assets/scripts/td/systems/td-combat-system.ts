import { getScaledTDHeroConfig } from '../config/td-hero-config';
import type { TDEffectState, TDEnemyInstanceState, TDHeroInstanceState, TDVec2, TDTowerSlotState } from '../types';
import { nextTdId } from './td-id';
import { TDTargetingSystem } from './targeting-system';

function distance(a: TDVec2, b: TDVec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function applyDamage(raw: number, heroDamageType: string, armor: number, magicResist: number, armorPierce: number, magicPierce: number): number {
  if (heroDamageType === 'true') return Math.max(1, Math.round(raw));
  if (heroDamageType === 'magic' || heroDamageType === 'poison') {
    const resist = Math.max(-0.5, magicResist - magicPierce);
    return Math.max(1, Math.round(raw * (1 - resist)));
  }
  const mitigated = raw - armor * (1 - armorPierce);
  return Math.max(1, Math.round(mitigated));
}

export interface TDCombatTickResult {
  killed: number;
  awardedGold: number;
  captainXp: number;
  effects: TDEffectState[];
}

export class TDCombatSystem {
  private readonly targeting = new TDTargetingSystem();

  public tick(dt: number, heroes: TDHeroInstanceState[], slots: TDTowerSlotState[], enemies: TDEnemyInstanceState[]): TDCombatTickResult {
    let killed = 0;
    let awardedGold = 0;
    let captainXp = 0;
    const effects: TDEffectState[] = [];

    for (const hero of heroes) {
      const slot = this.targeting.findSlotForHero(slots, hero.instanceId);
      if (!slot) continue;

      const cfg = getScaledTDHeroConfig(hero.heroId, hero.star);
      const heroPosition = slot.position;
      hero.attackCooldownLeft = Math.max(0, hero.attackCooldownLeft - dt);

      if (cfg.blockCount > 0) {
        for (const enemy of enemies) {
          if (!enemy.alive || enemy.tags.includes('air')) continue;
          if (distance(heroPosition, enemy.position) <= cfg.guardRadius) {
            enemy.speedMultiplier = Math.min(enemy.speedMultiplier, hero.heroId === 'knight' ? 0.25 : 0.45);
          }
        }
      }

      if (hero.attackCooldownLeft > 0) continue;

      const target = this.targeting.findTarget(cfg, heroPosition, enemies, hero.targetPriority);
      if (!target) continue;

      const rawDamage = cfg.attackDamage;
      const stealthMultiplier = target.tags.includes('stealth') && !cfg.revealStealth && !(target.status.revealedSeconds && target.status.revealedSeconds > 0)
        ? 0.3
        : 1;
      const finalDamage = Math.max(1, Math.round(applyDamage(rawDamage, cfg.damageType, target.armor, target.magicResist, cfg.armorPierceRatio, cfg.magicPierceRatio) * stealthMultiplier));

      const damaged = cfg.splashRadius > 0
        ? enemies.filter((enemy) => enemy.alive && distance(enemy.position, target.position) <= cfg.splashRadius)
        : [target];

      for (const enemy of damaged) {
        if (enemy.tags.includes('air') && !cfg.canAttackAir) continue;
        const before = enemy.currentHp;
        enemy.currentHp = Math.max(0, enemy.currentHp - finalDamage);
        effects.push({
          effectId: nextTdId('td_effect'),
          kind: 'damage',
          position: { ...enemy.position },
          value: Math.min(before, finalDamage),
          ttl: 0.8,
          age: 0,
        });
        if (enemy.currentHp <= 0 && enemy.alive) {
          enemy.alive = false;
          hero.kills += 1;
          killed += 1;
          awardedGold += enemy.tags.includes('boss') ? 8 : enemy.tags.includes('elite') ? 3 : 1;
          captainXp += enemy.tags.includes('boss') ? 25 : enemy.tags.includes('elite') ? 6 : 2;
        }
      }

      if (cfg.damageType === 'healing') {
        const wounded = heroes.find((ally) => ally.currentHp < ally.maxHp);
        if (wounded) {
          const heal = Math.max(1, Math.round(cfg.attackDamage));
          wounded.currentHp = Math.min(wounded.maxHp, wounded.currentHp + heal);
          effects.push({
            effectId: nextTdId('td_effect'),
            kind: 'heal',
            position: { ...heroPosition },
            value: heal,
            ttl: 0.8,
            age: 0,
          });
        }
      }

      hero.attackCooldownLeft = cfg.attackInterval;
      effects.push({
        effectId: nextTdId('td_effect'),
        kind: cfg.damageType === 'healing' ? 'heal' : 'projectile',
        from: { ...heroPosition },
        position: { ...target.position },
        label: cfg.name,
        ttl: 0.35,
        age: 0,
      });
    }

    return { killed, awardedGold, captainXp, effects };
  }
}
