import { ENEMY_CONFIG } from '../config/enemy-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { EnemyState, PlacedUnitState } from '../models/types';

export interface BattleTickResult {
  crystalDamage: number;
  killedEnemyIds: string[];
  goldFromKills: number;
  healingDoneByUnit: Record<string, number>;
  killsByUnit: Record<string, number>;
}

export class BattleSystem {
  private readonly lanePathLength = [14, 15.5];

  public tick(units: PlacedUnitState[], enemies: EnemyState[], dt: number): BattleTickResult {
    const killsByUnit: Record<string, number> = {};
    const healingDoneByUnit: Record<string, number> = {};

    for (const enemy of enemies) {
      if (enemy.currentHp <= 0) continue;
      const cfg = ENEMY_CONFIG[enemy.enemyId];
      enemy.distanceOnPath += cfg.speed * dt;
      if (enemy.distanceOnPath >= this.lanePathLength[enemy.lane]) {
        enemy.reachedCrystal = true;
      }
    }

    for (const unit of units) {
      const cfg = UNIT_CONFIG[unit.unitId];
      unit.cooldownLeft -= dt;
      if (unit.cooldownLeft > 0) continue;

      const target = enemies
        .filter((enemy) => !enemy.reachedCrystal && enemy.currentHp > 0 && enemy.lane === unit.lane)
        .sort((a, b) => b.distanceOnPath - a.distanceOnPath)[0];

      if (!target && cfg.skillType !== 'heal') {
        continue;
      }

      const damage = cfg.baseDamage * (1 + (unit.star - 1) * 0.8);
      if (cfg.skillType === 'aoe') {
        const splash = enemies.filter((enemy) => enemy.lane === unit.lane && Math.abs(enemy.distanceOnPath - (target?.distanceOnPath ?? 0)) <= 1.2);
        for (const enemy of splash) {
          enemy.currentHp -= damage;
          if (enemy.currentHp <= 0) {
            killsByUnit[unit.instanceId] = (killsByUnit[unit.instanceId] ?? 0) + 1;
          }
        }
      } else if (cfg.skillType === 'heal') {
        const heal = (cfg.healPower ?? 0) * unit.star;
        healingDoneByUnit[unit.instanceId] = (healingDoneByUnit[unit.instanceId] ?? 0) + heal;
      } else {
        target.currentHp -= damage;
        if (target.currentHp <= 0) {
          killsByUnit[unit.instanceId] = (killsByUnit[unit.instanceId] ?? 0) + 1;
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
}
