import { BATTLEFIELD_CONFIG } from '../config/battlefield-config';
import { ENEMY_CONFIG } from '../config/enemy-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { EnemyState, PlacedUnitState, Vec2 } from '../models/types';

export interface BattleTickResult {
  crystalDamage: number;
  killedEnemyIds: string[];
  goldFromKills: number;
  healingDoneByUnit: Record<string, number>;
  killsByUnit: Record<string, number>;
}

function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function normalize(from: Vec2, to: Vec2): Vec2 {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

export class BattleSystem {
  public tick(units: PlacedUnitState[], enemies: EnemyState[], dt: number): BattleTickResult {
    const killsByUnit: Record<string, number> = {};
    const healingDoneByUnit: Record<string, number> = {};

    this.updateEnemyBehavior(enemies, units, dt);
    this.applySeparation(enemies);
    this.updateUnitBehavior(units, enemies, dt, killsByUnit, healingDoneByUnit);

    const killedEnemyIds = enemies.filter((e) => e.currentHp <= 0).map((e) => e.instanceId);
    const goldFromKills = enemies
      .filter((e) => e.currentHp <= 0)
      .reduce((sum, e) => sum + ENEMY_CONFIG[e.enemyId].goldReward, 0);

    const crystalDamage = enemies
      .filter((enemy) => enemy.reachedCrystal)
      .reduce((sum, enemy) => sum + ENEMY_CONFIG[enemy.enemyId].crystalDamage, 0);

    return { crystalDamage, killedEnemyIds, goldFromKills, healingDoneByUnit, killsByUnit };
  }

  private updateEnemyBehavior(enemies: EnemyState[], units: PlacedUnitState[], dt: number): void {
    for (const enemy of enemies) {
      if (enemy.currentHp <= 0 || enemy.reachedCrystal) continue;

      const cfg = ENEMY_CONFIG[enemy.enemyId];
      enemy.cooldownLeft = Math.max(0, enemy.cooldownLeft - dt);

      const nearbyUnits = units
        .filter((unit) => unit.currentHp > 0)
        .map((unit) => ({ unit, dist: distance(enemy.position, unit.position) }))
        .filter((entry) => entry.dist <= cfg.detectionRange)
        .sort((a, b) => a.dist - b.dist);

      const targetUnit = nearbyUnits[0]?.unit;
      const distToUnit = nearbyUnits[0]?.dist ?? Number.MAX_VALUE;
      const crystalDistance = distance(enemy.position, BATTLEFIELD_CONFIG.crystalPosition);

      if (targetUnit && distToUnit <= cfg.attackRange) {
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
        if (enemy.cooldownLeft <= 0) {
          targetUnit.currentHp = Math.max(0, targetUnit.currentHp - cfg.attackDamage * dt);
          enemy.cooldownLeft = cfg.attackInterval;
        }
      } else if (crystalDistance <= BATTLEFIELD_CONFIG.crystalRadius + cfg.attackRange) {
        enemy.reachedCrystal = true;
        enemy.velocity.x = 0;
        enemy.velocity.y = 0;
      } else {
        const moveTarget = targetUnit && distToUnit <= cfg.detectionRange * 0.7 ? targetUnit.position : BATTLEFIELD_CONFIG.crystalPosition;
        const dir = normalize(enemy.position, moveTarget);
        enemy.velocity.x = dir.x * cfg.moveSpeed;
        enemy.velocity.y = dir.y * cfg.moveSpeed;
        enemy.position.x += enemy.velocity.x * dt;
        enemy.position.y += enemy.velocity.y * dt;
      }

      enemy.position.x = Math.max(0, Math.min(BATTLEFIELD_CONFIG.width, enemy.position.x));
      enemy.position.y = Math.max(0, Math.min(BATTLEFIELD_CONFIG.height, enemy.position.y));
    }
  }

  private updateUnitBehavior(
    units: PlacedUnitState[],
    enemies: EnemyState[],
    dt: number,
    killsByUnit: Record<string, number>,
    healingDoneByUnit: Record<string, number>,
  ): void {
    for (const unit of units) {
      if (unit.currentHp <= 0) continue;
      const cfg = UNIT_CONFIG[unit.unitId];
      unit.cooldownLeft = Math.max(0, unit.cooldownLeft - dt);

      if (cfg.skillType === 'heal') {
        this.updateHealer(unit, units, cfg, dt, healingDoneByUnit);
        continue;
      }

      const target = this.pickNearestEnemy(unit, enemies, cfg.detectionRange);
      if (!target) {
        unit.velocity.x = 0;
        unit.velocity.y = 0;
        continue;
      }

      const dist = distance(unit.position, target.position);
      if (dist > cfg.attackRange) {
        const dir = normalize(unit.position, target.position);
        const desired = cfg.behaviorRole === 'ranged' || cfg.behaviorRole === 'mage' ? cfg.attackRange * 0.85 : cfg.attackRange;
        const moveFactor = Math.max(0.25, Math.min(1, (dist - desired) / Math.max(1, cfg.attackRange)));
        unit.velocity.x = dir.x * cfg.moveSpeed * moveFactor;
        unit.velocity.y = dir.y * cfg.moveSpeed * moveFactor;
        unit.position.x += unit.velocity.x * dt;
        unit.position.y += unit.velocity.y * dt;
      } else {
        unit.velocity.x = 0;
        unit.velocity.y = 0;
        if (unit.cooldownLeft <= 0) {
          const damage = cfg.baseDamage * (1 + (unit.star - 1) * 0.8);
          if (cfg.skillType === 'aoe') {
            const radius = cfg.skillRadius ?? 80;
            for (const enemy of enemies) {
              if (enemy.currentHp <= 0 || enemy.reachedCrystal) continue;
              if (distance(enemy.position, target.position) <= radius) {
                enemy.currentHp -= damage;
                if (enemy.currentHp <= 0) {
                  killsByUnit[unit.instanceId] = (killsByUnit[unit.instanceId] ?? 0) + 1;
                }
              }
            }
          } else {
            target.currentHp -= damage;
            if (target.currentHp <= 0) {
              killsByUnit[unit.instanceId] = (killsByUnit[unit.instanceId] ?? 0) + 1;
            }
          }
          unit.cooldownLeft = cfg.attackInterval;
        }
      }

      unit.position.x = Math.max(0, Math.min(BATTLEFIELD_CONFIG.width, unit.position.x));
      unit.position.y = Math.max(0, Math.min(BATTLEFIELD_CONFIG.height, unit.position.y));
    }
  }

  private updateHealer(
    caster: PlacedUnitState,
    units: PlacedUnitState[],
    cfg: (typeof UNIT_CONFIG)[keyof typeof UNIT_CONFIG],
    dt: number,
    healingDoneByUnit: Record<string, number>,
  ): void {
    const wounded = units
      .filter((unit) => unit.currentHp > 0)
      .map((unit) => {
        const maxHp = UNIT_CONFIG[unit.unitId].maxHp;
        return {
          unit,
          dist: distance(caster.position, unit.position),
          missingHp: Math.max(0, maxHp - unit.currentHp),
          hpRatio: unit.currentHp / maxHp,
        };
      })
      .filter((entry) => entry.missingHp > 0 && entry.dist <= cfg.detectionRange)
      .sort((a, b) => a.hpRatio - b.hpRatio || a.dist - b.dist)[0];

    if (!wounded) {
      caster.velocity.x = 0;
      caster.velocity.y = 0;
      return;
    }

    if (wounded.dist > cfg.attackRange) {
      const dir = normalize(caster.position, wounded.unit.position);
      caster.velocity.x = dir.x * cfg.moveSpeed;
      caster.velocity.y = dir.y * cfg.moveSpeed;
      caster.position.x += caster.velocity.x * dt;
      caster.position.y += caster.velocity.y * dt;
      return;
    }

    caster.velocity.x = 0;
    caster.velocity.y = 0;
    if (caster.cooldownLeft > 0) return;

    const healAmount = (cfg.healPower ?? 0) * caster.star;
    const actualHeal = Math.min(healAmount, wounded.missingHp);
    if (actualHeal > 0) {
      wounded.unit.currentHp += actualHeal;
      healingDoneByUnit[caster.instanceId] = (healingDoneByUnit[caster.instanceId] ?? 0) + actualHeal;
    }
    caster.cooldownLeft = cfg.attackInterval;
  }

  private pickNearestEnemy(unit: PlacedUnitState, enemies: EnemyState[], detectionRange: number): EnemyState | undefined {
    return enemies
      .filter((enemy) => enemy.currentHp > 0 && !enemy.reachedCrystal)
      .map((enemy) => ({ enemy, dist: distance(unit.position, enemy.position) }))
      .filter((entry) => entry.dist <= detectionRange)
      .sort((a, b) => a.dist - b.dist)[0]?.enemy;
  }

  private applySeparation(enemies: EnemyState[]): void {
    for (let i = 0; i < enemies.length; i += 1) {
      const a = enemies[i];
      if (a.currentHp <= 0 || a.reachedCrystal) continue;
      for (let j = i + 1; j < enemies.length; j += 1) {
        const b = enemies[j];
        if (b.currentHp <= 0 || b.reachedCrystal) continue;
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dist = Math.hypot(dx, dy) || 1;
        const minDist = a.radius + b.radius + 4;
        if (dist >= minDist) continue;
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        const weightA = ENEMY_CONFIG[a.enemyId].separationWeight ?? 1;
        const weightB = ENEMY_CONFIG[b.enemyId].separationWeight ?? 1;
        a.position.x -= nx * overlap * 0.5 * weightA;
        a.position.y -= ny * overlap * 0.5 * weightA;
        b.position.x += nx * overlap * 0.5 * weightB;
        b.position.y += ny * overlap * 0.5 * weightB;
      }
    }
  }
}
