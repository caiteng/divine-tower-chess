import { SQUAD_BATTLEFIELD } from '../config/squad-battle-config';
import type { SquadUnitState, Vec2 } from '../types';
import { clamp } from './math';

export class UnitCommandSystem {
  private selectedUnitId: string | undefined;

  public selectUnit(unitId: string, allies: SquadUnitState[]): boolean {
    const exists = allies.some((ally) => ally.instanceId === unitId && ally.alive);
    if (!exists) return false;
    this.selectedUnitId = unitId;
    return true;
  }

  public clearSelection(): void {
    this.selectedUnitId = undefined;
  }

  public getSelectedUnitId(): string | undefined {
    return this.selectedUnitId;
  }

  public issueMoveToGround(position: Vec2, allies: SquadUnitState[]): boolean {
    const unit = this.getSelectedAlly(allies);
    if (!unit) return false;
    unit.command = { type: 'move', position: this.clampMoveCommand(position) };
    return true;
  }

  public issueFocusEnemy(enemyId: string, allies: SquadUnitState[]): boolean {
    const unit = this.getSelectedAlly(allies);
    if (!unit) return false;
    unit.command = { type: 'focus_enemy', targetEnemyId: enemyId };
    return true;
  }

  public issueChannelHealAlly(targetAllyId: string, allies: SquadUnitState[]): boolean {
    const unit = this.getSelectedAlly(allies);
    if (!unit || unit.role !== 'priest') return false;
    unit.command = { type: 'channel_heal', targetAllyId };
    return true;
  }

  private getSelectedAlly(allies: SquadUnitState[]): SquadUnitState | undefined {
    if (!this.selectedUnitId) return undefined;
    return allies.find((ally) => ally.instanceId === this.selectedUnitId && ally.alive);
  }

  private clampMoveCommand(position: Vec2): Vec2 {
    return {
      x: clamp(position.x, 0, SQUAD_BATTLEFIELD.width),
      y: clamp(position.y, SQUAD_BATTLEFIELD.combatYMin, SQUAD_BATTLEFIELD.combatYMax),
    };
  }
}
