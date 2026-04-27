export type DifficultyId = 'beginner' | 'normal' | 'hard';

export type UnitId =
  | 'archer'
  | 'shield_guard'
  | 'warrior'
  | 'mage'
  | 'priest'
  | 'spearman'
  | 'berserker'
  | 'light_mage';

export type EnemyId = 'grunt' | 'brute' | 'boss';

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
  armor: number;
  armorPierceRatio: number;
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
