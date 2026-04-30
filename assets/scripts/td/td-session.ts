import { getTDDifficultyConfig, TD_STARTING_STARDUST } from './config/td-game-config';
import { getTDHeroConfig } from './config/td-hero-config';
import { getTDMapConfig } from './config/td-map-config';
import { getTDEnemyConfig, scaleTDEnemyConfig } from './config/td-enemy-config';
import { getTDRefreshCost } from './config/td-shop-config';
import { TD_DEFAULT_STAGE_ID } from './config/td-stage-ids';
import { EnemyPathSystem, choosePath } from './systems/enemy-path-system';
import { TDCaptainSystem } from './systems/captain-system';
import { TDCombatSystem } from './systems/td-combat-system';
import { TDEconomySystem } from './systems/td-economy-system';
import { nextTdId, syncTdIdSeedFromIds } from './systems/td-id';
import { TDLifeSystem } from './systems/life-system';
import { TDPlacementSystem } from './systems/placement-system';
import { TDRosterSystem } from './systems/td-roster-system';
import { TDSaveSystem, TD_SAVE_VERSION } from './systems/td-save-system';
import { TDShopSystem } from './systems/td-shop-system';
import { TDWaveSystem } from './systems/wave-system';
import type {
  TDCaptainState,
  TDDifficultyId,
  TDEffectState,
  TDEnemyId,
  TDEnemyInstanceState,
  TDHeroId,
  TDHeroInstanceState,
  TDPhase,
  TDStageId,
  TDStartRunOptions,
  TDSaveData,
  TDSnapshot,
  TDTickResult,
  TDTowerSlotState,
  TDVec2,
} from './types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class TowerDefenseSession {
  private readonly pathSystem = new EnemyPathSystem();
  private readonly lifeSystem = new TDLifeSystem();
  private readonly economy = new TDEconomySystem();
  private readonly shop = new TDShopSystem();
  private readonly roster = new TDRosterSystem();
  private readonly placement = new TDPlacementSystem();
  private readonly combat = new TDCombatSystem();
  private readonly captainSystem = new TDCaptainSystem();
  private readonly waveSystem = new TDWaveSystem();
  private readonly saveSystem = new TDSaveSystem();

  private runId = '';
  private phase: TDPhase = 'prep';
  private stageId: TDStageId = TD_DEFAULT_STAGE_ID;
  private difficulty: TDDifficultyId = 'normal';
  private life = 10;
  private waveIndex = 1;
  private totalWaves = 10;
  private elapsedSeconds = 0;
  private notice: string | undefined;
  private towerSlots: TDTowerSlotState[] = [];
  private enemies: TDEnemyInstanceState[] = [];
  private effects: TDEffectState[] = [];
  private captain: TDCaptainState = { level: 1, xp: 0, skillCooldowns: {}, anchorIndex: 0 };

  public constructor(options?: TDStartRunOptions) {
    this.startNewRun(options?.stageId ?? TD_DEFAULT_STAGE_ID, options?.difficulty ?? 'normal', options?.captainId);
  }

  public startNewRun(stageId: TDStageId = TD_DEFAULT_STAGE_ID, difficulty: TDDifficultyId = 'normal', captainId?: TDHeroId): void {
    const difficultyConfig = getTDDifficultyConfig(difficulty);
    const map = getTDMapConfig(stageId);
    this.runId = nextTdId('td_run');
    this.phase = 'prep';
    this.stageId = stageId;
    this.difficulty = difficulty;
    this.life = difficultyConfig.startingLife;
    this.economy.setGold(difficultyConfig.startingGold);
    this.economy.setStardust(TD_STARTING_STARDUST);
    this.waveIndex = 1;
    this.elapsedSeconds = 0;
    this.notice = '准备阶段：购买英雄并布置塔位。';
    this.towerSlots = clone(map.towerSlots);
    this.enemies = [];
    this.effects = [];
    this.roster.reset();
    this.shop.refresh();
    this.waveSystem.load(stageId, difficulty);
    this.totalWaves = difficultyConfig.isEndless ? 0 : this.waveSystem.getTotalWaves();
    this.captain = { captainId, level: 1, xp: 0, skillCooldowns: {}, anchorIndex: 0 };
  }

  public getSnapshot(): TDSnapshot {
    return {
      runId: this.runId,
      phase: this.phase,
      stageId: this.stageId,
      difficulty: this.difficulty,
      life: this.life,
      gold: this.economy.getGold(),
      stardust: this.economy.getStardust(),
      waveIndex: this.waveIndex,
      totalWaves: this.totalWaves,
      elapsedSeconds: this.elapsedSeconds,
      captain: clone(this.captain),
      towerSlots: clone(this.towerSlots),
      shop: clone(this.shop.getEntries()),
      bench: clone(this.roster.getBench()),
      deployed: clone(this.roster.getDeployed()),
      enemies: clone(this.enemies),
      wave: {
        waveIndex: this.waveIndex,
        totalWaves: this.totalWaves,
        started: this.phase === 'spawning' || this.phase === 'battle',
        spawningDone: this.waveSystem.isSpawningDone(),
        activeEnemyCount: this.enemies.filter((e) => e.alive && !e.leaked).length,
        spawnQueueLeft: this.waveSystem.getQueueLeft(),
        nextWavePreview: this.waveSystem.getPreview(this.waveIndex),
      },
      effects: clone(this.effects),
      notice: this.notice,
    };
  }

  public startNextWave(): boolean {
    if (this.phase !== 'prep' || this.isTerminal()) return false;
    if (!this.waveSystem.start(this.waveIndex)) return false;
    this.phase = 'spawning';
    this.notice = `第 ${this.waveIndex} 波开始。`;
    return true;
  }

  public tick(dt = 1 / 60): TDTickResult {
    const beforePhase = this.phase;
    const safeDt = Number.isFinite(dt) && dt > 0 ? dt : 0;
    this.elapsedSeconds += safeDt;
    let spawned = 0;
    let leaked = 0;
    let killed = 0;
    let awardedGold = 0;
    let advancedWave = false;

    this.tickEffects(safeDt);
    this.captainSystem.tick(this.captain, safeDt);

    if (this.phase === 'spawning' || this.phase === 'battle') {
      const waveTick = this.waveSystem.tick(safeDt);
      for (const spawn of waveTick.spawned) {
        for (let i = 0; i < spawn.count; i += 1) {
          this.enemies.push(this.createEnemy(spawn.enemyId, spawn.level, spawn.pathKind));
          spawned += 1;
        }
      }
      if (spawned > 0 && this.phase === 'spawning') this.phase = 'battle';

      for (const enemy of this.enemies) {
        enemy.speedMultiplier = 1;
        if ((enemy.status.slowedSeconds ?? 0) > 0) {
          enemy.status.slowedSeconds = Math.max(0, (enemy.status.slowedSeconds ?? 0) - safeDt);
          enemy.speedMultiplier = Math.min(enemy.speedMultiplier, 0.5);
        }
        if ((enemy.status.revealedSeconds ?? 0) > 0) {
          enemy.status.revealedSeconds = Math.max(0, (enemy.status.revealedSeconds ?? 0) - safeDt);
        }
      }

      const combatResult = this.combat.tick(safeDt, this.roster.getDeployed(), this.towerSlots, this.enemies);
      killed += combatResult.killed;
      awardedGold += combatResult.awardedGold;
      this.captainSystem.addXp(this.captain, combatResult.captainXp);
      this.effects.push(...combatResult.effects);

      const map = getTDMapConfig(this.stageId);
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.leaked) continue;
        const path = choosePath(map, enemy.pathKind, Number(enemy.instanceId.split('_').pop() ?? 0));
        this.pathSystem.advanceEnemy(enemy, path, safeDt);
        if (this.pathSystem.hasReachedExit(enemy)) {
          enemy.leaked = true;
          leaked += 1;
          this.damageLife(enemy.leakDamage);
          this.effects.push({
            effectId: nextTdId('td_effect'),
            kind: 'leak',
            position: { ...enemy.position },
            value: enemy.leakDamage,
            ttl: 1,
            age: 0,
          });
        }
      }

      if (awardedGold > 0) this.economy.earnGold(awardedGold);
      this.enemies = this.enemies.filter((enemy) => enemy.alive && !enemy.leaked);

      if (!this.isTerminal() && this.waveSystem.isSpawningDone() && this.enemies.length === 0) {
        const reward = Math.round(this.waveSystem.getCurrentReward() * getTDDifficultyConfig(this.difficulty).goldMultiplier);
        if (this.waveIndex >= this.waveSystem.getTotalWaves() && this.difficulty !== 'endless') {
          this.economy.earnGold(reward);
          this.phase = 'victory';
          this.notice = '防守成功，关卡胜利。';
        } else {
          this.economy.earnGold(reward);
          this.waveIndex += 1;
          this.phase = 'prep';
          this.shop.refresh();
          this.roster.getDeployed().forEach((hero) => {
            hero.attackCooldownLeft = 0;
          });
          this.notice = `第 ${this.waveIndex - 1} 波清除，金币 +${reward}`;
          advancedWave = true;
        }
      }
    }

    return { changedPhase: beforePhase !== this.phase, beforePhase, afterPhase: this.phase, spawned, leaked, killed, awardedGold, advancedWave };
  }

  public buyShopHero(slotIndex: number): boolean {
    if (this.phase !== 'prep') return false;
    const heroId = this.shop.peek(slotIndex);
    if (!heroId) return false;
    const cost = getTDHeroConfig(heroId).cost;
    if (!this.economy.spendGold(cost)) return false;
    const added = this.roster.addToBench(heroId);
    if (!added) {
      this.economy.earnGold(cost);
      return false;
    }
    this.shop.take(slotIndex);
    this.notice = `购买 ${getTDHeroConfig(heroId).name}`;
    return true;
  }

  public refreshShopByCost(): boolean {
    if (this.phase !== 'prep') return false;
    const cost = getTDRefreshCost(0);
    if (!this.economy.spendGold(cost)) return false;
    this.shop.refresh();
    this.notice = '商店已刷新。';
    return true;
  }

  public placeHero(heroInstanceId: string, slotId: string): boolean {
    if (this.phase !== 'prep') return false;
    const slot = this.towerSlots.find((entry) => entry.slotId === slotId);
    const hero = this.roster.find(heroInstanceId);
    if (!slot || !hero || !this.placement.canPlace(hero, slot)) return false;
    const placed = this.roster.place(heroInstanceId, slotId);
    if (!placed) return false;
    slot.occupiedBy = heroInstanceId;
    this.notice = '英雄已放置。';
    return true;
  }

  public recallHero(heroInstanceId: string): boolean {
    if (this.phase !== 'prep') return false;
    this.placement.clearSlotForHero(this.towerSlots, heroInstanceId);
    const recalled = this.roster.recall(heroInstanceId);
    if (!recalled) return false;
    this.notice = '英雄已撤回。';
    return true;
  }

  public sellHero(heroInstanceId: string): boolean {
    if (this.phase !== 'prep') return false;
    this.placement.clearSlotForHero(this.towerSlots, heroInstanceId);
    const removed = this.roster.remove(heroInstanceId);
    if (!removed) return false;
    const price = this.roster.getSellPrice(removed);
    this.economy.earnGold(price);
    this.notice = `售出英雄，金币 +${price}`;
    return true;
  }

  public castCaptainSkill(skillId?: string, target?: TDVec2): boolean {
    if (!(this.phase === 'spawning' || this.phase === 'battle')) return false;
    const map = getTDMapConfig(this.stageId);
    const resolvedTarget = target ?? map.captainAnchors[this.captain.anchorIndex]?.position ?? map.exitMarker;
    const result = this.captainSystem.cast(this.captain, skillId, resolvedTarget, this.enemies);
    if (!result.casted) {
      this.notice = result.reason;
      return false;
    }
    if (result.gold > 0) this.economy.earnGold(result.gold);
    this.effects.push(...result.effects);
    this.enemies = this.enemies.filter((enemy) => enemy.alive && !enemy.leaked);
    this.notice = '队长技能释放。';
    return true;
  }

  public damageLife(amount: number): number {
    if (this.isTerminal()) return this.life;
    this.life = this.lifeSystem.damage(this.life, amount);
    if (this.lifeSystem.isDefeated(this.life)) {
      this.phase = 'defeat';
      this.notice = '据点生命归零，防守失败。';
    }
    return this.life;
  }

  public addGold(amount: number): number {
    return this.economy.earnGold(amount);
  }

  public spendGold(amount: number): boolean {
    return this.economy.spendGold(amount);
  }

  public isTerminal(): boolean {
    return this.phase === 'victory' || this.phase === 'defeat';
  }

  public exportSaveData(): TDSaveData {
    return {
      version: TD_SAVE_VERSION,
      runId: this.runId,
      phase: this.phase,
      stageId: this.stageId,
      difficulty: this.difficulty,
      life: this.life,
      gold: this.economy.getGold(),
      stardust: this.economy.getStardust(),
      waveIndex: this.waveIndex,
      elapsedSeconds: this.elapsedSeconds,
      captain: clone(this.captain),
      towerSlots: clone(this.towerSlots),
      shop: clone(this.shop.getEntries()),
      bench: clone(this.roster.getBench()),
      deployed: clone(this.roster.getDeployed()),
      enemies: clone(this.enemies),
    };
  }

  public loadFromSaveData(data: TDSaveData): boolean {
    if (!this.saveSystem.isValid(data)) return false;
    this.runId = data.runId;
    this.phase = data.phase;
    this.stageId = data.stageId;
    this.difficulty = data.difficulty;
    this.life = data.life;
    this.economy.setGold(data.gold);
    this.economy.setStardust(data.stardust);
    this.waveIndex = data.waveIndex;
    this.elapsedSeconds = data.elapsedSeconds;
    this.captain = clone(data.captain);
    this.towerSlots = clone(data.towerSlots);
    this.roster.setState(data.bench, data.deployed);
    this.enemies = clone(data.enemies);
    this.effects = [];
    this.waveSystem.load(data.stageId, data.difficulty);
    this.totalWaves = getTDDifficultyConfig(data.difficulty).isEndless ? 0 : this.waveSystem.getTotalWaves();
    this.shop.setEntries(data.shop.map((slot) => slot.heroId));
    syncTdIdSeedFromIds([
      data.runId,
      ...data.bench.map((hero) => hero.instanceId),
      ...data.deployed.map((hero) => hero.instanceId),
      ...data.enemies.map((enemy) => enemy.instanceId),
    ]);
    return true;
  }

  public debugSetShop(heroIds: Array<TDHeroId | undefined>): void {
    this.shop.setEntries(heroIds);
  }

  public debugAddHero(heroId: TDHeroId, star: 1 | 2 | 3 = 1): TDHeroInstanceState | null {
    const before = this.roster.getBench().length;
    for (let i = 0; i < (star === 3 ? 9 : star === 2 ? 3 : 1); i += 1) {
      this.roster.addToBench(heroId);
    }
    return this.roster.getBench()[before] ?? this.roster.getBench().find((hero) => hero.heroId === heroId && hero.star === star) ?? null;
  }

  public debugCompleteCurrentWaveForTest(): void {
    if (!(this.phase === 'spawning' || this.phase === 'battle')) return;
    this.enemies = [];
    while (!this.waveSystem.isSpawningDone()) {
      this.waveSystem.tick(999);
    }
    const reward = this.waveSystem.getCurrentReward();
    if (this.waveIndex >= this.waveSystem.getTotalWaves() && this.difficulty !== 'endless') {
      this.economy.earnGold(reward);
      this.phase = 'victory';
    } else {
      this.economy.earnGold(reward);
      this.waveIndex += 1;
      this.phase = 'prep';
      this.shop.refresh();
    }
  }

  private createEnemy(enemyId: TDEnemyId, level: number, pathKindOverride?: 'ground' | 'air'): TDEnemyInstanceState {
    const cfg = scaleTDEnemyConfig(enemyId, level, this.difficulty);
    const map = getTDMapConfig(this.stageId);
    const pathKind = pathKindOverride ?? cfg.pathKind;
    const path = choosePath(map, pathKind, this.enemies.length);
    const maxHp = cfg.maxHp;
    return {
      instanceId: nextTdId('td_enemy'),
      enemyId,
      level,
      currentHp: maxHp,
      maxHp,
      speed: cfg.speed,
      speedMultiplier: 1,
      leakDamage: cfg.leakDamage,
      pathId: path.pathId,
      pathKind,
      pathProgress: 0,
      position: { ...path.points[0] },
      alive: true,
      leaked: false,
      armor: cfg.armor,
      magicResist: cfg.magicResist,
      tags: [...cfg.tags],
      status: {},
    };
  }

  private tickEffects(dt: number): void {
    this.effects = this.effects
      .map((effect) => ({ ...effect, age: effect.age + dt }))
      .filter((effect) => effect.age < effect.ttl);
  }
}
