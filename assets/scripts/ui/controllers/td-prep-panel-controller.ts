import { _decorator, Button, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import { getTDHeroConfig } from '../../td/config/td-hero-config';
import type { TDSnapshot } from '../../td/types';

const { ccclass } = _decorator;

@ccclass('TDPrepPanelController')
export class TDPrepPanelController extends Component {
  public onBuy?: (slotIndex: number) => void;
  public onRefresh?: () => void;
  public onStartWave?: () => void;
  public onSelectHero?: (heroInstanceId: string) => void;
  public onRecall?: (heroInstanceId?: string) => void;
  public onSell?: (heroInstanceId?: string) => void;

  public render(snapshot: TDSnapshot, selectedHeroId?: string): void {
    this.node.removeAllChildren();
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(280, 520);

    const bg = this.node.addComponent(Sprite);
    bg.color = new Color(15, 23, 42, 230);

    this.makeLabel('TDPrepTitle', '塔防准备', 0, 244, 240, 18, new Color(251, 191, 36, 255));
    this.makeButton('StartWave', snapshot.phase === 'prep' ? '开始下一波' : '波次进行中', 0, 206, 200, 38, new Color(21, 128, 61, 255), () => this.onStartWave?.());
    this.makeButton('RefreshShop', '刷新商店', 0, 162, 160, 30, new Color(37, 99, 235, 255), () => this.onRefresh?.());

    this.makeLabel('ShopTitle', '商店', -90, 126, 120, 14, new Color(226, 232, 240, 255));
    snapshot.shop.forEach((slot, index) => {
      const label = slot.heroId ? `${getTDHeroConfig(slot.heroId).name} ${slot.cost}金` : '空';
      this.makeButton(`Shop-${index}`, label, 0, 94 - index * 36, 220, 30, new Color(51, 65, 85, 255), () => this.onBuy?.(index));
    });

    this.makeLabel('BenchTitle', '背包：点击选中，再点地图塔位', 0, -24, 240, 12, new Color(191, 219, 254, 255));
    snapshot.bench.slice(0, 8).forEach((hero, index) => {
      const cfg = getTDHeroConfig(hero.heroId);
      const y = -58 - index * 30;
      const selected = hero.instanceId === selectedHeroId;
      this.makeButton(
        `Bench-${hero.instanceId}`,
        `${selected ? '▶ ' : ''}${cfg.name} ★${hero.star}`,
        0,
        y,
        220,
        26,
        selected ? new Color(180, 83, 9, 255) : new Color(30, 41, 59, 255),
        () => this.onSelectHero?.(hero.instanceId),
      );
    });

    if (selectedHeroId) {
      this.makeButton('RecallSelected', '撤回选中', -58, -230, 104, 28, new Color(71, 85, 105, 255), () => this.onRecall?.(selectedHeroId));
      this.makeButton('SellSelected', '售出选中', 58, -230, 104, 28, new Color(127, 29, 29, 255), () => this.onSell?.(selectedHeroId));
    }
  }

  private makeButton(name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;

    const guarded = this.makeGuardedClick(onClick);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, guarded, this);
    node.on(Node.EventType.TOUCH_END, guarded, this);

    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = 13;
    label.lineHeight = 17;
    label.color = new Color(255, 255, 255, 255);
  }

  private makeLabel(name: string, text: string, x: number, y: number, width: number, fontSize: number, color: Color): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, fontSize + 8);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
  }

  private makeGuardedClick(onClick: () => void): () => void {
    let lastAt = 0;
    return () => {
      const now = Date.now();
      if (now - lastAt < 120) return;
      lastAt = now;
      onClick();
    };
  }
}
