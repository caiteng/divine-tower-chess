import { SQUAD_BATTLEFIELD } from '../config/squad-battle-config';
import type { EnemyUnitState, SquadUnitState, Vec2 } from '../types';
import { clamp, distance } from './math';

interface Collider {
  position: Vec2;
  radius: number;
  weight: number;
}

export class CollisionSystem {
  public resolve(allies: SquadUnitState[], enemies: EnemyUnitState[], iterations = 2): void {
    const aliveAllies = allies.filter((ally) => ally.alive);
    const aliveEnemies = enemies.filter((enemy) => enemy.alive);

    for (let i = 0; i < iterations; i += 1) {
      this.resolveGroupCollisions(aliveAllies.map((ally) => ({
        position: ally.position,
        radius: this.getAllyRadius(ally),
        weight: ally.role === 'melee' ? 0.85 : 1,
      })));

      this.resolveGroupCollisions(aliveEnemies.map((enemy) => ({
        position: enemy.position,
        radius: this.getEnemyRadius(enemy),
        weight: enemy.enemyType === 'boss' ? 0.55 : enemy.enemyType === 'brute' ? 0.72 : 1,
      })));

      this.resolveSideVsSide(aliveAllies, aliveEnemies);
      this.clampAll(aliveAllies, aliveEnemies);
    }
  }

  private resolveGroupCollisions(colliders: Collider[]): void {
    for (let i = 0; i < colliders.length; i += 1) {
      for (let j = i + 1; j < colliders.length; j += 1) {
        this.separate(colliders[i], colliders[j]);
      }
    }
  }

  private resolveSideVsSide(allies: SquadUnitState[], enemies: EnemyUnitState[]): void {
    for (const ally of allies) {
      for (const enemy of enemies) {
        this.separate(
          {
            position: ally.position,
            radius: this.getAllyRadius(ally),
            weight: ally.role === 'melee' ? 0.82 : 1,
          },
          {
            position: enemy.position,
            radius: this.getEnemyRadius(enemy),
            weight: enemy.enemyType === 'boss' ? 0.5 : enemy.enemyType === 'brute' ? 0.68 : 0.92,
          },
        );
      }
    }
  }

  private separate(a: Collider, b: Collider): void {
    const minDist = a.radius + b.radius;
    const dist = distance(a.position, b.position);
    if (dist >= minDist) return;

    const overlap = minDist - Math.max(0.001, dist);
    const nx = dist > 0.001 ? (b.position.x - a.position.x) / dist : 1;
    const ny = dist > 0.001 ? (b.position.y - a.position.y) / dist : 0;
    const totalWeight = a.weight + b.weight;
    const aShare = totalWeight > 0 ? b.weight / totalWeight : 0.5;
    const bShare = totalWeight > 0 ? a.weight / totalWeight : 0.5;
    const push = overlap * 0.52;

    a.position.x -= nx * push * aShare;
    a.position.y -= ny * push * aShare;
    b.position.x += nx * push * bShare;
    b.position.y += ny * push * bShare;
  }

  private clampAll(allies: SquadUnitState[], enemies: EnemyUnitState[]): void {
    for (const ally of allies) {
      const radius = this.getAllyRadius(ally);
      ally.position.x = clamp(ally.position.x, radius, SQUAD_BATTLEFIELD.width - radius);
      ally.position.y = clamp(ally.position.y, radius, SQUAD_BATTLEFIELD.height - radius);
    }
    for (const enemy of enemies) {
      const radius = this.getEnemyRadius(enemy);
      enemy.position.x = clamp(enemy.position.x, radius, SQUAD_BATTLEFIELD.width - radius);
      enemy.position.y = clamp(enemy.position.y, radius, SQUAD_BATTLEFIELD.height - radius);
    }
  }

  private getAllyRadius(ally: SquadUnitState): number {
    if (ally.role === 'melee') return 26;
    if (ally.role === 'priest') return 22;
    return 20;
  }

  private getEnemyRadius(enemy: EnemyUnitState): number {
    if (enemy.enemyType === 'boss') return 34;
    if (enemy.enemyType === 'brute') return 28;
    return 20;
  }
}
