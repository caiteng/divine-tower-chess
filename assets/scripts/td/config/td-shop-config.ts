import type { TDHeroId } from '../types';

export const TD_SHOP_REFRESH_COSTS = [2, 2, 3, 4];

export const TD_SHOP_WEIGHT_TABLE: Array<{ heroId: TDHeroId; weight: number }> = [
  { heroId: 'archer', weight: 24 },
  { heroId: 'mage', weight: 16 },
  { heroId: 'warrior', weight: 22 },
  { heroId: 'knight', weight: 18 },
  { heroId: 'assassin', weight: 12 },
  { heroId: 'priest', weight: 14 },
  { heroId: 'spearman', weight: 8 },
  { heroId: 'alchemist', weight: 7 },
  { heroId: 'gunner', weight: 5 },
  { heroId: 'druid', weight: 6 },
];

export function getTDRefreshCost(refreshCount: number): number {
  return TD_SHOP_REFRESH_COSTS[Math.min(refreshCount, TD_SHOP_REFRESH_COSTS.length - 1)];
}
