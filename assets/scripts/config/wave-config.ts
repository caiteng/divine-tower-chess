import { DifficultyId, EnemyId, WaveConfig } from '../models/types';

const PATTERNS: Array<Array<{ enemyId: EnemyId; count: number; spawnInterval: number }>> = [
  [{ enemyId: 'slime', count: 8, spawnInterval: 0.8 }],
  [{ enemyId: 'slime', count: 10, spawnInterval: 0.75 }],
  [{ enemyId: 'slime', count: 6, spawnInterval: 0.7 }, { enemyId: 'wolf', count: 4, spawnInterval: 1 }],
  [{ enemyId: 'wolf', count: 8, spawnInterval: 0.9 }],
  [{ enemyId: 'wolf', count: 10, spawnInterval: 0.85 }, { enemyId: 'slime', count: 6, spawnInterval: 0.7 }],
  [{ enemyId: 'brute', count: 3, spawnInterval: 1.6 }, { enemyId: 'wolf', count: 8, spawnInterval: 0.85 }],
  [{ enemyId: 'brute', count: 5, spawnInterval: 1.3 }],
  [{ enemyId: 'brute', count: 6, spawnInterval: 1.15 }, { enemyId: 'wolf', count: 10, spawnInterval: 0.8 }],
];

function scaleEntry(entry: { enemyId: EnemyId; count: number; spawnInterval: number }, scale: number) {
  return {
    enemyId: entry.enemyId,
    count: Math.max(1, Math.floor(entry.count * scale)),
    spawnInterval: Math.max(0.35, entry.spawnInterval / Math.min(2, scale)),
  };
}

function buildWaves(totalWaves: number, multiplier: number): WaveConfig[] {
  const waves: WaveConfig[] = [];
  for (let i = 1; i <= totalWaves; i += 1) {
    const pattern = PATTERNS[(i - 1) % PATTERNS.length];
    const scale = 1 + Math.floor((i - 1) / PATTERNS.length) * 0.18 + multiplier;
    waves.push({
      waveNumber: i,
      entries: pattern.map((entry) => scaleEntry(entry, scale)),
    });
  }
  return waves;
}

export const WAVE_CONFIG: Record<DifficultyId, WaveConfig[]> = {
  beginner: buildWaves(10, 0),
  normal: buildWaves(30, 0.2),
  hard: buildWaves(60, 0.45),
};
