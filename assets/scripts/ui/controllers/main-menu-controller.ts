import { _decorator, Button, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import type { SavedAchievements, SavedAudioSettings } from '../../squad/types';

const { ccclass } = _decorator;

type MenuPanelId = 'settings' | 'credits' | 'achievements';

@ccclass('MainMenuController')
export class MainMenuController extends Component {
  public onStart?: () => void;
  public onLoadRequested?: () => void;
  public onSettingAdjusted?: (key: keyof SavedAudioSettings, nextValue: number) => void;

  private footerLabel: Label | null = null;
  private settings: SavedAudioSettings = { master: 80, music: 70, sfx: 80 };
  private achievements: SavedAchievements = { firstClear: false };
  private hasRunSave = false;

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(960, 640);

    const bg = this.node.addComponent(Sprite);
    bg.color = new Color(8, 15, 28, 255);

    this.makeStripe('TopShade', 0, 214, 960, 184, new Color(15, 23, 42, 245));
    this.makeStripe('BottomShade', 0, -170, 960, 264, new Color(2, 6, 23, 230));

    this.makeLabel('Title', '放置合成塔防', 0, 178, 760, 38, new Color(248, 250, 252, 255));
    this.makeLabel('Subtitle', 'TD 模式已接入：路径出怪、塔位放置、商店购买、三合一、十波防守', 0, 132, 780, 16, new Color(191, 219, 254, 255));
    this.makeLabel('Tagline', '点击“塔防模式”进入新玩法。旧 squad 主线代码仍保留在仓库中作为回退基线。', 0, 96, 820, 14, new Color(226, 232, 240, 255));

    this.makeMenuButton('StartTDButton', '塔防模式', 0, 34, new Color(21, 128, 61, 255), () => this.onStart?.());
    this.makeMenuButton('LoadTDButton', '载入塔防', 0, -24, new Color(37, 99, 235, 255), () => this.onLoadRequested?.());
    this.makeMenuButton('SettingsButton', '设置', 0, -82, new Color(71, 85, 105, 255), () => this.showPanel('settings'));
    this.makeMenuButton('CreditsButton', '说明', 0, -140, new Color(120, 53, 15, 255), () => this.showPanel('credits'));
    this.makePanelButton(this.node, 'AchievementsButton', '成就', 332, 246, 120, 40, new Color(76, 29, 149, 255), () => this.showPanel('achievements'));

    this.footerLabel = this.makeLabel('Footer', '当前入口：塔防模式。建议先购买英雄，再点击地图塔位放置。', 0, -276, 800, 13, new Color(226, 232, 240, 255));
  }

  public setFooterText(text: string): void {
    if (this.footerLabel) this.footerLabel.string = text;
  }

  public setSettings(settings: SavedAudioSettings): void {
    this.settings = { ...settings };
  }

  public setAchievements(achievements: SavedAchievements): void {
    this.achievements = { ...achievements };
  }

  public setHasRunSave(hasSave: boolean): void {
    this.hasRunSave = hasSave;
    if (this.footerLabel && hasSave) {
      this.footerLabel.string = '检测到本地存档。点击“载入塔防”继续。';
    }
  }

  public showPanel(panel: MenuPanelId): void {
    if (panel === 'settings') {
      this.setFooterText(`设置：总音量 ${this.settings.master}% / 音乐 ${this.settings.music}% / 音效 ${this.settings.sfx}%。当前入口包不展开设置面板。`);
      return;
    }
    if (panel === 'achievements') {
      this.setFooterText(this.achievements.firstClear ? '成就：初次通关已解锁。' : '成就：初次通关尚未解锁。');
      return;
    }
    this.setFooterText('说明：这是塔防入口修复版。旧小队模式代码未删除，但主入口现在优先进入 TD 模式。');
  }

  public hidePanel(): void {
    // 保留旧接口，入口修复版没有弹层需要隐藏。
  }

  private makeStripe(name: string, x: number, y: number, width: number, height: number, color: Color): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    this.node.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;
  }

  private makeMenuButton(name: string, text: string, x: number, y: number, color: Color, onClick: () => void): void {
    this.makePanelButton(this.node, name, text, x, y, 240, 48, color, onClick);
  }

  private makePanelButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;

    const guarded = this.makeGuardedClick(onClick);
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, guarded, this);
    node.on(Node.EventType.TOUCH_END, guarded, this);

    const labelNode = new Node(`${name}Label`);
    labelNode.layer = Layers.Enum.UI_2D;
    node.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(width - 12, height - 8);
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
