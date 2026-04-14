import { BattlefieldConfig } from '../models/types';

const allyDeploymentAnchors = Array.from({ length: 12 }).map((_, index) => {
  const column = index % 6;
  const row = Math.floor(index / 6);
  return {
    id: `deploy_${index}`,
    position: {
      x: 180 + column * 60,
      y: 250 + row * 260,
    },
  };
});

export const BATTLEFIELD_CONFIG: BattlefieldConfig = {
  width: 1000,
  height: 800,
  crystalPosition: { x: 64, y: 400 },
  crystalRadius: 52,
  allyDeploymentRegion: {
    xMin: 120,
    xMax: 520,
    yMin: 120,
    yMax: 680,
  },
  allyDeploymentAnchors,
  enemySpawnRegion: {
    xMin: 900,
    xMax: 980,
    yMin: 120,
    yMax: 680,
  },
};
