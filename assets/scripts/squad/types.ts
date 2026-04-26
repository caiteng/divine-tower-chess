import type { DifficultyId, DivineTaskId, UnitId } from '../models/types';

export type SquadBattlePhase = 'prep' | 'battle' | 'victory' | 'defeat';

export type SquadRole = 'melee' | 'ranged' | 'priest';

export interface Vec2 {
  x: number;
  y: number;
}

export interface UnitBattleStats {
  maxHp: number;
  attackDamage: number;
  attackInterval: number;
  moveSpeed: number;
  attackRange: number;
  reactionRange: number;
  healPower?: number;
}

export interface EnemyBattleStats {
  maxHp: number;
  attackDamage: number;
  attackInterval: number;
  moveSpeed: number;
  attackRange: number;
}

export type UnitCommandType = 'idle' | 'move' | 'focus_enemy' | 'channel_heal';

export interface UnitCommand {
  type: UnitCommandType;
  position?: Vec2;
  targetEnemyId?: string;
  targetAllyId?: string;
}

export interface SquadUnitState {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  isCaptain?: boolean;
  role: SquadRole;
  position: Vec2;
  velocity: Vec2;
  currentHp: number;
  attackCooldownLeft: number;
  alive: boolean;
  assignedTaskId?: string;
  command: UnitCommand;
}

export interface EnemyUnitState {
  instanceId: string;
  enemyType: 'grunt' | 'brute' | 'boss';
  position: Vec2;
  velocity: Vec2;
  currentHp: number;
  attackCooldownLeft: number;
  alive: boolean;
}

export interface WaveSpawnPlan {
  waveNumber: number;
  enemies: Array<{ enemyType: 'grunt' | 'brute' | 'boss'; count: number }>;
}

export interface PersistentUnitProgress {
  unitInstanceId: string;
  divineTaskId?: DivineTaskId;
  divineProgress?: number;
}

export interface RosterUnitState {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  assignedTaskId?: DivineTaskId;
  isCaptain?: boolean;
}

export interface SavedAudioSettings {
  master: number;
  music: number;
  sfx: number;
}

export interface SavedAchievements {
  firstClear: boolean;
}

export interface SquadBattleSaveData {
  difficulty: DifficultyId;
  phase: SquadBattlePhase;
  waveNumber: number;
  gold: number;
  shop: UnitId[];
  bench: RosterUnitState[];
  deployed: RosterUnitState[];
  divineTasks: Array<{
    taskId: DivineTaskId;
    unitInstanceId: string;
    progress: number;
    completed: boolean;
  }>;
  selectedStarterUnitId?: UnitId;
  pendingBattleStart: boolean;
  uiState: SquadBattleSnapshot['uiState'];
  allies: SquadUnitState[];
  enemies: EnemyUnitState[];
}

export interface SquadBattleSnapshot {
  phase: SquadBattlePhase;
  waveNumber: number;
  totalWaves: number;
  currentWave: number;
  gold: number;
  shop: UnitId[];
  bench: RosterUnitState[];
  deployed: RosterUnitState[];
  divineTasks: PersistentUnitProgress[];
  slotConfig: {
    deployed: number;
    bench: number;
    shop: number;
  };
  uiState: {
    prepPanel: 'hidden' | 'rising' | 'visible' | 'falling';
    battlefieldLighting: 'dim' | 'brightening' | 'bright';
    transitionProgress: number;
    nextWaveReady: boolean;
  };
  selectedUnitId?: string;
  allies: SquadUnitState[];
  enemies: EnemyUnitState[];
}

export interface BattleOutcome {
  advancedWave: boolean;
  changedPhase: boolean;
}
