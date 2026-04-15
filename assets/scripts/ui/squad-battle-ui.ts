import { _decorator, Button, Canvas, Color, Component, director, Graphics, ImageAsset, Label, Layers, Node, resources, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { UNIT_CONFIG } from '../config/unit-config';
import { SQUAD_UNIT_STATS } from '../squad/config/squad-battle-config';
import { SquadBattleSession } from '../squad/squad-battle-session';
import { SquadBattleSnapshot, SquadUnitState } from '../squad/types';

const { ccclass } = _decorator;

@ccclass('SquadBattleUi')
export class SquadBattleUi extends Component {
  /**
   * Transitional UI:
   * - battlefield, HUD and prep panel now render in Cocos nodes
   * - no DOM interaction layer remains
   */
  private readonly session = new SquadBattleSession();
  private readonly prototypeConfig = {
    difficulty: 'beginner' as const,
    enablePrepBootstrap: false,
  };

  private cocosUiRoot: Node | null = null;
  private cocosBattleRoot: Node | null = null;
  private cocosHudRoot: Node | null = null;
  private cocosPrepRoot: Node | null = null;

  private selectedUnitId: string | undefined;
  private lastMoveMarker: { x: number; y: number; until: number } | null = null;
  private transientNotice: { message: string; tone: 'info' | 'success' | 'warn'; until: number } | null = null;
  private battleBackgroundFrame: SpriteFrame | null = null;

  public onLoad(): void {
    this.session.startNewRun(this.prototypeConfig.difficulty);
    this.ensureCocosUi();
    this.tryLoadBattleBackground();
    if (this.prototypeConfig.enablePrepBootstrap) {
      this.bootstrapPrepSquad();
    }
    this.pushNotice('已切入 Cocos 节点 HUD / 面板迁移模式。准备阶段先购买并上阵单位。', 'info', 2600);
  }

  public update(dt: number): void {
    this.session.tick(Math.max(0.016, Math.min(0.05, dt || 0.016)));
    this.render();
  }

  public onDestroy(): void {
    if (this.cocosUiRoot) {
      this.cocosUiRoot.removeAllChildren();
      this.cocosUiRoot.parent = null;
    }
    this.cocosUiRoot = null;
    this.cocosBattleRoot = null;
    this.cocosHudRoot = null;
    this.cocosPrepRoot = null;
  }

  private ensureCocosUi(): void {
    if (this.cocosUiRoot) return;

    const scene = director.getScene();
    const canvasNode = scene ? this.findCanvasNode(scene) : null;
    const parent = canvasNode ?? this.node;

    const uiRoot = new Node('SquadCocosUi');
    uiRoot.layer = Layers.Enum.UI_2D;
    parent.addChild(uiRoot);
    uiRoot.setPosition(new Vec3(0, 0, 0));
    uiRoot.addComponent(UITransform).setContentSize(960, 640);

    const battleRoot = new Node('BattleRoot');
    battleRoot.layer = Layers.Enum.UI_2D;
    uiRoot.addChild(battleRoot);
    battleRoot.setPosition(new Vec3(0, 0, 0));
    battleRoot.addComponent(UITransform).setContentSize(960, 420);

    const hudRoot = new Node('HudRoot');
    hudRoot.layer = Layers.Enum.UI_2D;
    uiRoot.addChild(hudRoot);
    hudRoot.setPosition(new Vec3(0, 0, 0));
    hudRoot.addComponent(UITransform).setContentSize(960, 220);

    const prepRoot = new Node('PrepRoot');
    prepRoot.layer = Layers.Enum.UI_2D;
    uiRoot.addChild(prepRoot);
    prepRoot.setPosition(new Vec3(0, 0, 0));
    prepRoot.addComponent(UITransform).setContentSize(960, 320);

    this.cocosUiRoot = uiRoot;
    this.cocosBattleRoot = battleRoot;
    this.cocosHudRoot = hudRoot;
    this.cocosPrepRoot = prepRoot;
  }

  private findCanvasNode(root: Node): Node | null {
    if (root.getComponent(Canvas)) return root;
    for (const child of root.children) {
      const found = this.findCanvasNode(child);
      if (found) return found;
    }
    return null;
  }

  private tryLoadBattleBackground(): void {
    resources.load('textures/backgrounds/battlefield_01', ImageAsset, (err, asset) => {
      if (err || !asset) {
        this.battleBackgroundFrame = null;
        return;
      }
      this.battleBackgroundFrame = SpriteFrame.createWithImage(asset);
    });
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

  private render(): void {
    const snap = this.session.getSnapshot();
    this.renderCocosBattlefield(snap);
    this.renderCocosHud(snap);
    this.renderCocosPrepPanel(snap);
  }

  private renderCocosBattlefield(snap: SquadBattleSnapshot): void {
    if (!this.cocosBattleRoot) return;
    this.cocosBattleRoot.removeAllChildren();

    this.createBattleBackground();
    this.createBattleMoveGrid();
    this.createFieldStripe('BattleStripeTop', 0, 118, 840, 88, new Color(15, 23, 42, 150));
    this.createFieldStripe('BattleStripeBottom', 0, 30, 840, 88, new Color(17, 24, 39, 110));
    this.createText(this.cocosBattleRoot, 'BattleTitle', 'Battlefield', -374, 222, 160, 16, new Color(248, 250, 252, 255));
    this.createText(this.cocosBattleRoot, 'BattleHint', 'Main spawns right, anti-camp spawns may come from left.', 160, 222, 470, 11, new Color(148, 163, 184, 255));
    this.createBattleLightingOverlay(snap);

    const lineNode = new Node('CommandLines');
    lineNode.layer = Layers.Enum.UI_2D;
    this.cocosBattleRoot.addChild(lineNode);
    lineNode.setPosition(new Vec3(0, 74, 0));
    lineNode.addComponent(UITransform).setContentSize(888, 348);
    const lineGraphics = lineNode.addComponent(Graphics);
    lineGraphics.lineWidth = 2;

    for (const ally of snap.allies) {
      if (ally.command.type === 'focus_enemy' && ally.command.targetEnemyId) {
        const target = snap.enemies.find((e) => e.instanceId === ally.command.targetEnemyId);
        if (target) {
          this.drawBattleLine(lineGraphics, ally.position, target.position, new Color(245, 158, 11, 255));
        }
      }
      if (ally.command.type === 'channel_heal' && ally.command.targetAllyId) {
        const target = snap.allies.find((u) => u.instanceId === ally.command.targetAllyId);
        if (target) {
          this.drawBattleLine(lineGraphics, ally.position, target.position, new Color(96, 165, 250, 255));
        }
      }
    }

    for (const enemy of snap.enemies) {
      const pos = this.toBattlefieldNodePosition(enemy.position.x, enemy.position.y);
      this.createMarker(
        this.cocosBattleRoot,
        `Enemy${enemy.instanceId}`,
        pos.x,
        pos.y,
        15,
        new Color(239, 68, 68, 255),
        new Color(127, 29, 29, 255),
        () => this.onEnemyClicked(enemy.instanceId),
      );
      this.createBattleText(`EnemyLabel${enemy.instanceId}`, `${Math.floor(enemy.currentHp)}`, pos.x, pos.y - 26, 46, 10, new Color(254, 226, 226, 255));
    }

    for (const ally of snap.allies) {
      const pos = this.toBattlefieldNodePosition(ally.position.x, ally.position.y);
      const selected = this.selectedUnitId === ally.instanceId;
      const border = selected ? new Color(245, 158, 11, 255) : ally.role === 'priest' ? new Color(147, 197, 253, 255) : new Color(15, 23, 42, 255);
      const fill = selected ? new Color(180, 83, 9, 255) : ally.role === 'priest' ? new Color(59, 130, 246, 255) : new Color(34, 197, 94, 255);
      this.createMarker(this.cocosBattleRoot, `Ally${ally.instanceId}`, pos.x, pos.y, 16, fill, border, () => this.onAllyClicked(ally.instanceId, snap.allies));
      this.createBattleText(`AllyLabel${ally.instanceId}`, `${ally.unitId}★${ally.star}`, pos.x, pos.y + 24, 92, 10, new Color(248, 250, 252, 255));
      this.createHpBar(this.cocosBattleRoot, `AllyHp${ally.instanceId}`, pos.x, pos.y - 23, 48, 7, ally.currentHp / Math.max(1, this.getUnitMaxHp(ally)));
      if (ally.role === 'priest' && ally.command.type === 'channel_heal') {
        this.createBattleText(`HealTag${ally.instanceId}`, 'heal', pos.x, pos.y - 38, 48, 10, new Color(147, 197, 253, 255));
      }
    }

    if (this.lastMoveMarker && Date.now() <= this.lastMoveMarker.until) {
      const pos = this.toBattlefieldNodePosition(this.lastMoveMarker.x, this.lastMoveMarker.y);
      this.createRing(this.cocosBattleRoot, 'MoveMarker', pos.x, pos.y, 11, new Color(251, 191, 36, 255));
    } else {
      this.lastMoveMarker = null;
    }
  }

  private createBattleMoveGrid(): void {
    if (!this.cocosBattleRoot) return;
    const cols = 12;
    const rows = 7;
    const width = 888 / cols;
    const height = 348 / rows;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const worldX = ((col + 0.5) / cols) * 1200;
        const worldY = ((row + 0.5) / rows) * 700;
        const pos = this.toBattlefieldNodePosition(worldX, worldY);
        const node = new Node(`MoveCell${col}_${row}`);
        node.layer = Layers.Enum.UI_2D;
        this.cocosBattleRoot.addChild(node);
        node.setPosition(new Vec3(pos.x, pos.y + 74, 0));
        node.addComponent(UITransform).setContentSize(width, height);
        node.addComponent(Button);
        node.on(Button.EventType.CLICK, () => this.onGroundClicked(worldX, worldY), this);
      }
    }
  }

  private createBattleLightingOverlay(snap: SquadBattleSnapshot): void {
    if (!this.cocosBattleRoot) return;
    let alpha = 0;
    if (snap.uiState.battlefieldLighting === 'dim') {
      alpha = 150;
    } else if (snap.uiState.battlefieldLighting === 'brightening') {
      alpha = Math.round((1 - snap.uiState.transitionProgress) * 150);
    }
    if (alpha <= 0) return;
    this.createPanel(this.cocosBattleRoot, 'BattleDimOverlay', 0, 74, 888, 348, new Color(2, 6, 23, alpha), new Color(0, 0, 0, 0));
  }

  private onGroundClicked(worldX: number, worldY: number): void {
    if (!this.selectedUnitId) return;
    this.session.selectUnit(this.selectedUnitId);
    const issued = this.session.commandMoveToGround({ x: worldX, y: worldY });
    if (!issued) {
      this.pushNotice('移动命令失败：当前选中单位不能执行移动。', 'warn');
      return;
    }
    this.lastMoveMarker = { x: worldX, y: worldY, until: Date.now() + 900 };
    this.pushNotice(`已下达移动命令：(${Math.round(worldX)}, ${Math.round(worldY)})`, 'success', 1100);
  }

  private onEnemyClicked(enemyInstanceId: string): void {
    if (!this.selectedUnitId) return;
    this.session.selectUnit(this.selectedUnitId);
    const issued = this.session.commandFocusEnemy(enemyInstanceId);
    this.pushNotice(issued ? `已下达集火命令：目标 ${enemyInstanceId.slice(-4)}` : '命令失败：当前选中单位无法执行集火。', issued ? 'success' : 'warn');
  }

  private onAllyClicked(allyInstanceId: string, allies: SquadUnitState[]): void {
    const selectedUnit = allies.find((a) => a.instanceId === this.selectedUnitId);
    if (selectedUnit?.role === 'priest' && this.selectedUnitId) {
      this.session.selectUnit(this.selectedUnitId);
      const issued = this.session.commandPriestHeal(allyInstanceId);
      const ally = allies.find((a) => a.instanceId === allyInstanceId);
      this.pushNotice(issued ? `已下达持续治疗：${ally?.unitId ?? allyInstanceId.slice(-4)}${ally ? `★${ally.star}` : ''}` : '治疗命令失败：仅牧师可对友军持续治疗。', issued ? 'success' : 'warn');
      return;
    }
    const ally = allies.find((a) => a.instanceId === allyInstanceId);
    this.selectedUnitId = allyInstanceId;
    this.pushNotice(`已选中战场单位：${ally?.unitId ?? allyInstanceId.slice(-4)}${ally ? `★${ally.star}` : ''}`, 'info', 1200);
  }

  private createBattleBackground(): void {
    if (!this.cocosBattleRoot) return;
    if (this.battleBackgroundFrame) {
      const node = new Node('BattleBgSprite');
      node.layer = Layers.Enum.UI_2D;
      this.cocosBattleRoot.addChild(node);
      node.setPosition(new Vec3(0, 74, 0));
      node.addComponent(UITransform).setContentSize(888, 348);
      const sprite = node.addComponent(Sprite);
      sprite.spriteFrame = this.battleBackgroundFrame;
      sprite.sizeMode = Sprite.SizeMode.CUSTOM;
      sprite.trim = false;
      sprite.color = new Color(255, 255, 255, 255);
      this.createPanel(node, 'BattleBgFrame', 0, 0, 888, 348, new Color(0, 0, 0, 0), new Color(51, 65, 85, 255));
      return;
    }
    this.createPanel(this.cocosBattleRoot, 'BattleBgFallback', 0, 74, 888, 348, new Color(11, 18, 32, 255), new Color(51, 65, 85, 255));
  }

  private renderCocosHud(snap: SquadBattleSnapshot): void {
    if (!this.cocosHudRoot) return;
    this.cocosHudRoot.removeAllChildren();

    this.createPanel(this.cocosHudRoot, 'HudTopBg', 0, 282, 888, 44, new Color(15, 23, 42, 235), new Color(51, 65, 85, 255));
    this.createText(this.cocosHudRoot, 'HudTopLeft', `Phase: ${snap.phase} · Wave: ${snap.currentWave}/${snap.totalWaves}`, -300, 282, 360, 14, new Color(226, 232, 240, 255));
    this.createText(
      this.cocosHudRoot,
      'HudTopRight',
      `Gold ${snap.gold} · Deployed ${snap.deployed.length}/${snap.slotConfig.deployed} · Bench ${snap.bench.length}/${snap.slotConfig.bench}`,
      180,
      282,
      420,
      14,
      new Color(226, 232, 240, 255),
    );

    const selectedLabel = this.getSelectedUnitLabel(snap) ?? 'none';
    this.createPanel(this.cocosHudRoot, 'SelectedBg', 0, 248, 888, 28, new Color(15, 23, 42, 210), new Color(51, 65, 85, 255));
    this.createText(this.cocosHudRoot, 'SelectedText', `Selected: ${selectedLabel}`, 0, 248, 860, 12, new Color(251, 191, 36, 255));

    const taskText = snap.divineTasks.length > 0
      ? snap.divineTasks.map((t) => `${t.unitInstanceId.slice(-4)} → ${t.divineTaskId ?? '-'} (${Math.floor(t.divineProgress ?? 0)})`).join(' | ')
      : 'Divine Tasks: none';
    this.createPanel(this.cocosHudRoot, 'TaskBg', 0, 212, 888, 28, new Color(15, 23, 42, 200), new Color(51, 65, 85, 255));
    this.createText(this.cocosHudRoot, 'TaskText', taskText, 0, 212, 860, 12, new Color(191, 219, 254, 255));

    const notice = this.getNoticeText(snap);
    const noticeTone = this.getNoticeTone();
    this.createPanel(this.cocosHudRoot, 'NoticeBg', 0, 176, 888, 32, new Color(15, 23, 42, 180), this.getNoticeBorderColor(noticeTone));
    this.createText(this.cocosHudRoot, 'NoticeText', notice, 0, 176, 860, 12, this.getNoticeTextColor(noticeTone));
  }

  private createFieldStripe(name: string, x: number, y: number, width: number, height: number, fill: Color): void {
    if (!this.cocosBattleRoot) return;
    const stripe = new Node(name);
    stripe.layer = Layers.Enum.UI_2D;
    this.cocosBattleRoot.addChild(stripe);
    stripe.setPosition(new Vec3(x, y, 0));
    stripe.addComponent(UITransform).setContentSize(width, height);
    const graphics = stripe.addComponent(Graphics);
    graphics.fillColor = fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
  }

  private renderCocosPrepPanel(snap: SquadBattleSnapshot): void {
    if (!this.cocosPrepRoot) return;
    this.cocosPrepRoot.removeAllChildren();

    const visible = snap.uiState.prepPanel === 'visible' || snap.uiState.prepPanel === 'rising';
    if (!visible) {
      this.createPanel(this.cocosPrepRoot, 'BattleHintBg', 0, -246, 920, 92, new Color(15, 23, 42, 210), new Color(51, 65, 85, 255));
      this.createText(this.cocosPrepRoot, 'BattleHintTitle', 'Battle Commands', -350, -220, 180, 16, new Color(248, 250, 252, 255));
      this.createText(this.cocosPrepRoot, 'BattleHintBody', '点击己方单位后：点地面移动，点敌人集火，点友军为牧师持续治疗。', 40, -220, 680, 12, new Color(191, 219, 254, 255));
      return;
    }

    this.createPanel(this.cocosPrepRoot, 'PrepBg', 0, -205, 920, 210, new Color(15, 23, 42, 240), new Color(51, 65, 85, 255));
    this.createText(this.cocosPrepRoot, 'PrepTitle', 'Preparation Panel', -336, -124, 220, 18, new Color(248, 250, 252, 255));
    this.createText(this.cocosPrepRoot, 'PrepSubtitle', `Current selection: ${this.getSelectedUnitLabel(snap) ?? 'none'}`, 96, -124, 610, 12, new Color(251, 191, 36, 255));

    this.createText(this.cocosPrepRoot, 'ShopTitle', 'Shop', -398, -158, 90, 14, new Color(226, 232, 240, 255));
    snap.shop.forEach((unitId, idx) => {
      this.createActionButton(this.cocosPrepRoot!, `Buy${idx}`, `${unitId}\nBuy`, -300 + idx * 146, -188, 126, 42, new Color(30, 41, 59, 255), new Color(148, 163, 184, 255), () => this.onBuyClicked(idx));
    });

    this.createText(this.cocosPrepRoot, 'DeployedTitle', 'Deployed', -398, -228, 110, 14, new Color(226, 232, 240, 255));
    for (let i = 0; i < snap.slotConfig.deployed; i += 1) {
      const unit = snap.deployed[i];
      if (unit) {
        this.createActionButton(
          this.cocosPrepRoot,
          `Recall${unit.instanceId}`,
          `${unit.unitId}★${unit.star}\nRecall`,
          -278 + i * 136,
          -258,
          120,
          42,
          this.selectedUnitId === unit.instanceId ? new Color(66, 32, 6, 255) : new Color(30, 41, 59, 255),
          this.selectedUnitId === unit.instanceId ? new Color(245, 158, 11, 255) : new Color(100, 116, 139, 255),
          () => this.onRecallClicked(unit.instanceId),
        );
      } else {
        this.createSlotPlaceholder(this.cocosPrepRoot, `DeployedEmpty${i}`, -278 + i * 136, -258, 120, 42, 'Empty');
      }
    }

    this.createText(this.cocosPrepRoot, 'BenchTitle', 'Bench', -398, -298, 90, 14, new Color(226, 232, 240, 255));
    for (let i = 0; i < snap.slotConfig.bench; i += 1) {
      const unit = snap.bench[i];
      const x = -290 + (i % 4) * 194;
      const y = i < 4 ? -328 : -378;
      if (unit) {
        this.createActionButton(
          this.cocosPrepRoot,
          `Deploy${unit.instanceId}`,
          `${unit.unitId}★${unit.star}\nDeploy`,
          x,
          y,
          172,
          40,
          this.selectedUnitId === unit.instanceId ? new Color(66, 32, 6, 255) : new Color(30, 41, 59, 255),
          this.selectedUnitId === unit.instanceId ? new Color(245, 158, 11, 255) : new Color(71, 85, 105, 255),
          () => this.onDeployClicked(unit.instanceId),
        );
      } else {
        this.createSlotPlaceholder(this.cocosPrepRoot, `BenchEmpty${i}`, x, y, 172, 40, 'Empty');
      }
    }

    this.createActionButton(this.cocosPrepRoot, 'SellButton', 'Sell Selected', 238, -148, 144, 40, new Color(69, 26, 26, 255), new Color(185, 28, 28, 255), () => this.onSellClicked());
    this.createActionButton(this.cocosPrepRoot, 'RefreshButton', 'Refresh Shop', 238, -198, 144, 40, new Color(30, 41, 59, 255), new Color(59, 130, 246, 255), () => this.onRefreshClicked());
    this.createActionButton(this.cocosPrepRoot, 'StartButton', 'Start Next Wave', 238, -248, 144, 40, new Color(20, 83, 45, 255), new Color(34, 197, 94, 255), () => this.onStartClicked());
    this.createText(this.cocosPrepRoot, 'PrepRuleHint', 'Rule hint: 3 same 1-star => 2-star, 3 same 2-star => 3-star. Task units are protected from normal merge.', 24, -296, 430, 11, new Color(148, 163, 184, 255));
  }

  private onBuyClicked(slotIndex: number): void {
    const snap = this.session.getSnapshot();
    const unitId = snap.shop[slotIndex];
    const bought = this.session.buyShopUnit(slotIndex);
    this.pushNotice(bought ? `购买成功：${unitId}` : this.getBuyFailureReason(slotIndex), bought ? 'success' : 'warn');
  }

  private onDeployClicked(instanceId: string): void {
    const snap = this.session.getSnapshot();
    const unit = snap.bench.find((u) => u.instanceId === instanceId);
    const deployed = this.session.deployFromBench(instanceId);
    if (deployed) {
      this.selectedUnitId = instanceId;
      this.pushNotice(`已上阵：${unit?.unitId ?? instanceId.slice(-4)}${unit ? `★${unit.star}` : ''}`, 'success');
      return;
    }
    this.pushNotice('上阵失败：上阵位已满或单位不存在。', 'warn');
  }

  private onRecallClicked(instanceId: string): void {
    const snap = this.session.getSnapshot();
    const unit = snap.deployed.find((u) => u.instanceId === instanceId);
    const recalled = this.session.recallFromDeployed(instanceId);
    if (recalled) {
      this.selectedUnitId = instanceId;
      this.pushNotice(`已撤回到备战区：${unit?.unitId ?? instanceId.slice(-4)}${unit ? `★${unit.star}` : ''}`, 'success');
      return;
    }
    this.pushNotice('撤回失败：单位不存在。', 'warn');
  }

  private onSellClicked(): void {
    if (!this.selectedUnitId) {
      this.pushNotice('卖出失败：请先选中一个备战区或上阵区单位。', 'warn');
      return;
    }
    const snap = this.session.getSnapshot();
    const unit = [...snap.bench, ...snap.deployed].find((u) => u.instanceId === this.selectedUnitId);
    const sold = this.session.sellUnit(this.selectedUnitId);
    if (sold) {
      this.pushNotice(`已卖出：${unit?.unitId ?? this.selectedUnitId.slice(-4)}${unit ? `★${unit.star}` : ''}`, 'success');
      this.selectedUnitId = undefined;
      return;
    }
    this.pushNotice('卖出失败：当前选中单位不可卖出。', 'warn');
  }

  private onRefreshClicked(): void {
    const refreshed = this.session.refreshShopByCost();
    this.pushNotice(refreshed ? '商店已刷新。' : '刷新失败：金币不足或当前不在准备阶段。', refreshed ? 'success' : 'warn');
  }

  private onStartClicked(): void {
    const started = this.session.startNextWaveFromPrep();
    this.pushNotice(started ? '已开始下一波。' : '开始失败：至少需要 1 名已上阵单位，且当前必须处于准备阶段。', started ? 'success' : 'warn');
  }

  private createPanel(root: Node, name: string, x: number, y: number, width: number, height: number, fill: Color, border: Color): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = border;
    graphics.lineWidth = 2;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.stroke();
    return node;
  }

  private createText(root: Node, name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color): Node {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, Math.max(28, fontSize * 2.2));
    const label = node.addComponent(Label);
    label.string = text;
    label.color = color;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    return node;
  }

  private createActionButton(
    root: Node,
    name: string,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: Color,
    border: Color,
    onClick: () => void,
  ): void {
    const node = this.createPanel(root, name, x, y, width, height, fill, border);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, onClick, this);
    this.createText(node, `${name}Label`, text, 0, 0, width - 12, 12, new Color(248, 250, 252, 255));
  }

  private createBattleText(name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color): void {
    if (!this.cocosBattleRoot) return;
    this.createText(this.cocosBattleRoot, name, text, x, y + 74, width, fontSize, color);
  }

  private createMarker(root: Node, name: string, x: number, y: number, radius: number, fill: Color, border: Color, onClick?: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y + 74, 0));
    node.addComponent(UITransform).setContentSize(radius * 2.5, radius * 2.5);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = border;
    graphics.circle(0, 0, radius + 2);
    graphics.fill();
    graphics.fillColor = fill;
    graphics.circle(0, 0, radius);
    graphics.fill();
    if (onClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, onClick, this);
    }
  }

  private createHpBar(root: Node, name: string, x: number, y: number, width: number, height: number, ratio: number): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y + 74, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = new Color(15, 23, 42, 255);
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.fillColor = new Color(74, 222, 128, 255);
    const filled = Math.max(4, Math.min(width, width * Math.max(0, ratio)));
    graphics.rect(-width / 2, -height / 2, filled, height);
    graphics.fill();
  }

  private createRing(root: Node, name: string, x: number, y: number, radius: number, color: Color): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    root.addChild(node);
    node.setPosition(new Vec3(x, y + 74, 0));
    node.addComponent(UITransform).setContentSize(radius * 3, radius * 3);
    const graphics = node.addComponent(Graphics);
    graphics.strokeColor = color;
    graphics.lineWidth = 2;
    graphics.circle(0, 0, radius);
    graphics.stroke();
  }

  private drawBattleLine(graphics: Graphics, from: { x: number; y: number }, to: { x: number; y: number }, color: Color): void {
    const fromPos = this.toBattlefieldNodePosition(from.x, from.y);
    const toPos = this.toBattlefieldNodePosition(to.x, to.y);
    graphics.strokeColor = color;
    graphics.moveTo(fromPos.x, fromPos.y);
    graphics.lineTo(toPos.x, toPos.y);
    graphics.stroke();
  }

  private createSlotPlaceholder(root: Node, name: string, x: number, y: number, width: number, height: number, text: string): void {
    this.createPanel(root, name, x, y, width, height, new Color(15, 23, 42, 120), new Color(71, 85, 105, 255));
    this.createText(root, `${name}Text`, text, x, y, width - 10, 11, new Color(100, 116, 139, 255));
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

  private getNoticeTone(): 'info' | 'success' | 'warn' {
    return this.transientNotice?.tone ?? 'info';
  }

  private getNoticeTextColor(tone: 'info' | 'success' | 'warn'): Color {
    if (tone === 'warn') return new Color(252, 165, 165, 255);
    if (tone === 'success') return new Color(134, 239, 172, 255);
    return new Color(226, 232, 240, 255);
  }

  private getNoticeBorderColor(tone: 'info' | 'success' | 'warn'): Color {
    if (tone === 'warn') return new Color(127, 29, 29, 255);
    if (tone === 'success') return new Color(20, 83, 45, 255);
    return new Color(51, 65, 85, 255);
  }

  private pushNotice(message: string, tone: 'info' | 'success' | 'warn', durationMs = 1600): void {
    this.transientNotice = {
      message,
      tone,
      until: Date.now() + durationMs,
    };
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

  private toBattlefieldNodePosition(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX / 1200 - 0.5) * 888,
      y: (0.5 - worldY / 700) * 348,
    };
  }

  private getUnitMaxHp(unit: SquadUnitState): number {
    const base = SQUAD_UNIT_STATS[unit.unitId].maxHp;
    const hpMultiplier = 1 + (unit.star - 1) * 0.7;
    return Math.round(base * hpMultiplier);
  }
}
