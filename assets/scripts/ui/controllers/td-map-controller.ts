import { _decorator, Color, Component, Graphics, Label, Layers, Node, UITransform, Vec3 } from 'cc';
import { getTDHeroConfig } from '../../td/config/td-hero-config';
import { getTDMapConfig } from '../../td/config/td-map-config';
import type { TDSnapshot, TDVec2 } from '../../td/types';

const { ccclass } = _decorator;

const VIEW_WIDTH = 620;
const VIEW_HEIGHT = 500;
const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;

@ccclass('TDMapController')
export class TDMapController extends Component {
  public onSlotClick?: (slotId: string) => void;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(VIEW_WIDTH, VIEW_HEIGHT);
  }

  public render(snapshot: TDSnapshot, selectedHeroId?: string): void {
    this.node.removeAllChildren();
    const map = getTDMapConfig(snapshot.stageId);

    const bgNode = new Node('TDMapBackground');
    bgNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(bgNode);
    bgNode.addComponent(UITransform).setContentSize(VIEW_WIDTH, VIEW_HEIGHT);
    const bg = bgNode.addComponent(Graphics);
    bg.fillColor = new Color(15, 23, 42, 255);
    bg.rect(-VIEW_WIDTH / 2, -VIEW_HEIGHT / 2, VIEW_WIDTH, VIEW_HEIGHT);
    bg.fill();

    this.drawPaths(map.groundPaths, new Color(110, 84, 54, 235), 14);
    this.drawPaths(map.airPaths, new Color(96, 165, 250, 135), 8);

    for (const slot of snapshot.towerSlots) {
      const p = this.toLocal(slot.position);
      const slotNode = new Node(`TDSlot-${slot.slotId}`);
      slotNode.layer = Layers.Enum.UI_2D;
      this.node.addChild(slotNode);
      slotNode.setPosition(new Vec3(p.x, p.y, 0));
      slotNode.addComponent(UITransform).setContentSize(58, 58);

      const g = slotNode.addComponent(Graphics);
      g.fillColor = slot.occupiedBy ? new Color(34, 197, 94, 190) : new Color(59, 130, 246, 155);
      g.circle(0, 0, slot.occupiedBy ? 24 : 21);
      g.fill();

      if (slot.occupiedBy === selectedHeroId) {
        g.strokeColor = new Color(253, 224, 71, 255);
        g.lineWidth = 3;
        g.circle(0, 0, 29);
        g.stroke();
      }

      slotNode.on(Node.EventType.TOUCH_END, () => this.onSlotClick?.(slot.slotId), this);

      const hero = snapshot.deployed.find((entry) => entry.instanceId === slot.occupiedBy);
      if (hero) {
        this.makeLabel(`TDHeroLabel-${hero.instanceId}`, `${getTDHeroConfig(hero.heroId).name[0]}★${hero.star}`, p.x, p.y - 4, 60, 12, new Color(254, 249, 195, 255));
      }
    }

    for (const enemy of snapshot.enemies) {
      if (!enemy.alive || enemy.leaked) continue;
      const p = this.toLocal(enemy.position);
      const enemyNode = new Node(`TDEnemy-${enemy.instanceId}`);
      enemyNode.layer = Layers.Enum.UI_2D;
      this.node.addChild(enemyNode);
      enemyNode.setPosition(new Vec3(p.x, p.y, 0));
      enemyNode.addComponent(UITransform).setContentSize(34, 34);
      const g = enemyNode.addComponent(Graphics);
      g.fillColor = enemy.tags.includes('boss') ? new Color(239, 68, 68, 240) : new Color(248, 113, 113, 220);
      g.circle(0, 0, enemy.tags.includes('boss') ? 18 : 10);
      g.fill();
    }

    this.makeLabel('TDMapTitle', map.name, -VIEW_WIDTH / 2 + 12, VIEW_HEIGHT / 2 - 24, 180, 14, new Color(248, 250, 252, 255));
    this.makeLabel('TDMapHint', '蓝色塔位可点击放置英雄；红点为敌人。', -VIEW_WIDTH / 2 + 12, -VIEW_HEIGHT / 2 + 20, 360, 12, new Color(191, 219, 254, 255));
  }

  private drawPaths(paths: Array<{ points: TDVec2[] }>, color: Color, lineWidth: number): void {
    const pathNode = new Node('TDPathOverlay');
    pathNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(pathNode);
    const graphics = pathNode.addComponent(Graphics);
    graphics.strokeColor = color;
    graphics.lineWidth = lineWidth;

    for (const path of paths) {
      if (!path.points.length) continue;
      const first = this.toLocal(path.points[0]);
      graphics.moveTo(first.x, first.y);
      for (const point of path.points.slice(1)) {
        const p = this.toLocal(point);
        graphics.lineTo(p.x, p.y);
      }
      graphics.stroke();
    }
  }

  private toLocal(position: TDVec2): TDVec2 {
    return {
      x: (position.x / MAP_WIDTH) * VIEW_WIDTH - VIEW_WIDTH / 2,
      y: (position.y / MAP_HEIGHT) * VIEW_HEIGHT - VIEW_HEIGHT / 2,
    };
  }

  private makeLabel(name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, fontSize + 8);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
  }
}
