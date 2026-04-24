import { _decorator, Button, Color, Component, Label, Layers, Node, ProgressBar, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { SquadUnitState } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('UnitView')
export class UnitView extends Component {
  private sprite: Sprite | null = null;
  private label: Label | null = null;
  private commandLabel: Label | null = null;
  private hpBar: ProgressBar | null = null;
  private hpFill: Sprite | null = null;
  private selectedRing: Node | null = null;

  public onClick?: () => void;

  public setup(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(56, 56);

    this.sprite = this.node.addComponent(Sprite);
    this.sprite.color = new Color(52, 211, 153, 255);

    const labelNode = new Node('Label');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, 34, 0));
    labelNode.addComponent(UITransform).setContentSize(110, 22);
    this.label = labelNode.addComponent(Label);
    this.label.fontSize = 12;
    this.label.lineHeight = 16;
    this.label.color = new Color(241, 245, 249, 255);

    const commandNode = new Node('Command');
    commandNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(commandNode);
    commandNode.setPosition(new Vec3(0, 22, 0));
    commandNode.addComponent(UITransform).setContentSize(110, 18);
    this.commandLabel = commandNode.addComponent(Label);
    this.commandLabel.fontSize = 10;
    this.commandLabel.lineHeight = 12;
    this.commandLabel.color = new Color(253, 224, 71, 255);

    const hpNode = new Node('Hp');
    hpNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(hpNode);
    hpNode.setPosition(new Vec3(0, -34, 0));
    hpNode.addComponent(UITransform).setContentSize(56, 8);
    const hpBg = hpNode.addComponent(Sprite);
    hpBg.color = new Color(30, 41, 59, 255);
    this.hpBar = hpNode.addComponent(ProgressBar);

    const hpFillNode = new Node('Fill');
    hpFillNode.layer = Layers.Enum.UI_2D;
    hpNode.addChild(hpFillNode);
    hpFillNode.setPosition(new Vec3(-28, 0, 0));
    hpFillNode.addComponent(UITransform).setContentSize(56, 8);
    this.hpFill = hpFillNode.addComponent(Sprite);
    this.hpFill.color = new Color(74, 222, 128, 255);
    this.hpBar.barSprite = this.hpFill;
    this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
    this.hpBar.totalLength = 56;

    this.selectedRing = new Node('Selected');
    this.selectedRing.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.selectedRing);
    this.selectedRing.addComponent(UITransform).setContentSize(64, 64);
    const ringSprite = this.selectedRing.addComponent(Sprite);
    ringSprite.color = new Color(251, 191, 36, 120);
    this.selectedRing.active = false;

    this.node.addComponent(Button);
    this.node.on(Button.EventType.CLICK, () => this.onClick?.(), this);
  }

  public render(state: SquadUnitState, maxHp: number, selected: boolean, spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[] = []): void {
    if (!this.sprite || !this.label || !this.hpBar || !this.commandLabel) return;
    this.node.setPosition(new Vec3(0, 0, 0));
    this.sprite.spriteFrame = this.pickFrame(spriteFrame, animationFrames);
    this.sprite.color = spriteFrame
      ? new Color(255, 255, 255, 255)
      : selected
        ? new Color(249, 115, 22, 255)
        : state.role === 'priest'
          ? new Color(96, 165, 250, 255)
          : new Color(52, 211, 153, 255);
    this.label.string = `${state.isCaptain ? '♛ ' : ''}${state.unitId}★${state.star}${state.assignedTaskId ? ' ✦' : ''}`;
    this.commandLabel.string = this.getCommandText(state);
    this.hpBar.progress = Math.max(0, Math.min(1, state.currentHp / Math.max(1, maxHp)));
    if (this.selectedRing) this.selectedRing.active = selected;
  }

  private getCommandText(state: SquadUnitState): string {
    if (state.command.type === 'move') return 'MOVE';
    if (state.command.type === 'focus_enemy') return 'FOCUS';
    if (state.command.type === 'channel_heal') return 'HEAL';
    if (state.isCaptain) return 'CAPTAIN';
    return state.assignedTaskId ? 'DIVINE' : '';
  }

  private pickFrame(spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[]): SpriteFrame | null {
    if (animationFrames.length === 0) return spriteFrame;
    const index = Math.floor(Date.now() / 120) % animationFrames.length;
    return animationFrames[index] ?? spriteFrame;
  }
}
