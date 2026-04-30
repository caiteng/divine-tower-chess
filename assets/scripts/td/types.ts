export type TDPhase = 'prep' | 'spawning' | 'battle' | 'victory' | 'defeat';

export type TDStageId =
  | 'stage_1_forest_loop'
  | 'stage_2_twin_bridge'
  | 'stage_3_lost_corridor'
  | 'stage_4_forge_cross'
  | 'stage_5_sky_sanctum';

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

export type TDDamageType = 'physical' | 'magic' | 'true' | 'healing' | 'poison' | 'explosive';

export type TDTargetPriority = 'first' | 'last' | 'strong' | 'fast' | 'air';

export type TDPathKind = 'ground' | 'air';

export interface TDVec2 {
  x: number;
  y: number;
}

export interface TDPathConfig {
  pathId: string;
  kind: TDPathKind;
  points: TDVec2[];
}

export interface TDTowerSlotState {
  slotId: string;
  position: TDVec2;
  occupiedBy?: string;
  locked?: boolean;
  tags?: string[];
}

export interface TDCaptainAnchor {
  anchorId: string;
  position: TDVec2;
}

export interface TDMapConfig {
  stageId: TDStageId;
  name: string;
  size: { width: number; height: number };
  backgroundId: string;
  groundPaths: TDPathConfig[];
  airPaths: TDPathConfig[];
  towerSlots: TDTowerSlotState[];
  captainAnchors: TDCaptainAnchor[];
  entranceMarkers: TDVec2[];
  exitMarker: TDVec2;
}

export interface TDHeroConfig {
  heroId: TDHeroId;
  name: string;
  cost: number;
  maxHp: number;
  attackDamage: number;
  attackInterval: number;
  attackRange: number;
  armor: number;
  blockCount: number;
  guardRadius: number;
  canAttackAir: boolean;
  revealStealth: boolean;
  damageType: TDDamageType;
  armorPierceRatio: number;
  magicPierceRatio: number;
  splashRadius: number;
  tags: string[];
  skillIds: string[];
}

export interface TDEnemyConfig {
  enemyId: TDEnemyId;
  name: string;
  maxHp: number;
  speed: number;
  armor: number;
  magicResist: number;
  leakDamage: number;
  killGold: number;
  pathKind: TDPathKind;
  tags: string[];
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
  speedMultiplier: number;
  leakDamage: number;
  pathId: string;
  pathKind: TDPathKind;
  pathProgress: number;
  position: TDVec2;
  alive: boolean;
  leaked: boolean;
  level: number;
  armor: number;
  magicResist: number;
  tags: string[];
  status: {
    slowedSeconds?: number;
    stunnedSeconds?: number;
    revealedSeconds?: number;
    shieldValue?: number;
  };
}

export interface TDWaveEntry {
  enemyId: TDEnemyId;
  count: number;
  level: number;
  interval: number;
  spawnDelay?: number;
  pathKind?: TDPathKind;
}

export interface TDWaveDefinition {
  stageId: TDStageId;
  waveIndex: number;
  rewardGold: number;
  entries: TDWaveEntry[];
  previewTags: string[];
}

export interface TDWaveState {
  waveIndex: number;
  totalWaves: number;
  started: boolean;
  spawningDone: boolean;
  activeEnemyCount: number;
  spawnQueueLeft: number;
  nextWavePreview: string[];
}

export interface TDShopSlotState {
  slotIndex: number;
  heroId?: TDHeroId;
  cost: number;
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
  shop: TDShopSlotState[];
  bench: TDHeroInstanceState[];
  deployed: TDHeroInstanceState[];
  enemies: TDEnemyInstanceState[];
  wave: TDWaveState;
  effects: TDEffectState[];
  notice?: string;
}

export interface TDTickResult {
  changedPhase: boolean;
  beforePhase: TDPhase;
  afterPhase: TDPhase;
  spawned: number;
  leaked: number;
  killed: number;
  awardedGold: number;
  advancedWave: boolean;
}

export interface TDEffectState {
  effectId: string;
  kind: 'damage' | 'heal' | 'projectile' | 'slow' | 'stun' | 'skill' | 'merge' | 'leak' | 'boss';
  position: TDVec2;
  from?: TDVec2;
  value?: number;
  label?: string;
  ttl: number;
  age: number;
}

export interface TDSaveData {
  version: number;
  runId: string;
  phase: TDPhase;
  stageId: TDStageId;
  difficulty: TDDifficultyId;
  life: number;
  gold: number;
  stardust: number;
  waveIndex: number;
  elapsedSeconds: number;
  captain: TDCaptainState;
  towerSlots: TDTowerSlotState[];
  shop: TDShopSlotState[];
  bench: TDHeroInstanceState[];
  deployed: TDHeroInstanceState[];
  enemies: TDEnemyInstanceState[];
}
