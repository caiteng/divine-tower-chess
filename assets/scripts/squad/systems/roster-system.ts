import type { DivineTaskId, UnitId } from '../../models/types';
import { SQUAD_BENCH_SLOTS, SQUAD_DEPLOY_SLOTS } from '../config/squad-ui-layout-config';
import { nextId } from '../../utils/id';
import type { RosterUnitState } from '../types';

interface MergeCandidate {
  source: 'bench' | 'deployed';
  unit: RosterUnitState;
}

export class RosterSystem {
  private bench: RosterUnitState[] = [];
  private deployed: RosterUnitState[] = [];

  public reset(): void {
    this.bench = [];
    this.deployed = [];
  }

  public setState(bench: RosterUnitState[], deployed: RosterUnitState[]): void {
    this.bench = bench.map((u) => ({ ...u }));
    this.deployed = deployed.map((u) => ({ ...u }));
  }

  public addToBench(unitId: UnitId): RosterUnitState | null {
    return this.addToBenchWithState({ unitId, star: 1 });
  }

  public addToBenchWithState(template: Omit<RosterUnitState, 'instanceId'> & { instanceId?: string }): RosterUnitState | null {
    if (this.bench.length >= SQUAD_BENCH_SLOTS) {
      return null;
    }
    const instance: RosterUnitState = {
      instanceId: template.instanceId ?? nextId('roster_unit'),
      unitId: template.unitId,
      star: template.star,
      assignedTaskId: template.assignedTaskId,
      isCaptain: template.isCaptain,
    };
    this.bench.push(instance);
    const mergedUnit = this.tryMerge(template.unitId, 1);
    return this.findByInstanceId(instance.instanceId) ?? mergedUnit ?? null;
  }

  public deploy(instanceId: string): boolean {
    if (this.deployed.length >= SQUAD_DEPLOY_SLOTS) return false;
    const unit = this.bench.find((u) => u.instanceId === instanceId);
    if (!unit) return false;
    this.bench = this.bench.filter((u) => u.instanceId !== instanceId);
    this.deployed.push(unit);
    return true;
  }

  public recall(instanceId: string): boolean {
    const unit = this.deployed.find((u) => u.instanceId === instanceId);
    if (!unit) return false;
    this.deployed = this.deployed.filter((u) => u.instanceId !== instanceId);
    this.bench.push(unit);
    return true;
  }

  public removeUnit(instanceId: string): boolean {
    const inBench = this.bench.some((u) => u.instanceId === instanceId);
    if (inBench) {
      this.bench = this.bench.filter((u) => u.instanceId !== instanceId);
      return true;
    }
    const inDeployed = this.deployed.some((u) => u.instanceId === instanceId);
    if (inDeployed) {
      this.deployed = this.deployed.filter((u) => u.instanceId !== instanceId);
      return true;
    }
    return false;
  }

  public assignTask(instanceId: string, taskId: DivineTaskId): void {
    const unit = this.findByInstanceId(instanceId);
    if (unit) {
      unit.assignedTaskId = taskId;
    }
  }

  public evolveUnit(instanceId: string, targetUnitId: UnitId): void {
    const unit = this.findByInstanceId(instanceId);
    if (!unit) return;
    unit.unitId = targetUnitId;
    unit.star = 3;
    unit.assignedTaskId = undefined;
  }

  public getBench(): RosterUnitState[] {
    return this.bench.map((u) => ({ ...u }));
  }

  public getDeployed(): RosterUnitState[] {
    return this.deployed.map((u) => ({ ...u }));
  }

  public getDeployCount(): number {
    return this.deployed.length;
  }

  public getAllUnits(): RosterUnitState[] {
    return [...this.bench, ...this.deployed].map((u) => ({ ...u }));
  }

  public getDeployUnitsForBattle(): RosterUnitState[] {
    return this.deployed.slice(0, SQUAD_DEPLOY_SLOTS).map((u) => ({ ...u }));
  }

  private findByInstanceId(instanceId: string): RosterUnitState | undefined {
    return [...this.bench, ...this.deployed].find((u) => u.instanceId === instanceId);
  }

  private tryMerge(unitId: UnitId, star: 1 | 2): RosterUnitState | undefined {
    const candidates = this.getMergeCandidates(unitId, star);
    if (candidates.length < 3) return undefined;

    const selected = candidates.slice(0, 3);
    const keep = selected[0];
    const consumedIds = selected.slice(1).map((c) => c.unit.instanceId);

    this.bench = this.bench.filter((u) => !consumedIds.includes(u.instanceId));
    this.deployed = this.deployed.filter((u) => !consumedIds.includes(u.instanceId));

    keep.unit.star = (star + 1) as 2 | 3;
    if (star === 1) {
      return this.tryMerge(unitId, 2) ?? keep.unit;
    }
    return keep.unit;
  }

  private getMergeCandidates(unitId: UnitId, star: 1 | 2): MergeCandidate[] {
    const fromBench = this.bench
      .filter((u) => u.unitId === unitId && u.star === star && !u.assignedTaskId)
      .map((unit) => ({ source: 'bench' as const, unit }));
    const fromDeployed = this.deployed
      .filter((u) => u.unitId === unitId && u.star === star && !u.assignedTaskId)
      .map((unit) => ({ source: 'deployed' as const, unit }));
    return [...fromDeployed, ...fromBench];
  }
}
