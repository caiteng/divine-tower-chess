
import type { TDDifficultyId } from '../types';

export const TD_DEFAULT_LIFE = 10;
export const TD_TOTAL_WAVES = 10;
export const TD_STARTING_GOLD = 20;
export const TD_STARTING_STARDUST = 0;
export const TD_LOGIC_FPS = 60;

export interface TDDifficultyConfig {
  id: TDDifficultyId;
  name: string;
  startingLife: number;
  startingGold: number;
  enemyHpMultiplier: number;
  enemySpeedMultiplier: number;
  rewardMultiplier: number;
  isEndless: boolean;
}

export const TD_DIFFICULTY_CONFIG: Record<TDDifficultyId, TDDifficultyConfig> = {
  beginner: {
    id: 'beginner',
    name: '新手',
    startingLife: TD_DEFAULT_LIFE,
    startingGold: TD_STARTING_GOLD + 5,
    enemyHpMultiplier: 0.88,
    enemySpeedMultiplier: 0.95,
    rewardMultiplier: 1.15,
    isEndless: false,
  },
  normal: {
    id: 'normal',
    name: '普通',
    startingLife: TD_DEFAULT_LIFE,
    startingGold: TD_STARTING_GOLD,
    enemyHpMultiplier: 1,
    enemySpeedMultiplier: 1,
    rewardMultiplier: 1,
    isEndless: false,
  },
  hard: {
    id: 'hard',
    name: '困难',
    startingLife: 8,
    startingGold: TD_STARTING_GOLD - 2,
    enemyHpMultiplier: 1.18,
    enemySpeedMultiplier: 1.06,
    rewardMultiplier: 0.9,
    isEndless: false,
  },
  endless: {
    id: 'endless',
    name: '无尽',
    startingLife: TD_DEFAULT_LIFE,
    startingGold: TD_STARTING_GOLD,
    enemyHpMultiplier: 1,
    enemySpeedMultiplier: 1,
    rewardMultiplier: 1,
    isEndless: true,
  },
};

export function getTDDifficultyConfig(difficulty: TDDifficultyId): TDDifficultyConfig {
  return TD_DIFFICULTY_CONFIG[difficulty];
}
