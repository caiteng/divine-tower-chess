import { BATTLEFIELD_CONFIG } from '../config/battlefield-config';
import { UNIT_CONFIG } from '../config/unit-config';
import { GameSession } from './game-session';
import { BattleSystem } from '../systems/battle-system';
import { DivineTaskSystem } from '../systems/divine-task-system';
import { UnitSystem } from '../systems/unit-system';
import { WaveSystem } from '../systems/wave-system';
import { EnemyState, PlacedUnitState, UnitId } from '../models/types';

declare const require: { main?: unknown } | undefined;
declare const module: unknown;

function assertRule(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Divine task rule failed: ${message}`);
}

function requireValue<T>(value: T | undefined | null, message: string): T {
  assertRule(value !== undefined && value !== null, message);
  return value as T;
}

function buildThreeStarUnits(unitSystem: UnitSystem, unitId: UnitId, count: number): void {
  for (let i = 0; i < count * 9; i += 1) unitSystem.addToBench(unitId);
}

function assignAllEligibleTasks(unitSystem: UnitSystem, divine: DivineTaskSystem): void {
  for (const unit of unitSystem.getUnitsForTaskRoll()) {
    const progress = divine.tryAssignTask(unit);
    if (progress) unitSystem.setAssignedTask(unit.instanceId, progress.taskId);
  }
}

function withGuaranteedTaskRoll(cb: () => void): void {
  const originalRandom = Math.random;
  Math.random = () => 0.01;
  try {
    cb();
  } finally {
    Math.random = originalRandom;
  }
}

function makePlaced(unitId: UnitId, id: string, x: number, y: number): PlacedUnitState {
  return {
    instanceId: id,
    unitId,
    star: 3,
    deploymentAnchorId: 'test_anchor',
    position: { x, y },
    velocity: { x: 0, y: 0 },
    radius: 24,
    cooldownLeft: 0,
    currentHp: UNIT_CONFIG[unitId].maxHp,
  };
}

function makeEnemy(id: string, x: number, y: number): EnemyState {
  return {
    instanceId: id,
    enemyId: 'slime',
    currentHp: 80,
    position: { x, y },
    velocity: { x: 0, y: 0 },
    radius: 20,
    cooldownLeft: 0,
    reachedCrystal: false,
  };
}

function verifyMultipleTasks(): void {
  const unitSystem = new UnitSystem();
  const divine = new DivineTaskSystem();
  buildThreeStarUnits(unitSystem, 'warrior', 2);
  buildThreeStarUnits(unitSystem, 'priest', 2);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(unitSystem, divine));

  const all = divine.getAllProgress();
  assertRule(all.filter((t) => t.taskId === 'warrior_to_berserker').length === 2, 'two warriors should get independent tasks');
  assertRule(all.filter((t) => t.taskId === 'priest_to_light_mage').length === 2, 'two priests should get independent tasks');
}

function verifyMovementKeepsTask(): void {
  const unitSystem = new UnitSystem();
  const divine = new DivineTaskSystem();
  buildThreeStarUnits(unitSystem, 'warrior', 1);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(unitSystem, divine));
  const task = requireValue(divine.getAllProgress()[0], 'task should exist');

  const firstAnchor = BATTLEFIELD_CONFIG.allyDeploymentAnchors[0];
  const secondAnchor = BATTLEFIELD_CONFIG.allyDeploymentAnchors[1];
  assertRule(Boolean(firstAnchor) && Boolean(secondAnchor), 'deployment anchors should exist');
  assertRule(unitSystem.placeFromBench(task.unitInstanceId, firstAnchor.id), 'place should succeed');
  divine.addMetric(task.unitInstanceId, 'kills', 25);
  assertRule(unitSystem.movePlacedUnit(task.unitInstanceId, secondAnchor.id), 'reposition should succeed');

  const moved = requireValue(unitSystem.getPlacedUnits().find((u) => u.instanceId === task.unitInstanceId), 'unit should exist after move');
  const progress = requireValue(divine.getAllProgress().find((u) => u.unitInstanceId === task.unitInstanceId), 'task progress should exist');
  assertRule(moved.assignedTaskId === task.taskId, 'move should keep assigned task');
  assertRule(progress.progress === 25, 'move should keep task progress');
}

function verifyActualHealingOnly(): void {
  const battle = new BattleSystem();
  const priest = makePlaced('priest', 'priest', 300, 400);
  priest.assignedTaskId = 'priest_to_light_mage';
  const warrior = makePlaced('warrior', 'warrior', 320, 400);
  warrior.currentHp -= 35;

  const result1 = battle.tick([priest, warrior], [], 0.2);
  assertRule(result1.healingDoneByUnit.priest === 35, 'healing must be actual restored hp only');

  priest.cooldownLeft = 0;
  const result2 = battle.tick([priest, warrior], [], 0.2);
  assertRule(!result2.healingDoneByUnit.priest, 'full-hp heal should not count');
}

function verifyContinuousBattleMovement(): void {
  const battle = new BattleSystem();
  const melee = makePlaced('warrior', 'w1', 200, 260);
  const ranged = makePlaced('archer', 'a1', 220, 540);
  const enemy = makeEnemy('e1', 430, 420);

  const before = { ...enemy.position };
  battle.tick([melee, ranged], [enemy], 0.5);
  assertRule(enemy.position.x < before.x, 'enemy should push left toward crystal in continuous space');

  let movedByMelee = false;
  for (let i = 0; i < 10; i += 1) {
    const prev = { ...melee.position };
    battle.tick([melee, ranged], [enemy], 0.2);
    if (melee.position.x !== prev.x || melee.position.y !== prev.y) {
      movedByMelee = true;
      break;
    }
  }
  assertRule(movedByMelee, 'melee unit should chase in 2D space');
}

function verifyCrystalThreat(): void {
  const battle = new BattleSystem();
  const nearCrystalEnemy = makeEnemy('crystal_enemy', BATTLEFIELD_CONFIG.crystalPosition.x + 20, BATTLEFIELD_CONFIG.crystalPosition.y);
  const result = battle.tick([], [nearCrystalEnemy], 0.2);
  assertRule(result.crystalDamage > 0, 'enemy near crystal should damage crystal');
}

function verifyRoundPhaseGuards(): void {
  const session = new GameSession();
  assertRule(!session.refreshShopByCost(), 'refresh should fail before game start');
  session.startNewGame('beginner');
  const snapshot = session.getSnapshot();
  assertRule(snapshot.deploymentAnchors.length > 0, 'snapshot should expose deployment anchors');
  assertRule(session.beginBattle(), 'battle should start from prep');
  assertRule(!session.buyShopUnit(0), 'buy should fail in battle phase');
}

function verifyWaveSpawnRegion(): void {
  const wave = new WaveSystem();
  wave.resetWave();

  const region = BATTLEFIELD_CONFIG.enemySpawnRegion;
  const spawned: EnemyState[] = [];
  for (let i = 0; i < 120; i += 1) {
    spawned.push(...wave.tickSpawn('beginner', 1, 0.2));
  }

  assertRule(spawned.length > 0, 'wave should spawn enemies');
  for (const enemy of spawned) {
    assertRule(enemy.position.x >= region.xMin && enemy.position.x <= region.xMax, 'spawn x should stay in enemy spawn region');
    assertRule(enemy.position.y >= region.yMin && enemy.position.y <= region.yMax, 'spawn y should stay in enemy spawn region');
  }
}

function runAllRules(): void {
  verifyMultipleTasks();
  verifyMovementKeepsTask();
  verifyActualHealingOnly();
  verifyContinuousBattleMovement();
  verifyCrystalThreat();
  verifyRoundPhaseGuards();
  verifyWaveSpawnRegion();
  console.log('Divine task rules verified.');
}

if (typeof require !== 'undefined' && require.main === module) {
  runAllRules();
}

export { runAllRules };
