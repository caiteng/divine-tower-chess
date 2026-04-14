import { BATTLEFIELD_CONFIG } from '../config/battlefield-config';
import { ENEMY_CONFIG } from '../config/enemy-config';
import { WAVE_CONFIG } from '../config/wave-config';
import { DifficultyId, EnemyState } from '../models/types';
import { nextId } from '../utils/id';

interface SpawnCursor {
  entryIndex: number;
  spawnCooldown: number;
  spawnedInCurrentEntry: number;
}

export class WaveSystem {
  private cursor: SpawnCursor = { entryIndex: 0, spawnCooldown: 0, spawnedInCurrentEntry: 0 };

  public resetWave(): void {
    this.cursor = { entryIndex: 0, spawnCooldown: 0, spawnedInCurrentEntry: 0 };
  }

  public tickSpawn(difficulty: DifficultyId, waveNumber: number, dt: number): EnemyState[] {
    const wave = WAVE_CONFIG[difficulty][waveNumber - 1];
    if (!wave) return [];

    const spawned: EnemyState[] = [];
    this.cursor.spawnCooldown -= dt;

    while (this.cursor.spawnCooldown <= 0) {
      const entry = wave.entries[this.cursor.entryIndex];
      if (!entry) break;

      const cfg = ENEMY_CONFIG[entry.enemyId];
      const index = this.cursor.spawnedInCurrentEntry;
      const spawnPos = this.pickSpawnPosition(index);

      spawned.push({
        instanceId: nextId('enemy'),
        enemyId: entry.enemyId,
        currentHp: cfg.maxHp,
        position: spawnPos,
        velocity: { x: 0, y: 0 },
        radius: 20,
        cooldownLeft: 0,
        reachedCrystal: false,
      });

      this.cursor.spawnedInCurrentEntry += 1;
      this.cursor.spawnCooldown += entry.spawnInterval;
      if (this.cursor.spawnedInCurrentEntry >= entry.count) {
        this.cursor.entryIndex += 1;
        this.cursor.spawnedInCurrentEntry = 0;
      }
    }

    return spawned;
  }

  private pickSpawnPosition(index: number): { x: number; y: number } {
    const region = BATTLEFIELD_CONFIG.enemySpawnRegion;
    const ySpan = Math.max(1, region.yMax - region.yMin);
    const yStep = 37;
    const y = region.yMin + (index * yStep) % ySpan;
    const x = region.xMax - (index % 4) * 8;
    return { x, y };
  }

  public isWaveSpawnFinished(difficulty: DifficultyId, waveNumber: number): boolean {
    const wave = WAVE_CONFIG[difficulty][waveNumber - 1];
    return !wave || this.cursor.entryIndex >= wave.entries.length;
  }
}
