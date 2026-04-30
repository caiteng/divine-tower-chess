import { _decorator, Color, Component, Graphics, Label, Layers, UITransform } from 'cc';
import { getTDEnemyConfig } from '../../td/config/td-enemy-config';
import type { TDEnemyInstanceState } from '../../td/types';

const { ccclass } = _decorator;

@ccclass('TDEnemyView')
export class TDEnemyView extends Component {
  public render(enemy: TDEnemyInstanceState): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(52, 52);
    const graphics = this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    graphics.fillColor = enemy.tags.includes('boss') ? new Color(185, 28, 28, 230) : new Color(126, 34, 206, 220);
    graphics.circle(0, 0, enemy.tags.includes('boss') ? 24 : 18);
    graphics.fill();
    const label = this.node.getComponent(Label) ?? this.node.addComponent(Label);
    label.string = getTDEnemyConfig(enemy.enemyId).name[0];
    label.fontSize = 12;
    label.lineHeight = 14;
    label.color = new Color(255, 255, 255, 255);
  }
}
