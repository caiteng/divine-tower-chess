import { SQUAD_BATTLEFIELD } from '../config/squad-battle-config';
import type { SquadUnitState, Vec2 } from '../types';
import { clamp, distance, normalize } from './math';

export class MovementSystem {
  public moveTowards(unit: SquadUnitState, target: Vec2, speed: number, dt: number, stopDistance = 4): void {
    const boundedTarget = this.clampToCombatArea(target);
    const dist = distance(unit.position, boundedTarget);
    if (dist <= stopDistance) {
      unit.velocity.x = 0;
      unit.velocity.y = 0;
      unit.position.x = clamp(unit.position.x, 0, SQUAD_BATTLEFIELD.width);
      unit.position.y = clamp(unit.position.y, SQUAD_BATTLEFIELD.combatYMin, SQUAD_BATTLEFIELD.combatYMax);
      return;
    }

    const dir = normalize(unit.position, boundedTarget);
    unit.velocity.x = dir.x * speed;
    unit.velocity.y = dir.y * speed;
    unit.position.x = clamp(unit.position.x + unit.velocity.x * dt, 0, SQUAD_BATTLEFIELD.width);
    unit.position.y = clamp(unit.position.y + unit.velocity.y * dt, SQUAD_BATTLEFIELD.combatYMin, SQUAD_BATTLEFIELD.combatYMax);
  }

  public stop(unit: SquadUnitState): void {
    unit.velocity.x = 0;
    unit.velocity.y = 0;
  }

  private clampToCombatArea(position: Vec2): Vec2 {
    return {
      x: clamp(position.x, 0, SQUAD_BATTLEFIELD.width),
      y: clamp(position.y, SQUAD_BATTLEFIELD.combatYMin, SQUAD_BATTLEFIELD.combatYMax),
    };
  }
}
