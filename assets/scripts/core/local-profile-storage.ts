import { sys } from 'cc';
import type { SavedAchievements, SavedAudioSettings, SquadBattleSaveData } from '../squad/types';

const RUN_SAVE_KEY = 'divine_tower_chess.run_save.v1';
const SETTINGS_KEY = 'divine_tower_chess.settings.v1';
const ACHIEVEMENTS_KEY = 'divine_tower_chess.achievements.v1';

const DEFAULT_SETTINGS: SavedAudioSettings = {
  master: 80,
  music: 70,
  sfx: 80,
};

const DEFAULT_ACHIEVEMENTS: SavedAchievements = {
  firstClear: false,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = sys.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export class LocalProfileStorage {
  public loadSettings(): SavedAudioSettings {
    return readJson<SavedAudioSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  }

  public saveSettings(settings: SavedAudioSettings): void {
    sys.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  public loadAchievements(): SavedAchievements {
    return readJson<SavedAchievements>(ACHIEVEMENTS_KEY, DEFAULT_ACHIEVEMENTS);
  }

  public saveAchievements(achievements: SavedAchievements): void {
    sys.localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  }

  public loadRun(): SquadBattleSaveData | null {
    try {
      const raw = sys.localStorage.getItem(RUN_SAVE_KEY);
      return raw ? JSON.parse(raw) as SquadBattleSaveData : null;
    } catch {
      return null;
    }
  }

  public saveRun(data: SquadBattleSaveData): void {
    sys.localStorage.setItem(RUN_SAVE_KEY, JSON.stringify(data));
  }

  public clearRun(): void {
    sys.localStorage.removeItem(RUN_SAVE_KEY);
  }

  public hasRunSave(): boolean {
    return Boolean(this.loadRun());
  }
}
