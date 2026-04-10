import { UNIT_CONFIG } from '../config/unit-config';
import { BenchUnitState, PlacedUnitState, UnitId } from '../models/types';
import { nextId } from '../utils/id';

export class UnitSystem {
  private bench: BenchUnitState[] = [];
  private placed: PlacedUnitState[] = [];
  private lanes = [
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
  ];

  public addToBench(unitId: UnitId): BenchUnitState {
    const instance: BenchUnitState = {
      instanceId: nextId('unit'),
      unitId,
      star: 1,
    };
    this.bench.push(instance);
    this.tryMerge(unitId, 1);
    return instance;
  }

  private tryMerge(unitId: UnitId, star: 1 | 2): void {
    const candidates = this.bench.filter((u) => u.unitId === unitId && u.star === star && !u.assignedTaskId);
    if (candidates.length < 3) {
      return;
    }

    const toRemove = candidates.slice(0, 3).map((u) => u.instanceId);
    this.bench = this.bench.filter((u) => !toRemove.includes(u.instanceId));

    this.bench.push({
      instanceId: nextId('unit'),
      unitId,
      star: (star + 1) as 2 | 3,
    });

    if (star === 1) {
      this.tryMerge(unitId, 2);
    }
  }

  public placeFromBench(instanceId: string, lane: number, tileIndex: number): boolean {
    const laneTiles = this.lanes[lane];
    if (!laneTiles || !laneTiles.includes(tileIndex)) {
      return false;
    }
    const occupied = this.placed.some((u) => u.lane === lane && u.tileIndex === tileIndex);
    if (occupied) {
      return false;
    }
    const benchUnit = this.bench.find((u) => u.instanceId === instanceId);
    if (!benchUnit) {
      return false;
    }
    this.bench = this.bench.filter((u) => u.instanceId !== instanceId);
    const config = UNIT_CONFIG[benchUnit.unitId];
    this.placed.push({
      instanceId: benchUnit.instanceId,
      unitId: benchUnit.unitId,
      star: benchUnit.star,
      lane,
      tileIndex,
      cooldownLeft: 0,
      currentHp: config.maxHp,
      assignedTaskId: benchUnit.assignedTaskId,
    });
    return true;
  }

  public getBenchUnits(): BenchUnitState[] {
    return [...this.bench];
  }

  public getPlacedUnits(): PlacedUnitState[] {
    return [...this.placed];
  }

  public setAssignedTask(unitInstanceId: string, taskId: string): void {
    const benchUnit = this.bench.find((u) => u.instanceId === unitInstanceId);
    if (benchUnit) {
      benchUnit.assignedTaskId = taskId as any;
    }
    const placedUnit = this.placed.find((u) => u.instanceId === unitInstanceId);
    if (placedUnit) {
      placedUnit.assignedTaskId = taskId as any;
    }
  }

  public evolveUnit(unitInstanceId: string, targetUnitId: UnitId): void {
    const apply = (u: { unitId: UnitId; star: 1 | 2 | 3; assignedTaskId?: string }) => {
      u.unitId = targetUnitId;
      u.star = 3;
      u.assignedTaskId = undefined;
    };

    const benchUnit = this.bench.find((u) => u.instanceId === unitInstanceId);
    if (benchUnit) apply(benchUnit as any);

    const placedUnit = this.placed.find((u) => u.instanceId === unitInstanceId);
    if (placedUnit) apply(placedUnit as any);
  }
}
