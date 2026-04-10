import { DivineTaskConfig, DivineTaskId } from '../models/types';

export const DIVINE_TASK_CONFIG: Record<DivineTaskId, DivineTaskConfig> = {
  warrior_to_berserker: {
    id: 'warrior_to_berserker',
    sourceUnitId: 'warrior',
    targetUnitId: 'berserker',
    triggerChance: 0.1,
    metric: 'kills',
    requirement: 1000,
  },
  priest_to_light_mage: {
    id: 'priest_to_light_mage',
    sourceUnitId: 'priest',
    targetUnitId: 'light_mage',
    triggerChance: 0.1,
    metric: 'healing',
    requirement: 100000,
  },
};
