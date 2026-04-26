import { DivineTaskSystem } from '../assets/scripts/systems/divine-task-system';
import { HealingSystem } from '../assets/scripts/squad/systems/healing-system';
import { RosterSystem } from '../assets/scripts/squad/systems/roster-system';
import { SquadBattleSession } from '../assets/scripts/squad/squad-battle-session';
import { SQUAD_BENCH_SLOTS } from '../assets/scripts/squad/config/squad-ui-layout-config';
import type { SquadUnitState } from '../assets/scripts/squad/types';

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
    currentHp: 650,
    attackCooldownLeft: 0,
    alive: true,
    command: { type: 'idle' },
  };

  const result = healing.healIfPossible(priest, ally);
  assertRule(result.casted, 'full-hp target should still keep healing cast cadence');
  assertRule(result.actualHeal === 0, 'full-hp healing must not increase divine healing progress');
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
}

verifyTaskEligibility();
verifyMergeCapsAt3Star();
verifyActiveDivineTasksAreMergeProtected();
verifyFailedPurchaseKeepsShopEntry();
verifyActualHealingOnly();
verifySnapshotContract();

console.log('Squad rules verified.');
