import { UNIT_CONFIG } from '../config/unit-config';
import { GameSession } from './game-session';
import { BattleSystem } from '../systems/battle-system';
import { DivineTaskSystem } from '../systems/divine-task-system';
import { UnitSystem } from '../systems/unit-system';
import { EnemyState, PlacedUnitState, UnitId } from '../models/types';

declare const require: { main?: unknown } | undefined;
declare const module: unknown;

function assertRule(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Divine task rule failed: ${message}`);
  }
}

function requireValue<T>(value: T | undefined | null, message: string): T {
  assertRule(value !== undefined && value !== null, message);
  return value as T;
}

function buildThreeStarUnits(unitSystem: UnitSystem, unitId: UnitId, count: number): void {
  for (let i = 0; i < count * 9; i += 1) {
    unitSystem.addToBench(unitId);
  }
}

function assignAllEligibleTasks(unitSystem: UnitSystem, divine: DivineTaskSystem): void {
  for (const unit of unitSystem.getUnitsForTaskRoll()) {
    const progress = divine.tryAssignTask(unit);
    if (progress) {
      unitSystem.setAssignedTask(unit.instanceId, progress.taskId);
    }
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

function verifyMultipleWarriorTasks(): void {
  const unitSystem = new UnitSystem();
  const divine = new DivineTaskSystem();

  buildThreeStarUnits(unitSystem, 'warrior', 2);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(unitSystem, divine));

  const tasks = divine.getAllProgress().filter((task) => task.taskId === 'warrior_to_berserker');
  const unitIds = new Set(tasks.map((task) => task.unitInstanceId));
  assertRule(tasks.length === 2, 'two 3-star warriors should each receive a warrior task');
  assertRule(unitIds.size === 2, 'warrior tasks should bind to different unit instances');
}

function verifyMultiplePriestTasks(): void {
  const unitSystem = new UnitSystem();
  const divine = new DivineTaskSystem();

  buildThreeStarUnits(unitSystem, 'priest', 2);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(unitSystem, divine));

  const tasks = divine.getAllProgress().filter((task) => task.taskId === 'priest_to_light_mage');
  const unitIds = new Set(tasks.map((task) => task.unitInstanceId));
  assertRule(tasks.length === 2, 'two 3-star priests should each receive a priest task');
  assertRule(unitIds.size === 2, 'priest tasks should bind to different unit instances');
}

function verifyMoveKeepsTaskIdentityAndProgress(): void {
  const unitSystem = new UnitSystem();
  const divine = new DivineTaskSystem();

  buildThreeStarUnits(unitSystem, 'warrior', 1);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(unitSystem, divine));

  const task = requireValue(divine.getAllProgress()[0], 'warrior task should be assigned before movement verification');
  requireValue(
    unitSystem.getBenchUnits().find((unit) => unit.instanceId === task.unitInstanceId),
    'assigned warrior should still be available on bench before placement',
  );
  assertRule(unitSystem.placeFromBench(task.unitInstanceId, 0, 1), 'assigned warrior should be placeable');

  divine.addMetric(task.unitInstanceId, 'kills', 25);
  const before = requireValue(
    unitSystem.getPlacedUnits().find((unit) => unit.instanceId === task.unitInstanceId),
    'assigned warrior should be placed before move',
  );
  assertRule(unitSystem.movePlacedUnit(task.unitInstanceId, 1, 4), 'assigned warrior should move to an open tile');

  const after = requireValue(
    unitSystem.getPlacedUnits().find((unit) => unit.instanceId === task.unitInstanceId),
    'assigned warrior should still be placed after move',
  );
  const progress = requireValue(
    divine.getAllProgress().find((item) => item.unitInstanceId === task.unitInstanceId),
    'assigned warrior should still have divine progress after move',
  );

  assertRule(after.instanceId === before.instanceId, 'move should keep instanceId');
  assertRule(after.star === before.star, 'move should keep star level');
  assertRule(after.unitId === before.unitId, 'move should keep unitId');
  assertRule(after.assignedTaskId === before.assignedTaskId, 'move should keep assigned task id');
  assertRule(after.lane === 1 && after.tileIndex === 4, 'move should update only board position');
  assertRule(progress.progress === 25, 'move should keep divine task progress');
}

function verifyEvolutionTargets(): void {
  const warriorUnits = new UnitSystem();
  const warriorDivine = new DivineTaskSystem();
  buildThreeStarUnits(warriorUnits, 'warrior', 1);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(warriorUnits, warriorDivine));
  const warriorTask = requireValue(warriorDivine.getAllProgress()[0], 'warrior task should be assigned');
  warriorDivine.addMetric(warriorTask.unitInstanceId, 'kills', 1000);
  const warriorCompletion = requireValue(warriorDivine.resolveCompleted(warriorTask.unitInstanceId), 'warrior task should complete');
  assertRule(warriorCompletion.targetUnitId === 'berserker', 'warrior task should resolve to berserker');
  warriorUnits.evolveUnit(warriorTask.unitInstanceId, warriorCompletion.targetUnitId);
  const evolvedWarrior = requireValue(
    warriorUnits.getBenchUnits().find((unit) => unit.instanceId === warriorTask.unitInstanceId),
    'completed warrior should still exist after evolution',
  );
  assertRule(evolvedWarrior.unitId === 'berserker', 'completed warrior should evolve to berserker');
  assertRule(UNIT_CONFIG[evolvedWarrior.unitId].isDivine === true, 'berserker should be marked divine');

  const priestUnits = new UnitSystem();
  const priestDivine = new DivineTaskSystem();
  buildThreeStarUnits(priestUnits, 'priest', 1);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(priestUnits, priestDivine));
  const priestTask = requireValue(priestDivine.getAllProgress()[0], 'priest task should be assigned');
  priestDivine.addMetric(priestTask.unitInstanceId, 'healing', 100000);
  const priestCompletion = requireValue(priestDivine.resolveCompleted(priestTask.unitInstanceId), 'priest task should complete');
  assertRule(priestCompletion.targetUnitId === 'light_mage', 'priest task should resolve to light mage');
  priestUnits.evolveUnit(priestTask.unitInstanceId, priestCompletion.targetUnitId);
  const evolvedPriest = requireValue(
    priestUnits.getBenchUnits().find((unit) => unit.instanceId === priestTask.unitInstanceId),
    'completed priest should still exist after evolution',
  );
  assertRule(evolvedPriest.unitId === 'light_mage', 'completed priest should evolve to light mage');
  assertRule(UNIT_CONFIG[evolvedPriest.unitId].isDivine === true, 'light mage should be marked divine');
}

function verifyActualHealingOnly(): void {
  const battle = new BattleSystem();
  const priest: PlacedUnitState = {
    instanceId: 'priest_test',
    unitId: 'priest',
    star: 3,
    lane: 0,
    tileIndex: 1,
    cooldownLeft: 0,
    currentHp: UNIT_CONFIG.priest.maxHp,
    assignedTaskId: 'priest_to_light_mage',
  };
  const warrior: PlacedUnitState = {
    instanceId: 'warrior_test',
    unitId: 'warrior',
    star: 3,
    lane: 0,
    tileIndex: 0,
    cooldownLeft: 0,
    currentHp: UNIT_CONFIG.warrior.maxHp - 35,
  };

  const damagedResult = battle.tick([priest, warrior], [], 0.2);
  assertRule(damagedResult.healingDoneByUnit.priest_test === 35, 'healing progress should count actual restored HP only');

  priest.cooldownLeft = 0;
  const fullHpResult = battle.tick([priest, warrior], [], 0.2);
  assertRule(!fullHpResult.healingDoneByUnit.priest_test, 'full HP targets should not create virtual healing progress');
}

function verifyDefeatedUnitLifecycle(): void {
  const battle = new BattleSystem();
  const defeatedArcher: PlacedUnitState = {
    instanceId: 'defeated_archer',
    unitId: 'archer',
    star: 3,
    lane: 0,
    tileIndex: 1,
    cooldownLeft: 0,
    currentHp: 0,
  };
  const enemy: EnemyState = {
    instanceId: 'enemy_test',
    enemyId: 'slime',
    lane: 0,
    currentHp: 80,
    distanceOnPath: 0,
    reachedCrystal: false,
  };

  battle.tick([defeatedArcher], [enemy], 0.2);
  assertRule(enemy.currentHp === 80, 'defeated units should not attack during the current round');

  const unitSystem = new UnitSystem();
  unitSystem.addToBench('warrior');
  unitSystem.addToBench('priest');
  const [warrior, priest] = unitSystem.getBenchUnits();
  assertRule(unitSystem.placeFromBench(warrior.instanceId, 0, 0), 'warrior should be placed for defeat reset verification');
  assertRule(unitSystem.placeFromBench(priest.instanceId, 0, 1), 'priest should be placed for defeat reset verification');

  const placed = unitSystem.getPlacedUnits();
  const placedWarrior = requireValue(
    placed.find((unit) => unit.instanceId === warrior.instanceId),
    'placed warrior should exist for defeat reset verification',
  );
  const placedPriest = requireValue(
    placed.find((unit) => unit.instanceId === priest.instanceId),
    'placed priest should exist for defeat reset verification',
  );
  placedWarrior.currentHp = 0;
  placedWarrior.cooldownLeft = 2;
  placedPriest.currentHp = UNIT_CONFIG.priest.maxHp - 10;
  placedPriest.cooldownLeft = 2;

  const resetCount = unitSystem.resetDefeatedPlacedUnits();
  assertRule(resetCount === 1, 'only defeated placed units should be reset at round end');
  assertRule(placedWarrior.currentHp === UNIT_CONFIG.warrior.maxHp, 'defeated warrior should revive to max HP');
  assertRule(placedWarrior.cooldownLeft === 0, 'defeated warrior cooldown should reset for the next round');
  assertRule(placedPriest.currentHp === UNIT_CONFIG.priest.maxHp - 10, 'living damaged units should not be healed by defeat reset');
  assertRule(placedPriest.cooldownLeft === 2, 'living unit cooldown should not be changed by defeat reset');
}

function verifyMeleeAggroRules(): void {
  const battle = new BattleSystem();
  const shield: PlacedUnitState = {
    instanceId: 'shield_test',
    unitId: 'shield_guard',
    star: 1,
    lane: 0,
    tileIndex: 1,
    cooldownLeft: 99,
    currentHp: UNIT_CONFIG.shield_guard.maxHp,
  };
  const shieldEnemies: EnemyState[] = [0, 1, 2].map((index) => ({
    instanceId: `shield_enemy_${index}`,
    enemyId: 'slime',
    lane: 0,
    currentHp: UNIT_CONFIG.archer.maxHp,
    distanceOnPath: 3.8,
    reachedCrystal: false,
  }));

  battle.tick([shield], shieldEnemies, 1);
  assertRule(shield.currentHp === UNIT_CONFIG.shield_guard.maxHp - 15, 'shield guard should block and be attacked by all enemies in range');
  assertRule(shieldEnemies.every((enemy) => enemy.distanceOnPath === 3.8), 'enemies blocked by shield guard should stop moving');

  const warrior: PlacedUnitState = {
    instanceId: 'warrior_aggro_test',
    unitId: 'warrior',
    star: 1,
    lane: 0,
    tileIndex: 1,
    cooldownLeft: 99,
    currentHp: UNIT_CONFIG.warrior.maxHp,
  };
  const meleeEnemies: EnemyState[] = [0, 1, 2].map((index) => ({
    instanceId: `melee_enemy_${index}`,
    enemyId: 'slime',
    lane: 0,
    currentHp: UNIT_CONFIG.archer.maxHp,
    distanceOnPath: 3.8,
    reachedCrystal: false,
  }));

  battle.tick([warrior], meleeEnemies, 1);
  assertRule(warrior.currentHp === UNIT_CONFIG.warrior.maxHp - 5, 'non-shield melee units should attract only one enemy');
  assertRule(meleeEnemies.filter((enemy) => enemy.distanceOnPath === 3.8).length === 1, 'only the attracted enemy should stop against a non-shield melee unit');

  meleeEnemies[0].currentHp = 0;
  const warriorHpBeforeRefill = warrior.currentHp;
  battle.tick([warrior], meleeEnemies, 1);
  assertRule(warrior.currentHp === warriorHpBeforeRefill - 5, 'another enemy in range should fill the duel slot after the previous enemy dies');

  const archer: PlacedUnitState = {
    instanceId: 'archer_aggro_test',
    unitId: 'archer',
    star: 1,
    lane: 0,
    tileIndex: 1,
    cooldownLeft: 99,
    currentHp: UNIT_CONFIG.archer.maxHp,
  };
  const rangedEnemies: EnemyState[] = [0, 1].map((index) => ({
    instanceId: `ranged_enemy_${index}`,
    enemyId: 'slime',
    lane: 0,
    currentHp: UNIT_CONFIG.archer.maxHp,
    distanceOnPath: 3.8,
    reachedCrystal: false,
  }));

  battle.tick([archer], rangedEnemies, 1);
  assertRule(archer.currentHp === UNIT_CONFIG.archer.maxHp, 'ranged units should not attract normal enemy aggro');
  assertRule(rangedEnemies.every((enemy) => enemy.distanceOnPath > 3.8), 'normal enemies should keep moving past ranged units');
}

function verifyRoundPhaseGuards(): void {
  const session = new GameSession();
  assertRule(!session.refreshShopByCost(), 'shop refresh should fail before game start');
  assertRule(!session.placeUnit('missing_unit', 0, 0), 'placement should fail before prep phase');
  assertRule(!session.beginBattle(), 'battle should not start before prep phase');

  session.startNewGame('beginner');
  assertRule(session.beginBattle(), 'battle should start from prep phase');
  assertRule(!session.refreshShopByCost(), 'shop refresh should fail during battle');
  assertRule(!session.buyShopUnit(0), 'buy should fail during battle');
  assertRule(!session.placeUnit('missing_unit', 0, 0), 'placement should fail during battle');
  assertRule(!session.beginBattle(), 'battle should not restart while already in battle');
}

function verifyMergeAcrossBenchAndPlaced(): void {
  const unitSystem = new UnitSystem();
  for (let i = 0; i < 3; i += 1) {
    unitSystem.addToBench('warrior');
  }
  const firstTwoStar = requireValue(unitSystem.getBenchUnits()[0], 'first 2-star warrior should be created on bench');
  assertRule(firstTwoStar.star === 2, 'three 1-star warriors should merge into one 2-star warrior');
  assertRule(unitSystem.placeFromBench(firstTwoStar.instanceId, 0, 0), '2-star warrior should be placeable before cross-area merge');

  const placedBeforeMerge = requireValue(
    unitSystem.getPlacedUnits().find((unit) => unit.instanceId === firstTwoStar.instanceId),
    'placed 2-star warrior should exist before cross-area merge',
  );
  placedBeforeMerge.currentHp = 1;
  placedBeforeMerge.cooldownLeft = 3;

  for (let i = 0; i < 6; i += 1) {
    unitSystem.addToBench('warrior');
  }

  const placedAfterMerge = requireValue(
    unitSystem.getPlacedUnits().find((unit) => unit.instanceId === firstTwoStar.instanceId),
    'placed warrior should be kept as merge result',
  );
  assertRule(placedAfterMerge.star === 3, 'placed 2-star plus two bench 2-star warriors should merge into a placed 3-star warrior');
  assertRule(placedAfterMerge.currentHp === UNIT_CONFIG.warrior.maxHp, 'placed merge result should reset to max HP');
  assertRule(placedAfterMerge.cooldownLeft === 0, 'placed merge result should reset cooldown');
  assertRule(unitSystem.getBenchUnits().filter((unit) => unit.unitId === 'warrior').length === 0, 'consumed bench merge materials should be removed');
}

function verifyAssignedUnitsDoNotMerge(): void {
  const unitSystem = new UnitSystem();
  const divine = new DivineTaskSystem();

  buildThreeStarUnits(unitSystem, 'warrior', 1);
  withGuaranteedTaskRoll(() => assignAllEligibleTasks(unitSystem, divine));
  const assignedTask = requireValue(divine.getAllProgress()[0], 'warrior task should be assigned before protected merge verification');
  const assignedUnit = requireValue(
    unitSystem.getBenchUnits().find((unit) => unit.instanceId === assignedTask.unitInstanceId),
    'assigned 3-star warrior should stay on bench before protected merge verification',
  );
  assertRule(assignedUnit.assignedTaskId === 'warrior_to_berserker', 'assigned warrior should hold the divine task id');

  for (let i = 0; i < 9; i += 1) {
    unitSystem.addToBench('warrior');
  }

  const stillAssigned = requireValue(
    unitSystem.getBenchUnits().find((unit) => unit.instanceId === assignedTask.unitInstanceId),
    'assigned warrior should not be consumed by later merges',
  );
  const unassignedThreeStars = unitSystem
    .getBenchUnits()
    .filter((unit) => unit.unitId === 'warrior' && unit.star === 3 && !unit.assignedTaskId);
  assertRule(stillAssigned.assignedTaskId === 'warrior_to_berserker', 'assigned warrior should keep task id after later merges');
  assertRule(unassignedThreeStars.length === 1, 'later unassigned warriors should merge separately from assigned task holder');
}

export function verifyDivineTaskRules(): void {
  verifyMultipleWarriorTasks();
  verifyMultiplePriestTasks();
  verifyMoveKeepsTaskIdentityAndProgress();
  verifyEvolutionTargets();
  verifyActualHealingOnly();
  verifyDefeatedUnitLifecycle();
  verifyMeleeAggroRules();
  verifyRoundPhaseGuards();
  verifyMergeAcrossBenchAndPlaced();
  verifyAssignedUnitsDoNotMerge();
}

if (typeof require !== 'undefined' && require.main === module) {
  verifyDivineTaskRules();
  console.log('Divine task rules verified.');
}
