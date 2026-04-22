import { _decorator, Button, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import { UNIT_CONFIG } from '../../config/unit-config';
import { UnitId } from '../../models/types';
import { UnitSpriteResolver } from '../resources/sprite-resolvers';

const { ccclass } = _decorator;

@ccclass('CharacterSelectController')
export class CharacterSelectController extends Component {
  public onBack?: () => void;
  public onConfirm?: (unitId: UnitId) => void;

  private readonly resolver = new UnitSpriteResolver();
  private options: UnitId[] = [];
  private selectedIndex = 0;
  private previewSprite: Sprite | null = null;
  private titleLabel: Label | null = null;
  private detailLabel: Label | null = null;
  private footerLabel: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    this.node.addComponent(UITransform).setContentSize(960, 640);
    const bg = this.node.addComponent(Sprite);
    bg.color = new Color(9, 18, 32, 255);

    this.makePanel('Backdrop', 0, 0, 820, 560, new Color(15, 23, 42, 245));
    this.makeLabel('PageTitle', '选择初始职业', 0, 228, 520, 28, new Color(248, 250, 252, 255));
    this.makeLabel('PageHint', '左右切换你想带入第一回合的队长职业，确认后会作为起始棋子进入备战区。', 0, 194, 660, 14, new Color(191, 219, 254, 255));

    const preview = new Node('Preview');
    preview.layer = Layers.Enum.UI_2D;
    this.node.addChild(preview);
    preview.setPosition(new Vec3(0, 34, 0));
    preview.addComponent(UITransform).setContentSize(220, 220);
    this.previewSprite = preview.addComponent(Sprite);
    this.previewSprite.color = new Color(148, 163, 184, 255);

    this.titleLabel = this.makeLabel('SelectedTitle', '', 0, -126, 520, 24, new Color(251, 191, 36, 255));
    this.detailLabel = this.makeLabel('SelectedDetail', '', 0, -168, 620, 14, new Color(226, 232, 240, 255));
    if (this.detailLabel) this.detailLabel.lineHeight = 20;
    this.footerLabel = this.makeLabel('Footer', '左右切换职业，右下角开始游戏。', 0, -230, 620, 13, new Color(148, 163, 184, 255));

    this.makeButton('Prev', '◀', -224, 24, 56, 56, new Color(30, 41, 59, 255), () => this.shiftSelection(-1));
    this.makeButton('Next', '▶', 224, 24, 56, 56, new Color(30, 41, 59, 255), () => this.shiftSelection(1));
    this.makeButton('Back', '返回', -278, -248, 140, 42, new Color(71, 85, 105, 255), () => this.onBack?.());
    this.makeButton('Confirm', '开始游戏', 280, -248, 160, 42, new Color(21, 128, 61, 255), () => this.confirmSelection());
  }

  public setOptions(options: UnitId[], selectedUnitId?: UnitId): void {
    this.options = [...options];
    const foundIndex = selectedUnitId ? this.options.indexOf(selectedUnitId) : -1;
    this.selectedIndex = foundIndex >= 0 ? foundIndex : 0;
    void this.renderSelection();
  }

  private shiftSelection(delta: number): void {
    if (this.options.length === 0) return;
    this.selectedIndex = (this.selectedIndex + delta + this.options.length) % this.options.length;
    void this.renderSelection();
  }

  private confirmSelection(): void {
    const unitId = this.options[this.selectedIndex];
    if (!unitId) return;
    this.onConfirm?.(unitId);
  }

  private async renderSelection(): Promise<void> {
    const unitId = this.options[this.selectedIndex];
    if (!unitId) return;
    const cfg = UNIT_CONFIG[unitId];
    if (this.titleLabel) {
      this.titleLabel.string = `${cfg.name} · ${unitId}`;
    }
    if (this.detailLabel) {
      this.detailLabel.string = `职业定位：${cfg.behaviorRole}  |  生命 ${cfg.maxHp}  |  攻击 ${cfg.baseDamage}  |  移速 ${cfg.moveSpeed}\n该单位会作为你的起始队长实例进入第一回合准备阶段。`;
    }
    if (this.footerLabel) {
      this.footerLabel.string = `当前选择：${cfg.name}。进入游戏后它会以标准棋子身份进入备战区。`;
    }
    if (this.previewSprite) {
      const frame = await this.resolver.resolvePortrait(unitId, 1, false);
      this.previewSprite.spriteFrame = frame;
      this.previewSprite.color = frame ? new Color(255, 255, 255, 255) : new Color(148, 163, 184, 255);
    }
  }

  private makePanel(name: string, x: number, y: number, width: number, height: number, color: Color): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;
  }

  private makeButton(name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, onClick, this);

    const labelNode = new Node(`${name}Label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(width - 10, height - 8);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 18;
    label.lineHeight = 22;
    label.color = new Color(248, 250, 252, 255);
  }

  private makeLabel(name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, fontSize + 16);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.color = color;
    return label;
  }
}
