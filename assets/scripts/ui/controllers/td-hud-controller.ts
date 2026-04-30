import { _decorator, Color, Component, Label, Layers, Node, UITransform, Vec3 } from 'cc';
import type { TDSnapshot } from '../../td/types';

const { ccclass } = _decorator;

@ccclass('TDHudController')
export class TDHudController extends Component {
  private label: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(720, 48);
    const labelNode = new Node('TDHudLabel');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, 0, 0));
    labelNode.addComponent(UITransform).setContentSize(700, 40);
    this.label = labelNode.addComponent(Label);
    this.label.fontSize = 16;
    this.label.lineHeight = 20;
    this.label.color = new Color(255, 255, 255, 255);
  }

  public render(snapshot: TDSnapshot): void {
    if (!this.label) this.initialize();
    if (!this.label) return;
    this.label.string = `生命 ${snapshot.life}  金币 ${snapshot.gold}  波次 ${snapshot.waveIndex}/${snapshot.totalWaves || '∞'}  ${snapshot.phase}`;
  }
}
