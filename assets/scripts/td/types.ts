
export type TDPhase = 'prep' | 'spawning' | 'battle' | 'victory' | 'defeat';

export type TDStageId = 'stage_1_forest_loop';

export type TDDifficultyId = 'beginner' | 'normal' | 'hard' | 'endless';

export type TDStar = 1 | 2 | 3;

export type TDHeroId =
  | 'archer'
  | 'mage'
  | 'warrior'
  | 'knight'
  | 'assassin'
  | 'priest'
  | 'spearman'
  | 'alchemist'
  | 'gunner'
  | 'druid';

export type TDEnemyId =
  | 'slime'
  | 'shieldling'
  | 'boneguard'
  | 'bat'
  | 'shadehound'
  | 'warlock'
  | 'spore'
  | 'gate_golem'
  | 'sky_lord';

export type TDTargetPriority = 'first' | 'last' | 'strong' | 'fast' | 'air';

export interface TDVec2 {
  x: number;
  y: number;
}

export interface TDTowerSlotState {
  slotId: string;
  position: TDVec2;
  occupiedBy?: string;
  locked?: boolean;
  tags?: string[];
}

export interface TDHeroInstanceState {
  instanceId: string;
  heroId: TDHeroId;
  star: TDStar;
  level: number;
  currentHp: number;
  maxHp: number;
  attackCooldownLeft: number;
  targetPriority: TDTargetPriority;
  deployedSlotId?: string;
  locked?: boolean;
  kills: number;
  skillCooldowns: Record<string, number>;
}

export interface TDEnemyInstanceState {
  instanceId: string;
  enemyId: TDEnemyId;
  currentHp: number;
  maxHp: number;
  speed: number;
  leakDamage: number;
  pathId: string;
  pathProgress: number;
  position: TDVec2;
  alive: boolean;
  leaked: boolean;
  tags: string[];
}

export interface TDWaveState {
  waveIndex: number;
  totalWaves: number;
  started: boolean;
  spawningDone: boolean;
  activeEnemyCount: number;
}

export interface TDCaptainState {
  captainId?: TDHeroId;
  level: number;
  xp: number;
  skillCooldowns: Record<string, number>;
  anchorIndex: number;
}

export interface TDPlayerState {
  life: number;
  gold: number;
  stardust: number;
}

export interface TDStartRunOptions {
  stageId?: TDStageId;
  difficulty?: TDDifficultyId;
  captainId?: TDHeroId;
}

export interface TDSnapshot {
  runId: string;
  phase: TDPhase;
  stageId: TDStageId;
  difficulty: TDDifficultyId;
  life: number;
  gold: number;
  stardust: number;
  waveIndex: number;
  totalWaves: number;
  elapsedSeconds: number;
  captain: TDCaptainState;
  towerSlots: TDTowerSlotState[];
  bench: TDHeroInstanceState[];
  deployed: TDHeroInstanceState[];
  enemies: TDEnemyInstanceState[];
  wave: TDWaveState;
  notice?: string;
}

export interface TDTickResult {
  changedPhase: boolean;
  beforePhase: TDPhase;
  afterPhase: TDPhase;
}
