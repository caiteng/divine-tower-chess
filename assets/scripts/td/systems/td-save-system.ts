import type { TDSaveData } from '../types';

export const TD_SAVE_VERSION = 1;

export class TDSaveSystem {
  public isValid(data: unknown): data is TDSaveData {
    if (!data || typeof data !== 'object') return false;
    const value = data as Partial<TDSaveData>;
    return value.version === TD_SAVE_VERSION
      && typeof value.runId === 'string'
      && typeof value.life === 'number'
      && typeof value.gold === 'number'
      && Array.isArray(value.towerSlots)
      && Array.isArray(value.bench)
      && Array.isArray(value.deployed)
      && Array.isArray(value.enemies);
  }

  public clone(data: TDSaveData): TDSaveData {
    return JSON.parse(JSON.stringify(data)) as TDSaveData;
  }
}
