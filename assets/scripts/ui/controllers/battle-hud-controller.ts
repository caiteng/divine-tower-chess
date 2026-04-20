import { _decorator, Color, Component, Label, Layers, Node, UITransform, Vec3 } from 'cc';
import { SquadBattleSnapshot } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('BattleHudController')
export class BattleHudController extends Component {
  private topLabel: Label | null = null;
  private statusLabel: Label | null = null;
  private taskLabel: Label | null = null;
  private noticeLabel: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(920, 150);

    this.topLabel = this.createLabel('Top', new Vec3(-420, 52, 0), 15, new Color(226, 232, 240, 255));
    this.statusLabel = this.createLabel('Status', new Vec3(-420, 18, 0), 13, new Color(251, 191, 36, 255));
    this.taskLabel = this.createLabel('Task', new Vec3(-420, -16, 0), 12, new Color(191, 219, 254, 255));
    this.noticeLabel = this.createLabel('Notice', new Vec3(-420, -50, 0), 12, new Color(134, 239, 172, 255));
  }

  public render(snapshot: SquadBattleSnapshot, selected: string | undefined, notice: string): void {
    if (!this.topLabel || !this.statusLabel || !this.taskLabel || !this.noticeLabel) return;
    this.topLabel.string = `Phase ${snapshot.phase} · Wave ${snapshot.currentWave}/${snapshot.totalWaves} · Gold ${snapshot.gold} · Deployed ${snapshot.deployed.length}/${snapshot.slotConfig.deployed} · Bench ${snapshot.bench.length}/${snapshot.slotConfig.bench}`;
    this.statusLabel.string = `Selected: ${selected ?? 'none'}`;
    this.taskLabel.string = snapshot.divineTasks.length > 0
      ? `Divine: ${snapshot.divineTasks.map((task) => `${task.unitInstanceId.slice(-4)}:${task.divineTaskId ?? '-'}(${Math.floor(task.divineProgress ?? 0)})`).join(' | ')}`
      : 'Divine: none';
    this.noticeLabel.string = notice;
  }

  private createLabel(name: string, position: Vec3, fontSize: number, color: Color): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(position);
    node.addComponent(UITransform).setContentSize(860, 28);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.color = color;
    return label;
  }
}
