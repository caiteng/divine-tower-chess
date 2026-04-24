import { _decorator, Button, Color, Component, Label, Layers, Node, ProgressBar, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { EnemyUnitState } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('EnemyView')
export class EnemyView extends Component {
  private sprite: Sprite | null = null;
  private label: Label | null = null;
  private hpBar: ProgressBar | null = null;
  private hpFill: Sprite | null = null;

  public onClick?: () => void;

  public setup(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(50, 50);
    this.sprite = this.node.addComponent(Sprite);
    this.sprite.color = new Color(248, 113, 113, 255);

    const labelNode = new Node('Label');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, 30, 0));
    labelNode.addComponent(UITransform).setContentSize(80, 20);
    this.label = labelNode.addComponent(Label);
    this.label.fontSize = 11;
    this.label.color = new Color(254, 226, 226, 255);

    const hpNode = new Node('Hp');
    hpNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(hpNode);
    hpNode.setPosition(new Vec3(0, -30, 0));
    hpNode.addComponent(UITransform).setContentSize(50, 7);
    const hpBg = hpNode.addComponent(Sprite);
    hpBg.color = new Color(69, 10, 10, 255);
    this.hpBar = hpNode.addComponent(ProgressBar);

    const hpFillNode = new Node('Fill');
    hpFillNode.layer = Layers.Enum.UI_2D;
    hpNode.addChild(hpFillNode);
    hpFillNode.setPosition(new Vec3(-25, 0, 0));
    hpFillNode.addComponent(UITransform).setContentSize(50, 7);
    this.hpFill = hpFillNode.addComponent(Sprite);
    this.hpFill.color = new Color(239, 68, 68, 255);
    this.hpBar.barSprite = this.hpFill;
    this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
    this.hpBar.totalLength = 50;

    this.node.addComponent(Button);
    this.node.on(Button.EventType.CLICK, () => this.onClick?.(), this);
  }

  public render(state: EnemyUnitState, maxHp: number, spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[] = []): void {
    if (!this.sprite || !this.label || !this.hpBar) return;
    this.sprite.spriteFrame = this.pickFrame(spriteFrame, animationFrames);
    this.label.string = `${state.enemyType} ${Math.floor(state.currentHp)}`;
    this.hpBar.progress = Math.max(0, Math.min(1, state.currentHp / Math.max(1, maxHp)));
  }

  private pickFrame(spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[]): SpriteFrame | null {
    if (animationFrames.length === 0) return spriteFrame;
    const index = Math.floor(Date.now() / 120) % animationFrames.length;
    return animationFrames[index] ?? spriteFrame;
  }
}
