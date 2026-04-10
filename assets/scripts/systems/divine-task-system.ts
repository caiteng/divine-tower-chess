import { DIVINE_TASK_CONFIG } from '../config/divine-task-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { DivineTaskConfig, DivineTaskId, DivineTaskProgress, UnitId } from '../models/types';
import { chance } from '../utils/random';

interface TaskAssignableUnit {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  assignedTaskId?: DivineTaskId;
}

export class DivineTaskSystem {
  private progresses: DivineTaskProgress[] = [];

  public tryAssignTask(unit: TaskAssignableUnit): DivineTaskProgress | null {
    if (unit.star !== 3 || unit.assignedTaskId) {
      return null;
    }

    const unitCfg = UNIT_CONFIG[unit.unitId];
    if (unitCfg.isDivine) {
      return null;
    }

    const existingTask = this.progresses.find((progress) => progress.unitInstanceId === unit.instanceId && !progress.completed);
    if (existingTask) {
      return null;
    }

    const taskConfig = Object.values(DIVINE_TASK_CONFIG).find((task) => task.sourceUnitId === unit.unitId);
    if (!taskConfig || !chance(taskConfig.triggerChance)) {
      return null;
    }

    const progress: DivineTaskProgress = {
      taskId: taskConfig.id,
      unitInstanceId: unit.instanceId,
      progress: 0,
      completed: false,
    };
    this.progresses.push(progress);
    return progress;
  }

  public addMetric(unitInstanceId: string, metric: 'kills' | 'healing', amount: number): DivineTaskProgress | null {
    const progress = this.progresses.find((p) => p.unitInstanceId === unitInstanceId && !p.completed);
    if (!progress) {
      return null;
    }
    const task = DIVINE_TASK_CONFIG[progress.taskId];
    if (task.metric !== metric) {
      return null;
    }

    progress.progress += amount;
    if (progress.progress >= task.requirement) {
      progress.completed = true;
    }
    return progress;
  }

  public resolveCompleted(unitInstanceId: string): DivineTaskConfig | null {
    const progress = this.progresses.find((p) => p.unitInstanceId === unitInstanceId && p.completed);
    if (!progress) {
      return null;
    }
    return DIVINE_TASK_CONFIG[progress.taskId as DivineTaskId];
  }

  public getAllProgress(): DivineTaskProgress[] {
    return [...this.progresses];
  }
}
