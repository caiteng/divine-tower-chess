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
  crystalDamage: number;
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

export interface DeploymentAnchor {
  id: string;
  position: Vec2;
}

export interface RectRegion {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface PlacedUnitState {
  instanceId: string;
  unitId: UnitId;
  star: 1 | 2 | 3;
  deploymentAnchorId: string;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  cooldownLeft: number;
  currentHp: number;
  targetEnemyId?: string;
  assignedTaskId?: DivineTaskId;

  /** @deprecated 仅用于短期存档兼容，核心逻辑禁止依赖。 */
  lane?: number;
  /** @deprecated 仅用于短期存档兼容，核心逻辑禁止依赖。 */
  tileIndex?: number;
  /** @deprecated 仅用于短期存档兼容，核心逻辑禁止依赖。 */
  placementPointId?: string;
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
  position: Vec2;
  velocity: Vec2;
  radius: number;
  cooldownLeft: number;
  targetUnitId?: string;
  reachedCrystal: boolean;
}

export interface DivineTaskProgress {
  taskId: DivineTaskId;
  unitInstanceId: string;
  progress: number;
  completed: boolean;
}

export interface BattlefieldConfig {
  width: number;
  height: number;
  crystalPosition: Vec2;
  crystalRadius: number;
  allyDeploymentRegion: RectRegion;
  allyDeploymentAnchors: DeploymentAnchor[];
  enemySpawnRegion: RectRegion;
}
