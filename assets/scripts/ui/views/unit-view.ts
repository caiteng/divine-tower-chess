import { _decorator, Button, Color, Component, Graphics, Label, Layers, Node, ProgressBar, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import type { SquadUnitState } from '../../squad/types';

const { ccclass } = _decorator;
const UNIT_SIZE = 96;
const UNIT_HP_WIDTH = 82;
const UNIT_FRAME_MS = 170;

@ccclass('UnitView')
export class UnitView extends Component {
  private spriteNode: Node | null = null;
  private sprite: Sprite | null = null;
  private label: Label | null = null;
  private commandLabel: Label | null = null;
  private hpBar: ProgressBar | null = null;
  private hpFill: Sprite | null = null;
  private selectedRing: Node | null = null;

  public onClick?: () => void;

  public setup(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(UNIT_SIZE, UNIT_SIZE);

    this.spriteNode = new Node('Sprite');
    this.spriteNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.spriteNode);
    this.spriteNode.addComponent(UITransform).setContentSize(UNIT_SIZE, UNIT_SIZE);
    this.sprite = this.spriteNode.addComponent(Sprite);
    this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    this.sprite.color = new Color(52, 211, 153, 255);

    const labelNode = new Node('Label');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, 56, 0));
    labelNode.addComponent(UITransform).setContentSize(140, 22);
    this.label = labelNode.addComponent(Label);
    this.label.fontSize = 12;
    this.label.lineHeight = 16;
    this.label.color = new Color(241, 245, 249, 255);

    const commandNode = new Node('Command');
    commandNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(commandNode);
    commandNode.setPosition(new Vec3(0, 42, 0));
    commandNode.addComponent(UITransform).setContentSize(120, 18);
    this.commandLabel = commandNode.addComponent(Label);
    this.commandLabel.fontSize = 10;
    this.commandLabel.lineHeight = 12;
    this.commandLabel.color = new Color(253, 224, 71, 255);

    const hpNode = new Node('Hp');
    hpNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(hpNode);
    hpNode.setPosition(new Vec3(0, -56, 0));
    hpNode.addComponent(UITransform).setContentSize(UNIT_HP_WIDTH, 8);
    const hpBg = hpNode.addComponent(Sprite);
    hpBg.color = new Color(30, 41, 59, 255);
    this.hpBar = hpNode.addComponent(ProgressBar);

    const hpFillNode = new Node('Fill');
    hpFillNode.layer = Layers.Enum.UI_2D;
    hpNode.addChild(hpFillNode);
    hpFillNode.setPosition(new Vec3(-UNIT_HP_WIDTH / 2, 0, 0));
    hpFillNode.addComponent(UITransform).setContentSize(UNIT_HP_WIDTH, 8);
    this.hpFill = hpFillNode.addComponent(Sprite);
    this.hpFill.color = new Color(74, 222, 128, 255);
    this.hpBar.barSprite = this.hpFill;
    this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
    this.hpBar.totalLength = UNIT_HP_WIDTH;

    this.selectedRing = new Node('Selected');
    this.selectedRing.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.selectedRing);
    this.selectedRing.setPosition(new Vec3(0, -34, 0));
    this.selectedRing.addComponent(UITransform).setContentSize(UNIT_SIZE + 12, UNIT_SIZE + 12);
    const ring = this.selectedRing.addComponent(Graphics);
    ring.fillColor = new Color(251, 191, 36, 110);
    ring.strokeColor = new Color(254, 240, 138, 235);
    ring.lineWidth = 4;
    ring.circle(0, 0, 34);
    ring.fill();
    ring.stroke();
    this.selectedRing.active = false;

    this.node.addComponent(Button);
    this.node.on(Button.EventType.CLICK, () => this.onClick?.(), this);
  }

  public render(state: SquadUnitState, maxHp: number, selected: boolean, spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[] = []): void {
    if (!this.sprite || !this.label || !this.hpBar || !this.commandLabel) return;
    const moving = state.alive && (Math.hypot(state.velocity.x, state.velocity.y) > 1 || state.command.type === 'move');
    this.sprite.spriteFrame = moving ? spriteFrame : this.pickFrame(spriteFrame, animationFrames);
    this.applyPose(state, moving);
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
    if (state.command.type === 'move') return '移动';
    if (state.command.type === 'focus_enemy') return '集火';
    if (state.command.type === 'channel_heal') return '治疗';
    if (state.isCaptain) return '队长';
    return state.assignedTaskId ? '神品' : '';
  }

  private pickFrame(spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[]): SpriteFrame | null {
    if (animationFrames.length === 0) return spriteFrame;
    const index = Math.floor(Date.now() / UNIT_FRAME_MS) % animationFrames.length;
    return animationFrames[index] ?? spriteFrame;
  }

  private applyPose(state: SquadUnitState, moving: boolean): void {
    if (!this.spriteNode) return;

    this.spriteNode.setPosition(new Vec3(0, 0, 0));
    this.spriteNode.setScale(new Vec3(1, 1, 1));
    this.spriteNode.angle = 0;

    if (!state.alive) {
      this.spriteNode.setPosition(new Vec3(6, -12, 0));
      this.spriteNode.setScale(new Vec3(0.95, 0.95, 1));
      this.spriteNode.angle = 72;
      return;
    }

    if (moving) {
      const cycle = (Date.now() % 720) / 720;
      const step = Math.sin(cycle * Math.PI * 2);
      const stride = Math.sin(cycle * Math.PI * 4);
      const lift = Math.abs(stride);
      this.spriteNode.setPosition(new Vec3(step * 2.2, lift * 4, 0));
      this.spriteNode.setScale(new Vec3(1 + lift * 0.025, 1 - lift * 0.018, 1));
      this.spriteNode.angle = step * 3.2;
      return;
    }

    if (state.attackCooldownLeft > 0 || state.command.type === 'focus_enemy' || state.command.type === 'channel_heal') {
      const pulse = Math.sin((Date.now() % 360) / 360 * Math.PI);
      this.spriteNode.setPosition(new Vec3(pulse * 3, 0, 0));
      this.spriteNode.setScale(new Vec3(1 + pulse * 0.025, 1 + pulse * 0.015, 1));
      this.spriteNode.angle = -pulse * 2;
    }
  }
}
