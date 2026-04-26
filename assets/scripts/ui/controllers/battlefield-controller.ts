import { _decorator, Color, Component, Graphics, Label, Layers, Node, Sprite, UIOpacity, UITransform, Vec3 } from 'cc';
import { UNIT_CONFIG } from '../../config/unit-config';
import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../../squad/config/squad-battle-config';
import type { EnemyUnitState, SquadBattleSnapshot, SquadUnitState } from '../../squad/types';
import { BackgroundResolver, EnemySpriteResolver, UnitSpriteResolver } from '../resources/sprite-resolvers';
import type { EnemyAnimationClip, UnitAnimationClip } from '../resources/sprite-resolvers';
import { EnemyView } from '../views/enemy-view';
import { UnitView } from '../views/unit-view';

const { ccclass } = _decorator;

@ccclass('BattlefieldController')
export class BattlefieldController extends Component {
  private readonly unitResolver = new UnitSpriteResolver();
  private readonly enemyResolver = new EnemySpriteResolver();
  private readonly backgroundResolver = new BackgroundResolver();
  private readonly allyViews = new Map<string, { node: Node; view: UnitView }>();
  private readonly enemyViews = new Map<string, { node: Node; view: EnemyView }>();

  private allyLayer: Node | null = null;
  private enemyLayer: Node | null = null;
  private commandLayer: Node | null = null;
  private moveHint: Node | null = null;
  private dimmer: UIOpacity | null = null;
  private renderSerial = 0;

  public onGroundClick?: (x: number, y: number) => void;
  public onAllyClick?: (allyId: string, allies: SquadUnitState[]) => void;
  public onEnemyClick?: (enemyId: string) => void;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(920, 390);

    const bg = new Node('BattleBg');
    bg.layer = Layers.Enum.UI_2D;
    this.node.addChild(bg);
    bg.addComponent(UITransform).setContentSize(888, 348);
    bg.setPosition(new Vec3(0, 20, 0));
    const bgSprite = bg.addComponent(Sprite);
    bgSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    bgSprite.color = new Color(31, 79, 91, 255);
    void this.loadBackground(bgSprite);

    const dimNode = new Node('Dimmer');
    dimNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(dimNode);
    dimNode.addComponent(UITransform).setContentSize(888, 348);
    dimNode.setPosition(new Vec3(0, 20, 0));
    const dimSprite = dimNode.addComponent(Sprite);
    dimSprite.color = new Color(2, 6, 23, 255);
    this.dimmer = dimNode.addComponent(UIOpacity);
    this.dimmer.opacity = 42;

    const ground = new Node('GroundClick');
    ground.layer = Layers.Enum.UI_2D;
    this.node.addChild(ground);
    const groundTransform = ground.addComponent(UITransform);
    groundTransform.setContentSize(888, 348);
    ground.setPosition(new Vec3(0, 20, 0));
    ground.on(Node.EventType.TOUCH_END, (...args: unknown[]) => {
      const event = args[0] as { getUILocation: () => { x: number; y: number } };
      const uiPoint = event.getUILocation();
      const local = groundTransform.convertToNodeSpaceAR(new Vec3(uiPoint.x, uiPoint.y, 0));
      const worldX = ((local.x / 888) + 0.5) * 1200;
      const worldY = (0.5 - (local.y / 348)) * 700;
      this.onGroundClick?.(Math.max(0, Math.min(1200, worldX)), Math.max(0, Math.min(700, worldY)));
    }, this);

    this.commandLayer = new Node('CommandLayer');
    this.commandLayer.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.commandLayer);
    this.commandLayer.addComponent(UITransform).setContentSize(888, 348);

    this.allyLayer = new Node('Allies');
    this.allyLayer.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.allyLayer);

    this.enemyLayer = new Node('Enemies');
    this.enemyLayer.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.enemyLayer);

    this.moveHint = new Node('MoveHint');
    this.moveHint.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.moveHint);
    this.moveHint.addComponent(UITransform).setContentSize(20, 20);
    const hintSprite = this.moveHint.addComponent(Sprite);
    hintSprite.color = new Color(251, 191, 36, 220);
    this.moveHint.active = false;

    const title = new Node('Title');
    title.layer = Layers.Enum.UI_2D;
    this.node.addChild(title);
    title.addComponent(UITransform).setContentSize(500, 24);
    title.setPosition(new Vec3(-180, 198, 0));
    const label = title.addComponent(Label);
    label.fontSize = 14;
    label.string = '战场：点己方单位后，可点地面移动、点敌人集火、牧师点友军持续治疗';
    label.color = new Color(191, 219, 254, 255);
  }

  public async render(snapshot: SquadBattleSnapshot, selectedUnitId: string | undefined, moveMarker: { x: number; y: number; until: number } | null): Promise<void> {
    if (!this.allyLayer || !this.enemyLayer || !this.commandLayer) return;
    const serial = ++this.renderSerial;
    const visibleAllies = new Set<string>();
    const visibleEnemies = new Set<string>();

    this.commandLayer.removeAllChildren();

    for (const ally of snapshot.allies) {
      visibleAllies.add(ally.instanceId);
      await this.createAlly(ally, selectedUnitId, snapshot.allies, serial);
      if (serial !== this.renderSerial) return;
      if (ally.command.type === 'focus_enemy' && ally.command.targetEnemyId) {
        const target = snapshot.enemies.find((enemy) => enemy.instanceId === ally.command.targetEnemyId);
        if (target) this.createCommandVisual(ally.position, target.position, '集火', new Color(245, 158, 11, 255));
      }
      if (ally.command.type === 'channel_heal' && ally.command.targetAllyId) {
        const target = snapshot.allies.find((other) => other.instanceId === ally.command.targetAllyId);
        if (target) this.createCommandVisual(ally.position, target.position, '治疗', new Color(96, 165, 250, 255));
      }
      if (ally.command.type === 'move' && ally.command.position) {
        this.createCommandVisual(ally.position, ally.command.position, '移动', new Color(251, 191, 36, 255));
      }
    }

    for (const enemy of snapshot.enemies) {
      visibleEnemies.add(enemy.instanceId);
      await this.createEnemy(enemy, serial);
      if (serial !== this.renderSerial) return;
    }

    this.hideMissingViews(this.allyViews, visibleAllies);
    this.hideMissingViews(this.enemyViews, visibleEnemies);

    if (moveMarker && Date.now() <= moveMarker.until && this.moveHint) {
      const pos = this.worldToUi(moveMarker.x, moveMarker.y);
      this.moveHint.active = true;
      this.moveHint.setPosition(new Vec3(pos.x, pos.y, 0));
    } else if (this.moveHint) {
      this.moveHint.active = false;
    }

    if (this.dimmer) {
      if (snapshot.uiState.battlefieldLighting === 'dim') {
        this.dimmer.opacity = 42;
      } else if (snapshot.uiState.battlefieldLighting === 'brightening') {
        this.dimmer.opacity = Math.round((1 - snapshot.uiState.transitionProgress) * 42);
      } else {
        this.dimmer.opacity = 0;
      }
    }
  }

  private async loadBackground(bgSprite: Sprite): Promise<void> {
    const frame = await this.backgroundResolver.resolve('battlefield_01');
    if (!frame) return;
    bgSprite.spriteFrame = frame;
    bgSprite.color = new Color(255, 255, 255, 255);
  }

  private async createAlly(ally: SquadUnitState, selectedUnitId: string | undefined, allies: SquadUnitState[], serial: number): Promise<void> {
    if (!this.allyLayer) return;
    const { node, view } = this.getOrCreateAllyView(ally.instanceId);
    view.onClick = () => this.onAllyClick?.(ally.instanceId, allies);
    const pos = this.worldToUi(ally.position.x, ally.position.y);
    node.setPosition(new Vec3(pos.x, pos.y, 0));
    const isDivineUnit = Boolean(UNIT_CONFIG[ally.unitId]?.isDivine);
    const clip = this.getUnitAnimationClip(ally);
    const frame = await this.unitResolver.resolve(ally.unitId, ally.star, isDivineUnit);
    const animationFrames = await this.unitResolver.resolveAnimation(ally.unitId, clip, isDivineUnit);
    if (serial !== this.renderSerial || !node.parent) return;
    const maxHp = this.getAllyMaxHp(ally);
    view.render(ally, maxHp, selectedUnitId === ally.instanceId, frame, animationFrames);
  }

  private async createEnemy(enemy: EnemyUnitState, serial: number): Promise<void> {
    if (!this.enemyLayer) return;
    const { node, view } = this.getOrCreateEnemyView(enemy.instanceId);
    view.onClick = () => this.onEnemyClick?.(enemy.instanceId);
    const pos = this.worldToUi(enemy.position.x, enemy.position.y);
    node.setPosition(new Vec3(pos.x, pos.y, 0));
    const clip = this.getEnemyAnimationClip(enemy);
    const frame = await this.enemyResolver.resolve(enemy.enemyType);
    const animationFrames = await this.enemyResolver.resolveAnimation(enemy.enemyType, clip);
    if (serial !== this.renderSerial || !node.parent) return;
    const maxHp = ENEMY_STATS[enemy.enemyType].maxHp;
    view.render(enemy, maxHp, frame, animationFrames);
  }

  private getOrCreateAllyView(instanceId: string): { node: Node; view: UnitView } {
    const cached = this.allyViews.get(instanceId);
    if (cached) {
      cached.node.active = true;
      if (!cached.node.parent && this.allyLayer) this.allyLayer.addChild(cached.node);
      return cached;
    }

    const node = new Node(`Ally-${instanceId}`);
    if (this.allyLayer) this.allyLayer.addChild(node);
    const view = node.addComponent(UnitView);
    view.setup();
    const entry = { node, view };
    this.allyViews.set(instanceId, entry);
    return entry;
  }

  private getOrCreateEnemyView(instanceId: string): { node: Node; view: EnemyView } {
    const cached = this.enemyViews.get(instanceId);
    if (cached) {
      cached.node.active = true;
      if (!cached.node.parent && this.enemyLayer) this.enemyLayer.addChild(cached.node);
      return cached;
    }

    const node = new Node(`Enemy-${instanceId}`);
    if (this.enemyLayer) this.enemyLayer.addChild(node);
    const view = node.addComponent(EnemyView);
    view.setup();
    const entry = { node, view };
    this.enemyViews.set(instanceId, entry);
    return entry;
  }

  private hideMissingViews<T extends { node: Node }>(views: Map<string, T>, visibleIds: Set<string>): void {
    for (const [instanceId, entry] of views) {
      if (!visibleIds.has(instanceId)) {
        entry.node.active = false;
      }
    }
  }

  private getUnitAnimationClip(unit: SquadUnitState): UnitAnimationClip {
    if (!unit.alive) return 'death_fall';
    if (unit.attackCooldownLeft > 0 || unit.command.type === 'channel_heal') return 'attack';
    if (Math.hypot(unit.velocity.x, unit.velocity.y) > 1 || unit.command.type === 'move') return 'move';
    return 'move';
  }

  private getEnemyAnimationClip(enemy: EnemyUnitState): EnemyAnimationClip {
    if (!enemy.alive) return 'death_fall';
    if (enemy.attackCooldownLeft > 0) return 'attack';
    if (Math.hypot(enemy.velocity.x, enemy.velocity.y) > 1) return 'move';
    return 'move';
  }

  private createCommandVisual(from: { x: number; y: number }, to: { x: number; y: number }, text: string, color: Color): void {
    if (!this.commandLayer) return;
    const fromPos = this.worldToUi(from.x, from.y);
    const toPos = this.worldToUi(to.x, to.y);

    const lineNode = new Node(`CmdLine-${text}`);
    this.commandLayer.addChild(lineNode);
    lineNode.addComponent(UITransform).setContentSize(888, 348);
    const graphics = lineNode.addComponent(Graphics);
    graphics.lineWidth = 3;
    graphics.strokeColor = color;
    graphics.moveTo(fromPos.x, fromPos.y);
    graphics.lineTo(toPos.x, toPos.y);
    graphics.stroke();

    const markerNode = new Node(`CmdMarker-${text}`);
    this.commandLayer.addChild(markerNode);
    markerNode.setPosition(new Vec3(toPos.x, toPos.y, 0));
    markerNode.addComponent(UITransform).setContentSize(20, 20);
    const marker = markerNode.addComponent(Graphics);
    marker.fillColor = color;
    marker.circle(0, 0, 6);
    marker.fill();

    const node = new Node(`CmdLabel-${text}`);
    this.commandLayer.addChild(node);
    node.addComponent(UITransform).setContentSize(120, 20);
    node.setPosition(new Vec3((fromPos.x + toPos.x) / 2, (fromPos.y + toPos.y) / 2 + 18, 0));
    const label = node.addComponent(Label);
    label.string = `${text}`;
    label.fontSize = 11;
    label.color = color;
  }

  private worldToUi(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX / 1200 - 0.5) * 888,
      y: (0.5 - worldY / 700) * 348 + 20,
    };
  }

  private getAllyMaxHp(unit: SquadUnitState): number {
    const base = SQUAD_UNIT_STATS[unit.unitId].maxHp;
    return Math.round(base * (1 + (unit.star - 1) * 0.7));
  }
}
