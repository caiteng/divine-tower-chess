import { _decorator, Button, Color, Component, Label, Layers, Node, UITransform, Vec3 } from 'cc';
import type { TDSnapshot, TDVec2 } from '../../td/types';

const { ccclass } = _decorator;

@ccclass('TDCommandBarController')
export class TDCommandBarController extends Component {
  public onCastCaptainSkill?: (target?: TDVec2) => void;

  public render(snapshot: TDSnapshot): void {
    this.node.removeAllChildren();
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(360, 72);
    const node = new Node('CaptainSkillButton');
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(0, 0, 0));
    node.addComponent(UITransform).setContentSize(220, 42);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, () => this.onCastCaptainSkill?.(), this);
    node.on(Node.EventType.TOUCH_END, () => this.onCastCaptainSkill?.(), this);
    const label = node.addComponent(Label);
    const cooldowns = Object.values(snapshot.captain.skillCooldowns);
    const cooldown = cooldowns.length ? Math.max(...cooldowns) : 0;
    label.string = cooldown > 0 ? `队长技能 ${cooldown.toFixed(1)}s` : '释放队长技能';
    label.fontSize = 14;
    label.lineHeight = 18;
    label.color = new Color(255, 255, 255, 255);
  }
}
