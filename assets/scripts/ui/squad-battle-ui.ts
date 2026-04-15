import { _decorator, Component } from 'cc';
import { SQUAD_UNIT_STATS } from '../squad/config/squad-battle-config';
import { SquadBattleSession } from '../squad/squad-battle-session';
import { SquadUnitState } from '../squad/types';

const { ccclass } = _decorator;

@ccclass('SquadBattleUi')
export class SquadBattleUi extends Component {
  /**
   * Prototype-only DOM UI used for gameplay/interaction validation.
   * This is NOT the final Cocos node-based UI architecture.
   */
  private readonly session = new SquadBattleSession();
  /**
   * Prototype-only switches:
   * - difficulty: default beginner to align with v1 baseline.
   * - enablePrepBootstrap: optional debugging helper, default OFF.
   */
  private readonly prototypeConfig = {
    difficulty: 'beginner' as const,
    enablePrepBootstrap: false,
  };

  private root: HTMLDivElement | null = null;
  private battlefieldLayer: HTMLDivElement | null = null;
  private commandLayer: SVGSVGElement | null = null;
  private prepPanel: HTMLDivElement | null = null;
  private hudTop: HTMLDivElement | null = null;
  private hudTasks: HTMLDivElement | null = null;
  private selectedUnitId: string | undefined;
  private lastMoveMarker: { x: number; y: number; until: number } | null = null;

  public onLoad(): void {
    this.session.startNewRun(this.prototypeConfig.difficulty);
    this.ensureDom();
    if (this.prototypeConfig.enablePrepBootstrap) {
      this.bootstrapPrepSquad();
    }
  }

  public update(dt: number): void {
    // Use Cocos lifecycle tick first. This DOM UI is a prototype renderer only.
    this.session.tick(Math.max(0.016, Math.min(0.05, dt || 0.016)));
    this.syncPhaseUi();
    this.render();
  }

  private ensureDom(): void {
    if (!globalThis.document || this.root) return;

    const root = globalThis.document.createElement('div');
    root.id = 'squad-ui-root';
    root.style.position = 'fixed';
    root.style.inset = '0';
    root.style.fontFamily = 'Inter, Arial, sans-serif';
    root.style.background = '#020617';
    root.style.color = '#e2e8f0';
    root.style.overflow = 'hidden';

    const battlefield = globalThis.document.createElement('div');
    battlefield.style.position = 'absolute';
    battlefield.style.left = '36px';
    battlefield.style.right = '36px';
    battlefield.style.top = '72px';
    battlefield.style.bottom = '220px';
    battlefield.style.border = '1px solid #334155';
    battlefield.style.borderRadius = '12px';
    battlefield.style.background = 'linear-gradient(180deg,#0b1220,#111827)';
    battlefield.style.transition = 'filter 420ms cubic-bezier(0.22,1,0.36,1)';
    battlefield.style.overflow = 'hidden';

    const commandLayer = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    commandLayer.style.position = 'absolute';
    commandLayer.style.inset = '0';
    commandLayer.style.pointerEvents = 'none';

    const hudTop = globalThis.document.createElement('div');
    hudTop.style.position = 'absolute';
    hudTop.style.left = '36px';
    hudTop.style.right = '36px';
    hudTop.style.top = '16px';
    hudTop.style.height = '44px';
    hudTop.style.display = 'flex';
    hudTop.style.alignItems = 'center';
    hudTop.style.justifyContent = 'space-between';
    hudTop.style.padding = '0 12px';
    hudTop.style.border = '1px solid #334155';
    hudTop.style.borderRadius = '10px';
    hudTop.style.background = 'rgba(15,23,42,0.8)';

    const hudTasks = globalThis.document.createElement('div');
    hudTasks.style.position = 'absolute';
    hudTasks.style.left = '36px';
    hudTasks.style.right = '36px';
    hudTasks.style.top = '124px';
    hudTasks.style.minHeight = '24px';
    hudTasks.style.padding = '6px 10px';
    hudTasks.style.border = '1px solid #334155';
    hudTasks.style.borderRadius = '8px';
    hudTasks.style.background = 'rgba(15,23,42,0.66)';
    hudTasks.style.fontSize = '12px';
    hudTasks.style.color = '#bfdbfe';

    const prep = globalThis.document.createElement('div');
    prep.style.position = 'absolute';
    prep.style.left = '20px';
    prep.style.right = '20px';
    prep.style.bottom = '-440px';
    prep.style.height = '420px';
    prep.style.padding = '14px';
    prep.style.background = 'rgba(15, 23, 42, 0.94)';
    prep.style.border = '1px solid #334155';
    prep.style.borderRadius = '14px 14px 0 0';
    prep.style.transition = 'bottom 420ms cubic-bezier(0.22,1,0.36,1)';
    prep.style.overflow = 'auto';
    prep.addEventListener('click', (evt) => this.handlePrepPanelClick(evt));

    this.battlefieldLayer = battlefield;
    this.commandLayer = commandLayer;
    this.prepPanel = prep;
    this.hudTop = hudTop;
    this.hudTasks = hudTasks;

    battlefield.appendChild(commandLayer);
    root.appendChild(battlefield);
    root.appendChild(hudTop);
    root.appendChild(hudTasks);
    root.appendChild(prep);
    globalThis.document.body.appendChild(root);
    this.root = root;
  }

  private bootstrapPrepSquad(): void {
    const snap = this.session.getSnapshot();
    if (snap.phase !== 'prep') return;

    for (let round = 0; round < 3; round += 1) {
      const current = this.session.getSnapshot();
      for (let i = 0; i < current.shop.length; i += 1) {
        this.session.buyShopUnit(i);
      }
      for (const unit of this.session.getSnapshot().bench) {
        if (this.session.getSnapshot().deployed.length >= this.session.getSnapshot().slotConfig.deployed) break;
        this.session.deployFromBench(unit.instanceId);
      }
      this.session.refreshShopByCost();
    }
  }

  private syncPhaseUi(): void {
    const snap = this.session.getSnapshot();
    if (!this.prepPanel || !this.battlefieldLayer) return;

    this.prepPanel.style.bottom = (snap.uiState.prepPanel === 'visible' || snap.uiState.prepPanel === 'rising') ? '0px' : '-440px';

    if (snap.uiState.battlefieldLighting === 'bright') {
      this.battlefieldLayer.style.filter = 'brightness(1) saturate(1)';
    } else if (snap.uiState.battlefieldLighting === 'brightening') {
      const t = snap.uiState.transitionProgress;
      this.battlefieldLayer.style.filter = `brightness(${0.42 + 0.58 * t}) saturate(${0.8 + 0.2 * t})`;
    } else {
      this.battlefieldLayer.style.filter = 'brightness(0.42) saturate(0.8)';
    }
  }

  private render(): void {
    const snap = this.session.getSnapshot();
    if (!this.battlefieldLayer || !this.prepPanel || !this.hudTop || !this.hudTasks || !this.commandLayer) return;

    this.hudTop.innerHTML = `
      <div>Phase: <b>${snap.phase}</b> · Wave: <b>${snap.currentWave}/${snap.totalWaves}</b></div>
      <div>Gold: <b>${snap.gold}</b> · Deployed: <b>${snap.deployed.length}/${snap.slotConfig.deployed}</b> · Bench: <b>${snap.bench.length}/${snap.slotConfig.bench}</b></div>
    `;

    const taskText = snap.divineTasks.length > 0
      ? snap.divineTasks.map((t) => `${t.unitInstanceId.slice(-4)} → ${t.divineTaskId ?? '-'} (${Math.floor(t.divineProgress ?? 0)})`).join(' ｜ ')
      : 'Divine Tasks: none';
    this.hudTasks.textContent = taskText;

    this.renderBattlefield(snap.allies, snap.enemies);
    this.renderCommandFeedback(snap.allies, snap.enemies);
    this.renderPrepPanel();
  }

  private renderBattlefield(allies: SquadUnitState[], enemies: Array<{ instanceId: string; currentHp: number; position: { x: number; y: number } }>): void {
    if (!this.battlefieldLayer) return;
    this.battlefieldLayer.querySelectorAll('.unit-dot,.enemy-dot,.hp-bar,.target-tag,.move-marker').forEach((n) => n.remove());

    for (const enemy of enemies) {
      const el = globalThis.document.createElement('div');
      el.className = 'enemy-dot';
      el.style.position = 'absolute';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.borderRadius = '14px';
      el.style.left = `${(enemy.position.x / 1200) * 100}%`;
      el.style.top = `${(enemy.position.y / 700) * 100}%`;
      el.style.background = '#ef4444';
      el.style.transform = 'translate(-50%, -50%)';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 8px rgba(239,68,68,0.7)';
      el.title = `Enemy HP: ${Math.floor(enemy.currentHp)}`;
      el.onclick = (e) => {
        e.stopPropagation();
        if (this.selectedUnitId) {
          this.session.selectUnit(this.selectedUnitId);
          this.session.commandFocusEnemy(enemy.instanceId);
        }
      };
      this.battlefieldLayer.appendChild(el);
    }

    for (const ally of allies) {
      const selected = this.selectedUnitId === ally.instanceId;
      const el = globalThis.document.createElement('div');
      el.className = 'unit-dot';
      el.style.position = 'absolute';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '15px';
      el.style.left = `${(ally.position.x / 1200) * 100}%`;
      el.style.top = `${(ally.position.y / 700) * 100}%`;
      el.style.transform = 'translate(-50%, -50%)';
      el.style.background = selected ? '#f59e0b' : '#22c55e';
      el.style.border = ally.role === 'priest' ? '2px solid #93c5fd' : '2px solid #0f172a';
      el.style.boxShadow = selected ? '0 0 14px rgba(245,158,11,0.9)' : '0 0 6px rgba(34,197,94,0.5)';
      el.style.cursor = 'pointer';
      el.title = `${ally.unitId} ★${ally.star} HP:${Math.floor(ally.currentHp)} ${ally.command.type}`;
      el.onclick = (e) => {
        e.stopPropagation();
        const selectedUnit = allies.find((a) => a.instanceId === this.selectedUnitId);
        if (selectedUnit?.role === 'priest' && this.selectedUnitId) {
          this.session.selectUnit(this.selectedUnitId);
          this.session.commandPriestHeal(ally.instanceId);
          return;
        }
        this.selectedUnitId = ally.instanceId;
      };
      this.battlefieldLayer.appendChild(el);

      const hp = globalThis.document.createElement('div');
      hp.className = 'hp-bar';
      hp.style.position = 'absolute';
      hp.style.left = `${(ally.position.x / 1200) * 100}%`;
      hp.style.top = `${(ally.position.y / 700) * 100 - 4.2}%`;
      hp.style.transform = 'translate(-50%, -50%)';
      hp.style.width = '44px';
      hp.style.height = '6px';
      hp.style.background = '#1e293b';
      hp.style.border = '1px solid #0f172a';
      const maxHp = this.getUnitMaxHp(ally);
      const hpPercent = maxHp > 0 ? (ally.currentHp / maxHp) * 100 : 0;
      hp.innerHTML = `<div style='height:100%;width:${Math.max(4, Math.min(100, hpPercent))}%;background:#4ade80'></div>`;
      this.battlefieldLayer.appendChild(hp);

      if (ally.role === 'priest' && ally.command.type === 'channel_heal') {
        const tag = globalThis.document.createElement('div');
        tag.className = 'target-tag';
        tag.style.position = 'absolute';
        tag.style.left = `${(ally.position.x / 1200) * 100}%`;
        tag.style.top = `${(ally.position.y / 700) * 100 + 3.5}%`;
        tag.style.transform = 'translate(-50%, -50%)';
        tag.style.fontSize = '11px';
        tag.style.color = '#93c5fd';
        tag.textContent = '持续治疗';
        this.battlefieldLayer.appendChild(tag);
      }
    }

    this.renderMoveMarker();

    this.battlefieldLayer.onclick = (evt) => {
      if (!this.selectedUnitId) return;
      const rect = this.battlefieldLayer?.getBoundingClientRect();
      if (!rect) return;
      const x = ((evt.clientX - rect.left) / rect.width) * 1200;
      const y = ((evt.clientY - rect.top) / rect.height) * 700;
      this.session.selectUnit(this.selectedUnitId);
      this.session.commandMoveToGround({ x, y });
      this.lastMoveMarker = { x, y, until: Date.now() + 900 };
    };
  }

  private renderMoveMarker(): void {
    if (!this.battlefieldLayer || !this.lastMoveMarker) return;
    if (Date.now() > this.lastMoveMarker.until) {
      this.lastMoveMarker = null;
      return;
    }
    const marker = globalThis.document.createElement('div');
    marker.className = 'move-marker';
    marker.style.position = 'absolute';
    marker.style.left = `${(this.lastMoveMarker.x / 1200) * 100}%`;
    marker.style.top = `${(this.lastMoveMarker.y / 700) * 100}%`;
    marker.style.width = '18px';
    marker.style.height = '18px';
    marker.style.transform = 'translate(-50%, -50%)';
    marker.style.border = '2px dashed #fbbf24';
    marker.style.borderRadius = '50%';
    marker.style.opacity = '0.85';
    this.battlefieldLayer.appendChild(marker);
  }

  private renderCommandFeedback(
    allies: SquadUnitState[],
    enemies: Array<{ instanceId: string; position: { x: number; y: number } }>,
  ): void {
    if (!this.commandLayer) return;
    this.commandLayer.innerHTML = '';

    for (const ally of allies) {
      if (ally.command.type !== 'focus_enemy' || !ally.command.targetEnemyId) continue;
      const target = enemies.find((e) => e.instanceId === ally.command.targetEnemyId);
      if (!target) continue;
      this.drawCommandLine(ally.position.x, ally.position.y, target.position.x, target.position.y, '#f59e0b');
    }

    for (const ally of allies) {
      if (ally.command.type !== 'channel_heal' || !ally.command.targetAllyId) continue;
      const target = allies.find((u) => u.instanceId === ally.command.targetAllyId);
      if (!target) continue;
      this.drawCommandLine(ally.position.x, ally.position.y, target.position.x, target.position.y, '#60a5fa');
    }
  }

  private drawCommandLine(fromX: number, fromY: number, toX: number, toY: number, color: string): void {
    if (!this.commandLayer) return;
    const line = globalThis.document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(fromX / 1200 * 100) + '%');
    line.setAttribute('y1', String(fromY / 700 * 100) + '%');
    line.setAttribute('x2', String(toX / 1200 * 100) + '%');
    line.setAttribute('y2', String(toY / 700 * 100) + '%');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 4');
    this.commandLayer.appendChild(line);
  }

  private renderPrepPanel(): void {
    if (!this.prepPanel) return;
    const snap = this.session.getSnapshot();

    const shopRow = `<div style="margin-bottom:8px"><b>商店区(3)</b>: ${snap.shop.map((u, idx) => `<button data-buy='${idx}'>${u}</button>`).join(' ')}</div>`;
    const deployedRow = `<div style="margin-bottom:8px"><b>上阵区(${snap.slotConfig.deployed})</b>: ${snap.deployed.map((u) => `<button data-recall='${u.instanceId}'>${u.unitId}★${u.star}</button>`).join(' ')}</div>`;
    const benchSlots = Array.from({ length: snap.slotConfig.bench }).map((_, idx) => {
      const u = snap.bench[idx];
      return u ? `<button data-deploy='${u.instanceId}'>${u.unitId}★${u.star}</button>` : '<span style="display:inline-flex;align-items:center;justify-content:center;width:80px;height:30px;border:1px dashed #475569;border-radius:6px;color:#64748b;">空位</span>';
    });
    const benchRow = `<div style="margin-bottom:8px"><b>备战区(8)</b>: ${benchSlots.join(' ')}</div>`;

    this.prepPanel.innerHTML = `
      <div style='font-weight:700;margin-bottom:8px'>准备阶段面板</div>
      ${shopRow}
      ${deployedRow}
      ${benchRow}
      <div style='display:flex;gap:8px;margin-top:12px'>
        <button data-sell='1'>卖出</button>
        <button data-refresh='1'>刷新</button>
        <button data-start='1'>开始下一波</button>
      </div>
    `;
  }

  private handlePrepPanelClick(evt: Event): void {
    const button = (evt.target as HTMLElement | null)?.closest('button');
    if (!button) return;
    const dataset = (button as HTMLButtonElement).dataset;
    if (dataset.buy) {
      this.session.buyShopUnit(Number(dataset.buy));
      return;
    }
    if (dataset.deploy) {
      this.session.deployFromBench(dataset.deploy);
      return;
    }
    if (dataset.recall) {
      this.session.recallFromDeployed(dataset.recall);
      return;
    }
    if (dataset.sell) {
      if (this.selectedUnitId) this.session.sellUnit(this.selectedUnitId);
      return;
    }
    if (dataset.refresh) {
      this.session.refreshShopByCost();
      return;
    }
    if (dataset.start) {
      const current = this.session.getSnapshot();
      if (current.uiState.nextWaveReady) {
        this.session.startNextWaveFromPrep();
      }
    }
  }

  private getUnitMaxHp(unit: SquadUnitState): number {
    const base = SQUAD_UNIT_STATS[unit.unitId].maxHp;
    const hpMultiplier = 1 + (unit.star - 1) * 0.7;
    return Math.round(base * hpMultiplier);
  }
}
