import { _decorator, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import type { SquadBattleSnapshot } from '../../squad/types';
import { UiIconResolver } from '../resources/sprite-resolvers';

const { ccclass } = _decorator;

@ccclass('BattleHudController')
export class BattleHudController extends Component {
  private readonly iconResolver = new UiIconResolver();

  private topLabel: Label | null = null;
  private goldLabel: Label | null = null;
  private statusLabel: Label | null = null;
  private taskLabel: Label | null = null;
  private noticeLabel: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(920, 150);

    this.topLabel = this.createLabel('Top', new Vec3(-420, 52, 0), 15, new Color(226, 232, 240, 255));
    this.goldLabel = this.createGoldReadout();
    this.statusLabel = this.createLabel('Status', new Vec3(-420, 18, 0), 13, new Color(251, 191, 36, 255));
    this.taskLabel = this.createLabel('Task', new Vec3(-420, -16, 0), 12, new Color(191, 219, 254, 255));
    this.noticeLabel = this.createLabel('Notice', new Vec3(-420, -50, 0), 12, new Color(134, 239, 172, 255));
  }

  public render(snapshot: SquadBattleSnapshot, selected: string | undefined, notice: string): void {
    if (!this.topLabel || !this.goldLabel || !this.statusLabel || !this.taskLabel || !this.noticeLabel) return;
    this.topLabel.string = `阶段 ${snapshot.phase} · 波次 ${snapshot.currentWave}/${snapshot.totalWaves} · 上阵 ${snapshot.deployed.length}/${snapshot.slotConfig.deployed} · 备战 ${snapshot.bench.length}/${snapshot.slotConfig.bench}`;
    this.goldLabel.string = `${snapshot.gold}`;
    this.statusLabel.string = `当前选择：${selected ?? '未选择'} · ${snapshot.phase === 'prep' ? '准备阶段可调整阵容' : '战斗阶段可持续下达命令'}`;
    this.taskLabel.string = snapshot.divineTasks.length > 0
      ? `神品进度：${snapshot.divineTasks.map((task) => `${task.unitInstanceId.slice(-4)}:${task.divineTaskId ?? '-'}(${Math.floor(task.divineProgress ?? 0)})`).join(' | ')}`
      : '神品进度：none';
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

  private createGoldReadout(): Label {
    const iconNode = new Node('GoldIcon');
    iconNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(iconNode);
    iconNode.setPosition(new Vec3(150, 52, 0));
    iconNode.addComponent(UITransform).setContentSize(24, 24);
    const sprite = iconNode.addComponent(Sprite);
    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    sprite.color = new Color(245, 158, 11, 255);
    void this.iconResolver.resolve('gold').then((frame) => {
      if (!frame || !sprite.node.parent) return;
      sprite.spriteFrame = frame;
      sprite.color = new Color(255, 255, 255, 255);
    });

    const label = this.createLabel('GoldValue', new Vec3(172, 52, 0), 15, new Color(254, 240, 138, 255));
    label.node.getComponent(UITransform)?.setContentSize(90, 28);
    return label;
  }
}
