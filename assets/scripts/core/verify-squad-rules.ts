import { DivineTaskSystem } from '../systems/divine-task-system';
import { HealingSystem } from '../squad/systems/healing-system';
import { RosterSystem } from '../squad/systems/roster-system';
import { SquadBattleSession } from '../squad/squad-battle-session';
import { SquadUnitState } from '../squad/types';

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
verifyActualHealingOnly();
verifySnapshotContract();

console.log('Squad rules verified.');
