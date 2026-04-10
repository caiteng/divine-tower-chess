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
    if (!wave) {
      return [];
    }
    const spawned: EnemyState[] = [];

    this.cursor.spawnCooldown -= dt;
    while (this.cursor.spawnCooldown <= 0) {
      const entry = wave.entries[this.cursor.entryIndex];
      if (!entry) {
        break;
      }

      const lane = this.cursor.spawnedInCurrentEntry % 2;
      const config = ENEMY_CONFIG[entry.enemyId];
      spawned.push({
        instanceId: nextId('enemy'),
        enemyId: entry.enemyId,
        currentHp: config.maxHp,
        lane,
        distanceOnPath: 0,
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

  public isWaveSpawnFinished(difficulty: DifficultyId, waveNumber: number): boolean {
    const wave = WAVE_CONFIG[difficulty][waveNumber - 1];
    return !wave || this.cursor.entryIndex >= wave.entries.length;
  }
}
