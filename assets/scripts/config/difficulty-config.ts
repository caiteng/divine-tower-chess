import type { DifficultyConfig, DifficultyId } from '../models/types';

export const DIFFICULTY_CONFIG: Record<DifficultyId, DifficultyConfig> = {
  beginner: {
    id: 'beginner',
    name: '新手',
    totalWaves: 10,
    startingGold: 16,
    refreshCost: 2,
  },
  normal: {
    id: 'normal',
    name: '普通',
    totalWaves: 30,
    startingGold: 20,
    refreshCost: 2,
  },
  hard: {
    id: 'hard',
    name: '困难',
    totalWaves: 60,
    startingGold: 24,
    refreshCost: 3,
  },
};
