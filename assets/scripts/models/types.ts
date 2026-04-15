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

export interface Vec2 {
  x: number;
  y: number;
}

export interface UnitConfig {
  id: UnitId;
  name: string;
  isDivine?: boolean;
  cost: number;
  baseDamage: number;
  attackInterval: number;
  maxHp: number;
  detectionRange: number;
  attackRange: number;
  moveSpeed: number;
  projectileSpeed?: number;
  healPower?: number;
  skillRadius?: number;
  skillType: 'single' | 'aoe' | 'heal' | 'none';
  behaviorRole: 'melee' | 'ranged' | 'healer' | 'mage';
}

export interface EnemyConfig {
  id: EnemyId;
  name: string;
  maxHp: number;
  moveSpeed: number;
  goldReward: number;
  attackDamage: number;
  attackInterval: number;
  detectionRange: number;
  attackRange: number;
  separationWeight?: number;
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
}

export interface DivineTaskConfig {
  id: DivineTaskId;
  sourceUnitId: UnitId;
  targetUnitId: UnitId;
  triggerChance: number;
  metric: 'kills' | 'healing';
  requirement: number;
}

export interface DivineTaskProgress {
  taskId: DivineTaskId;
  unitInstanceId: string;
  progress: number;
  completed: boolean;
}
