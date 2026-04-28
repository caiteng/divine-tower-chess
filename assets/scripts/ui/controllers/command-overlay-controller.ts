import { _decorator, Button, Color, Component, Graphics, Label, Layers, Node, UITransform, Vec3 } from 'cc';
import { getAvailableSkills } from '../../squad/config/skill-config';
import type { SquadBattleSnapshot, SquadUnitState } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('CommandOverlayController')
export class CommandOverlayController extends Component {
  private noticeLabel: Label | null = null;
  public onSkill?: (skillId: string) => void;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(920, 72);

    const labelNode = new Node('CommandNotice');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(-430, 22, 0));
    labelNode.addComponent(UITransform).setContentSize(860, 30);
    this.noticeLabel = labelNode.addComponent(Label);
    this.noticeLabel.fontSize = 12;
    this.noticeLabel.color = new Color(134, 239, 172, 255);
  }

  public render(snapshot: SquadBattleSnapshot, selectedUnitId: string | undefined, text: string): void {
    this.node.removeAllChildren();
    const labelNode = new Node('CommandNotice');
    labelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(labelNode);
    labelNode.setPosition(new Vec3(-430, 22, 0));
    labelNode.addComponent(UITransform).setContentSize(860, 30);
    this.noticeLabel = labelNode.addComponent(Label);
    this.noticeLabel.fontSize = 12;
    this.noticeLabel.color = new Color(134, 239, 172, 255);
    if (this.noticeLabel) this.noticeLabel.string = text;

    const selected = selectedUnitId ? snapshot.allies.find((ally) => ally.instanceId === selectedUnitId && ally.alive) : undefined;
    if (!selected || snapshot.phase !== 'battle') return;
    this.renderSkillButtons(selected);
  }

  public setNotice(text: string): void {
    if (this.noticeLabel) this.noticeLabel.string = text;
  }

  private renderSkillButtons(unit: SquadUnitState): void {
    const skills = getAvailableSkills(unit.unitId, unit.star);
    skills.forEach((skill, index) => {
      const cooldown = unit.skillCooldowns?.[skill.id] ?? 0;
      const label = cooldown > 0 ? `${skill.name} ${Math.ceil(cooldown)}s` : skill.name;
      this.makeButton(
        `Skill-${skill.id}`,
        label,
        -410 + index * 126,
        -18,
        112,
        30,
        cooldown > 0 ? new Color(71, 85, 105, 230) : new Color(37, 99, 235, 245),
        () => {
          if (cooldown <= 0) this.onSkill?.(skill.id);
        },
      );
    });
  }

  private makeButton(name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = color;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    graphics.strokeColor = new Color(191, 219, 254, 120);
    graphics.lineWidth = 2;
    graphics.rect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2);
    graphics.stroke();
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, onClick, this);

    const labelNode = new Node(`${name}-label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(width - 8, height - 6);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 12;
    label.lineHeight = 14;
    label.color = new Color(248, 250, 252, 255);
  }
}
