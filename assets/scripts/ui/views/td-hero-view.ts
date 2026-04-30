import { _decorator, Color, Component, Graphics, Label, Layers, UITransform } from 'cc';
import { getTDHeroConfig } from '../../td/config/td-hero-config';
import type { TDHeroInstanceState } from '../../td/types';

const { ccclass } = _decorator;

@ccclass('TDHeroView')
export class TDHeroView extends Component {
  public render(hero: TDHeroInstanceState): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(64, 64);
    const graphics = this.node.getComponent(Graphics) ?? this.node.addComponent(Graphics);
    graphics.fillColor = new Color(37, 99, 235, 220);
    graphics.circle(0, 0, 28);
    graphics.fill();
    const label = this.node.getComponent(Label) ?? this.node.addComponent(Label);
    label.string = `${getTDHeroConfig(hero.heroId).name[0]}★${hero.star}`;
    label.fontSize = 12;
    label.lineHeight = 14;
    label.color = new Color(255, 255, 255, 255);
  }
}
