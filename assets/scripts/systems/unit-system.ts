import { BATTLEFIELD_CONFIG } from '../config/battlefield-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { BenchUnitState, DeploymentAnchor, DivineTaskId, PlacedUnitState, UnitId, Vec2 } from '../models/types';
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

  public placeFromBench(instanceId: string, deploymentAnchorId: string): boolean {
    const anchor = this.findDeploymentAnchor(deploymentAnchorId);
    if (!anchor) return false;
    if (this.placed.some((u) => u.deploymentAnchorId === anchor.id)) return false;

    const benchUnit = this.bench.find((u) => u.instanceId === instanceId);
    if (!benchUnit) return false;

    this.bench = this.bench.filter((u) => u.instanceId !== instanceId);
    const config = UNIT_CONFIG[benchUnit.unitId];
    this.placed.push(this.buildPlacedUnit(benchUnit, anchor, config.maxHp));
    return true;
  }

  public movePlacedUnit(instanceId: string, deploymentAnchorId: string): boolean {
    const anchor = this.findDeploymentAnchor(deploymentAnchorId);
    if (!anchor) return false;

    const unit = this.placed.find((u) => u.instanceId === instanceId);
    if (!unit) return false;
    if (this.placed.some((u) => u.instanceId !== instanceId && u.deploymentAnchorId === anchor.id)) return false;

    unit.deploymentAnchorId = anchor.id;
    unit.position.x = anchor.position.x;
    unit.position.y = anchor.position.y;
    unit.velocity.x = 0;
    unit.velocity.y = 0;
    return true;
  }

  private buildPlacedUnit(benchUnit: BenchUnitState, anchor: DeploymentAnchor, maxHp: number): PlacedUnitState {
    return {
      instanceId: benchUnit.instanceId,
      unitId: benchUnit.unitId,
      star: benchUnit.star,
      deploymentAnchorId: anchor.id,
      position: { ...anchor.position },
      velocity: { x: 0, y: 0 },
      radius: 24,
      cooldownLeft: 0,
      currentHp: maxHp,
      assignedTaskId: benchUnit.assignedTaskId,
    };
  }

  public placeFromBenchAtPosition(instanceId: string, position: Vec2): boolean {
    const anchor = this.findNearestAvailableAnchor(position);
    if (!anchor) return false;
    return this.placeFromBench(instanceId, anchor.id);
  }

  public movePlacedUnitToPosition(instanceId: string, position: Vec2): boolean {
    const anchor = this.findNearestAvailableAnchor(position, instanceId);
    if (!anchor) return false;
    return this.movePlacedUnit(instanceId, anchor.id);
  }

  private findDeploymentAnchor(deploymentAnchorId: string): DeploymentAnchor | undefined {
    return BATTLEFIELD_CONFIG.allyDeploymentAnchors.find((anchor) => anchor.id === deploymentAnchorId);
  }

  private findNearestAvailableAnchor(position: Vec2, ignoreInstanceId?: string): DeploymentAnchor | undefined {
    const isOccupied = (anchorId: string) => this.placed.some((unit) => unit.instanceId !== ignoreInstanceId && unit.deploymentAnchorId === anchorId);
    return [...BATTLEFIELD_CONFIG.allyDeploymentAnchors]
      .filter((anchor) => !isOccupied(anchor.id))
      .sort((a, b) => {
        const da = Math.hypot(a.position.x - position.x, a.position.y - position.y);
        const db = Math.hypot(b.position.x - position.x, b.position.y - position.y);
        return da - db;
      })[0];
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
