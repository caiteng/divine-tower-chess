import { _decorator, Button, Color, Component, Graphics, Label, Layers, Node, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { SHOP_UNIT_POOL, UNIT_CONFIG } from '../../config/unit-config';
import type { UnitId } from '../../models/types';
import { getScaledUnitMaxHp, SQUAD_UNIT_STATS } from '../../squad/config/squad-battle-config';
import type { RosterUnitState, SquadBattleSnapshot } from '../../squad/types';
import { UiIconResolver, UnitSpriteResolver } from '../resources/sprite-resolvers';

const { ccclass } = _decorator;
const SHOP_CARD_WIDTH = 132;
const SHOP_CARD_HEIGHT = 76;
const ROSTER_CARD_WIDTH = 92;
const ROSTER_CARD_HEIGHT = 66;
const INLINE_ACTION_HEIGHT = 22;
const PREP_PANEL_WIDTH = 920;
const PREP_PANEL_HEIGHT = 560;
const SAFE_LEFT = -392;
const SAFE_RIGHT = 392;
const SAFE_TOP = 230;
const SAFE_BOTTOM = -230;

@ccclass('PrepPanelController')
export class PrepPanelController extends Component {
  private readonly unitResolver = new UnitSpriteResolver();
  private readonly iconResolver = new UiIconResolver();
  private readonly avatarFrames = new Map<UnitId, SpriteFrame>();
  private goldFrame: SpriteFrame | null = null;

  public onBuy?: (index: number) => void;
  public onSelectShop?: (index: number) => void;
  public onSelectUnit?: (id: string) => void;
  public onDeploy?: (id: string) => void;
  public onRecall?: (id: string) => void;
  public onSell?: (id: string) => void;
  public onRefresh?: () => void;
  public onStartWave?: () => void;

  private infoLabel: Label | null = null;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(PREP_PANEL_WIDTH, PREP_PANEL_HEIGHT);
    this.paintRect(this.node, PREP_PANEL_WIDTH, PREP_PANEL_HEIGHT, new Color(15, 23, 42, 245));

    this.infoLabel = this.makeLabel('Info', SAFE_LEFT, SAFE_TOP, 620, 14, new Color(251, 191, 36, 255));
    for (const unitId of SHOP_UNIT_POOL) {
      void this.unitResolver.resolveAvatar(unitId).then((frame) => {
        if (frame) this.avatarFrames.set(unitId, frame);
      });
    }
    void this.iconResolver.resolve('gold').then((frame) => {
      this.goldFrame = frame;
    });
  }

  public render(snapshot: SquadBattleSnapshot, selectedLabel: string, selectedUnitId?: string, selectedShopIndex?: number): void {
    this.node.removeAllChildren();
    this.infoLabel = this.makeLabel('Info', SAFE_LEFT, SAFE_TOP, 620, 14, new Color(251, 191, 36, 255));
    this.infoLabel.string = `准备阶段 · 当前选择：${selectedLabel}`;
    this.makeGoldReadout(snapshot.gold);

    this.makeLabel('ShopTitle', SAFE_LEFT, 186, 140, 13, new Color(226, 232, 240, 255)).string = '商店（3）';
    snapshot.shop.forEach((unitId, index) => {
      const x = -260 + index * 156;
      this.makeUnitCard({
        name: `Buy-${index}`,
        unitId,
        star: 1,
        text: `${this.getUnitName(unitId)}\n商店`,
        x,
        y: 148,
        width: SHOP_CARD_WIDTH,
        height: SHOP_CARD_HEIGHT,
        selected: selectedShopIndex === index,
        color: new Color(30, 41, 59, 255),
        onClick: () => this.onSelectShop?.(index),
      });
      if (selectedShopIndex === index) {
        this.makeInlineActionButton(`BuyAction-${index}`, '购买', x, 96, 76, new Color(21, 128, 61, 255), () => this.onBuy?.(index));
      }
    });

    this.makeLabel('DeployTitle', SAFE_LEFT, 56, 140, 13, new Color(226, 232, 240, 255)).string = '上阵区（5）';
    for (let i = 0; i < snapshot.slotConfig.deployed; i += 1) {
      const unit = snapshot.deployed[i];
      const x = -328 + i * 112;
      if (unit) {
        this.makeUnitCard({
          name: `Deployed-${unit.instanceId}`,
          unitId: unit.unitId,
          star: unit.star,
          text: `${unit.isCaptain ? '♛ ' : ''}${this.getUnitName(unit.unitId)}★${unit.star}${unit.assignedTaskId ? ' ✦' : ''}\n已上阵`,
          x,
          y: 14,
          width: 104,
          height: 68,
          selected: unit.instanceId === selectedUnitId,
          color: new Color(30, 41, 59, 255),
          onClick: () => this.onSelectUnit?.(unit.instanceId),
        });
        if (unit.instanceId === selectedUnitId) {
          this.makeInlineActionButton(`RecallAction-${unit.instanceId}`, '下阵', x, -34, 70, new Color(37, 99, 235, 255), () => this.onRecall?.(unit.instanceId));
        }
      } else {
        this.makeButton(`DeployEmpty-${i}`, '空位', x, 14, 104, 68, new Color(51, 65, 85, 160));
      }
    }

    this.makeLabel('BenchTitle', SAFE_LEFT, -82, 140, 13, new Color(226, 232, 240, 255)).string = '备战区（8）';
    for (let i = 0; i < snapshot.slotConfig.bench; i += 1) {
      const unit = snapshot.bench[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = -332 + col * 106;
      const y = -112 - row * 88;
      if (unit) {
        this.makeRosterCard(unit, x, y, unit.instanceId === selectedUnitId, () => this.onSelectUnit?.(unit.instanceId));
        if (unit.instanceId === selectedUnitId) {
          this.makeInlineActionButton(`DeployAction-${unit.instanceId}`, '上阵', x - 24, y - 44, 46, new Color(21, 128, 61, 255), () => this.onDeploy?.(unit.instanceId));
          this.makeInlineActionButton(`SellAction-${unit.instanceId}`, '售出', x + 26, y - 44, 46, new Color(127, 29, 29, 255), () => this.onSell?.(unit.instanceId));
        }
      } else {
        this.makeButton(`BenchEmpty-${i}`, '空位', x, y, ROSTER_CARD_WIDTH, ROSTER_CARD_HEIGHT, new Color(51, 65, 85, 160));
      }
    }

    const selectedRosterUnit = this.findSelectedRosterUnit(snapshot, selectedUnitId);
    this.makeButton('Start', '开始下一波', 342, 148, 170, 48, new Color(21, 128, 61, 255), () => this.onStartWave?.());
    this.makeButton('Refresh', '刷新商店', 342, 90, 150, 32, new Color(37, 99, 235, 255), () => this.onRefresh?.());
    this.makeSelectedInfoPanel(snapshot, selectedRosterUnit);
    this.makeLabel('Hint', SAFE_LEFT, SAFE_BOTTOM, 780, 12, new Color(191, 219, 254, 255)).string = this.buildHint(snapshot, selectedUnitId, selectedShopIndex);
  }

  private buildHint(snapshot: SquadBattleSnapshot, selectedUnitId?: string, selectedShopIndex?: number): string {
    if (selectedShopIndex !== undefined) {
      const unitId = snapshot.shop[selectedShopIndex];
      return unitId
        ? `提示：已选中商店 ${this.getUnitName(unitId)}，点击卡片下方购买按钮会加入备战区；购买失败不会移除该槽位。`
        : '提示：当前商店槽位为空。';
    }

    if (!selectedUnitId) {
      return '提示：点击商店、备战区或上阵区角色会先选中，实际购买 / 上阵 / 下阵 / 售出使用角色下方的小按钮。';
    }

    const rosterUnit = [...snapshot.deployed, ...snapshot.bench].find((unit) => unit.instanceId === selectedUnitId);
    if (!rosterUnit) {
      return '提示：当前选中单位已离开备战链路。';
    }

    const inDeployed = snapshot.deployed.some((unit) => unit.instanceId === selectedUnitId);
    const task = snapshot.divineTasks.find((entry) => entry.unitInstanceId === selectedUnitId);
    if (task) {
      return `提示：${this.getUnitName(rosterUnit.unitId)}★${rosterUnit.star} 持有 ${task.divineTaskId}，实例进度 ${Math.floor(task.divineProgress ?? 0)}，普通升星不会消耗它。`;
    }

    if (rosterUnit.isCaptain) {
      return inDeployed
        ? `提示：${this.getUnitName(rosterUnit.unitId)}★${rosterUnit.star} 是当前队长实例，已在上阵区。`
        : `提示：${this.getUnitName(rosterUnit.unitId)}★${rosterUnit.star} 是你选择的起始队长实例，当前位于备战区。`;
    }

    return inDeployed
      ? `提示：${this.getUnitName(rosterUnit.unitId)}★${rosterUnit.star} 当前在上阵区，可用角色下方按钮撤回或直接开波。`
      : `提示：${this.getUnitName(rosterUnit.unitId)}★${rosterUnit.star} 当前在备战区，可用角色下方按钮上阵或售出；3 个同名同星实例会自动合成。`;
  }

  private getUnitName(unitId: UnitId): string {
    return UNIT_CONFIG[unitId]?.name ?? unitId;
  }

  private findSelectedRosterUnit(snapshot: SquadBattleSnapshot, selectedUnitId?: string): RosterUnitState | undefined {
    if (!selectedUnitId) return undefined;
    return [...snapshot.deployed, ...snapshot.bench].find((unit) => unit.instanceId === selectedUnitId);
  }

  private makeSelectedInfoPanel(snapshot: SquadBattleSnapshot, unit: RosterUnitState | undefined): void {
    const panel = new Node('SelectedInfoPanel');
    panel.layer = Layers.Enum.UI_2D;
    this.node.addChild(panel);
    panel.setPosition(new Vec3(302, -104, 0));
    panel.addComponent(UITransform).setContentSize(220, 220);
    this.paintRect(panel, 220, 220, new Color(15, 23, 42, 240), new Color(148, 163, 184, 100));

    if (!unit) {
      const empty = this.makeLabel('SelectedInfoEmpty', 0, 44, 190, 13, new Color(203, 213, 225, 255), panel);
      empty.string = '选中一个上阵区或备战区单位';
      const hint = this.makeLabel('SelectedInfoHint', 0, 10, 190, 11, new Color(148, 163, 184, 255), panel);
      hint.string = '这里会显示头像、属性和神品任务进度';
      return;
    }

    const avatarNode = new Node('SelectedAvatar');
    avatarNode.layer = Layers.Enum.UI_2D;
    panel.addChild(avatarNode);
    avatarNode.setPosition(new Vec3(-72, 64, 0));
    avatarNode.addComponent(UITransform).setContentSize(58, 58);
    const avatar = avatarNode.addComponent(Sprite);
    avatar.sizeMode = Sprite.SizeMode.CUSTOM;
    avatar.color = new Color(148, 163, 184, 255);
    const cachedFrame = this.avatarFrames.get(unit.unitId);
    if (cachedFrame) {
      avatar.spriteFrame = cachedFrame;
      avatar.color = new Color(255, 255, 255, 255);
    } else {
      void this.unitResolver.resolveAvatar(unit.unitId).then((frame) => {
        if (!frame || !avatar.node.parent) return;
        this.avatarFrames.set(unit.unitId, frame);
        avatar.spriteFrame = frame;
        avatar.color = new Color(255, 255, 255, 255);
      });
    }

    const title = this.makeLabel('SelectedTitle', -28, 82, 140, 13, new Color(248, 250, 252, 255), panel);
    title.string = `${unit.isCaptain ? '♛ ' : ''}${this.getUnitName(unit.unitId)} ★${unit.star}`;
    const idLabel = this.makeLabel('SelectedId', -28, 58, 140, 10, new Color(148, 163, 184, 255), panel);
    idLabel.string = `实例 ${unit.instanceId.slice(-6)}${unit.assignedTaskId ? '  ✦' : ''}`;

    const stats = SQUAD_UNIT_STATS[unit.unitId];
    const maxHp = getScaledUnitMaxHp(unit.unitId, unit.star);
    const damage = Math.round(stats.attackDamage * (1 + (unit.star - 1) * 0.8));
    const pierce = Math.round((stats.armorPierceRatio + (unit.star - 1) * 0.12) * 100);
    const rows = [
      `生命 ${maxHp}    护甲 ${stats.armor}`,
      `攻击 ${damage}    攻速 ${stats.attackInterval.toFixed(2)}s`,
      `射程 ${stats.attackRange}    移速 ${stats.moveSpeed}`,
      `穿甲 ${pierce}%    体积 ${stats.collisionRadius}`,
    ];
    rows.forEach((text, index) => {
      const row = this.makeLabel(`SelectedStat-${index}`, -98, 24 - index * 22, 190, 11, new Color(226, 232, 240, 255), panel);
      row.string = text;
    });

    const task = snapshot.divineTasks.find((entry) => entry.unitInstanceId === unit.instanceId);
    const taskLabel = this.makeLabel('SelectedTask', -98, -78, 194, 11, task ? new Color(251, 191, 36, 255) : new Color(148, 163, 184, 255), panel);
    taskLabel.string = task
      ? `神品任务 ${task.divineTaskId ?? '-'} · ${Math.floor(task.divineProgress ?? 0)}`
      : '神品任务：无';
  }

  private makeGoldReadout(gold: number): void {
    const node = new Node('GoldReadout');
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(248, SAFE_TOP, 0));
    node.addComponent(UITransform).setContentSize(150, 28);

    const iconNode = new Node('GoldIcon');
    iconNode.layer = Layers.Enum.UI_2D;
    node.addChild(iconNode);
    iconNode.setPosition(new Vec3(-48, 0, 0));
    iconNode.addComponent(UITransform).setContentSize(24, 24);
    const icon = iconNode.addComponent(Sprite);
    icon.sizeMode = Sprite.SizeMode.CUSTOM;
    icon.color = new Color(245, 158, 11, 255);
    if (this.goldFrame) {
      icon.spriteFrame = this.goldFrame;
      icon.color = new Color(255, 255, 255, 255);
    } else {
      void this.iconResolver.resolve('gold').then((frame) => {
        if (!frame || !icon.node.parent) return;
        this.goldFrame = frame;
        icon.spriteFrame = frame;
        icon.color = new Color(255, 255, 255, 255);
      });
    }

    const label = this.makeLabel('GoldValue', 18, 0, 90, 15, new Color(254, 240, 138, 255), node);
    label.string = `${gold}`;
  }

  private makeRosterCard(unit: RosterUnitState, x: number, y: number, selected: boolean, onClick: () => void): void {
    this.makeUnitCard({
      name: `Deploy-${unit.instanceId}`,
      unitId: unit.unitId,
      star: unit.star,
      text: `${unit.isCaptain ? '♛ ' : ''}${this.getUnitName(unit.unitId)}★${unit.star}${unit.assignedTaskId ? ' ✦' : ''}\n备战`,
      x,
      y,
      width: ROSTER_CARD_WIDTH,
      height: ROSTER_CARD_HEIGHT,
      selected,
      color: selected ? new Color(180, 83, 9, 255) : new Color(30, 41, 59, 255),
      onClick,
    });
  }

  private makeLabel(name: string, x: number, y: number, width: number, fontSize: number, color: Color, parent: Node = this.node): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, 24);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
    return label;
  }

  private makeButton(name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick?: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    this.paintRect(node, width, height, color, new Color(148, 163, 184, 70));
    const guardedClick = onClick ? this.makeGuardedClick(onClick) : undefined;
    if (guardedClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, guardedClick, this);
    }

    const labelNode = new Node(`${name}-label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(width - 8, height - 8);
    const label = labelNode.addComponent(Label);
    label.string = text;
    label.fontSize = 12;
    label.lineHeight = 14;
    label.color = new Color(248, 250, 252, 255);
    if (guardedClick) {
      labelNode.addComponent(Button);
      labelNode.on(Button.EventType.CLICK, guardedClick, this);
    }
  }

  private makeInlineActionButton(name: string, text: string, x: number, y: number, width: number, color: Color, onClick: () => void): void {
    this.makeButton(name, text, x, y, width, INLINE_ACTION_HEIGHT, color, onClick);
  }

  private makeUnitCard(options: {
    name: string;
    unitId: UnitId;
    star: 1 | 2 | 3;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    color: Color;
    onClick?: () => void;
  }): void {
    const node = new Node(options.name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(options.x, options.y, 0));
    node.addComponent(UITransform).setContentSize(options.width, options.height);
    this.paintRect(
      node,
      options.width,
      options.height,
      options.selected ? new Color(180, 83, 9, 255) : options.color,
      options.selected ? new Color(254, 240, 138, 210) : new Color(148, 163, 184, 80),
    );

    if (options.selected) {
      const glow = new Node(`${options.name}-selected`);
      glow.layer = Layers.Enum.UI_2D;
      node.addChild(glow);
      glow.setPosition(new Vec3(0, -6, 0));
      glow.addComponent(UITransform).setContentSize(options.width - 12, 12);
      this.paintRect(glow, options.width - 12, 12, new Color(254, 240, 138, 180));
    }

    const imageBack = new Node(`${options.name}-image-back`);
    imageBack.layer = Layers.Enum.UI_2D;
    node.addChild(imageBack);
    imageBack.setPosition(new Vec3(0, options.height * 0.13, 0));
    const imageBackWidth = Math.min(options.width - 18, options.height > 70 ? 74 : 58);
    const imageBackHeight = Math.min(options.height - 22, options.height > 70 ? 56 : 46);
    imageBack.addComponent(UITransform).setContentSize(imageBackWidth, imageBackHeight);

    const imageNode = new Node(`${options.name}-image`);
    imageNode.layer = Layers.Enum.UI_2D;
    imageBack.addChild(imageNode);
    imageNode.setPosition(new Vec3(0, 0, 0));
    imageNode.addComponent(UITransform).setContentSize(Math.min(72, options.width - 18), Math.min(58, options.height - 18));
    const unitSprite = imageNode.addComponent(Sprite);
    unitSprite.sizeMode = Sprite.SizeMode.CUSTOM;
    unitSprite.color = new Color(148, 163, 184, 255);
    const cachedFrame = this.avatarFrames.get(options.unitId);
    if (cachedFrame) {
      unitSprite.spriteFrame = cachedFrame;
      unitSprite.color = new Color(255, 255, 255, 255);
    } else {
      void this.unitResolver.resolveAvatar(options.unitId).then((frame) => {
        if (!frame || !unitSprite.node.parent) return;
        this.avatarFrames.set(options.unitId, frame);
        unitSprite.spriteFrame = frame;
        unitSprite.color = new Color(255, 255, 255, 255);
      });
    }

    const labelNode = new Node(`${options.name}-label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.setPosition(new Vec3(0, -options.height * 0.32, 0));
    labelNode.addComponent(UITransform).setContentSize(options.width - 8, 26);
    const label = labelNode.addComponent(Label);
    label.string = options.text;
    label.fontSize = 11;
    label.lineHeight = 13;
    label.color = new Color(248, 250, 252, 255);

    const guardedClick = options.onClick ? this.makeGuardedClick(options.onClick) : undefined;
    if (guardedClick) {
      node.addComponent(Button);
      node.on(Button.EventType.CLICK, guardedClick, this);
      labelNode.addComponent(Button);
      labelNode.on(Button.EventType.CLICK, guardedClick, this);
      imageNode.addComponent(Button);
      imageNode.on(Button.EventType.CLICK, guardedClick, this);
    }
  }

  private paintRect(node: Node, width: number, height: number, fill: Color, stroke?: Color): void {
    const graphics = node.addComponent(Graphics);
    graphics.fillColor = fill;
    graphics.rect(-width / 2, -height / 2, width, height);
    graphics.fill();
    if (stroke) {
      graphics.strokeColor = stroke;
      graphics.lineWidth = 2;
      graphics.rect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 2);
      graphics.stroke();
    }
  }

  private makeGuardedClick(onClick: () => void): () => void {
    let lastClickAt = 0;
    return () => {
      const now = Date.now();
      if (now - lastClickAt < 80) return;
      lastClickAt = now;
      onClick();
    };
  }
}
