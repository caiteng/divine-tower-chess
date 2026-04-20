import { _decorator, Canvas, Component, director, Layers, Node, UITransform, Vec3 } from 'cc';
import { UNIT_CONFIG } from '../config/unit-config';
import { SquadBattleSession } from '../squad/squad-battle-session';
import { SquadBattleSnapshot, SquadUnitState } from '../squad/types';
import { BattlefieldController } from './controllers/battlefield-controller';
import { BattleHudController } from './controllers/battle-hud-controller';
import { CommandOverlayController } from './controllers/command-overlay-controller';
import { PrepPanelController } from './controllers/prep-panel-controller';
import { WaveTransitionController } from './controllers/wave-transition-controller';

const { ccclass } = _decorator;

@ccclass('BattleSceneController')
export class BattleSceneController extends Component {
  private readonly session = new SquadBattleSession();

  private selectedUnitId: string | undefined;
  private transientNotice: { message: string; until: number } | null = null;
  private moveMarker: { x: number; y: number; until: number } | null = null;

  private hudController: BattleHudController | null = null;
  private prepController: PrepPanelController | null = null;
  private fieldController: BattlefieldController | null = null;
  private transitionController: WaveTransitionController | null = null;
  private commandOverlayController: CommandOverlayController | null = null;

  public onLoad(): void {
    this.session.startNewRun('beginner');
    this.ensureSceneGraph();
    this.pushNotice('Cocos 正式 UI 主链已启用：准备阶段先购买并上阵。', 2200);
  }

  public update(dt: number): void {
    this.session.tick(Math.max(0.016, Math.min(0.05, dt || 0.016)));
    this.render();
  }

  private ensureSceneGraph(): void {
    const scene = director.getScene();
    const canvasNode = scene ? this.findCanvasNode(scene) : null;
    const parent = canvasNode ?? this.node;

    const root = new Node('BattleSceneRoot');
    root.layer = Layers.Enum.UI_2D;
    root.addComponent(UITransform).setContentSize(960, 640);
    parent.addChild(root);

    const battleNode = new Node('Battlefield');
    battleNode.layer = Layers.Enum.UI_2D;
    battleNode.addComponent(UITransform).setContentSize(920, 400);
    battleNode.setPosition(new Vec3(0, 108, 0));
    root.addChild(battleNode);

    const hudNode = new Node('Hud');
    hudNode.layer = Layers.Enum.UI_2D;
    hudNode.addComponent(UITransform).setContentSize(920, 150);
    hudNode.setPosition(new Vec3(0, 244, 0));
    root.addChild(hudNode);

    const prepNode = new Node('PrepPanel');
    prepNode.layer = Layers.Enum.UI_2D;
    prepNode.addComponent(UITransform).setContentSize(920, 240);
    prepNode.setPosition(new Vec3(0, -186, 0));
    root.addChild(prepNode);

    const cmdNode = new Node('CommandOverlay');
    cmdNode.layer = Layers.Enum.UI_2D;
    cmdNode.addComponent(UITransform).setContentSize(920, 40);
    cmdNode.setPosition(new Vec3(0, 164, 0));
    root.addChild(cmdNode);

    this.hudController = hudNode.addComponent(BattleHudController);
    this.hudController.initialize();

    this.prepController = prepNode.addComponent(PrepPanelController);
    this.prepController.initialize();
    this.prepController.onBuy = (index) => this.onBuy(index);
    this.prepController.onDeploy = (id) => this.onDeploy(id);
    this.prepController.onRecall = (id) => this.onRecall(id);
    this.prepController.onSell = () => this.onSell();
    this.prepController.onRefresh = () => this.onRefresh();
    this.prepController.onStartWave = () => this.onStartWave();

    this.fieldController = battleNode.addComponent(BattlefieldController);
    this.fieldController.initialize();
    this.fieldController.onGroundClick = (x, y) => this.onGroundClicked(x, y);
    this.fieldController.onEnemyClick = (enemyId) => this.onEnemyClicked(enemyId);
    this.fieldController.onAllyClick = (allyId, allies) => this.onAllyClicked(allyId, allies);

    this.transitionController = root.addComponent(WaveTransitionController);
    this.transitionController.bind(prepNode, battleNode);

    this.commandOverlayController = cmdNode.addComponent(CommandOverlayController);
    this.commandOverlayController.initialize();
  }

  private render(): void {
    const snap = this.session.getSnapshot();
    const selectedLabel = this.getSelectedUnitLabel(snap) ?? 'none';
    const notice = this.getNoticeText(snap);

    this.hudController?.render(snap, selectedLabel, notice);
    this.prepController?.render(snap, selectedLabel);
    this.fieldController?.render(snap, this.selectedUnitId, this.moveMarker);
    this.transitionController?.sync(snap);
    this.commandOverlayController?.setNotice(notice);
  }

  private onGroundClicked(worldX: number, worldY: number): void {
    if (!this.selectedUnitId) return;
    this.session.selectUnit(this.selectedUnitId);
    const issued = this.session.commandMoveToGround({ x: worldX, y: worldY });
    if (!issued) {
      this.pushNotice('移动命令失败：当前选中单位不能执行移动。');
      return;
    }
    this.moveMarker = { x: worldX, y: worldY, until: Date.now() + 900 };
    this.pushNotice(`已下达移动命令：(${Math.round(worldX)}, ${Math.round(worldY)})`, 1200);
  }

  private onEnemyClicked(enemyInstanceId: string): void {
    if (!this.selectedUnitId) return;
    this.session.selectUnit(this.selectedUnitId);
    const issued = this.session.commandFocusEnemy(enemyInstanceId);
    this.pushNotice(issued ? `已下达集火命令：目标 ${enemyInstanceId.slice(-4)}` : '命令失败：当前选中单位无法执行集火。');
  }

  private onAllyClicked(allyInstanceId: string, allies: SquadUnitState[]): void {
    const selectedUnit = allies.find((ally) => ally.instanceId === this.selectedUnitId);
    if (selectedUnit?.role === 'priest' && this.selectedUnitId) {
      this.session.selectUnit(this.selectedUnitId);
      const issued = this.session.commandPriestHeal(allyInstanceId);
      this.pushNotice(issued ? `已下达持续治疗：${allyInstanceId.slice(-4)}` : '治疗命令失败：仅牧师可对友军持续治疗。');
      return;
    }

    this.selectedUnitId = allyInstanceId;
    const ally = allies.find((u) => u.instanceId === allyInstanceId);
    this.pushNotice(`已选中战场单位：${ally?.unitId ?? allyInstanceId.slice(-4)}${ally ? `★${ally.star}` : ''}`, 1200);
  }

  private onBuy(slotIndex: number): void {
    const snap = this.session.getSnapshot();
    const unitId = snap.shop[slotIndex];
    const bought = this.session.buyShopUnit(slotIndex);
    this.pushNotice(bought ? `购买成功：${unitId}` : this.getBuyFailureReason(slotIndex));
  }

  private onDeploy(instanceId: string): void {
    const snap = this.session.getSnapshot();
    const unit = snap.bench.find((u) => u.instanceId === instanceId);
    const deployed = this.session.deployFromBench(instanceId);
    if (deployed) {
      this.selectedUnitId = instanceId;
      this.pushNotice(`已上阵：${unit?.unitId ?? instanceId.slice(-4)}${unit ? `★${unit.star}` : ''}`);
      return;
    }
    this.pushNotice('上阵失败：上阵位已满或单位不存在。');
  }

  private onRecall(instanceId: string): void {
    const snap = this.session.getSnapshot();
    const unit = snap.deployed.find((u) => u.instanceId === instanceId);
    const recalled = this.session.recallFromDeployed(instanceId);
    if (recalled) {
      this.selectedUnitId = instanceId;
      this.pushNotice(`已撤回：${unit?.unitId ?? instanceId.slice(-4)}${unit ? `★${unit.star}` : ''}`);
      return;
    }
    this.pushNotice('撤回失败：单位不存在。');
  }

  private onSell(): void {
    if (!this.selectedUnitId) {
      this.pushNotice('卖出失败：请先选中单位。');
      return;
    }
    const sold = this.session.sellUnit(this.selectedUnitId);
    if (sold) {
      this.pushNotice('已卖出当前选中单位。');
      this.selectedUnitId = undefined;
      return;
    }
    this.pushNotice('卖出失败：当前选中单位不可卖出。');
  }

  private onRefresh(): void {
    const refreshed = this.session.refreshShopByCost();
    this.pushNotice(refreshed ? '商店已刷新。' : '刷新失败：金币不足或当前不在准备阶段。');
  }

  private onStartWave(): void {
    const started = this.session.startNextWaveFromPrep();
    this.pushNotice(started ? '已开始下一波。' : '开始失败：至少需要 1 名已上阵单位，且当前必须处于准备阶段。');
  }

  private findCanvasNode(root: Node): Node | null {
    if (root.getComponent(Canvas)) return root;
    for (const child of root.children) {
      const found = this.findCanvasNode(child);
      if (found) return found;
    }
    return null;
  }

  private pushNotice(message: string, durationMs = 1600): void {
    this.transientNotice = {
      message,
      until: Date.now() + durationMs,
    };
  }

  private getNoticeText(snap: SquadBattleSnapshot): string {
    if (this.transientNotice && Date.now() > this.transientNotice.until) {
      this.transientNotice = null;
    }
    const selected = this.getSelectedUnitLabel(snap);
    return this.transientNotice?.message ?? (selected
      ? `已选中 ${selected}。准备阶段可卖出/上阵/撤回；战斗阶段可继续下达命令。`
      : snap.phase === 'prep'
        ? '准备阶段：购买 3 个同星同单位会自动合成；先上阵至少 1 人再开始下一波。'
        : '战斗阶段：点己方单位后，再点地面移动、点敌人集火、点友军为牧师持续治疗。');
  }

  private getSelectedUnitLabel(snap: SquadBattleSnapshot): string | undefined {
    if (!this.selectedUnitId) return undefined;
    const rosterUnit = [...snap.deployed, ...snap.bench].find((u) => u.instanceId === this.selectedUnitId);
    if (rosterUnit) {
      const source = snap.deployed.some((u) => u.instanceId === this.selectedUnitId) ? 'deployed' : 'bench';
      return `${rosterUnit.unitId}★${rosterUnit.star} [${source}]`;
    }
    const battleUnit = snap.allies.find((u) => u.instanceId === this.selectedUnitId);
    if (battleUnit) {
      return `${battleUnit.unitId}★${battleUnit.star} [battle]`;
    }
    return undefined;
  }

  private getBuyFailureReason(slotIndex: number): string {
    const snap = this.session.getSnapshot();
    const unitId = snap.shop[slotIndex];
    if (!unitId) return '购买失败：商店槽位为空。';
    if (snap.phase !== 'prep') return '购买失败：当前不在准备阶段。';
    if (snap.bench.length >= snap.slotConfig.bench) return '购买失败：备战区已满。';
    const cost = UNIT_CONFIG[unitId].cost;
    if (snap.gold < cost) return `购买失败：金币不足，需要 ${cost}。`;
    return '购买失败：该单位未能加入备战区。';
  }
}
