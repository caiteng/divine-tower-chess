import { DivineTaskSystem } from '../assets/scripts/systems/divine-task-system';
import { HealingSystem } from '../assets/scripts/squad/systems/healing-system';
import { CollisionSystem } from '../assets/scripts/squad/systems/collision-system';
import { AttackSystem, applyArmor, scaleArmorPierce } from '../assets/scripts/squad/systems/attack-system';
import { EnemyAiSystem } from '../assets/scripts/squad/systems/enemy-ai-system';
import { RosterSystem } from '../assets/scripts/squad/systems/roster-system';
import { MovementSystem } from '../assets/scripts/squad/systems/movement-system';
import { UnitCommandSystem } from '../assets/scripts/squad/systems/unit-command-system';
import { SquadBattleSession } from '../assets/scripts/squad/squad-battle-session';
import { ENEMY_STATS, getScaledUnitMaxHp, SQUAD_BATTLEFIELD, SQUAD_UNIT_STATS } from '../assets/scripts/squad/config/squad-battle-config';
import { SQUAD_BENCH_SLOTS } from '../assets/scripts/squad/config/squad-ui-layout-config';
import type { EnemyUnitState, SquadUnitState } from '../assets/scripts/squad/types';

function assertRule(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`[verify-squad-rules] ${msg}`);
}

function verifyTaskEligibility(): void {
  const divine = new DivineTaskSystem();
  const originalRandom = Math.random;
  (Math as unknown as { random: () => number }).random = () => 0;

  const star2 = divine.tryAssignTask({ instanceId: 'u2', unitId: 'warrior', star: 2 });
  assertRule(star2 === null, '2-star unit must never receive divine task');

  const star3 = divine.tryAssignTask({ instanceId: 'u3', unitId: 'warrior', star: 3 });
  assertRule(star3?.taskId === 'warrior_to_berserker', '3-star warrior should be eligible for task');

  (Math as unknown as { random: () => number }).random = originalRandom;
}

function verifyMergeCapsAt3Star(): void {
  const roster = new RosterSystem();

  for (let i = 0; i < 9; i += 1) {
    roster.addToBench('warrior');
  }

  const all = roster.getAllUnits();
  assertRule(all.length === 1, '9 same units should merge into single 3-star unit');
  assertRule(all[0].star === 3, 'merge result should be 3-star');

  roster.addToBench('warrior');
  roster.addToBench('warrior');
  roster.addToBench('warrior');

  const stars = roster.getAllUnits().map((u) => u.star).sort();
  assertRule(stars.includes(3), 'existing 3-star must remain and not be consumed by normal merge');
}

function verifyMergedPurchaseReturnsLiveUnit(): void {
  const roster = new RosterSystem();

  roster.addToBenchWithState({ instanceId: 'merge-a', unitId: 'warrior', star: 1 });
  roster.addToBenchWithState({ instanceId: 'merge-b', unitId: 'warrior', star: 1 });
  const returned = roster.addToBenchWithState({ instanceId: 'merge-c', unitId: 'warrior', star: 1 });
  const all = roster.getAllUnits();

  assertRule(all.length === 1, 'three same 1-star units should collapse to one roster instance');
  assertRule(returned?.instanceId === all[0].instanceId, 'addToBenchWithState should return the surviving merged unit');
  assertRule(returned?.star === 2, 'returned merged unit should expose its new star level');
}

function verifyActiveDivineTasksAreMergeProtected(): void {
  const roster = new RosterSystem();

  roster.addToBenchWithState({ instanceId: 'task-star1', unitId: 'warrior', star: 1, assignedTaskId: 'warrior_to_berserker' });
  roster.addToBench('warrior');
  roster.addToBench('warrior');
  assertRule(roster.getAllUnits().length === 3, 'active task unit must not be counted as third 1-star merge candidate');

  roster.addToBench('warrior');
  const afterStar1Merge = roster.getAllUnits();
  const protectedStar1 = afterStar1Merge.find((u) => u.instanceId === 'task-star1');
  assertRule(protectedStar1?.star === 1, 'active task 1-star unit must survive ordinary merge');
  assertRule(afterStar1Merge.filter((u) => u.unitId === 'warrior' && u.star === 2).length === 1, 'three normal 1-star units should still merge');

  const rosterWithStar2Task = new RosterSystem();
  rosterWithStar2Task.addToBenchWithState({ instanceId: 'task-star2', unitId: 'warrior', star: 2, assignedTaskId: 'warrior_to_berserker' });
  rosterWithStar2Task.addToBenchWithState({ instanceId: 'normal-star2-a', unitId: 'warrior', star: 2 });
  rosterWithStar2Task.addToBenchWithState({ instanceId: 'normal-star2-b', unitId: 'warrior', star: 2 });
  rosterWithStar2Task.addToBench('warrior');
  rosterWithStar2Task.addToBench('warrior');
  rosterWithStar2Task.addToBench('warrior');

  const afterStar2Merge = rosterWithStar2Task.getAllUnits();
  const protectedStar2 = afterStar2Merge.find((u) => u.instanceId === 'task-star2');
  assertRule(protectedStar2?.star === 2, 'active task 2-star unit must survive ordinary merge');
  assertRule(afterStar2Merge.some((u) => u.unitId === 'warrior' && u.star === 3), 'three normal 2-star units should still merge');
}

function verifyFailedPurchaseKeepsShopEntry(): void {
  const session = new SquadBattleSession();
  session.startNewRun('beginner');

  session.loadFromSaveData({
    difficulty: 'beginner',
    phase: 'prep',
    waveNumber: 1,
    gold: 99,
    shop: ['warrior', 'mage', 'priest'],
    bench: Array.from({ length: SQUAD_BENCH_SLOTS }, (_, index) => ({
      instanceId: `bench-full-${index}`,
      unitId: 'warrior',
      star: 3,
    })),
    deployed: [],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'visible',
      battlefieldLighting: 'dim',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [],
    enemies: [],
  });

  const before = session.getSnapshot();
  const bought = session.buyShopUnit(0);
  const after = session.getSnapshot();

  assertRule(!bought, 'purchase should fail when bench is full');
  assertRule(after.gold === before.gold, 'failed purchase should refund spent gold');
  assertRule(after.shop.length === before.shop.length, 'failed purchase must not remove shop entry');
  assertRule(after.shop[0] === before.shop[0], 'failed purchase must keep original shop slot');
}

function verifyActualHealingOnly(): void {
  const healing = new HealingSystem();

  const priest: SquadUnitState = {
    instanceId: 'priest',
    unitId: 'priest',
    star: 3,
    role: 'priest',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: 100,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'channel_heal', targetAllyId: 'tank' },
  };

  const ally: SquadUnitState = {
    instanceId: 'tank',
    unitId: 'shield_guard',
    star: 1,
    role: 'melee',
    position: { x: 0, y: 10 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.shield_guard.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };

  const result = healing.healIfPossible(priest, ally, SQUAD_UNIT_STATS.shield_guard.maxHp);
  assertRule(result.casted, 'full-hp target should still keep healing cast cadence');
  assertRule(result.actualHeal === 0, 'full-hp healing must not increase divine healing progress');
}

function verifyHealingUsesScaledMaxHp(): void {
  const healing = new HealingSystem();
  const priest: SquadUnitState = {
    instanceId: 'priest',
    unitId: 'priest',
    star: 2,
    role: 'priest',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: getScaledUnitMaxHp('priest', 2),
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'channel_heal', targetAllyId: 'tank' },
  };
  const scaledMaxHp = getScaledUnitMaxHp('shield_guard', 3);
  const ally: SquadUnitState = {
    instanceId: 'tank',
    unitId: 'shield_guard',
    star: 3,
    role: 'melee',
    position: { x: 0, y: 10 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.shield_guard.maxHp + 10,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };

  const result = healing.healIfPossible(priest, ally, scaledMaxHp);
  assertRule(result.actualHeal > 0, 'healing should restore 2-star/3-star units above their 1-star base max hp');
  assertRule(ally.currentHp <= scaledMaxHp, 'healing should still cap at scaled max hp');
}

function verifySnapshotContract(): void {
  const session = new SquadBattleSession();
  session.startNewRun('beginner');
  const snap = session.getSnapshot();

  assertRule(typeof snap.gold === 'number', 'snapshot should expose gold');
  assertRule(Array.isArray(snap.shop), 'snapshot should expose shop slots');
  assertRule(Array.isArray(snap.bench), 'snapshot should expose bench');
  assertRule(Array.isArray(snap.deployed), 'snapshot should expose deployed');
  assertRule(typeof snap.currentWave === 'number', 'snapshot should expose currentWave');
  assertRule(Boolean(snap.uiState), 'snapshot should expose uiState for phase-5 UI transitions');
  assertRule(snap.totalWaves === 10, 'beginner run should expose 10 total waves');
  session.startNewRun('endless');
  const endlessSnap = session.getSnapshot();
  assertRule(endlessSnap.isEndless && endlessSnap.totalWaves === 0, 'endless run should expose endless snapshot state');
}

function verifyArmorReducesDamage(): void {
  const attack = new AttackSystem();
  const warrior: SquadUnitState = {
    instanceId: 'warrior',
    unitId: 'warrior',
    star: 1,
    role: 'melee',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };
  const brute: EnemyUnitState = {
    instanceId: 'brute',
    enemyType: 'brute',
    position: { x: 0, y: 40 },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.brute.maxHp,
    attackCooldownLeft: 0,
    alive: true,
  };

  attack.attackIfPossible(warrior, brute);
  const expectedDamage = applyArmor(
    SQUAD_UNIT_STATS.warrior.attackDamage,
    ENEMY_STATS.brute.armor,
    scaleArmorPierce(SQUAD_UNIT_STATS.warrior.armorPierceRatio, warrior.star),
  );
  assertRule(brute.currentHp === ENEMY_STATS.brute.maxHp - expectedDamage, 'ally attacks should account for enemy armor and attacker armor pierce');
}

function verifyCollisionPreventsOverlap(): void {
  const collision = new CollisionSystem();
  const allyA: SquadUnitState = {
    instanceId: 'ally-a',
    unitId: 'shield_guard',
    star: 1,
    role: 'melee',
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.shield_guard.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };
  const allyB: SquadUnitState = {
    instanceId: 'ally-b',
    unitId: 'warrior',
    star: 1,
    role: 'melee',
    position: { x: 400, y: 300 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };

  collision.resolve([allyA, allyB], [], 4);
  const dist = Math.hypot(allyA.position.x - allyB.position.x, allyA.position.y - allyB.position.y);
  const minDist = SQUAD_UNIT_STATS.shield_guard.collisionRadius + SQUAD_UNIT_STATS.warrior.collisionRadius;
  assertRule(dist >= minDist, 'same-side units should be separated by collision radius');
}

function verifyEnemiesHoldContactOutsideShieldGuardRadius(): void {
  const enemyAi = new EnemyAiSystem();
  const collision = new CollisionSystem();
  const shield: SquadUnitState = {
    instanceId: 'shield',
    unitId: 'shield_guard',
    star: 1,
    role: 'melee',
    position: { x: 500, y: SQUAD_BATTLEFIELD.centerLineY },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.shield_guard.maxHp,
    attackCooldownLeft: 99,
    alive: true,
    command: { type: 'idle' },
  };
  const enemies: EnemyUnitState[] = [
    {
      instanceId: 'grunt-a',
      enemyType: 'grunt',
      position: { x: 620, y: SQUAD_BATTLEFIELD.centerLineY },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 99,
      alive: true,
    },
    {
      instanceId: 'grunt-b',
      enemyType: 'grunt',
      position: { x: 626, y: SQUAD_BATTLEFIELD.centerLineY + 4 },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 99,
      alive: true,
    },
    {
      instanceId: 'grunt-c',
      enemyType: 'grunt',
      position: { x: 626, y: SQUAD_BATTLEFIELD.centerLineY - 4 },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 99,
      alive: true,
    },
  ];

  for (let i = 0; i < 80; i += 1) {
    enemyAi.tick(enemies, [shield], 0.05);
    collision.resolve([shield], enemies, 4);
  }

  const minShieldDistance = SQUAD_UNIT_STATS.shield_guard.collisionRadius + ENEMY_STATS.grunt.collisionRadius;
  for (const enemy of enemies) {
    const shieldDistance = Math.hypot(enemy.position.x - shield.position.x, enemy.position.y - shield.position.y);
    assertRule(shieldDistance >= minShieldDistance, 'enemies should hold contact outside shield guard collision radius');
    assertRule(Math.hypot(enemy.velocity.x, enemy.velocity.y) < 0.001, 'enemies in contact band should stop pushing into shield guard');
  }
}

function verifyEnemyBodyBlockingSteersRearEnemy(): void {
  const enemyAi = new EnemyAiSystem();
  const shield: SquadUnitState = {
    instanceId: 'shield',
    unitId: 'shield_guard',
    star: 1,
    role: 'melee',
    position: { x: 500, y: SQUAD_BATTLEFIELD.centerLineY },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.shield_guard.maxHp,
    attackCooldownLeft: 99,
    alive: true,
    command: { type: 'idle' },
  };
  const front: EnemyUnitState = {
    instanceId: 'front',
    enemyType: 'grunt',
    position: { x: 620, y: SQUAD_BATTLEFIELD.centerLineY },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.grunt.maxHp,
    attackCooldownLeft: 99,
    alive: true,
  };
  const rear: EnemyUnitState = {
    instanceId: 'rear',
    enemyType: 'grunt',
    position: { x: 660, y: SQUAD_BATTLEFIELD.centerLineY },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.grunt.maxHp,
    attackCooldownLeft: 99,
    alive: true,
  };

  enemyAi.tick([front, rear], [shield], 0.1);
  assertRule(Math.abs(rear.velocity.y) > 0.001, 'rear enemy should steer sideways when a nearer enemy blocks its lane');
  assertRule(rear.velocity.x < 0, 'rear enemy should still generally advance toward target while avoiding blocker');
}

function verifyMageSplashDamage(): void {
  const attack = new AttackSystem();
  const mage: SquadUnitState = {
    instanceId: 'mage',
    unitId: 'mage',
    star: 1,
    role: 'ranged',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.mage.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };
  const primary: EnemyUnitState = {
    instanceId: 'primary',
    enemyType: 'grunt',
    position: { x: 0, y: 80 },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.grunt.maxHp,
    attackCooldownLeft: 0,
    alive: true,
  };
  const nearby: EnemyUnitState = {
    instanceId: 'nearby',
    enemyType: 'grunt',
    position: { x: 35, y: 90 },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.grunt.maxHp,
    attackCooldownLeft: 0,
    alive: true,
  };

  attack.attackIfPossible(mage, primary, [primary, nearby]);
  assertRule(primary.currentHp < ENEMY_STATS.grunt.maxHp, 'mage should damage primary target');
  assertRule(nearby.currentHp < ENEMY_STATS.grunt.maxHp, 'mage should splash damage nearby enemies');
}

function verifyAttackEffectsAreEmitted(): void {
  const attack = new AttackSystem();
  const archer: SquadUnitState = {
    instanceId: 'archer',
    unitId: 'archer',
    star: 1,
    role: 'ranged',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.archer.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };
  const enemy: EnemyUnitState = {
    instanceId: 'grunt',
    enemyType: 'grunt',
    position: { x: 0, y: 80 },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.grunt.maxHp,
    attackCooldownLeft: 0,
    alive: true,
  };

  const result = attack.attackIfPossible(archer, enemy, [enemy]);
  assertRule(result.effects.some((effect) => effect.kind === 'projectile'), 'ranged attacks should emit projectile effects');
  assertRule(result.effects.some((effect) => effect.kind === 'damage' && (effect.value ?? 0) > 0), 'attacks should emit damage floating text effects');
  assertRule(archer.attackCooldownLeft === SQUAD_UNIT_STATS.archer.attackInterval, 'ranged attacks should start full attack cooldown after release');
  assertRule((archer.attackReleaseTimeLeft ?? 0) > 0, 'ranged attacks should expose a short release feedback window separate from cooldown');
}

function verifyRangedCanMoveAfterProjectileRelease(): void {
  const session = new SquadBattleSession();
  session.loadFromSaveData({
    difficulty: 'beginner',
    phase: 'battle',
    waveNumber: 1,
    gold: 10,
    shop: ['warrior', 'mage', 'priest'],
    bench: [],
    deployed: [{ instanceId: 'archer-1', unitId: 'archer', star: 1 }],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'hidden',
      battlefieldLighting: 'bright',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [{
      instanceId: 'archer-1',
      unitId: 'archer',
      star: 1,
      role: 'ranged',
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      currentHp: SQUAD_UNIT_STATS.archer.maxHp,
      attackCooldownLeft: 0,
      attackReleaseTimeLeft: 0,
      skillCooldowns: {},
      alive: true,
      command: { type: 'focus_enemy', targetEnemyId: 'grunt-1' },
    }],
    enemies: [{
      instanceId: 'grunt-1',
      enemyType: 'grunt',
      position: { x: 260, y: 100 },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 99,
      alive: true,
    }],
  });

  session.selectUnit('archer-1');
  session.tick(0.05);
  const duringWindup = session.getSnapshot();
  const windingArcher = duringWindup.allies.find((ally) => ally.instanceId === 'archer-1');
  assertRule(!duringWindup.battleEffects.some((effect) => effect.kind === 'projectile'), 'ranged attack should not release projectile before windup completes');
  assertRule((windingArcher?.attackWindupLeft ?? 0) > 0, 'ranged attack should expose cancellable windup before release');

  session.tick(SQUAD_UNIT_STATS.archer.attackWindupTime ?? 0.3);
  const afterRelease = session.getSnapshot();
  const releasedArcher = afterRelease.allies.find((ally) => ally.instanceId === 'archer-1');
  assertRule(afterRelease.battleEffects.some((effect) => effect.kind === 'projectile'), 'ranged attack should release projectile after windup');
  assertRule((releasedArcher?.attackCooldownLeft ?? 0) > 0, 'ranged unit should remain on attack cooldown after projectile release');

  const beforeMoveX = releasedArcher?.position.x ?? 0;
  session.commandMoveToGround({ x: 40, y: 100 });
  session.tick(0.1);
  const movingArcher = session.getSnapshot().allies.find((ally) => ally.instanceId === 'archer-1');
  assertRule((movingArcher?.position.x ?? beforeMoveX) < beforeMoveX, 'ranged unit should move immediately after projectile release while attack is on cooldown');
  assertRule((movingArcher?.attackCooldownLeft ?? 0) > 0, 'movement cancel should not reset or remove attack cooldown');
}

function verifyMovementCancelsRangedWindupBeforeRelease(): void {
  const session = new SquadBattleSession();
  session.loadFromSaveData({
    difficulty: 'beginner',
    phase: 'battle',
    waveNumber: 1,
    gold: 10,
    shop: ['warrior', 'mage', 'priest'],
    bench: [],
    deployed: [{ instanceId: 'archer-1', unitId: 'archer', star: 1 }],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'hidden',
      battlefieldLighting: 'bright',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [{
      instanceId: 'archer-1',
      unitId: 'archer',
      star: 1,
      role: 'ranged',
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      currentHp: SQUAD_UNIT_STATS.archer.maxHp,
      attackCooldownLeft: 0,
      attackWindupLeft: 0,
      attackReleaseTimeLeft: 0,
      skillCooldowns: {},
      alive: true,
      command: { type: 'focus_enemy', targetEnemyId: 'grunt-1' },
    }],
    enemies: [{
      instanceId: 'grunt-1',
      enemyType: 'grunt',
      position: { x: 260, y: 100 },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 99,
      alive: true,
    }],
  });

  session.selectUnit('archer-1');
  session.tick(0.05);
  session.commandMoveToGround({ x: 40, y: 100 });
  session.tick(SQUAD_UNIT_STATS.archer.attackWindupTime ?? 0.3);
  const afterCancel = session.getSnapshot();
  const archer = afterCancel.allies.find((ally) => ally.instanceId === 'archer-1');
  const target = afterCancel.enemies.find((enemy) => enemy.instanceId === 'grunt-1');
  assertRule(!afterCancel.battleEffects.some((effect) => effect.kind === 'projectile'), 'moving before release should cancel ranged windup and not create projectile');
  assertRule((archer?.attackCooldownLeft ?? 0) === 0, 'cancelled windup should not start attack cooldown');
  assertRule((target?.currentHp ?? 0) === ENEMY_STATS.grunt.maxHp, 'cancelled windup should not damage target');
}

function verifyLockedSkillCast(): void {
  const session = new SquadBattleSession();
  session.loadFromSaveData({
    difficulty: 'beginner',
    phase: 'battle',
    waveNumber: 1,
    gold: 10,
    shop: ['warrior', 'mage', 'priest'],
    bench: [],
    deployed: [{ instanceId: 'archer-1', unitId: 'archer', star: 2 }],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'hidden',
      battlefieldLighting: 'bright',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [{
      instanceId: 'archer-1',
      unitId: 'archer',
      star: 2,
      role: 'ranged',
      position: { x: 100, y: 100 },
      velocity: { x: 0, y: 0 },
      currentHp: SQUAD_UNIT_STATS.archer.maxHp,
      attackCooldownLeft: 0,
      skillCooldowns: {},
      alive: true,
      command: { type: 'idle' },
    }],
    enemies: [{
      instanceId: 'grunt-1',
      enemyType: 'grunt',
      position: { x: 260, y: 100 },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 0,
      alive: true,
    }],
  });

  session.selectUnit('archer-1');
  const result = session.castSelectedSkill('archer_snipe');
  const after = session.getSnapshot();
  const archer = after.allies.find((ally) => ally.instanceId === 'archer-1');
  const target = after.enemies.find((enemy) => enemy.instanceId === 'grunt-1');
  assertRule(result.casted, '2-star archer should cast locked snipe skill');
  assertRule((archer?.skillCooldowns?.archer_snipe ?? 0) > 0, 'skill cast should start cooldown');
  assertRule((target?.currentHp ?? 0) < ENEMY_STATS.grunt.maxHp, 'snipe should damage locked target');
  assertRule(after.battleEffects.some((effect) => effect.kind === 'projectile'), 'snipe should emit projectile feedback');
}

function verifyShieldGuardTauntPriority(): void {
  const enemyAi = new EnemyAiSystem();
  const warrior: SquadUnitState = {
    instanceId: 'warrior',
    unitId: 'warrior',
    star: 1,
    role: 'melee',
    position: { x: 60, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };
  const shield: SquadUnitState = {
    instanceId: 'shield',
    unitId: 'shield_guard',
    star: 1,
    role: 'melee',
    position: { x: 72, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.shield_guard.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };
  const enemy: EnemyUnitState = {
    instanceId: 'grunt',
    enemyType: 'grunt',
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    currentHp: ENEMY_STATS.grunt.maxHp,
    attackCooldownLeft: 0,
    alive: true,
  };

  enemyAi.tick([enemy], [warrior, shield], 0.1);
  assertRule(shield.currentHp < SQUAD_UNIT_STATS.shield_guard.maxHp, 'shield guard taunt should make it preferred over a slightly closer warrior');
  assertRule(warrior.currentHp === SQUAD_UNIT_STATS.warrior.maxHp, 'non-taunting ally should not be targeted in this taunt scenario');
}

function verifyWaveRewardLoop(): void {
  const session = new SquadBattleSession();
  session.loadFromSaveData({
    difficulty: 'endless',
    phase: 'battle',
    waveNumber: 1,
    gold: 10,
    shop: ['warrior', 'mage', 'priest'],
    bench: [],
    deployed: [{ instanceId: 'warrior-1', unitId: 'warrior', star: 1 }],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'hidden',
      battlefieldLighting: 'bright',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [{
      instanceId: 'warrior-1',
      unitId: 'warrior',
      star: 1,
      role: 'melee',
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
      attackCooldownLeft: 0,
      alive: true,
      command: { type: 'idle' },
    }],
    enemies: [],
  });
  const beforeGold = session.getSnapshot().gold;
  session.tick(0.1);
  const after = session.getSnapshot();
  assertRule(after.phase === 'prep', 'endless run should return to prep after cleared generated wave');
  assertRule(after.waveNumber === 2, 'endless run should advance wave number instead of victory');
  assertRule(after.gold > beforeGold, 'clearing a wave should grant gold');
}

function verifyAllyMovementStaysInLowerCombatArea(): void {
  const movement = new MovementSystem();
  const command = new UnitCommandSystem();
  const warrior: SquadUnitState = {
    instanceId: 'warrior',
    unitId: 'warrior',
    star: 1,
    role: 'melee',
    position: { x: 520, y: SQUAD_BATTLEFIELD.centerLineY },
    velocity: { x: 0, y: 0 },
    currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };

  command.selectUnit('warrior', [warrior]);
  command.issueMoveToGround({ x: -200, y: 10 }, [warrior]);
  assertRule(warrior.command.position?.y === SQUAD_BATTLEFIELD.combatYMin, 'player move commands should clamp to lower combat area');

  movement.moveTowards(warrior, { x: -200, y: 10 }, SQUAD_UNIT_STATS.warrior.moveSpeed, 10);
  assertRule(warrior.position.x >= 0, 'ally movement should not leave left map edge');
  assertRule(warrior.position.y >= SQUAD_BATTLEFIELD.combatYMin, 'ally movement should not enter upper half background');
}

function verifyIdleMeleeHoldsWhenAlreadyInCombatBand(): void {
  const session = new SquadBattleSession();
  session.loadFromSaveData({
    difficulty: 'beginner',
    phase: 'battle',
    waveNumber: 1,
    gold: 10,
    shop: ['warrior', 'mage', 'priest'],
    bench: [],
    deployed: [],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'hidden',
      battlefieldLighting: 'bright',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [{
      instanceId: 'idle-warrior',
      unitId: 'warrior',
      star: 1,
      role: 'melee',
      position: { x: 520, y: SQUAD_BATTLEFIELD.centerLineY },
      velocity: { x: 0, y: 0 },
      currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
      attackCooldownLeft: 0,
      alive: true,
      command: { type: 'idle' },
    }],
    enemies: [{
      instanceId: 'near-combat-band',
      enemyType: 'grunt',
      position: { x: 585, y: SQUAD_BATTLEFIELD.centerLineY },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 0,
      alive: true,
    }],
  });

  const before = session.getSnapshot().allies[0].position.x;
  session.tick(0.2);
  const after = session.getSnapshot().allies[0];
  assertRule(after.position.x <= before + 1, 'idle melee should hold position when already in combat band');
}

function verifyIdleMeleeCanApproachWhenUnengaged(): void {
  const session = new SquadBattleSession();
  session.loadFromSaveData({
    difficulty: 'beginner',
    phase: 'battle',
    waveNumber: 1,
    gold: 10,
    shop: ['warrior', 'mage', 'priest'],
    bench: [],
    deployed: [],
    divineTasks: [],
    pendingBattleStart: false,
    uiState: {
      prepPanel: 'hidden',
      battlefieldLighting: 'bright',
      transitionProgress: 1,
      nextWaveReady: true,
    },
    allies: [{
      instanceId: 'idle-warrior',
      unitId: 'warrior',
      star: 1,
      role: 'melee',
      position: { x: 520, y: SQUAD_BATTLEFIELD.centerLineY },
      velocity: { x: 0, y: 0 },
      currentHp: SQUAD_UNIT_STATS.warrior.maxHp,
      attackCooldownLeft: 0,
      alive: true,
      command: { type: 'idle' },
    }],
    enemies: [{
      instanceId: 'approach-target',
      enemyType: 'grunt',
      position: { x: 650, y: SQUAD_BATTLEFIELD.centerLineY },
      velocity: { x: 0, y: 0 },
      currentHp: ENEMY_STATS.grunt.maxHp,
      attackCooldownLeft: 0,
      alive: true,
    }],
  });

  const before = session.getSnapshot().allies[0].position.x;
  session.tick(0.2);
  const after = session.getSnapshot().allies[0];
  assertRule(after.position.x > before, 'unengaged idle melee should be able to approach a nearby threat');
}

verifyTaskEligibility();
verifyMergeCapsAt3Star();
verifyMergedPurchaseReturnsLiveUnit();
verifyActiveDivineTasksAreMergeProtected();
verifyFailedPurchaseKeepsShopEntry();
verifyActualHealingOnly();
verifyHealingUsesScaledMaxHp();
verifySnapshotContract();
verifyArmorReducesDamage();
verifyMageSplashDamage();
verifyAttackEffectsAreEmitted();
verifyRangedCanMoveAfterProjectileRelease();
verifyMovementCancelsRangedWindupBeforeRelease();
verifyLockedSkillCast();
verifyShieldGuardTauntPriority();
verifyCollisionPreventsOverlap();
verifyEnemiesHoldContactOutsideShieldGuardRadius();
verifyEnemyBodyBlockingSteersRearEnemy();
verifyWaveRewardLoop();
verifyAllyMovementStaysInLowerCombatArea();
verifyIdleMeleeHoldsWhenAlreadyInCombatBand();
verifyIdleMeleeCanApproachWhenUnengaged();

console.log('Squad rules verified.');
