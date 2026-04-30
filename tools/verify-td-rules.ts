import { getAllTDMapConfigs, getTDMapConfig } from '../assets/scripts/td/config/td-map-config';
import { getAllTDWaveDefinitions } from '../assets/scripts/td/config/td-wave-config';
import { getPositionAtProgress, getPathLength } from '../assets/scripts/td/systems/enemy-path-system';
import { TowerDefenseSession } from '../assets/scripts/td/td-session';
import type { TDHeroId } from '../assets/scripts/td/types';

function assertRule(condition: boolean, message: string): void {
  if (!condition) throw new Error(`[verify-td-rules] ${message}`);
}

function verifyRuntimeCore(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_1_forest_loop', difficulty: 'normal', captainId: 'archer' });
  const snap = session.getSnapshot();
  assertRule(snap.phase === 'prep', 'new run should start in prep');
  assertRule(snap.life === 10, 'normal run should start with 10 life');
  assertRule(snap.gold === 20, 'normal run should start with 20 gold');
  assertRule(snap.towerSlots.length === 8, 'stage 1 should expose 8 tower slots');
  assertRule(session.startNextWave(), 'startNextWave should work from prep');
  assertRule(session.getSnapshot().phase === 'spawning', 'startNextWave should enter spawning');
  session.damageLife(99);
  assertRule(session.getSnapshot().phase === 'defeat', 'life reaching zero should defeat');
}

function verifyMapsAndPaths(): void {
  const maps = getAllTDMapConfigs();
  assertRule(maps.length === 5, 'should define 5 TD maps');
  for (const map of maps) {
    assertRule(map.groundPaths.length > 0, `${map.stageId} should have ground path`);
    assertRule(map.airPaths.length > 0, `${map.stageId} should have air path`);
    assertRule(map.towerSlots.length >= 8, `${map.stageId} should have at least 8 slots`);
    const path = map.groundPaths[0];
    assertRule(getPathLength(path) > 100, `${map.stageId} ground path should be meaningful`);
    const start = getPositionAtProgress(path, 0);
    const end = getPositionAtProgress(path, 1);
    assertRule(Math.hypot(start.x - path.points[0].x, start.y - path.points[0].y) < 0.001, 'progress 0 should be path start');
    const last = path.points[path.points.length - 1];
    assertRule(Math.hypot(end.x - last.x, end.y - last.y) < 0.001, 'progress 1 should be path end');
  }
}

function verifyWaveConfigs(): void {
  const waves = getAllTDWaveDefinitions();
  assertRule(waves.length === 50, '5 stages should define 50 waves');
  for (const stageId of ['stage_1_forest_loop', 'stage_2_twin_bridge', 'stage_3_lost_corridor', 'stage_4_forge_cross', 'stage_5_sky_sanctum']) {
    const count = waves.filter((wave) => wave.stageId === stageId).length;
    assertRule(count === 10, `${stageId} should have 10 waves`);
  }
  assertRule(waves.some((wave) => wave.entries.some((entry) => entry.enemyId === 'gate_golem')), 'waves should include gate_golem');
}

function verifyPathLeakLife(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_1_forest_loop', difficulty: 'normal' });
  session.startNextWave();
  for (let i = 0; i < 1200 && session.getSnapshot().life === 10; i += 1) {
    session.tick(0.1);
  }
  assertRule(session.getSnapshot().life < 10, 'without heroes, enemies should eventually leak and damage life');
}

function verifyShopPlacementAndMerge(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_1_forest_loop', difficulty: 'normal' });
  session.debugSetShop(['archer', 'archer', 'archer']);
  assertRule(session.buyShopHero(0), 'buy archer 1');
  assertRule(session.buyShopHero(1), 'buy archer 2');
  assertRule(session.buyShopHero(2), 'buy archer 3');
  let snap = session.getSnapshot();
  const archer2 = snap.bench.find((hero) => hero.heroId === 'archer' && hero.star === 2);
  assertRule(Boolean(archer2), 'three 1-star archers should merge into 2-star');
  assertRule(session.placeHero(archer2!.instanceId, 'slot_01'), 'should place merged archer into slot');
  snap = session.getSnapshot();
  assertRule(snap.towerSlots.find((slot) => slot.slotId === 'slot_01')?.occupiedBy === archer2!.instanceId, 'slot should be occupied');
  assertRule(!session.placeHero(archer2!.instanceId, 'slot_01'), 'occupied or already deployed placement should fail');
}

function verifyMergeToThreeStar(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_1_forest_loop', difficulty: 'beginner' });
  session.addGold(999);
  for (let i = 0; i < 9; i += 1) {
    session.debugSetShop(['mage', undefined, undefined]);
    assertRule(session.buyShopHero(0), `buy mage ${i}`);
  }
  const snap = session.getSnapshot();
  assertRule(snap.bench.some((hero) => hero.heroId === 'mage' && hero.star === 3), 'nine same heroes should become a 3-star');
}

function verifyCombatAndCaptain(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_1_forest_loop', difficulty: 'beginner', captainId: 'mage' });
  session.addGold(999);
  const heroes: TDHeroId[] = ['archer', 'mage', 'knight', 'assassin', 'priest'];
  heroes.forEach((heroId, index) => {
    const hero = session.debugAddHero(heroId, heroId === 'archer' || heroId === 'mage' ? 3 : 2);
    assertRule(Boolean(hero), `debug add ${heroId}`);
    assertRule(session.placeHero(hero!.instanceId, `slot_0${index + 1}`), `place ${heroId}`);
  });
  assertRule(session.startNextWave(), 'start wave with placed heroes');
  let casted = false;
  for (let i = 0; i < 300; i += 1) {
    const snap = session.getSnapshot();
    if (!casted && snap.enemies.length > 0) {
      casted = session.castCaptainSkill('arcane_meteor', snap.enemies[0].position);
    }
    session.tick(0.1);
    if (session.getSnapshot().phase === 'prep') break;
  }
  const after = session.getSnapshot();
  assertRule(after.gold >= 0, 'combat should preserve valid gold');
  assertRule(casted, 'captain skill should cast during battle');
  assertRule(after.phase === 'prep' || after.phase === 'victory' || after.phase === 'battle', 'combat phase should remain valid');
}

function verifySaveLoad(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_2_twin_bridge', difficulty: 'hard', captainId: 'knight' });
  session.addGold(12);
  const save = session.exportSaveData();
  const restored = new TowerDefenseSession();
  assertRule(restored.loadFromSaveData(save), 'valid save should load');
  const snap = restored.getSnapshot();
  assertRule(snap.stageId === 'stage_2_twin_bridge', 'stage should restore');
  assertRule(snap.difficulty === 'hard', 'difficulty should restore');
  assertRule(snap.gold === save.gold, 'gold should restore');
}

function verifyFullStageProgressionViaTestHelper(): void {
  const session = new TowerDefenseSession({ stageId: 'stage_1_forest_loop', difficulty: 'beginner' });
  for (let wave = 1; wave <= 10; wave += 1) {
    assertRule(session.startNextWave(), `start wave ${wave}`);
    session.debugCompleteCurrentWaveForTest();
  }
  assertRule(session.getSnapshot().phase === 'victory', 'completing 10 waves should produce victory');
}

verifyRuntimeCore();
verifyMapsAndPaths();
verifyWaveConfigs();
verifyPathLeakLife();
verifyShopPlacementAndMerge();
verifyMergeToThreeStar();
verifyCombatAndCaptain();
verifySaveLoad();
verifyFullStageProgressionViaTestHelper();

console.log('[verify-td-rules] all checks passed');
