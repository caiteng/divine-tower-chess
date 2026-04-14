import { BattlefieldConfig } from '../models/types';

const placementPoints = Array.from({ length: 12 }).map((_, index) => {
  const lane = Math.floor(index / 6);
  const tileIndex = index % 6;
  return {
    id: `p_${lane}_${tileIndex}`,
    lane,
    tileIndex,
    position: {
      x: 180 + tileIndex * 60,
      y: 250 + lane * 260,
    },
  };
});

export const BATTLEFIELD_CONFIG: BattlefieldConfig = {
  width: 1000,
  height: 800,
  crystalPosition: { x: 64, y: 400 },
  crystalRadius: 52,
  allySpawnAnchor: { x: 220, y: 400 },
  enemySpawnAnchor: { x: 940, y: 400 },
  placementPoints,
};
