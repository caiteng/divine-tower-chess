import { DIFFICULTY_CONFIG } from '../config/difficulty-config';
import { UNIT_CONFIG } from '../config/unit-config';
import type { DifficultyId, DivineTaskId, UnitId } from '../models/types';
import { DivineTaskSystem } from '../systems/divine-task-system';
import { EconomySystem } from '../systems/economy-system';
import { ShopSystem } from '../systems/shop-system';
import { nextId, syncIdSeedFromIds } from '../utils/id';
import { DEFAULT_WAVES, ENEMY_STATS, SQUAD_BATTLEFIELD, SQUAD_ROLE_MAP, SQUAD_UNIT_STATS } from './config/squad-battle-config';
import { SQUAD_BENCH_SLOTS, SQUAD_DEPLOY_SLOTS, SQUAD_SHOP_SLOTS } from './config/squad-ui-layout-config';
import type { WaveTransitionUiState } from './config/squad-ui-layout-config';
import { AttackSystem } from './systems/attack-system';
import { EnemyAiSystem } from './systems/enemy-ai-system';
import { HealingSystem } from './systems/healing-system';
import { CollisionSystem } from './systems/collision-system';
import { MovementSystem } from './systems/movement-system';
import { RosterSystem } from './systems/roster-system';
import { TargetingSystem } from './systems/targeting-system';
import { UnitCommandSystem } from './systems/unit-command-system';
import type { BattleOutcome, EnemyUnitState, SquadBattlePhase, SquadBattleSaveData, SquadBattleSnapshot, SquadUnitState, Vec2, WaveSpawnPlan } from './types';

export class SquadBattleSession {
  public onVictory?: () => void;

  private readonly commandSystem = new UnitCommandSystem();
  private readonly movementSystem = new MovementSystem();
  private readonly targetingSystem = new TargetingSystem();
  private readonly attackSystem = new AttackSystem();
  private readonly healingSystem = new HealingSystem();
  private readonly enemyAiSystem = new EnemyAiSystem();
  private readonly collisionSystem = new CollisionSystem();
  private selectedStarterUnitId: UnitId | undefined;

  private readonly roster = new RosterSystem();
  private readonly economy = new EconomySystem();
  private readonly shop = new ShopSystem();
  private divine = new DivineTaskSystem();

  private phase: SquadBattlePhase = 'prep';
  private difficulty: DifficultyId = 'beginner';
  private waveNumber = 1;
  private readonly waves: WaveSpawnPlan[];
  private allies: SquadUnitState[] = [];
  private enemies: EnemyUnitState[] = [];
  private pendingBattleStart = false;
  private uiState: WaveTransitionUiState = {
    prepPanel: 'visible',
    battlefieldLighting: 'dim',
    transitionProgress: 1,
    nextWaveReady: true,
  };

  public constructor(waves: WaveSpawnPlan[] = DEFAULT_WAVES) {
    this.waves = waves;
  }

  public startNewRun(difficulty: DifficultyId = 'beginner', starterUnitId?: UnitId): void {
    this.phase = 'prep';
    this.difficulty = difficulty;
    this.selectedStarterUnitId = starterUnitId;
    this.waveNumber = 1;
    this.allies = [];
    this.enemies = [];
    this.roster.reset();
    this.divine = new DivineTaskSystem();
    this.economy.setStartingGold(DIFFICULTY_CONFIG[difficulty].startingGold);
    this.shop.refresh();
    if (starterUnitId) {
      this.roster.addToBenchWithState({
        unitId: starterUnitId,
        star: 1,
        isCaptain: true,
      });
    }
    this.pendingBattleStart = false;
    this.uiState = {
      prepPanel: 'visible',
      battlefieldLighting: 'dim',
      transitionProgress: 1,
      nextWaveReady: true,
    };
  }

  public refreshShopByCost(): boolean {
    if (this.phase !== 'prep') return false;
    const cost = DIFFICULTY_CONFIG[this.difficulty].refreshCost;
    if (!this.economy.spend(cost)) return false;
    this.shop.refresh();
    return true;
  }

  public buyShopUnit(slotIndex: number): boolean {
    if (this.phase !== 'prep') return false;
    const unitId = this.shop.peek(slotIndex);
    if (!unitId) return false;

    const cost = UNIT_CONFIG[unitId].cost;
    if (!this.economy.spend(cost)) return false;

    const bought = this.roster.addToBench(unitId);
    if (!bought) {
      this.economy.earn(cost);
      return false;
    }
    this.shop.take(slotIndex);
    return true;
  }

  public deployFromBench(instanceId: string): boolean {
    if (this.phase !== 'prep') return false;
    return this.roster.deploy(instanceId);
  }

  public recallFromDeployed(instanceId: string): boolean {
    if (this.phase !== 'prep') return false;
    return this.roster.recall(instanceId);
  }

  public startBattle(): boolean {
    if (this.phase !== 'prep') return false;
    if (this.pendingBattleStart) return false;
    if (this.roster.getDeployCount() === 0) return false;
    this.uiState = {
      prepPanel: 'falling',
      battlefieldLighting: 'brightening',
      transitionProgress: 0,
      nextWaveReady: false,
    };
    this.pendingBattleStart = true;
    return true;
  }

  public startNextWaveFromPrep(): boolean {
    return this.startBattle();
  }

  public tick(dt = 0.1): BattleOutcome {
    const before = this.phase;
    this.tickWaveTransitionUi(dt);
    if (this.phase !== 'battle') {
      return { advancedWave: false, changedPhase: false };
    }

    const killsByUnit: Record<string, number> = {};
    const healingByUnit: Record<string, number> = {};

    this.tickAllies(dt, killsByUnit, healingByUnit);
    this.enemyAiSystem.tick(this.enemies, this.allies, dt);
    this.collisionSystem.resolve(this.allies, this.enemies, 4);

    this.enemies = this.enemies.filter((enemy) => enemy.alive);

    for (const [unitInstanceId, kills] of Object.entries(killsByUnit)) {
      this.divine.addMetric(unitInstanceId, 'kills', kills);
      const completed = this.divine.resolveCompleted(unitInstanceId);
      if (completed) {
        this.evolveUnitInstance(unitInstanceId, completed.targetUnitId);
      }
    }

    for (const [unitInstanceId, healing] of Object.entries(healingByUnit)) {
      this.divine.addMetric(unitInstanceId, 'healing', healing);
      const completed = this.divine.resolveCompleted(unitInstanceId);
      if (completed) {
        this.evolveUnitInstance(unitInstanceId, completed.targetUnitId);
      }
    }

    if (this.allies.filter((ally) => ally.alive).length === 0) {
      this.phase = 'defeat';
      return { advancedWave: false, changedPhase: before !== this.phase };
    }

    if (this.enemies.length === 0) {
      if (this.waveNumber >= this.waves.length) {
        this.phase = 'victory';
        this.onVictory?.();
        return { advancedWave: false, changedPhase: before !== this.phase };
      }

      this.waveNumber += 1;
      this.phase = 'prep';
      this.resetBattleStateForNextWave();
      this.shop.refresh();
      this.uiState = {
        prepPanel: 'rising',
        battlefieldLighting: 'dim',
        transitionProgress: 0,
        nextWaveReady: false,
      };
      return { advancedWave: true, changedPhase: before !== this.phase };
    }

    return { advancedWave: false, changedPhase: before !== this.phase };
  }

  private tickWaveTransitionUi(dt: number): void {
    if (this.uiState.transitionProgress >= 1) {
      if (this.pendingBattleStart && this.phase === 'prep') {
        this.beginBattleNow();
      }
      return;
    }
    this.uiState.transitionProgress = Math.min(1, this.uiState.transitionProgress + dt * 2.5);
    if (this.uiState.transitionProgress >= 1) {
      if (this.pendingBattleStart) {
        this.uiState.prepPanel = 'hidden';
        this.uiState.battlefieldLighting = 'bright';
        this.uiState.nextWaveReady = true;
        if (this.phase === 'prep') {
          this.beginBattleNow();
        }
      } else {
        this.uiState.prepPanel = 'visible';
        this.uiState.battlefieldLighting = 'dim';
        this.uiState.nextWaveReady = true;
      }
    }
  }

  private beginBattleNow(): void {
    this.assignDivineTasksAtRoundStart();
    this.phase = 'battle';
    this.pendingBattleStart = false;
    this.allies = this.buildBattleAlliesFromDeployedRoster();
    this.spawnWave(this.waveNumber);
  }

  public selectUnit(unitInstanceId: string): boolean {
    return this.commandSystem.selectUnit(unitInstanceId, this.allies);
  }

  public commandMoveToGround(position: Vec2): boolean {
    return this.commandSystem.issueMoveToGround(position, this.allies);
  }

  public commandFocusEnemy(enemyInstanceId: string): boolean {
    return this.commandSystem.issueFocusEnemy(enemyInstanceId, this.allies);
  }

  public commandPriestHeal(allyInstanceId: string): boolean {
    return this.commandSystem.issueChannelHealAlly(allyInstanceId, this.allies);
  }

  public sellUnit(instanceId: string): boolean {
    if (this.phase !== 'prep') return false;
    const snap = this.getSnapshot();
    const target = [...snap.bench, ...snap.deployed].find((u) => u.instanceId === instanceId);
    if (!target) return false;
    if (!this.roster.removeUnit(instanceId)) return false;
    const sellPrice = Math.max(1, Math.floor((UNIT_CONFIG[target.unitId].cost * target.star) / 2));
    this.economy.earn(sellPrice);
    return true;
  }

  public getSnapshot(): SquadBattleSnapshot {
    return {
      phase: this.phase,
      waveNumber: this.waveNumber,
      totalWaves: this.waves.length,
      currentWave: this.waveNumber,
      gold: this.economy.getGold(),
      shop: this.shop.getEntries(),
      bench: this.roster.getBench(),
      deployed: this.roster.getDeployed(),
      divineTasks: this.divine.getAllProgress().map((p) => ({
        unitInstanceId: p.unitInstanceId,
        divineTaskId: p.taskId,
        divineProgress: p.progress,
      })),
      slotConfig: {
        deployed: SQUAD_DEPLOY_SLOTS,
        bench: SQUAD_BENCH_SLOTS,
        shop: SQUAD_SHOP_SLOTS,
      },
      uiState: { ...this.uiState },
      selectedUnitId: this.commandSystem.getSelectedUnitId(),
      allies: this.allies.map((u) => ({ ...u, position: { ...u.position }, velocity: { ...u.velocity }, command: { ...u.command } })),
      enemies: this.enemies.map((e) => ({ ...e, position: { ...e.position }, velocity: { ...e.velocity } })),
    };
  }

  public exportSaveData(): SquadBattleSaveData {
    return {
      difficulty: this.difficulty,
      phase: this.phase,
      waveNumber: this.waveNumber,
      gold: this.economy.getGold(),
      shop: this.shop.getEntries(),
      bench: this.roster.getBench(),
      deployed: this.roster.getDeployed(),
      divineTasks: this.divine.getAllProgress().map((progress) => ({ ...progress })),
      selectedStarterUnitId: this.selectedStarterUnitId,
      pendingBattleStart: this.pendingBattleStart,
      uiState: { ...this.uiState },
      allies: this.allies.map((u) => ({ ...u, position: { ...u.position }, velocity: { ...u.velocity }, command: { ...u.command } })),
      enemies: this.enemies.map((e) => ({ ...e, position: { ...e.position }, velocity: { ...e.velocity } })),
    };
  }

  public loadFromSaveData(data: SquadBattleSaveData): boolean {
    if (!data) return false;
    this.phase = data.phase;
    this.difficulty = data.difficulty;
    this.selectedStarterUnitId = data.selectedStarterUnitId;
    this.waveNumber = data.waveNumber;
    this.pendingBattleStart = data.pendingBattleStart;
    this.uiState = { ...data.uiState };
    this.economy.setGold(data.gold);
    this.shop.setEntries(data.shop);
    this.roster.setState(data.bench, data.deployed);
    this.divine = new DivineTaskSystem();
    this.divine.setAllProgress(data.divineTasks.map((progress) => ({ ...progress })));
    this.allies = data.allies.map((u) => ({ ...u, position: { ...u.position }, velocity: { ...u.velocity }, command: { ...u.command } }));
    this.enemies = data.enemies.map((e) => ({ ...e, position: { ...e.position }, velocity: { ...e.velocity } }));
    this.commandSystem.clearSelection();

    syncIdSeedFromIds([
      ...data.bench.map((u) => u.instanceId),
      ...data.deployed.map((u) => u.instanceId),
      ...data.allies.map((u) => u.instanceId),
      ...data.enemies.map((u) => u.instanceId),
    ]);
    return true;
  }

  private tickAllies(dt: number, killsByUnit: Record<string, number>, healingByUnit: Record<string, number>): void {
    for (const ally of this.allies) {
      if (!ally.alive) continue;
      ally.attackCooldownLeft = Math.max(0, ally.attackCooldownLeft - dt);
      const cfg = this.getScaledStats(ally.unitId, ally.star);

      if (ally.role === 'priest') {
        const healing = this.tickPriest(ally, dt);
        if (healing > 0) {
          healingByUnit[ally.instanceId] = (healingByUnit[ally.instanceId] ?? 0) + healing;
        }
        continue;
      }

      if (ally.command.type === 'move' && ally.command.position) {
        this.movementSystem.moveTowards(ally, ally.command.position, cfg.moveSpeed, dt);
        continue;
      }

      let commandTarget = ally.command.type === 'focus_enemy' && ally.command.targetEnemyId
        ? this.targetingSystem.findEnemyById(ally.command.targetEnemyId, this.enemies)
        : undefined;

      if (!commandTarget) {
        const searchRange = ally.role === 'melee' ? cfg.reactionRange : cfg.attackRange;
        commandTarget = this.targetingSystem.findNearestEnemyInRange(ally, this.enemies, searchRange);
      }

      if (!commandTarget) {
        this.movementSystem.stop(ally);
        continue;
      }

      const dist = Math.hypot(commandTarget.position.x - ally.position.x, commandTarget.position.y - ally.position.y);
      if (dist > cfg.attackRange) {
        if (ally.command.type === 'focus_enemy' || ally.role === 'melee') {
          this.movementSystem.moveTowards(ally, commandTarget.position, cfg.moveSpeed, dt, cfg.attackRange * 0.9);
        } else {
          this.movementSystem.stop(ally);
        }
      } else {
        this.movementSystem.stop(ally);
        const attackResult = this.attackSystem.attackIfPossible(ally, commandTarget);
        if (attackResult.killed) {
          killsByUnit[ally.instanceId] = (killsByUnit[ally.instanceId] ?? 0) + 1;
        }
      }
    }
  }

  private tickPriest(priest: SquadUnitState, dt: number): number {
    const cfg = this.getScaledStats(priest.unitId, priest.star);
    const target = priest.command.type === 'channel_heal' && priest.command.targetAllyId
      ? this.targetingSystem.findAllyById(priest.command.targetAllyId, this.allies)
      : undefined;

    if (!target) {
      this.movementSystem.stop(priest);
      return 0;
    }

    const dist = Math.hypot(priest.position.x - target.position.x, priest.position.y - target.position.y);
    if (dist > cfg.attackRange) {
      this.movementSystem.moveTowards(priest, target.position, cfg.moveSpeed, dt, cfg.attackRange * 0.85);
      return 0;
    }

    this.movementSystem.stop(priest);
    const healResult = this.healingSystem.healIfPossible(priest, target);
    return healResult.actualHeal;
  }

  private resetBattleStateForNextWave(): void {
    this.enemies = [];
    this.allies = [];
    this.commandSystem.clearSelection();
  }

  private assignDivineTasksAtRoundStart(): void {
    for (const unit of this.roster.getAllUnits()) {
      const progress = this.divine.tryAssignTask({
        instanceId: unit.instanceId,
        unitId: unit.unitId,
        star: unit.star,
        assignedTaskId: unit.assignedTaskId as DivineTaskId | undefined,
      });

      if (progress) {
        this.roster.assignTask(unit.instanceId, progress.taskId);
      }
    }
  }

  private evolveUnitInstance(instanceId: string, targetUnitId: UnitId): void {
    this.roster.evolveUnit(instanceId, targetUnitId);

    const ally = this.allies.find((u) => u.instanceId === instanceId);
    if (!ally) return;
    ally.unitId = targetUnitId;
    ally.star = 3;
    ally.assignedTaskId = undefined;
    ally.role = SQUAD_ROLE_MAP[targetUnitId];
    ally.currentHp = Math.min(ally.currentHp, this.getScaledStats(targetUnitId, 3).maxHp);
  }

  private buildBattleAlliesFromDeployedRoster(): SquadUnitState[] {
    const deploy = this.roster.getDeployUnitsForBattle().slice(0, 5);
    return deploy.map((unit, idx) => ({
        instanceId: unit.instanceId,
        unitId: unit.unitId,
        star: unit.star,
        isCaptain: unit.isCaptain,
        role: SQUAD_ROLE_MAP[unit.unitId],
      position: {
        x: SQUAD_BATTLEFIELD.centerLineX,
        y: SQUAD_BATTLEFIELD.centerLineY + (idx - Math.floor(deploy.length / 2)) * SQUAD_BATTLEFIELD.allySpawnGapY,
      },
      velocity: { x: 0, y: 0 },
      currentHp: this.getScaledStats(unit.unitId, unit.star).maxHp,
      attackCooldownLeft: 0,
      alive: true,
      assignedTaskId: unit.assignedTaskId,
      command: { type: 'idle' },
    }));
  }

  private getScaledStats(unitId: UnitId, star: 1 | 2 | 3) {
    const base = SQUAD_UNIT_STATS[unitId];
    const hpMultiplier = 1 + (star - 1) * 0.7;
    return {
      ...base,
      maxHp: Math.round(base.maxHp * hpMultiplier),
    };
  }

  private spawnWave(waveNumber: number): void {
    const wave = this.waves[waveNumber - 1];
    if (!wave) {
      this.enemies = [];
      return;
    }

    const leftBias = this.isAlliesCampingLeft();
    const spawned: EnemyUnitState[] = [];

    for (const entry of wave.enemies) {
      for (let i = 0; i < entry.count; i += 1) {
        const spawnFromLeft = leftBias && i % 4 === 0;
        const yRange = SQUAD_BATTLEFIELD.spawnYMax - SQUAD_BATTLEFIELD.spawnYMin;
        const y = SQUAD_BATTLEFIELD.spawnYMin + ((i * 71 + waveNumber * 37) % Math.max(1, yRange));
        const x = spawnFromLeft ? SQUAD_BATTLEFIELD.leftSpawnX : SQUAD_BATTLEFIELD.rightSpawnX;
        const cfg = ENEMY_STATS[entry.enemyType];

        spawned.push({
          instanceId: nextId('enemy_squad'),
          enemyType: entry.enemyType,
          position: { x, y },
          velocity: { x: 0, y: 0 },
          currentHp: cfg.maxHp,
          attackCooldownLeft: 0,
          alive: true,
        });
      }
    }

    this.enemies = spawned;
  }

  private isAlliesCampingLeft(): boolean {
    if (this.allies.length === 0) return false;
    const leftCount = this.allies.filter((ally) => ally.position.x < SQUAD_BATTLEFIELD.centerLineX - 120).length;
    return leftCount >= Math.ceil(this.allies.length * 0.7);
  }
}
