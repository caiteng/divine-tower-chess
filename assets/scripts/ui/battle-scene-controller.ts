import { _decorator, Canvas, Component, director, Layers, Node, UITransform, Vec3 } from 'cc';
import { LocalProfileStorage } from '../core/local-profile-storage';
import { TowerDefenseSession } from '../td/td-session';
import type { TDHeroInstanceState, TDSnapshot } from '../td/types';
import type { SavedAchievements, SavedAudioSettings } from '../squad/types';
import { MainMenuController } from './controllers/main-menu-controller';
import { TDCommandBarController } from './controllers/td-command-bar-controller';
import { TDHudController } from './controllers/td-hud-controller';
import { TDMapController } from './controllers/td-map-controller';
import { TDPrepPanelController } from './controllers/td-prep-panel-controller';

const { ccclass } = _decorator;

type SceneMode = 'menu' | 'td';

@ccclass('BattleSceneController')
export class BattleSceneController extends Component {
  private readonly tdSession = new TowerDefenseSession();
  private readonly storage = new LocalProfileStorage();

  private mode: SceneMode = 'menu';
  private rootNode: Node | null = null;
  private menuController: MainMenuController | null = null;
  private settings: SavedAudioSettings = { master: 80, music: 70, sfx: 80 };
  private achievements: SavedAchievements = { firstClear: false };

  private tdRootNode: Node | null = null;
  private tdMapController: TDMapController | null = null;
  private tdHudController: TDHudController | null = null;
  private tdPrepController: TDPrepPanelController | null = null;
  private tdCommandController: TDCommandBarController | null = null;
  private selectedTdHeroId: string | undefined;
  private transientNotice: { message: string; until: number } | null = null;

  public onLoad(): void {
    this.hideRuntimeProfiler();
    this.settings = this.storage.loadSettings();
    this.achievements = this.storage.loadAchievements();
    this.ensureMenuGraph();
  }

  public update(dt: number): void {
    if (this.mode !== 'td') return;
    const outcome = this.tdSession.tick(Math.max(0.016, Math.min(0.05, dt || 0.016)));
    if (outcome.changedPhase || outcome.spawned > 0 || outcome.leaked > 0 || outcome.killed > 0 || outcome.advancedWave) {
      this.persistTdRun();
    }
    this.renderTD();
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
    this.menuController.onStart = () => this.startTowerDefenseRun();
    this.menuController.onLoadRequested = () => this.loadTowerDefenseRun();
    this.menuController.onSettingAdjusted = (key, nextValue) => this.updateSetting(key, nextValue);
    this.menuController.setSettings(this.settings);
    this.menuController.setAchievements(this.achievements);
    this.menuController.setHasRunSave(this.storage.hasRunSave());
  }

  private startTowerDefenseRun(): void {
    this.mode = 'td';
    this.selectedTdHeroId = undefined;
    this.transientNotice = null;
    this.tdSession.startNewRun('stage_1_forest_loop', 'normal', 'archer');
    this.ensureTDSceneGraph();
    if (this.menuController) {
      this.menuController.hidePanel();
      this.menuController.node.active = false;
    }
    this.pushNotice('塔防模式已启动：先购买英雄，再点击地图塔位放置。', 2400);
    this.persistTdRun();
    this.renderTD();
  }

  private loadTowerDefenseRun(): void {
    // 当前 LocalProfileStorage 的公开 schema 仍是 squad run。入口修复版先降级为新开 TD 局，避免读入不兼容旧档导致白屏。
    this.startTowerDefenseRun();
    this.pushNotice('塔防存档 schema 尚未接入旧存档槽，本次先开启一局新的塔防测试。', 2600);
  }

  private ensureTDSceneGraph(): void {
    if (!this.rootNode) this.ensureMenuGraph();
    const root = this.rootNode;
    if (!root || this.tdRootNode) return;

    const tdRoot = new Node('TowerDefenseRoot');
    tdRoot.layer = Layers.Enum.UI_2D;
    tdRoot.addComponent(UITransform).setContentSize(960, 640);
    root.addChild(tdRoot);
    this.tdRootNode = tdRoot;

    const mapNode = new Node('TDMap');
    mapNode.layer = Layers.Enum.UI_2D;
    mapNode.addComponent(UITransform).setContentSize(620, 500);
    mapNode.setPosition(new Vec3(-150, -24, 0));
    tdRoot.addChild(mapNode);

    const hudNode = new Node('TDHud');
    hudNode.layer = Layers.Enum.UI_2D;
    hudNode.addComponent(UITransform).setContentSize(920, 56);
    hudNode.setPosition(new Vec3(0, 284, 0));
    tdRoot.addChild(hudNode);

    const prepNode = new Node('TDPrepPanel');
    prepNode.layer = Layers.Enum.UI_2D;
    prepNode.addComponent(UITransform).setContentSize(280, 520);
    prepNode.setPosition(new Vec3(322, -20, 0));
    tdRoot.addChild(prepNode);

    const cmdNode = new Node('TDCommandBar');
    cmdNode.layer = Layers.Enum.UI_2D;
    cmdNode.addComponent(UITransform).setContentSize(620, 72);
    cmdNode.setPosition(new Vec3(-150, -292, 0));
    tdRoot.addChild(cmdNode);

    this.tdMapController = mapNode.addComponent(TDMapController);
    this.tdMapController.initialize();
    this.tdMapController.onSlotClick = (slotId) => this.onTDSlotClicked(slotId);

    this.tdHudController = hudNode.addComponent(TDHudController);
    this.tdHudController.initialize();

    this.tdPrepController = prepNode.addComponent(TDPrepPanelController);
    this.tdPrepController.onBuy = (slotIndex) => this.onTDBuy(slotIndex);
    this.tdPrepController.onRefresh = () => this.onTDRefresh();
    this.tdPrepController.onStartWave = () => this.onTDStartWave();
    this.tdPrepController.onSelectHero = (heroId) => this.onTDSelectHero(heroId);
    this.tdPrepController.onRecall = (heroId) => this.onTDRecall(heroId);
    this.tdPrepController.onSell = (heroId) => this.onTDSell(heroId);

    this.tdCommandController = cmdNode.addComponent(TDCommandBarController);
    this.tdCommandController.onCastCaptainSkill = () => this.onTDCastCaptainSkill();
  }

  private renderTD(): void {
    const snapshot = this.tdSession.getSnapshot();
    this.syncTDSelection(snapshot);
    this.tdMapController?.render(snapshot, this.selectedTdHeroId);
    this.tdHudController?.render({ ...snapshot, notice: this.getTDNotice(snapshot) });
    this.tdPrepController?.render(snapshot, this.selectedTdHeroId);
    this.tdCommandController?.render(snapshot);
  }

  private onTDBuy(slotIndex: number): void {
    const beforeIds = new Set(this.tdSession.getSnapshot().bench.map((hero) => hero.instanceId));
    const bought = this.tdSession.buyShopHero(slotIndex);
    const after = this.tdSession.getSnapshot();
    if (!bought) {
      this.pushNotice('购买失败：金币不足、背包已满或当前不在准备阶段。');
      this.renderTD();
      return;
    }
    const newHero = after.bench.find((hero) => !beforeIds.has(hero.instanceId)) ?? after.bench[after.bench.length - 1];
    this.selectedTdHeroId = newHero?.instanceId;
    this.pushNotice(newHero ? `购买成功，已选中 ${newHero.heroId}★${newHero.star}。点击地图塔位放置。` : '购买成功。');
    this.persistTdRun();
    this.renderTD();
  }

  private onTDSelectHero(heroInstanceId: string): void {
    this.selectedTdHeroId = heroInstanceId;
    const hero = this.findTDHero(this.tdSession.getSnapshot(), heroInstanceId);
    this.pushNotice(hero ? `已选中 ${hero.heroId}★${hero.star}。点击蓝色塔位放置。` : '已选中英雄。');
    this.renderTD();
  }

  private onTDSlotClicked(slotId: string): void {
    const snap = this.tdSession.getSnapshot();
    const selected = this.selectedTdHeroId ?? snap.bench[0]?.instanceId;
    if (!selected) {
      this.pushNotice('请先购买并选中一个背包英雄。');
      this.renderTD();
      return;
    }
    const placed = this.tdSession.placeHero(selected, slotId);
    if (!placed) {
      this.pushNotice('放置失败：塔位已占用、英雄不存在或当前不是准备阶段。');
      this.renderTD();
      return;
    }
    this.selectedTdHeroId = selected;
    this.pushNotice('英雄已放置到塔位。可以继续购买，或开始下一波。');
    this.persistTdRun();
    this.renderTD();
  }

  private onTDRecall(heroInstanceId?: string): void {
    const target = heroInstanceId ?? this.selectedTdHeroId;
    if (!target) {
      this.pushNotice('请先选中一个已放置英雄。');
      return;
    }
    const recalled = this.tdSession.recallHero(target);
    this.pushNotice(recalled ? '英雄已撤回背包。' : '撤回失败。');
    if (recalled) this.persistTdRun();
    this.renderTD();
  }

  private onTDSell(heroInstanceId?: string): void {
    const target = heroInstanceId ?? this.selectedTdHeroId;
    if (!target) {
      this.pushNotice('请先选中一个英雄。');
      return;
    }
    const sold = this.tdSession.sellHero(target);
    if (sold) {
      this.selectedTdHeroId = undefined;
      this.persistTdRun();
    }
    this.pushNotice(sold ? '英雄已售出。' : '售出失败。');
    this.renderTD();
  }

  private onTDRefresh(): void {
    const refreshed = this.tdSession.refreshShopByCost();
    this.pushNotice(refreshed ? '商店已刷新。' : '刷新失败：金币不足或当前不在准备阶段。');
    if (refreshed) this.persistTdRun();
    this.renderTD();
  }

  private onTDStartWave(): void {
    const started = this.tdSession.startNextWave();
    this.pushNotice(started ? '下一波开始。' : '开始失败：当前不是准备阶段，或波次已经结束。');
    if (started) this.persistTdRun();
    this.renderTD();
  }

  private onTDCastCaptainSkill(): void {
    const casted = this.tdSession.castCaptainSkill();
    this.pushNotice(casted ? '队长技能已释放。' : '技能失败：只能在战斗中释放，或技能正在冷却。');
    if (casted) this.persistTdRun();
    this.renderTD();
  }

  private syncTDSelection(snapshot: TDSnapshot): void {
    if (!this.selectedTdHeroId) return;
    const exists = [...snapshot.bench, ...snapshot.deployed].some((hero) => hero.instanceId === this.selectedTdHeroId);
    if (!exists) this.selectedTdHeroId = undefined;
  }

  private findTDHero(snapshot: TDSnapshot, heroInstanceId: string): TDHeroInstanceState | undefined {
    return [...snapshot.bench, ...snapshot.deployed].find((hero) => hero.instanceId === heroInstanceId);
  }

  private getTDNotice(snapshot: TDSnapshot): string {
    if (this.transientNotice && Date.now() > this.transientNotice.until) {
      this.transientNotice = null;
    }
    if (this.transientNotice) return this.transientNotice.message;
    if (snapshot.phase === 'prep') return '准备阶段：购买英雄，选中背包英雄后点击塔位放置。';
    if (snapshot.phase === 'victory') return '防守成功。';
    if (snapshot.phase === 'defeat') return '据点生命归零，防守失败。';
    return snapshot.notice ?? '战斗中：敌人沿路径推进，英雄自动攻击。';
  }

  private pushNotice(message: string, durationMs = 1800): void {
    this.transientNotice = { message, until: Date.now() + durationMs };
  }

  private updateSetting(key: keyof SavedAudioSettings, nextValue: number): void {
    this.settings = { ...this.settings, [key]: nextValue };
    this.storage.saveSettings(this.settings);
    this.menuController?.setSettings(this.settings);
  }

  private persistTdRun(): void {
    // LocalProfileStorage 当前公开 run 槽位是 squad schema。TD 存档在阶段 10 完整接入前不写入旧槽，避免污染旧存档。
    this.menuController?.setHasRunSave(false);
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
}
