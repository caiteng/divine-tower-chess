import { SQUAD_BATTLEFIELD } from '../config/squad-battle-config';
import { SquadUnitState, Vec2 } from '../types';
import { clamp, distance, normalize } from './math';

export class MovementSystem {
  public moveTowards(unit: SquadUnitState, target: Vec2, speed: number, dt: number, stopDistance = 4): void {
    const dist = distance(unit.position, target);
    if (dist <= stopDistance) {
      unit.velocity.x = 0;
      unit.velocity.y = 0;
      return;
    }

    const dir = normalize(unit.position, target);
    unit.velocity.x = dir.x * speed;
    unit.velocity.y = dir.y * speed;
    unit.position.x = clamp(unit.position.x + unit.velocity.x * dt, 0, SQUAD_BATTLEFIELD.width);
    unit.position.y = clamp(unit.position.y + unit.velocity.y * dt, 0, SQUAD_BATTLEFIELD.height);
  }

  public stop(unit: SquadUnitState): void {
    unit.velocity.x = 0;
    unit.velocity.y = 0;
  }
}
