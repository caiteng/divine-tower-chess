export type DifficultyId = 'beginner' | 'normal' | 'hard';

export type UnitId =
  | 'archer'
  | 'paladin'
  | 'shield_guard'
  | 'warrior'
  | 'mage'
  | 'priest'
  | 'cavalry'
  | 'spearman'
  | 'berserker'
  | 'light_mage';

export type EnemyId = 'slime' | 'wolf' | 'brute';

export type DivineTaskId = 'warrior_to_berserker' | 'priest_to_light_mage';

export interface UnitConfig {
  id: UnitId;
  name: string;
  isDivine?: boolean;
  cost: number;
  baseDamage: number;
  attackInterval: number;
  range: number;
  maxHp: number;
  healPower?: number;
  skillType: 'single' | 'aoe' | 'heal' | 'none';
  aggroRole: 'blocker' | 'melee' | 'ranged' | 'none';
}

export interface EnemyConfig {
  id: EnemyId;
  name: string;
  maxHp: number;
  speed: number;
  goldReward: number;
  crystalDamage: number;
}

export interface WaveEnemyEntry {
  enemyId: EnemyId;
  count: number;
  spawnInterval: number;
}

export interface WaveConfig {
  waveNumber: number;
  entries: WaveEnemyEntry[];
}

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  totalWaves: number;
  startingGold: number;
  refreshCost: number;
  crystalHp: number;
}

export interface DivineTaskConfig {
  id: DivineTaskId;
  sourceUnitId: UnitId;
  targetUnitId: UnitId;
  triggerChance: number;
  metric: 'kills' | 'healing';
  requirement: number;
}

export interface PlacedUnitState {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  lane: number;
  tileIndex: number;
  cooldownLeft: number;
  currentHp: number;
  assignedTaskId?: DivineTaskId;
}

export interface BenchUnitState {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  assignedTaskId?: DivineTaskId;
}

export interface EnemyState {
  instanceId: string;
  enemyId: EnemyId;
  currentHp: number;
  lane: number;
  distanceOnPath: number;
  reachedCrystal: boolean;
}

export interface DivineTaskProgress {
  taskId: DivineTaskId;
  unitInstanceId: string;
  progress: number;
  completed: boolean;
}
