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

  public render(snapshot: SquadBattleSnapshot, selectedLabel: string, selectedUnitId?: string): void {
    this.node.removeAllChildren();
    this.infoLabel = this.makeLabel('Info', -430, 96, 840, 14, new Color(251, 191, 36, 255));
    this.infoLabel.string = `Preparation · selected: ${selectedLabel} · gold: ${snapshot.gold}`;

    this.makeLabel('ShopTitle', -430, 62, 140, 13, new Color(226, 232, 240, 255)).string = 'Shop (3)';
    snapshot.shop.forEach((unitId, index) => {
      this.makeButton(`Buy-${index}`, `${unitId}\nBuy`, -300 + index * 156, 36, 132, 44, new Color(30, 41, 59, 255), () => this.onBuy?.(index));
    });

    this.makeLabel('DeployTitle', -430, -8, 140, 13, new Color(226, 232, 240, 255)).string = 'Deployed (5)';
    for (let i = 0; i < snapshot.slotConfig.deployed; i += 1) {
      const unit = snapshot.deployed[i];
      if (unit) {
        this.makeButton(
          `Recall-${unit.instanceId}`,
          `${unit.isCaptain ? '♛ ' : ''}${unit.unitId}★${unit.star}${unit.assignedTaskId ? ' ✦' : ''}\nRecall`,
          -320 + i * 130,
          -34,
          122,
          44,
          unit.instanceId === selectedUnitId ? new Color(180, 83, 9, 255) : new Color(30, 41, 59, 255),
          () => this.onRecall?.(unit.instanceId),
        );
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
        this.makeButton(
          `Deploy-${unit.instanceId}`,
          `${unit.isCaptain ? '♛ ' : ''}${unit.unitId}★${unit.star}${unit.assignedTaskId ? ' ✦' : ''}\nDeploy`,
          x,
          y,
          182,
          42,
          unit.instanceId === selectedUnitId ? new Color(180, 83, 9, 255) : new Color(30, 41, 59, 255),
          () => this.onDeploy?.(unit.instanceId),
        );
      } else {
        this.makeButton(`BenchEmpty-${i}`, 'Empty', x, y, 182, 42, new Color(51, 65, 85, 160));
      }
    }

    this.makeButton('Sell', 'Sell Selected', 330, 48, 160, 40, new Color(127, 29, 29, 255), () => this.onSell?.());
    this.makeButton('Refresh', 'Refresh Shop', 330, -4, 160, 40, new Color(37, 99, 235, 255), () => this.onRefresh?.());
    this.makeButton('Start', 'Start Next Wave', 330, -56, 160, 40, new Color(21, 128, 61, 255), () => this.onStartWave?.());
    this.makeLabel('Hint', -430, -198, 860, 12, new Color(191, 219, 254, 255)).string = this.buildHint(snapshot, selectedUnitId);
  }

  private buildHint(snapshot: SquadBattleSnapshot, selectedUnitId?: string): string {
    if (!selectedUnitId) {
      return 'Hint: 先买人再上阵。橙色高亮表示当前选中实例，带 ✦ 的单位持有神品任务。';
    }

    const rosterUnit = [...snapshot.deployed, ...snapshot.bench].find((unit) => unit.instanceId === selectedUnitId);
    if (!rosterUnit) {
      return 'Hint: 当前选中单位已离开备战链路。';
    }

    const inDeployed = snapshot.deployed.some((unit) => unit.instanceId === selectedUnitId);
    const task = snapshot.divineTasks.find((entry) => entry.unitInstanceId === selectedUnitId);
    if (task) {
      return `Hint: ${rosterUnit.unitId}★${rosterUnit.star} 持有 ${task.divineTaskId}，实例进度 ${Math.floor(task.divineProgress ?? 0)}，普通升星不会消耗它。`;
    }

    if (rosterUnit.isCaptain) {
      return inDeployed
        ? `Hint: ${rosterUnit.unitId}★${rosterUnit.star} 是当前队长实例，已在上阵区。`
        : `Hint: ${rosterUnit.unitId}★${rosterUnit.star} 是你选择的起始队长实例，当前位于备战区。`;
    }

    return inDeployed
      ? `Hint: ${rosterUnit.unitId}★${rosterUnit.star} 当前在上阵区，可撤回或直接开波。`
      : `Hint: ${rosterUnit.unitId}★${rosterUnit.star} 当前在备战区，可上阵；3 个同名同星实例会自动合成。`;
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
