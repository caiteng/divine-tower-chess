import { _decorator, Button, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import { SquadBattleSnapshot } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('PrepPanelController')
export class PrepPanelController extends Component {
  public onBuy?: (index: number) => void;
  public onDeploy?: (id: string) => void;
  public onRecall?: (id: string) => void;
  public onSell?: () => void;
  public onRefresh?: () => void;
  public onStartWave?: () => void;

  private infoLabel: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(920, 240);

    const bg = this.node.addComponent(Sprite);
    bg.color = new Color(15, 23, 42, 235);

    this.infoLabel = this.makeLabel('Info', -430, 96, 840, 14, new Color(251, 191, 36, 255));
  }

  public render(snapshot: SquadBattleSnapshot, selectedLabel: string): void {
    this.node.removeAllChildren();
    this.infoLabel = this.makeLabel('Info', -430, 96, 840, 14, new Color(251, 191, 36, 255));
    this.infoLabel.string = `Preparation · selected: ${selectedLabel}`;

    this.makeLabel('ShopTitle', -430, 62, 140, 13, new Color(226, 232, 240, 255)).string = 'Shop (3)';
    snapshot.shop.forEach((unitId, index) => {
      this.makeButton(`Buy-${index}`, `${unitId}\nBuy`, -300 + index * 156, 36, 132, 44, new Color(30, 41, 59, 255), () => this.onBuy?.(index));
    });

    this.makeLabel('DeployTitle', -430, -8, 140, 13, new Color(226, 232, 240, 255)).string = 'Deployed (5)';
    for (let i = 0; i < snapshot.slotConfig.deployed; i += 1) {
      const unit = snapshot.deployed[i];
      if (unit) {
        this.makeButton(`Recall-${unit.instanceId}`, `${unit.unitId}★${unit.star}\nRecall`, -320 + i * 130, -34, 122, 44, new Color(30, 41, 59, 255), () => this.onRecall?.(unit.instanceId));
      } else {
        this.makeButton(`DeployEmpty-${i}`, 'Empty', -320 + i * 130, -34, 122, 44, new Color(51, 65, 85, 160));
      }
    }

    this.makeLabel('BenchTitle', -430, -74, 140, 13, new Color(226, 232, 240, 255)).string = 'Bench (8)';
    for (let i = 0; i < snapshot.slotConfig.bench; i += 1) {
      const unit = snapshot.bench[i];
      const x = -330 + (i % 4) * 195;
      const y = i < 4 ? -102 : -150;
      if (unit) {
        this.makeButton(`Deploy-${unit.instanceId}`, `${unit.unitId}★${unit.star}\nDeploy`, x, y, 182, 42, new Color(30, 41, 59, 255), () => this.onDeploy?.(unit.instanceId));
      } else {
        this.makeButton(`BenchEmpty-${i}`, 'Empty', x, y, 182, 42, new Color(51, 65, 85, 160));
      }
    }

    this.makeButton('Sell', 'Sell Selected', 330, 48, 160, 40, new Color(127, 29, 29, 255), () => this.onSell?.());
    this.makeButton('Refresh', 'Refresh Shop', 330, -4, 160, 40, new Color(37, 99, 235, 255), () => this.onRefresh?.());
    this.makeButton('Start', 'Start Next Wave', 330, -56, 160, 40, new Color(21, 128, 61, 255), () => this.onStartWave?.());
  }

  private makeLabel(name: string, x: number, y: number, width: number, fontSize: number, color: Color): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, 24);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
    return label;
  }

  private makeButton(name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick?: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;
    if (onClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, onClick, this);
    }

    const labelNode = new Node(`${name}-label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(width - 8, height - 8);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 12;
    label.lineHeight = 14;
    label.color = new Color(248, 250, 252, 255);
  }
}
