import { _decorator, Color, Component, Label, Layers, Node, UITransform, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('CommandOverlayController')
export class CommandOverlayController extends Component {
  private noticeLabel: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(920, 40);

    const labelNode = new Node('CommandNotice');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(-430, 0, 0));
    labelNode.addComponent(UITransform).setContentSize(860, 30);
    this.noticeLabel = labelNode.addComponent(Label);
    this.noticeLabel.fontSize = 12;
    this.noticeLabel.color = new Color(134, 239, 172, 255);
  }

  public setNotice(text: string): void {
    if (this.noticeLabel) this.noticeLabel.string = text;
  }
}
