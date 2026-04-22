import { _decorator, Color, Component, Graphics, Label, Layers, Node, Sprite, UIOpacity, UITransform, Vec3 } from 'cc';
import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../../squad/config/squad-battle-config';
import { EnemyUnitState, SquadBattleSnapshot, SquadUnitState } from '../../squad/types';
import { EnemySpriteResolver, UnitSpriteResolver } from '../resources/sprite-resolvers';
import { EnemyView } from '../views/enemy-view';
import { UnitView } from '../views/unit-view';

const { ccclass } = _decorator;

@ccclass('BattlefieldController')
export class BattlefieldController extends Component {
  private readonly unitResolver = new UnitSpriteResolver();
  private readonly enemyResolver = new EnemySpriteResolver();

  private allyLayer: Node | null = null;
  private enemyLayer: Node | null = null;
  private commandLayer: Node | null = null;
  private moveHint: Node | null = null;
  private dimmer: UIOpacity | null = null;

  public onGroundClick?: (x: number, y: number) => void;
  public onAllyClick?: (allyId: string, allies: SquadUnitState[]) => void;
  public onEnemyClick?: (enemyId: string) => void;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(920, 390);

    const bg = new Node('BattleBg');
    bg.layer = Layers.Enum.UI_2D;
    this.node.addChild(bg);
    bg.addComponent(UITransform).setContentSize(888, 348);
    bg.setPosition(new Vec3(0, 20, 0));
    const bgSprite = bg.addComponent(Sprite);
    bgSprite.color = new Color(15, 23, 42, 255);

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
      const worldY = (0.5 - ((local.y - 20) / 348)) * 700;
      this.onGroundClick?.(Math.max(0, Math.min(1200, worldX)), Math.max(0, Math.min(700, worldY)));
    }, this);

    this.commandLayer = new Node('CommandLayer');
    this.commandLayer.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.commandLayer);
    this.commandLayer.addComponent(UITransform).setContentSize(888, 348);
    this.commandLayer.setPosition(new Vec3(0, 20, 0));

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

    const dimNode = new Node('Dimmer');
    dimNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(dimNode);
    dimNode.addComponent(UITransform).setContentSize(888, 348);
    dimNode.setPosition(new Vec3(0, 20, 0));
    const dimSprite = dimNode.addComponent(Sprite);
    dimSprite.color = new Color(2, 6, 23, 255);
    this.dimmer = dimNode.addComponent(UIOpacity);
    this.dimmer.opacity = 160;

    const title = new Node('Title');
    title.layer = Layers.Enum.UI_2D;
    this.node.addChild(title);
    title.addComponent(UITransform).setContentSize(500, 24);
    title.setPosition(new Vec3(-180, 198, 0));
    const label = title.addComponent(Label);
    label.fontSize = 14;
    label.string = 'Battlefield: select ally -> ground move / enemy focus / ally heal by priest';
    label.color = new Color(191, 219, 254, 255);
  }

  public async render(snapshot: SquadBattleSnapshot, selectedUnitId: string | undefined, moveMarker: { x: number; y: number; until: number } | null): Promise<void> {
    if (!this.allyLayer || !this.enemyLayer || !this.commandLayer) return;

    this.allyLayer.removeAllChildren();
    this.enemyLayer.removeAllChildren();
    this.commandLayer.removeAllChildren();

    for (const ally of snapshot.allies) {
      await this.createAlly(ally, selectedUnitId, snapshot.allies);
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
      await this.createEnemy(enemy);
    }

    if (moveMarker && Date.now() <= moveMarker.until && this.moveHint) {
      const pos = this.worldToUi(moveMarker.x, moveMarker.y);
      this.moveHint.active = true;
      this.moveHint.setPosition(new Vec3(pos.x, pos.y, 0));
    } else if (this.moveHint) {
      this.moveHint.active = false;
    }

    if (this.dimmer) {
      if (snapshot.uiState.battlefieldLighting === 'dim') {
        this.dimmer.opacity = 150;
      } else if (snapshot.uiState.battlefieldLighting === 'brightening') {
        this.dimmer.opacity = Math.round((1 - snapshot.uiState.transitionProgress) * 150);
      } else {
        this.dimmer.opacity = 0;
      }
    }
  }

  private async createAlly(ally: SquadUnitState, selectedUnitId: string | undefined, allies: SquadUnitState[]): Promise<void> {
    if (!this.allyLayer) return;
    const node = new Node(`Ally-${ally.instanceId}`);
    this.allyLayer.addChild(node);
    const view = node.addComponent(UnitView);
    view.setup();
    view.onClick = () => this.onAllyClick?.(ally.instanceId, allies);
    const pos = this.worldToUi(ally.position.x, ally.position.y);
    node.setPosition(new Vec3(pos.x, pos.y, 0));
    const frame = await this.unitResolver.resolve(ally.unitId, ally.star, Boolean(ally.assignedTaskId));
    const maxHp = this.getAllyMaxHp(ally);
    view.render(ally, maxHp, selectedUnitId === ally.instanceId, frame);
  }

  private async createEnemy(enemy: EnemyUnitState): Promise<void> {
    if (!this.enemyLayer) return;
    const node = new Node(`Enemy-${enemy.instanceId}`);
    this.enemyLayer.addChild(node);
    const view = node.addComponent(EnemyView);
    view.setup();
    view.onClick = () => this.onEnemyClick?.(enemy.instanceId);
    const pos = this.worldToUi(enemy.position.x, enemy.position.y);
    node.setPosition(new Vec3(pos.x, pos.y, 0));
    const frame = await this.enemyResolver.resolve(enemy.enemyType);
    const maxHp = ENEMY_STATS[enemy.enemyType].maxHp;
    view.render(enemy, maxHp, frame);
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
