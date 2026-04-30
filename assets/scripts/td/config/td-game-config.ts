import type { TDDifficultyId } from '../types';

export const TD_TOTAL_WAVES = 10;
export const TD_SHOP_SLOTS = 3;
export const TD_BENCH_SLOTS = 12;
export const TD_STARTING_STARDUST = 0;
export const TD_MERGE_STARS_CAP = 3;
export const TD_LOGIC_FPS = 60;

export interface TDDifficultyConfig {
  difficulty: TDDifficultyId;
  startingLife: number;
  startingGold: number;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
  goldMultiplier: number;
  isEndless: boolean;
}

export const TD_DIFFICULTY_CONFIG: Record<TDDifficultyId, TDDifficultyConfig> = {
  beginner: {
    difficulty: 'beginner',
    startingLife: 10,
    startingGold: 28,
    enemyHpMultiplier: 0.85,
    enemySpeedMultiplier: 0.95,
    goldMultiplier: 1.15,
    isEndless: false,
  },
  normal: {
    difficulty: 'normal',
    startingLife: 10,
    startingGold: 20,
    enemyHpMultiplier: 1,
    enemySpeedMultiplier: 1,
    goldMultiplier: 1,
    isEndless: false,
  },
  hard: {
    difficulty: 'hard',
    startingLife: 8,
    startingGold: 18,
    enemyHpMultiplier: 1.25,
    enemySpeedMultiplier: 1.08,
    goldMultiplier: 0.9,
    isEndless: false,
  },
  endless: {
    difficulty: 'endless',
    startingLife: 10,
    startingGold: 22,
    enemyHpMultiplier: 1.05,
    enemySpeedMultiplier: 1.02,
    goldMultiplier: 1,
    isEndless: true,
  },
};

export function getTDDifficultyConfig(difficulty: TDDifficultyId): TDDifficultyConfig {
  return TD_DIFFICULTY_CONFIG[difficulty] ?? TD_DIFFICULTY_CONFIG.normal;
}

export function getTDStarMultiplier(star: 1 | 2 | 3): number {
  if (star === 3) return 2.95;
  if (star === 2) return 1.72;
  return 1;
}
