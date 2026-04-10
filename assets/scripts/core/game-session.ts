import { DIFFICULTY_CONFIG } from '../config/difficulty-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { BattleSystem } from '../systems/battle-system';
import { DivineTaskSystem } from '../systems/divine-task-system';
import { EconomySystem } from '../systems/economy-system';
import { ShopSystem } from '../systems/shop-system';
import { UnitSystem } from '../systems/unit-system';
import { WaveSystem } from '../systems/wave-system';
import { DifficultyId, EnemyState } from '../models/types';

export type GamePhase = 'menu' | 'prep' | 'battle' | 'win' | 'lose';

export class GameSession {
  private readonly economy = new EconomySystem();
  private readonly shop = new ShopSystem();
  private readonly unitSystem = new UnitSystem();
  private readonly divine = new DivineTaskSystem();
  private readonly waveSystem = new WaveSystem();
  private readonly battleSystem = new BattleSystem();

  private phase: GamePhase = 'menu';
  private difficulty: DifficultyId = 'beginner';
  private waveNumber = 1;
  private crystalHp = 0;
  private enemies: EnemyState[] = [];

  public startNewGame(difficulty: DifficultyId): void {
    const diff = DIFFICULTY_CONFIG[difficulty];
    this.phase = 'prep';
    this.difficulty = difficulty;
    this.waveNumber = 1;
    this.crystalHp = diff.crystalHp;
    this.enemies = [];
    this.economy.setStartingGold(diff.startingGold);
    this.onRoundPrepStart();
  }

  public getSnapshot() {
    return {
      phase: this.phase,
      difficulty: this.difficulty,
      waveNumber: this.waveNumber,
      totalWaves: DIFFICULTY_CONFIG[this.difficulty].totalWaves,
      crystalHp: this.crystalHp,
      gold: this.economy.getGold(),
      shop: this.shop.getEntries(),
      bench: this.unitSystem.getBenchUnits(),
      placed: this.unitSystem.getPlacedUnits(),
      divineTasks: this.divine.getAllProgress(),
      enemies: this.enemies,
    };
  }

  public refreshShopByCost(): boolean {
    if (this.phase !== 'prep') {
      return false;
    }

    const cost = DIFFICULTY_CONFIG[this.difficulty].refreshCost;
    if (!this.economy.spend(cost)) {
      return false;
    }
    this.shop.refresh();
    return true;
  }

  public buyShopUnit(slotIndex: number): boolean {
    if (this.phase !== 'prep') {
      return false;
    }

    const unitId = this.shop.peek(slotIndex);
    if (!unitId) return false;

    const cost = UNIT_CONFIG[unitId].cost;
    if (!this.economy.spend(cost)) {
      return false;
    }

    this.shop.take(slotIndex);
    this.unitSystem.addToBench(unitId);
    return true;
  }

  public placeUnit(instanceId: string, lane: number, tileIndex: number): boolean {
    if (this.phase !== 'prep') {
      return false;
    }

    return this.unitSystem.placeFromBench(instanceId, lane, tileIndex);
  }

  public movePlacedUnit(instanceId: string, lane: number, tileIndex: number): boolean {
    if (this.phase !== 'prep') {
      return false;
    }
    return this.unitSystem.movePlacedUnit(instanceId, lane, tileIndex);
  }

  public beginBattle(): boolean {
    if (this.phase !== 'prep') {
      return false;
    }

    this.phase = 'battle';
    this.enemies = [];
    this.waveSystem.resetWave();
    return true;
  }

  public tickBattle(dt = 0.2): void {
    if (this.phase !== 'battle') return;

    const spawned = this.waveSystem.tickSpawn(this.difficulty, this.waveNumber, dt);
    this.enemies.push(...spawned);

    const result = this.battleSystem.tick(this.unitSystem.getPlacedUnits(), this.enemies, dt);
    this.crystalHp -= result.crystalDamage;
    this.economy.earn(result.goldFromKills);

    for (const [unitId, killCount] of Object.entries(result.killsByUnit)) {
      this.divine.addMetric(unitId, 'kills', killCount);
      const completed = this.divine.resolveCompleted(unitId);
      if (completed) {
        this.unitSystem.evolveUnit(unitId, completed.targetUnitId);
      }
    }

    for (const [unitId, healAmount] of Object.entries(result.healingDoneByUnit)) {
      this.divine.addMetric(unitId, 'healing', healAmount);
      const completed = this.divine.resolveCompleted(unitId);
      if (completed) {
        this.unitSystem.evolveUnit(unitId, completed.targetUnitId);
      }
    }

    const removedIds = new Set([...result.killedEnemyIds, ...this.enemies.filter((e) => e.reachedCrystal).map((e) => e.instanceId)]);
    this.enemies = this.enemies.filter((e) => !removedIds.has(e.instanceId));

    if (this.crystalHp <= 0) {
      this.phase = 'lose';
      return;
    }

    const spawnDone = this.waveSystem.isWaveSpawnFinished(this.difficulty, this.waveNumber);
    if (spawnDone && this.enemies.length === 0) {
      if (this.waveNumber >= DIFFICULTY_CONFIG[this.difficulty].totalWaves) {
        this.phase = 'win';
      } else {
        this.waveNumber += 1;
        this.phase = 'prep';
        this.onRoundPrepStart();
      }
    }
  }

  private onRoundPrepStart(): void {
    this.unitSystem.resetDefeatedPlacedUnits();
    this.shop.refresh();
    for (const unit of this.unitSystem.getUnitsForTaskRoll()) {
      const progress = this.divine.tryAssignTask(unit);
      if (progress) {
        this.unitSystem.setAssignedTask(unit.instanceId, progress.taskId);
      }
    }
  }
}
