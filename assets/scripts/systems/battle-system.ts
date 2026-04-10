import { ENEMY_CONFIG } from '../config/enemy-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { EnemyState, PlacedUnitState } from '../models/types';

type EngagementMap = Map<string, PlacedUnitState>;

export interface BattleTickResult {
  crystalDamage: number;
  killedEnemyIds: string[];
  goldFromKills: number;
  healingDoneByUnit: Record<string, number>;
  killsByUnit: Record<string, number>;
}

export class BattleSystem {
  private readonly lanePathLength = [14, 15.5];
  private readonly enemyDpsPerUnit = 5;
  private readonly firstTileDistance = 2;
  private readonly tileDistanceStep = 1.8;

  public tick(units: PlacedUnitState[], enemies: EnemyState[], dt: number): BattleTickResult {
    const killsByUnit: Record<string, number> = {};
    const healingDoneByUnit: Record<string, number> = {};
    let engagements = this.assignEngagements(units, enemies);

    for (const enemy of enemies) {
      if (enemy.currentHp <= 0) continue;
      if (engagements.has(enemy.instanceId)) continue;

      const cfg = ENEMY_CONFIG[enemy.enemyId];
      enemy.distanceOnPath += cfg.speed * dt;
      if (enemy.distanceOnPath >= this.lanePathLength[enemy.lane]) {
        enemy.reachedCrystal = true;
      }
    }

    engagements = this.assignEngagements(units, enemies);
    this.applyEnemyPressure(engagements, dt);

    for (const unit of units) {
      if (unit.currentHp <= 0) {
        continue;
      }

      const cfg = UNIT_CONFIG[unit.unitId];
      unit.cooldownLeft -= dt;
      if (unit.cooldownLeft > 0) continue;

      const laneEnemies = enemies.filter((enemy) => !enemy.reachedCrystal && enemy.currentHp > 0 && enemy.lane === unit.lane);
      const target = laneEnemies.sort((a, b) => b.distanceOnPath - a.distanceOnPath)[0];

      if (cfg.skillType === 'heal') {
        const healed = this.applyHeal(unit, units);
        if (healed > 0) {
          healingDoneByUnit[unit.instanceId] = (healingDoneByUnit[unit.instanceId] ?? 0) + healed;
        }
      } else {
        if (!target) {
          continue;
        }

        const damage = cfg.baseDamage * (1 + (unit.star - 1) * 0.8);
        if (cfg.skillType === 'aoe') {
          const splash = enemies.filter(
            (enemy) => enemy.lane === unit.lane && !enemy.reachedCrystal && enemy.currentHp > 0 && Math.abs(enemy.distanceOnPath - target.distanceOnPath) <= 1.2,
          );
          for (const enemy of splash) {
            enemy.currentHp -= damage;
            if (enemy.currentHp <= 0) {
              killsByUnit[unit.instanceId] = (killsByUnit[unit.instanceId] ?? 0) + 1;
            }
          }
        } else {
          target.currentHp -= damage;
          if (target.currentHp <= 0) {
            killsByUnit[unit.instanceId] = (killsByUnit[unit.instanceId] ?? 0) + 1;
          }
        }
      }

      unit.cooldownLeft = cfg.attackInterval;
    }

    const killedEnemyIds = enemies.filter((e) => e.currentHp <= 0).map((e) => e.instanceId);
    const goldFromKills = enemies
      .filter((e) => e.currentHp <= 0)
      .reduce((sum, e) => sum + ENEMY_CONFIG[e.enemyId].goldReward, 0);
    const crystalDamage = enemies
      .filter((e) => e.reachedCrystal)
      .reduce((sum, e) => sum + ENEMY_CONFIG[e.enemyId].crystalDamage, 0);

    return { crystalDamage, killedEnemyIds, goldFromKills, healingDoneByUnit, killsByUnit };
  }

  private assignEngagements(units: PlacedUnitState[], enemies: EnemyState[]): EngagementMap {
    const engagements: EngagementMap = new Map();
    const liveEnemies = enemies
      .filter((enemy) => enemy.currentHp > 0 && !enemy.reachedCrystal)
      .sort((a, b) => b.distanceOnPath - a.distanceOnPath);

    for (const lane of [0, 1]) {
      const laneEnemies = liveEnemies.filter((enemy) => enemy.lane === lane);

      const blockers = units
        .filter((unit) => unit.lane === lane && unit.currentHp > 0)
        .filter((unit) => UNIT_CONFIG[unit.unitId].aggroRole === 'blocker')
        .sort((a, b) => a.tileIndex - b.tileIndex);

      for (const enemy of laneEnemies) {
        const blocker = blockers.find((unit) => this.isEnemyInUnitAggroRange(enemy, unit));
        if (blocker) {
          engagements.set(enemy.instanceId, blocker);
        }
      }

      const meleeUnits = units
        .filter((unit) => unit.lane === lane && unit.currentHp > 0)
        .filter((unit) => UNIT_CONFIG[unit.unitId].aggroRole === 'melee')
        .sort((a, b) => a.tileIndex - b.tileIndex);

      for (const unit of meleeUnits) {
        const target = laneEnemies.find((enemy) => !engagements.has(enemy.instanceId) && this.isEnemyInUnitAggroRange(enemy, unit));
        if (target) {
          engagements.set(target.instanceId, unit);
        }
      }
    }

    return engagements;
  }

  private applyEnemyPressure(engagements: EngagementMap, dt: number): void {
    const attackersByUnit = new Map<string, { unit: PlacedUnitState; count: number }>();

    for (const unit of engagements.values()) {
      if (unit.currentHp <= 0) {
        continue;
      }

      const current = attackersByUnit.get(unit.instanceId);
      if (current) {
        current.count += 1;
      } else {
        attackersByUnit.set(unit.instanceId, { unit, count: 1 });
      }
    }

    for (const { unit, count } of attackersByUnit.values()) {
      unit.currentHp -= count * this.enemyDpsPerUnit * dt;
      if (unit.currentHp < 0) {
        unit.currentHp = 0;
      }
    }
  }

  private isEnemyInUnitAggroRange(enemy: EnemyState, unit: PlacedUnitState): boolean {
    const cfg = UNIT_CONFIG[unit.unitId];
    const distance = Math.abs(enemy.distanceOnPath - this.getUnitPathDistance(unit));
    return distance <= cfg.range;
  }

  private getUnitPathDistance(unit: PlacedUnitState): number {
    return this.firstTileDistance + unit.tileIndex * this.tileDistanceStep;
  }

  private applyHeal(caster: PlacedUnitState, units: PlacedUnitState[]): number {
    const healAmount = (UNIT_CONFIG[caster.unitId].healPower ?? 0) * caster.star;
    if (healAmount <= 0) {
      return 0;
    }

    const wounded = units
      .filter((unit) => unit.lane === caster.lane && unit.currentHp > 0)
      .map((unit) => {
        const maxHp = UNIT_CONFIG[unit.unitId].maxHp;
        return {
          unit,
          missingHp: Math.max(0, maxHp - unit.currentHp),
          hpRatio: unit.currentHp / maxHp,
        };
      })
      .filter((entry) => entry.missingHp > 0)
      .sort((a, b) => a.hpRatio - b.hpRatio)[0];

    if (!wounded) {
      return 0;
    }

    const actualHeal = Math.min(healAmount, wounded.missingHp);
    wounded.unit.currentHp += actualHeal;
    return actualHeal;
  }
}
