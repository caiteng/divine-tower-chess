
import { TD_DEFAULT_LIFE, TD_DIFFICULTY_CONFIG, TD_STARTING_GOLD } from '../assets/scripts/td/config/td-game-config';
import { TowerDefenseSession } from '../assets/scripts/td/td-session';
import { resetTdIdSeedForTest } from '../assets/scripts/td/systems/td-id';

function assertRule(condition: boolean, message: string): void {
  if (!condition) throw new Error(`[verify-td-rules] ${message}`);
}

function verifyNewRunDefaults(): void {
  resetTdIdSeedForTest();
  const session = new TowerDefenseSession();
  const snapshot = session.getSnapshot();

  assertRule(snapshot.phase === 'prep', 'new run should start in prep phase');
  assertRule(snapshot.stageId === 'stage_1_forest_loop', 'new run should use stage_1_forest_loop by default');
  assertRule(snapshot.difficulty === 'normal', 'new run should use normal difficulty by default');
  assertRule(snapshot.life === TD_DEFAULT_LIFE, 'normal new run should start with default life');
  assertRule(snapshot.gold === TD_STARTING_GOLD, 'normal new run should start with configured gold');
  assertRule(snapshot.waveIndex === 1, 'new run should start from wave 1');
  assertRule(snapshot.totalWaves === 10, 'normal new run should expose 10 total waves');
  assertRule(snapshot.wave.started === false, 'wave should not be started during prep');
}

function verifyDifficultyDefaults(): void {
  const beginner = new TowerDefenseSession({ difficulty: 'beginner' }).getSnapshot();
  const hard = new TowerDefenseSession({ difficulty: 'hard' }).getSnapshot();
  const endless = new TowerDefenseSession({ difficulty: 'endless' }).getSnapshot();

  assertRule(beginner.life === TD_DIFFICULTY_CONFIG.beginner.startingLife, 'beginner life should come from difficulty config');
  assertRule(beginner.gold === TD_DIFFICULTY_CONFIG.beginner.startingGold, 'beginner gold should come from difficulty config');
  assertRule(hard.life === TD_DIFFICULTY_CONFIG.hard.startingLife, 'hard life should come from difficulty config');
  assertRule(endless.totalWaves === 0, 'endless should expose 0 total waves as open-ended marker');
}

function verifyStartNextWaveChangesPhase(): void {
  const session = new TowerDefenseSession();
  const started = session.startNextWave();
  const spawning = session.getSnapshot();

  assertRule(started, 'startNextWave should return true from prep');
  assertRule(spawning.phase === 'spawning', 'startNextWave should enter spawning phase');
  assertRule(spawning.wave.started, 'wave state should mark started after startNextWave');

  const result = session.tick(0.1);
  const battle = session.getSnapshot();
  assertRule(result.changedPhase, 'first tick after spawning should change phase');
  assertRule(battle.phase === 'battle', 'spawning should advance to battle on tick in phase 1 stub');
  assertRule(battle.wave.spawningDone, 'battle wave should mark spawningDone in phase 1 stub');

  const secondStart = session.startNextWave();
  assertRule(!secondStart, 'startNextWave should fail outside prep');
}

function verifyDamageLifeAndDefeat(): void {
  const session = new TowerDefenseSession();
  assertRule(session.damageLife(3) === 7, 'damageLife should subtract integer damage');
  assertRule(session.getSnapshot().phase === 'prep', 'partial life damage should not end run');
  assertRule(session.damageLife(999) === 0, 'damageLife should clamp life to zero');
  assertRule(session.getSnapshot().phase === 'defeat', 'zero life should enter defeat phase');
  assertRule(session.isTerminal(), 'defeat should be terminal');
  assertRule(session.damageLife(1) === 0, 'terminal damage should not reduce below zero');
}

function verifyGoldAccounting(): void {
  const session = new TowerDefenseSession();
  assertRule(session.addGold(5) === TD_STARTING_GOLD + 5, 'addGold should increase gold');
  assertRule(session.spendGold(4), 'spendGold should succeed when affordable');
  assertRule(session.getGold() === TD_STARTING_GOLD + 1, 'spendGold should subtract cost');
  assertRule(!session.spendGold(999), 'spendGold should fail when unaffordable');
  assertRule(session.getGold() === TD_STARTING_GOLD + 1, 'failed spendGold should not change gold');
}

function verifySnapshotIsDefensiveCopy(): void {
  const session = new TowerDefenseSession({ captainId: 'archer' });
  const before = session.getSnapshot();
  before.captain.skillCooldowns.fake = 99;
  before.towerSlots.push({ slotId: 'fake', position: { x: 0, y: 0 } });
  const after = session.getSnapshot();

  assertRule(after.captain.skillCooldowns.fake === undefined, 'snapshot captain cooldowns should be defensive copy');
  assertRule(after.towerSlots.length === 0, 'snapshot arrays should be defensive copies');
}

function verifyRunIdsAdvance(): void {
  resetTdIdSeedForTest();
  const session = new TowerDefenseSession();
  const firstRunId = session.getSnapshot().runId;
  session.startNewRun('stage_1_forest_loop', 'normal');
  const secondRunId = session.getSnapshot().runId;

  assertRule(firstRunId !== secondRunId, 'startNewRun should create a new run id');
  assertRule(firstRunId === 'td_run_1', 'test seed should make first run id deterministic');
  assertRule(secondRunId === 'td_run_2', 'test seed should make second run id deterministic');
}

function main(): void {
  verifyNewRunDefaults();
  verifyDifficultyDefaults();
  verifyStartNextWaveChangesPhase();
  verifyDamageLifeAndDefeat();
  verifyGoldAccounting();
  verifySnapshotIsDefensiveCopy();
  verifyRunIdsAdvance();
  console.log('[verify-td-rules] all checks passed');
}

main();
