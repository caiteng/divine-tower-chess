import { BATTLEFIELD_CONFIG } from '../config/battlefield-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { BenchUnitState, DivineTaskId, PlacementPoint, PlacedUnitState, UnitId } from '../models/types';
import { nextId } from '../utils/id';

interface TaskRollUnitState {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  assignedTaskId?: DivineTaskId;
}

type MergeCandidate =
  | { source: 'placed'; unit: PlacedUnitState }
  | { source: 'bench'; unit: BenchUnitState };

export class UnitSystem {
  private bench: BenchUnitState[] = [];
  private placed: PlacedUnitState[] = [];

  public addToBench(unitId: UnitId): BenchUnitState {
    const instance: BenchUnitState = { instanceId: nextId('unit'), unitId, star: 1 };
    this.bench.push(instance);
    this.tryMerge(unitId, 1);
    return instance;
  }

  private tryMerge(unitId: UnitId, star: 1 | 2): void {
    const candidates = this.getMergeCandidates(unitId, star);
    if (candidates.length < 3) return;

    const selected = candidates.slice(0, 3);
    const keep = selected[0];
    const consumedIds = selected.slice(1).map((candidate) => candidate.unit.instanceId);
    const nextStar = (star + 1) as 2 | 3;

    this.bench = this.bench.filter((u) => !consumedIds.includes(u.instanceId));
    this.placed = this.placed.filter((u) => !consumedIds.includes(u.instanceId));

    keep.unit.star = nextStar;
    if (keep.source === 'placed') {
      keep.unit.currentHp = UNIT_CONFIG[keep.unit.unitId].maxHp;
      keep.unit.cooldownLeft = 0;
    }

    if (star === 1) this.tryMerge(unitId, 2);
  }

  private getMergeCandidates(unitId: UnitId, star: 1 | 2): MergeCandidate[] {
    const placed = this.placed
      .filter((u) => u.unitId === unitId && u.star === star && !u.assignedTaskId)
      .map((unit) => ({ source: 'placed' as const, unit }));
    const bench = this.bench
      .filter((u) => u.unitId === unitId && u.star === star && !u.assignedTaskId)
      .map((unit) => ({ source: 'bench' as const, unit }));
    return [...placed, ...bench];
  }

  public placeFromBench(instanceId: string, lane: number, tileIndex: number): boolean {
    const point = this.findPlacementPoint(lane, tileIndex);
    if (!point) return false;
    if (this.placed.some((u) => u.placementPointId === point.id)) return false;

    const benchUnit = this.bench.find((u) => u.instanceId === instanceId);
    if (!benchUnit) return false;

    this.bench = this.bench.filter((u) => u.instanceId !== instanceId);
    const config = UNIT_CONFIG[benchUnit.unitId];
    this.placed.push({
      instanceId: benchUnit.instanceId,
      unitId: benchUnit.unitId,
      star: benchUnit.star,
      lane,
      tileIndex,
      placementPointId: point.id,
      position: { ...point.position },
      velocity: { x: 0, y: 0 },
      radius: 24,
      cooldownLeft: 0,
      currentHp: config.maxHp,
      assignedTaskId: benchUnit.assignedTaskId,
    });
    return true;
  }

  public movePlacedUnit(instanceId: string, lane: number, tileIndex: number): boolean {
    const point = this.findPlacementPoint(lane, tileIndex);
    if (!point) return false;

    const unit = this.placed.find((u) => u.instanceId === instanceId);
    if (!unit) return false;
    if (this.placed.some((u) => u.instanceId !== instanceId && u.placementPointId === point.id)) return false;

    unit.lane = lane;
    unit.tileIndex = tileIndex;
    unit.placementPointId = point.id;
    unit.position.x = point.position.x;
    unit.position.y = point.position.y;
    unit.velocity.x = 0;
    unit.velocity.y = 0;
    return true;
  }

  private findPlacementPoint(lane: number, tileIndex: number): PlacementPoint | undefined {
    return BATTLEFIELD_CONFIG.placementPoints.find((point) => point.lane === lane && point.tileIndex === tileIndex);
  }

  public resetDefeatedPlacedUnits(): number {
    let resetCount = 0;
    for (const unit of this.placed) {
      if (unit.currentHp > 0) continue;
      unit.currentHp = UNIT_CONFIG[unit.unitId].maxHp;
      unit.cooldownLeft = 0;
      unit.velocity.x = 0;
      unit.velocity.y = 0;
      resetCount += 1;
    }
    return resetCount;
  }

  public getBenchUnits(): BenchUnitState[] {
    return [...this.bench];
  }

  public getPlacedUnits(): PlacedUnitState[] {
    return [...this.placed];
  }

  public getUnitsForTaskRoll(): TaskRollUnitState[] {
    return [...this.bench, ...this.placed].map((u) => ({
      instanceId: u.instanceId,
      unitId: u.unitId,
      star: u.star,
      assignedTaskId: u.assignedTaskId,
    }));
  }

  public setAssignedTask(unitInstanceId: string, taskId: DivineTaskId): void {
    const benchUnit = this.bench.find((u) => u.instanceId === unitInstanceId);
    if (benchUnit) benchUnit.assignedTaskId = taskId;
    const placedUnit = this.placed.find((u) => u.instanceId === unitInstanceId);
    if (placedUnit) placedUnit.assignedTaskId = taskId;
  }

  public evolveUnit(unitInstanceId: string, targetUnitId: UnitId): void {
    const apply = (u: { unitId: UnitId; star: 1 | 2 | 3; assignedTaskId?: DivineTaskId }) => {
      u.unitId = targetUnitId;
      u.star = 3;
      u.assignedTaskId = undefined;
    };

    const benchUnit = this.bench.find((u) => u.instanceId === unitInstanceId);
    if (benchUnit) apply(benchUnit);

    const placedUnit = this.placed.find((u) => u.instanceId === unitInstanceId);
    if (placedUnit) {
      apply(placedUnit);
      placedUnit.currentHp = Math.min(placedUnit.currentHp, UNIT_CONFIG[targetUnitId].maxHp);
    }
  }
}
