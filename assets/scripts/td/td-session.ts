
import { getTDDifficultyConfig, TD_STARTING_STARDUST, TD_TOTAL_WAVES } from './config/td-game-config';
import { TD_DEFAULT_STAGE_ID } from './config/td-stage-ids';
import { nextTdId } from './systems/td-id';
import type {
  TDCaptainState,
  TDDifficultyId,
  TDEnemyInstanceState,
  TDHeroId,
  TDHeroInstanceState,
  TDPhase,
  TDStageId,
  TDStartRunOptions,
  TDSnapshot,
  TDTickResult,
  TDTowerSlotState,
  TDVec2,
  TDWaveState,
} from './types';

function cloneVec2(position: TDVec2): TDVec2 {
  return { x: position.x, y: position.y };
}

function cloneHero(hero: TDHeroInstanceState): TDHeroInstanceState {
  return {
    ...hero,
    skillCooldowns: { ...hero.skillCooldowns },
  };
}

function cloneEnemy(enemy: TDEnemyInstanceState): TDEnemyInstanceState {
  return {
    ...enemy,
    position: cloneVec2(enemy.position),
    tags: [...enemy.tags],
  };
}

function cloneSlot(slot: TDTowerSlotState): TDTowerSlotState {
  return {
    ...slot,
    position: cloneVec2(slot.position),
    tags: slot.tags ? [...slot.tags] : undefined,
  };
}

function cloneCaptain(captain: TDCaptainState): TDCaptainState {
  return {
    ...captain,
    skillCooldowns: { ...captain.skillCooldowns },
  };
}

export class TowerDefenseSession {
  private runId = '';
  private phase: TDPhase = 'prep';
  private stageId: TDStageId = TD_DEFAULT_STAGE_ID;
  private difficulty: TDDifficultyId = 'normal';
  private life = 10;
  private gold = 20;
  private stardust = TD_STARTING_STARDUST;
  private waveIndex = 1;
  private totalWaves = TD_TOTAL_WAVES;
  private elapsedSeconds = 0;
  private notice: string | undefined;
  private towerSlots: TDTowerSlotState[] = [];
  private bench: TDHeroInstanceState[] = [];
  private deployed: TDHeroInstanceState[] = [];
  private enemies: TDEnemyInstanceState[] = [];
  private captain: TDCaptainState = {
    level: 1,
    xp: 0,
    skillCooldowns: {},
    anchorIndex: 0,
  };

  public constructor(options?: TDStartRunOptions) {
    this.startNewRun(options?.stageId ?? TD_DEFAULT_STAGE_ID, options?.difficulty ?? 'normal', options?.captainId);
  }

  public startNewRun(stageId: TDStageId = TD_DEFAULT_STAGE_ID, difficulty: TDDifficultyId = 'normal', captainId?: TDHeroId): void {
    const difficultyConfig = getTDDifficultyConfig(difficulty);
    this.runId = nextTdId('td_run');
    this.phase = 'prep';
    this.stageId = stageId;
    this.difficulty = difficulty;
    this.life = difficultyConfig.startingLife;
    this.gold = difficultyConfig.startingGold;
    this.stardust = TD_STARTING_STARDUST;
    this.waveIndex = 1;
    this.totalWaves = difficultyConfig.isEndless ? 0 : TD_TOTAL_WAVES;
    this.elapsedSeconds = 0;
    this.notice = '准备阶段：购买英雄并布置塔位。';
    this.towerSlots = [];
    this.bench = [];
    this.deployed = [];
    this.enemies = [];
    this.captain = {
      captainId,
      level: 1,
      xp: 0,
      skillCooldowns: {},
      anchorIndex: 0,
    };
  }

  public getSnapshot(): TDSnapshot {
    return {
      runId: this.runId,
      phase: this.phase,
      stageId: this.stageId,
      difficulty: this.difficulty,
      life: this.life,
      gold: this.gold,
      stardust: this.stardust,
      waveIndex: this.waveIndex,
      totalWaves: this.totalWaves,
      elapsedSeconds: this.elapsedSeconds,
      captain: cloneCaptain(this.captain),
      towerSlots: this.towerSlots.map(cloneSlot),
      bench: this.bench.map(cloneHero),
      deployed: this.deployed.map(cloneHero),
      enemies: this.enemies.map(cloneEnemy),
      wave: this.getWaveState(),
      notice: this.notice,
    };
  }

  public startNextWave(): boolean {
    if (this.phase !== 'prep') return false;
    if (this.isTerminal()) return false;
    this.phase = 'spawning';
    this.notice = `第 ${this.waveIndex} 波开始出怪。`;
    return true;
  }

  public tick(dt = 1 / 60): TDTickResult {
    const beforePhase = this.phase;
    const safeDt = Number.isFinite(dt) && dt > 0 ? dt : 0;
    this.elapsedSeconds += safeDt;

    if (this.phase === 'spawning') {
      this.phase = 'battle';
      this.notice = `第 ${this.waveIndex} 波战斗中。`;
    }

    this.tickCooldowns(safeDt);

    return {
      changedPhase: beforePhase !== this.phase,
      beforePhase,
      afterPhase: this.phase,
    };
  }

  public damageLife(amount: number): number {
    if (this.isTerminal()) return this.life;
    const damage = Math.max(0, Math.floor(amount));
    if (damage <= 0) return this.life;
    this.life = Math.max(0, this.life - damage);
    this.notice = `据点生命 -${damage}`;
    if (this.life <= 0) {
      this.phase = 'defeat';
      this.notice = '据点生命归零，防守失败。';
    }
    return this.life;
  }

  public addGold(amount: number): number {
    const value = Math.max(0, Math.floor(amount));
    this.gold += value;
    if (value > 0) this.notice = `金币 +${value}`;
    return this.gold;
  }

  public spendGold(amount: number): boolean {
    const cost = Math.max(0, Math.floor(amount));
    if (cost > this.gold) return false;
    this.gold -= cost;
    if (cost > 0) this.notice = `金币 -${cost}`;
    return true;
  }

  public isTerminal(): boolean {
    return this.phase === 'victory' || this.phase === 'defeat';
  }

  public getPhase(): TDPhase {
    return this.phase;
  }

  public getLife(): number {
    return this.life;
  }

  public getGold(): number {
    return this.gold;
  }

  private getWaveState(): TDWaveState {
    return {
      waveIndex: this.waveIndex,
      totalWaves: this.totalWaves,
      started: this.phase === 'spawning' || this.phase === 'battle',
      spawningDone: this.phase === 'battle',
      activeEnemyCount: this.enemies.filter((enemy) => enemy.alive && !enemy.leaked).length,
    };
  }

  private tickCooldowns(dt: number): void {
    for (const hero of [...this.bench, ...this.deployed]) {
      hero.attackCooldownLeft = Math.max(0, hero.attackCooldownLeft - dt);
      for (const [skillId, cooldown] of Object.entries(hero.skillCooldowns)) {
        hero.skillCooldowns[skillId] = Math.max(0, cooldown - dt);
      }
    }

    for (const [skillId, cooldown] of Object.entries(this.captain.skillCooldowns)) {
      this.captain.skillCooldowns[skillId] = Math.max(0, cooldown - dt);
    }
  }
}
