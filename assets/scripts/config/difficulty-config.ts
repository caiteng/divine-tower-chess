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
    totalWaves: 20,
    startingGold: 20,
    refreshCost: 2,
  },
  hard: {
    id: 'hard',
    name: '困难',
    totalWaves: 30,
    startingGold: 24,
    refreshCost: 3,
  },
  endless: {
    id: 'endless',
    name: '无尽',
    totalWaves: 0,
    isEndless: true,
    startingGold: 20,
    refreshCost: 2,
  },
};
