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
      const lane = index % 2;
      const rowOffset = lane === 0 ? -120 : 120;
      spawned.push({
        instanceId: nextId('enemy'),
        enemyId: entry.enemyId,
        currentHp: cfg.maxHp,
        position: {
          x: BATTLEFIELD_CONFIG.enemySpawnAnchor.x + (index % 3) * 10,
          y: BATTLEFIELD_CONFIG.enemySpawnAnchor.y + rowOffset + ((index % 5) - 2) * 12,
        },
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

  public isWaveSpawnFinished(difficulty: DifficultyId, waveNumber: number): boolean {
    const wave = WAVE_CONFIG[difficulty][waveNumber - 1];
    return !wave || this.cursor.entryIndex >= wave.entries.length;
  }
}
