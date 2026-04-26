import { SquadBattleSession } from '../assets/scripts/squad/squad-battle-session';

function autoBuildOpeningSquad(session: SquadBattleSession) {
  // 通过“商店/金币”构建最小 5 人上阵阵容（阶段 4 验证入口）。
  let guard = 0;
  while (session.getSnapshot().deployed.length < 5 && guard < 40) {
    const snap = session.getSnapshot();
    for (let i = 0; i < snap.shop.length; i += 1) {
      session.buyShopUnit(i);
    }

    for (const unit of session.getSnapshot().bench) {
      if (session.getSnapshot().deployed.length >= 5) break;
      session.deployFromBench(unit.instanceId);
    }

    if (session.getSnapshot().deployed.length < 5) {
      if (!session.refreshShopByCost()) {
        break;
      }
    }
    guard += 1;
  }
}

function issueBasicCommands(session: SquadBattleSession, tick: number): void {
  if (tick === 5) {
    const front = session.getSnapshot().allies[0];
    if (front) {
      session.selectUnit(front.instanceId);
      session.commandMoveToGround({ x: 640, y: front.position.y });
    }
  }

  if (tick === 12) {
    const ranged = session.getSnapshot().allies.find((a) => a.role === 'ranged');
    const enemy = session.getSnapshot().enemies[0];
    if (ranged && enemy) {
      session.selectUnit(ranged.instanceId);
      session.commandFocusEnemy(enemy.instanceId);
    }
  }

  if (tick === 20) {
    const priest = session.getSnapshot().allies.find((a) => a.role === 'priest');
    const tank = session.getSnapshot().allies.find((a) => a.role === 'melee');
    if (priest && tank) {
      session.selectUnit(priest.instanceId);
      session.commandPriestHeal(tank.instanceId);
    }
  }
}

function runDemo() {
  const session = new SquadBattleSession();
  session.startNewRun('hard');
  autoBuildOpeningSquad(session);
  session.startBattle();

  let tick = 0;
  while (tick < 1200) {
    const snap = session.getSnapshot();
    if (snap.phase === 'prep') {
      autoBuildOpeningSquad(session);
      if (snap.uiState.nextWaveReady) {
        session.startNextWaveFromPrep();
      }
    }
    if (snap.phase === 'victory' || snap.phase === 'defeat') {
      break;
    }

    issueBasicCommands(session, tick);
    session.tick(0.1);
    tick += 1;
  }

  const finalSnap = session.getSnapshot();
  console.log(
    `phase=${finalSnap.phase} wave=${finalSnap.waveNumber}/${finalSnap.totalWaves} gold=${finalSnap.gold} deployed=${finalSnap.deployed.length} tasks=${finalSnap.divineTasks.length}`,
  );
}

runDemo();
