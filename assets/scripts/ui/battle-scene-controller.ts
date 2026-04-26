import { _decorator, Canvas, Component, director, Layers, Node, UITransform, Vec3 } from 'cc';
import { SHOP_UNIT_POOL, UNIT_CONFIG } from '../config/unit-config';
import { LocalProfileStorage } from '../core/local-profile-storage';
import type { UnitId } from '../models/types';
import { SquadBattleSession } from '../squad/squad-battle-session';
import type { SavedAchievements, SavedAudioSettings, SquadBattleSnapshot, SquadUnitState } from '../squad/types';
import { BattlefieldController } from './controllers/battlefield-controller';
import { BattleHudController } from './controllers/battle-hud-controller';
import { CharacterSelectController } from './controllers/character-select-controller';
import { CommandOverlayController } from './controllers/command-overlay-controller';
import { MainMenuController } from './controllers/main-menu-controller';
import { PrepPanelController } from './controllers/prep-panel-controller';
import { WaveTransitionController } from './controllers/wave-transition-controller';

const { ccclass } = _decorator;

type SceneMode = 'menu' | 'select' | 'battle';

@ccclass('BattleSceneController')
export class BattleSceneController extends Component {
  private readonly session = new SquadBattleSession();
  private readonly storage = new LocalProfileStorage();
  private mode: SceneMode = 'menu';
  private rootNode: Node | null = null;
  private menuController: MainMenuController | null = null;
  private selectController: CharacterSelectController | null = null;
  private settings: SavedAudioSettings = { master: 80, music: 70, sfx: 80 };
  private achievements: SavedAchievements = { firstClear: false };
  private selectedStarterUnitId: UnitId = SHOP_UNIT_POOL[0];

  private selectedUnitId: string | undefined;
  private transientNotice: { message: string; until: number } | null = null;
  private moveMarker: { x: number; y: number; until: number } | null = null;

  private hudController: BattleHudController | null = null;
  private prepController: PrepPanelController | null = null;
  private fieldController: BattlefieldController | null = null;
  private transitionController: WaveTransitionController | null = null;
  private commandOverlayController: CommandOverlayController | null = null;

  public onLoad(): void {
    this.hideRuntimeProfiler();
    this.settings = this.storage.loadSettings();
    this.achievements = this.storage.loadAchievements();
    this.session.onVictory = () => this.unlockFirstClearAchievement();
    this.ensureMenuGraph();
  }

  public update(dt: number): void {
    if (this.mode !== 'battle') {
      return;
    }
    const outcome = this.session.tick(Math.max(0.016, Math.min(0.05, dt || 0.016)));
    if (outcome.advancedWave || outcome.changedPhase) {
      this.persistRun();
    }
    this.render();
  }

  private ensureMenuGraph(): void {
    const scene = director.getScene();
    const canvasNode = scene ? this.findCanvasNode(scene) : null;
    const parent = canvasNode ?? this.node;

    const root = new Node('BattleSceneRoot');
    root.layer = Layers.Enum.UI_2D;
    root.addComponent(UITransform).setContentSize(960, 640);
    parent.addChild(root);
    this.rootNode = root;

    const menuNode = new Node('MainMenu');
    menuNode.layer = Layers.Enum.UI_2D;
    menuNode.addComponent(UITransform).setContentSize(960, 640);
    root.addChild(menuNode);
    this.menuController = menuNode.addComponent(MainMenuController);
    this.menuController.initialize();
    this.menuController.onStart = () => this.startFromMainMenu();
    this.menuController.onLoadRequested = () => this.loadFromMenu();
    this.menuController.onSettingAdjusted = (key, nextValue) => this.updateSetting(key, nextValue);
    this.menuController.setSettings(this.settings);
    this.menuController.setAchievements(this.achievements);
    this.menuController.setHasRunSave(this.storage.hasRunSave());
    this.menuController.setFooterText('当前版本：先从开始界面进入，再进入准备阶段。');

    const selectNode = new Node('CharacterSelect');
    selectNode.layer = Layers.Enum.UI_2D;
    selectNode.addComponent(UITransform).setContentSize(960, 640);
    root.addChild(selectNode);
    selectNode.active = false;
    this.selectController = selectNode.addComponent(CharacterSelectController);
    this.selectController.initialize();
    this.selectController.setOptions(SHOP_UNIT_POOL, this.selectedStarterUnitId);
    this.selectController.onBack = () => this.backToMainMenu();
    this.selectController.onConfirm = (unitId) => this.startBattleRunWithStarter(unitId);
  }

  private ensureSceneGraph(): void {
    if (!this.rootNode) {
      this.ensureMenuGraph();
    }
    const root = this.rootNode;
    if (!root) {
      return;
    }
    if (this.hudController || this.prepController || this.fieldController || this.transitionController || this.commandOverlayController) {
      return;
    }

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
    prepNode.setPosition(new Vec3(0, -120, 0));
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

  private startFromMainMenu(): void {
    this.mode = 'select';
    if (this.menuController) {
      this.menuController.hidePanel();
      this.menuController.node.active = false;
    }
    if (this.selectController) {
      this.selectController.node.active = true;
      this.selectController.setOptions(SHOP_UNIT_POOL, this.selectedStarterUnitId);
    }
  }

  private backToMainMenu(): void {
    this.mode = 'menu';
    if (this.selectController) {
      this.selectController.node.active = false;
    }
    if (this.menuController) {
      this.menuController.node.active = true;
      this.menuController.setFooterText('已返回主菜单。点击开始后先选职业，再进入第一回合。');
    }
  }

  private startBattleRunWithStarter(unitId: UnitId): void {
    this.selectedStarterUnitId = unitId;
    this.session.startNewRun('beginner', unitId);
    this.mode = 'battle';
    this.selectedUnitId = undefined;
    this.moveMarker = null;
    this.transientNotice = null;
    this.ensureSceneGraph();
    if (this.selectController) {
      this.selectController.node.active = false;
    }
    if (this.menuController) {
      this.menuController.hidePanel();
      this.menuController.node.active = false;
    }
    this.pushNotice(`已选择 ${UNIT_CONFIG[unitId].name} 作为起始队长，先购买并上阵，至少 1 人后开始下一波。`, 2400);
    this.persistRun();
    this.render();
  }

  private loadFromMenu(): void {
    const save = this.storage.loadRun();
    if (!save) {
      this.menuController?.setHasRunSave(false);
      this.menuController?.setFooterText('未找到可用存档。先开始一局，系统会自动保存关键进度。');
      return;
    }
    if (!this.session.loadFromSaveData(save)) {
      this.menuController?.setFooterText('载入失败：存档内容不兼容。');
      return;
    }
    this.mode = 'battle';
    this.selectedUnitId = undefined;
    this.moveMarker = null;
    this.transientNotice = null;
    this.selectedStarterUnitId = save.selectedStarterUnitId ?? this.selectedStarterUnitId;
    this.ensureSceneGraph();
    if (this.menuController) {
      this.menuController.hidePanel();
      this.menuController.node.active = false;
    }
    if (this.selectController) {
      this.selectController.node.active = false;
    }
    this.pushNotice(`已载入存档：波次 ${save.waveNumber}，阶段 ${save.phase}。`, 2200);
    this.render();
  }

  private render(): void {
    const snap = this.session.getSnapshot();
    this.syncSelection(snap);
    const selectedLabel = this.getSelectedUnitLabel(snap) ?? 'none';
    const notice = this.getNoticeText(snap);

    this.hudController?.render(snap, selectedLabel, notice);
    this.prepController?.render(snap, selectedLabel, this.selectedUnitId);
    this.fieldController?.render(snap, this.selectedUnitId, this.moveMarker);
    this.transitionController?.sync(snap);
    this.commandOverlayController?.setNotice(notice);
  }

  private syncSelection(snap: SquadBattleSnapshot): void {
    if (!this.selectedUnitId) return;
    const stillExists = [...snap.bench, ...snap.deployed, ...snap.allies].some((unit) => unit.instanceId === this.selectedUnitId);
    if (!stillExists) {
      this.selectedUnitId = undefined;
    }
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
    this.persistRun();
  }

  private onEnemyClicked(enemyInstanceId: string): void {
    if (!this.selectedUnitId) return;
    this.session.selectUnit(this.selectedUnitId);
    const issued = this.session.commandFocusEnemy(enemyInstanceId);
    this.pushNotice(issued ? `已下达集火命令：目标 ${enemyInstanceId.slice(-4)}` : '命令失败：当前选中单位无法执行集火。');
    if (issued) this.persistRun();
  }

  private onAllyClicked(allyInstanceId: string, allies: SquadUnitState[]): void {
    const selectedUnit = allies.find((ally) => ally.instanceId === this.selectedUnitId);
    if (selectedUnit?.role === 'priest' && this.selectedUnitId) {
      this.session.selectUnit(this.selectedUnitId);
      const issued = this.session.commandPriestHeal(allyInstanceId);
      this.pushNotice(issued ? `已下达持续治疗：${allyInstanceId.slice(-4)}` : '治疗命令失败：仅牧师可对友军持续治疗。');
      if (issued) this.persistRun();
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
    if (bought) this.persistRun();
  }

  private onDeploy(instanceId: string): void {
    const snap = this.session.getSnapshot();
    const unit = snap.bench.find((u) => u.instanceId === instanceId);
    const deployed = this.session.deployFromBench(instanceId);
    if (deployed) {
      this.selectedUnitId = instanceId;
      this.pushNotice(`已上阵：${unit?.unitId ?? instanceId.slice(-4)}${unit ? `★${unit.star}` : ''}`);
      this.persistRun();
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
      this.persistRun();
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
      this.persistRun();
      return;
    }
    this.pushNotice('卖出失败：当前选中单位不可卖出。');
  }

  private onRefresh(): void {
    const refreshed = this.session.refreshShopByCost();
    this.pushNotice(refreshed ? '商店已刷新。' : '刷新失败：金币不足或当前不在准备阶段。');
    if (refreshed) this.persistRun();
  }

  private onStartWave(): void {
    const started = this.session.startNextWaveFromPrep();
    this.pushNotice(started ? '已开始下一波。' : '开始失败：至少需要 1 名已上阵单位，且当前必须处于准备阶段。');
    if (started) this.persistRun();
  }

  private findCanvasNode(root: Node): Node | null {
    if (root.getComponent(Canvas)) return root;
    for (const child of root.children) {
      const found = this.findCanvasNode(child);
      if (found) return found;
    }
    return null;
  }

  private hideRuntimeProfiler(): void {
    const runtimeGlobal = globalThis as typeof globalThis & {
      cc?: {
        profiler?: {
          hideStats?: () => void;
        };
      };
    };
    runtimeGlobal.cc?.profiler?.hideStats?.();
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
      ? this.getSelectedHint(snap, selected)
      : snap.phase === 'prep'
        ? '准备阶段：购买 3 个同星同单位会自动合成；先上阵至少 1 人再开始下一波。'
        : '战斗阶段：点己方单位后，再点地面移动、点敌人集火、点友军为牧师持续治疗。');
  }

  private getSelectedHint(snap: SquadBattleSnapshot, selected: string): string {
    const rosterUnit = [...snap.bench, ...snap.deployed].find((u) => u.instanceId === this.selectedUnitId);
    if (rosterUnit) {
      const location = snap.deployed.some((u) => u.instanceId === rosterUnit.instanceId) ? '上阵区' : '备战区';
      const task = snap.divineTasks.find((entry) => entry.unitInstanceId === rosterUnit.instanceId);
      return task
        ? `已选中 ${selected}，位于${location}。该实例有神品任务 ${task.divineTaskId}，当前进度 ${Math.floor(task.divineProgress ?? 0)}。`
        : `已选中 ${selected}，位于${location}。准备阶段可卖出/上阵/撤回，3 同星同单位会自动合成。`;
    }

    const battleUnit = snap.allies.find((u) => u.instanceId === this.selectedUnitId);
    if (!battleUnit) {
      return `已选中 ${selected}。`;
    }

    if (battleUnit.role === 'priest') {
      return `已选中 ${selected}。牧师不会自动攻击，请点友军下达持续治疗，或点地面重新走位。`;
    }

    if (battleUnit.command.type === 'focus_enemy') {
      return `已选中 ${selected}。当前处于集火命令状态，可改点地面移动或改点其他敌人。`;
    }

    if (battleUnit.command.type === 'move') {
      return `已选中 ${selected}。当前处于移动命令状态，可改点敌人集火或继续重定向走位。`;
    }

    return `已选中 ${selected}。战斗阶段可点地面移动、点敌人集火；近战只会短距离反应，远程不会自动满图追击。`;
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

  private updateSetting(key: keyof SavedAudioSettings, nextValue: number): void {
    this.settings = {
      ...this.settings,
      [key]: nextValue,
    };
    this.storage.saveSettings(this.settings);
    this.menuController?.setSettings(this.settings);
    this.menuController?.setFooterText(`设置已保存：${this.getSettingLabel(key)} ${nextValue}%`);
  }

  private getSettingLabel(key: keyof SavedAudioSettings): string {
    if (key === 'master') return '总音量';
    if (key === 'music') return '音乐';
    return '音效';
  }

  private unlockFirstClearAchievement(): void {
    if (this.achievements.firstClear) return;
    this.achievements = {
      ...this.achievements,
      firstClear: true,
    };
    this.storage.saveAchievements(this.achievements);
    this.menuController?.setAchievements(this.achievements);
    this.pushNotice('成就解锁：初次通关。', 2200);
    this.persistRun();
  }

  private persistRun(): void {
    if (this.mode !== 'battle') return;
    this.storage.saveRun(this.session.exportSaveData());
    this.menuController?.setHasRunSave(true);
  }
}
