import { _decorator, Button, Color, Component, Label, Layers, Node, ProgressBar, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import type { EnemyUnitState } from '../../squad/types';

const { ccclass } = _decorator;

const ENEMY_NAMES: Record<string, string> = {
  grunt: '小兵',
  brute: '蛮兵',
  boss: '首领',
};
const ENEMY_FRAME_MS = 170;
const ENEMY_SIZE: Record<EnemyUnitState['enemyType'], number> = {
  grunt: 88,
  brute: 100,
  boss: 128,
};

@ccclass('EnemyView')
export class EnemyView extends Component {
  private spriteNode: Node | null = null;
  private sprite: Sprite | null = null;
  private label: Label | null = null;
  private hpBar: ProgressBar | null = null;
  private hpFill: Sprite | null = null;

  public onClick?: () => void;

  public setup(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(88, 88);

    this.spriteNode = new Node('Sprite');
    this.spriteNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.spriteNode);
    this.spriteNode.addComponent(UITransform).setContentSize(88, 88);
    this.sprite = this.spriteNode.addComponent(Sprite);
    this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    this.sprite.color = new Color(248, 113, 113, 255);

    const labelNode = new Node('Label');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, 54, 0));
    labelNode.addComponent(UITransform).setContentSize(100, 20);
    this.label = labelNode.addComponent(Label);
    this.label.fontSize = 11;
    this.label.color = new Color(254, 226, 226, 255);

    const hpNode = new Node('Hp');
    hpNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(hpNode);
    hpNode.setPosition(new Vec3(0, -54, 0));
    hpNode.addComponent(UITransform).setContentSize(76, 7);
    const hpBg = hpNode.addComponent(Sprite);
    hpBg.color = new Color(69, 10, 10, 255);
    this.hpBar = hpNode.addComponent(ProgressBar);

    const hpFillNode = new Node('Fill');
    hpFillNode.layer = Layers.Enum.UI_2D;
    hpNode.addChild(hpFillNode);
    hpFillNode.setPosition(new Vec3(-38, 0, 0));
    hpFillNode.addComponent(UITransform).setContentSize(76, 7);
    this.hpFill = hpFillNode.addComponent(Sprite);
    this.hpFill.color = new Color(239, 68, 68, 255);
    this.hpBar.barSprite = this.hpFill;
    this.hpBar.mode = ProgressBar.Mode.HORIZONTAL;
    this.hpBar.totalLength = 76;

    this.node.addComponent(Button);
    this.node.on(Button.EventType.CLICK, () => this.onClick?.(), this);
  }

  public render(state: EnemyUnitState, maxHp: number, spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[] = []): void {
    if (!this.sprite || !this.label || !this.hpBar) return;
    const moving = state.alive && Math.hypot(state.velocity.x, state.velocity.y) > 1;
    this.resizeForEnemy(state.enemyType);
    this.sprite.spriteFrame = this.pickFrame(spriteFrame, animationFrames);
    this.applyPose(state, moving);
    this.sprite.color = spriteFrame
      ? new Color(255, 255, 255, 255)
      : new Color(248, 113, 113, 255);
    this.label.string = `${ENEMY_NAMES[state.enemyType] ?? state.enemyType} ${Math.floor(state.currentHp)}`;
    this.hpBar.progress = Math.max(0, Math.min(1, state.currentHp / Math.max(1, maxHp)));
  }

  private pickFrame(spriteFrame: SpriteFrame | null, animationFrames: SpriteFrame[]): SpriteFrame | null {
    if (animationFrames.length === 0) return spriteFrame;
    const index = Math.floor(Date.now() / ENEMY_FRAME_MS) % animationFrames.length;
    return animationFrames[index] ?? spriteFrame;
  }

  private resizeForEnemy(enemyType: EnemyUnitState['enemyType']): void {
    const size = ENEMY_SIZE[enemyType];
    this.node.getComponent(UITransform)?.setContentSize(size, size);
    this.spriteNode?.getComponent(UITransform)?.setContentSize(size, size);
  }

  private applyPose(state: EnemyUnitState, moving: boolean): void {
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
      const cycle = (Date.now() % 760) / 760;
      const step = Math.sin(cycle * Math.PI * 2);
      const stride = Math.sin(cycle * Math.PI * 4);
      const lift = Math.abs(stride);
      this.spriteNode.setPosition(new Vec3(step * 2, lift * 3.5, 0));
      this.spriteNode.setScale(new Vec3(1 + lift * 0.02, 1 - lift * 0.016, 1));
      this.spriteNode.angle = step * 3;
      return;
    }

    if (state.attackCooldownLeft > 0) {
      const pulse = Math.sin((Date.now() % 360) / 360 * Math.PI);
      this.spriteNode.setPosition(new Vec3(-pulse * 3, 0, 0));
      this.spriteNode.setScale(new Vec3(1 + pulse * 0.025, 1 + pulse * 0.015, 1));
      this.spriteNode.angle = pulse * 2;
    }
  }
}
