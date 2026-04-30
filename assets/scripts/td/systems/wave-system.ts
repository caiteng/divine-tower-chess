import type { TDStageId, TDDifficultyId, TDWaveDefinition, TDWaveEntry } from '../types';
import { getTDWaveDefinitions } from '../config/td-wave-config';

interface SpawnQueueItem extends TDWaveEntry {
  remaining: number;
  nextAt: number;
}

export interface TDWaveTickResult {
  spawned: TDWaveEntry[];
  queueLeft: number;
  spawningDone: boolean;
}

export class TDWaveSystem {
  private waves: TDWaveDefinition[] = [];
  private activeWave: TDWaveDefinition | null = null;
  private queue: SpawnQueueItem[] = [];
  private elapsed = 0;
  private spawningDone = true;

  public load(stageId: TDStageId, difficulty: TDDifficultyId): void {
    this.waves = getTDWaveDefinitions(stageId, difficulty);
    this.activeWave = null;
    this.queue = [];
    this.elapsed = 0;
    this.spawningDone = true;
  }

  public getTotalWaves(): number {
    return this.waves.length;
  }

  public getWave(index: number): TDWaveDefinition | undefined {
    return this.waves[index - 1];
  }

  public getPreview(index: number): string[] {
    return this.getWave(index)?.previewTags ?? [];
  }

  public start(index: number): boolean {
    const wave = this.getWave(index);
    if (!wave) return false;
    this.activeWave = wave;
    this.queue = wave.entries.map((entry, entryIndex) => ({
      ...entry,
      remaining: entry.count,
      nextAt: (entry.spawnDelay ?? 0) + entryIndex * 0.15,
    }));
    this.elapsed = 0;
    this.spawningDone = false;
    return true;
  }

  public tick(dt: number): TDWaveTickResult {
    if (!this.activeWave || this.spawningDone) {
      return { spawned: [], queueLeft: 0, spawningDone: this.spawningDone };
    }

    this.elapsed += Math.max(0, dt);
    const spawned: TDWaveEntry[] = [];

    for (const item of this.queue) {
      while (item.remaining > 0 && this.elapsed >= item.nextAt) {
        spawned.push({
          enemyId: item.enemyId,
          count: 1,
          level: item.level,
          interval: item.interval,
          pathKind: item.pathKind,
        });
        item.remaining -= 1;
        item.nextAt += item.interval;
      }
    }

    const queueLeft = this.queue.reduce((sum, item) => sum + item.remaining, 0);
    this.spawningDone = queueLeft <= 0;
    return { spawned, queueLeft, spawningDone: this.spawningDone };
  }

  public isSpawningDone(): boolean {
    return this.spawningDone;
  }

  public getQueueLeft(): number {
    return this.queue.reduce((sum, item) => sum + item.remaining, 0);
  }

  public getCurrentReward(): number {
    return this.activeWave?.rewardGold ?? 0;
  }
}
