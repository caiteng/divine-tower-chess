import { _decorator, Button, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import type { DifficultyId } from '../../models/types';
import type { SavedAchievements, SavedAudioSettings } from '../../squad/types';
import { BackgroundResolver } from '../resources/sprite-resolvers';

const { ccclass } = _decorator;

type MenuPanelId = 'settings' | 'credits' | 'achievements';

@ccclass('MainMenuController')
export class MainMenuController extends Component {
  public onStart?: () => void;
  public onLoadRequested?: () => void;
  public onDifficultySelected?: (difficulty: DifficultyId) => void;
  public onSettingAdjusted?: (key: keyof SavedAudioSettings, nextValue: number) => void;

  private panelNode: Node | null = null;
  private panelTitleLabel: Label | null = null;
  private panelBodyLabel: Label | null = null;
  private footerLabel: Label | null = null;
  private panelContentNode: Node | null = null;
  private activePanel: MenuPanelId | null = null;
  private settings: SavedAudioSettings = { master: 80, music: 70, sfx: 80 };
  private achievements: SavedAchievements = { firstClear: false };
  private hasRunSave = false;
  private selectedDifficulty: DifficultyId = 'beginner';
  private readonly backgroundResolver = new BackgroundResolver();

  public initialize(): void {
    this.node.layer = Layers.Enum.UI_2D;
    const transform = this.node.getComponent(UITransform) ?? this.node.addComponent(UITransform);
    transform.setContentSize(960, 640);

    const bg = this.node.addComponent(Sprite);
    bg.sizeMode = Sprite.SizeMode.CUSTOM;
    bg.color = new Color(8, 15, 28, 255);
    void this.loadBackground(bg);

    this.makeStripe('TopShade', 0, 210, 960, 180, new Color(2, 6, 23, 118));
    this.makeStripe('BottomShade', 0, -174, 960, 260, new Color(2, 6, 23, 150));

    this.makeLabel('Title', '角斗场：试炼之环', 0, 168, 760, 36, new Color(248, 250, 252, 255));
    this.makeLabel('Subtitle', '2D 小队实时指挥战斗原型', 0, 124, 640, 16, new Color(148, 163, 184, 255));
    this.makeLabel('Tagline', '先从主菜单进入，再进入准备阶段和实时指挥战斗。', 0, 88, 640, 14, new Color(191, 219, 254, 255));

    this.makeDifficultyButton('BeginnerDifficulty', '新手', -204, 52, 'beginner');
    this.makeDifficultyButton('NormalDifficulty', '普通', -68, 52, 'normal');
    this.makeDifficultyButton('HardDifficulty', '困难', 68, 52, 'hard');
    this.makeDifficultyButton('EndlessDifficulty', '无尽', 204, 52, 'endless');

    this.makeMenuButton('StartButton', '开始', 0, -12, new Color(21, 128, 61, 255), () => this.onStart?.());
    this.makeMenuButton('LoadButton', '载入', 0, -78, new Color(37, 99, 235, 255), () => this.onLoadRequested?.());
    this.makeMenuButton('SettingsButton', '设置', 0, -144, new Color(71, 85, 105, 255), () => this.showPanel('settings'));
    this.makeMenuButton('CreditsButton', '鸣谢', 0, -210, new Color(120, 53, 15, 255), () => this.showPanel('credits'));
    this.makePanelButton(this.node, 'AchievementsButton', '成就', 332, 246, 120, 40, new Color(76, 29, 149, 255), () => this.showPanel('achievements'));

    this.footerLabel = this.makeLabel('Footer', '当前版本：可玩原型，主循环已接通。', 0, -276, 720, 13, new Color(226, 232, 240, 255));

    this.createPanel();
    this.syncLoadButtonState();
  }

  public setFooterText(text: string): void {
    if (this.footerLabel) {
      this.footerLabel.string = text;
    }
  }

  public setSettings(settings: SavedAudioSettings): void {
    this.settings = { ...settings };
    if (this.activePanel === 'settings') {
      this.renderSettingsPanel();
    }
  }

  public setAchievements(achievements: SavedAchievements): void {
    this.achievements = { ...achievements };
    if (this.activePanel === 'achievements') {
      this.renderAchievementsPanel();
    }
  }

  public setHasRunSave(hasSave: boolean): void {
    this.hasRunSave = hasSave;
    this.syncLoadButtonState();
  }

  public setSelectedDifficulty(difficulty: DifficultyId): void {
    this.selectedDifficulty = difficulty;
    this.setFooterText(`当前难度：${this.getDifficultyName(difficulty)}。点击开始选择初始职业。`);
  }

  public showPanel(panel: MenuPanelId): void {
    if (!this.panelNode || !this.panelTitleLabel || !this.panelBodyLabel || !this.panelContentNode) return;
    this.activePanel = panel;
    this.panelNode.active = true;
    this.panelContentNode.removeAllChildren();

    if (panel === 'settings') {
      this.renderSettingsPanel();
      return;
    }

    if (panel === 'achievements') {
      this.renderAchievementsPanel();
      return;
    }

    this.panelTitleLabel.string = '鸣谢';
    this.panelBodyLabel.string = '项目方向：Battleheart 风格 2D 小队实时指挥。\n\n玩法原型、系统拆分与菜单/战斗串联由当前工程主线驱动完成。';
    this.makePanelBodyNote('CreditsNote', '当前版本优先保证可玩性、存档与交互链路成立，美术仍以占位资源为主。', 0, -10, 420, new Color(191, 219, 254, 255));
  }

  public hidePanel(): void {
    this.activePanel = null;
    if (this.panelNode) {
      this.panelNode.active = false;
    }
  }

  private renderSettingsPanel(): void {
    if (!this.panelTitleLabel || !this.panelBodyLabel || !this.panelContentNode) return;
    this.panelTitleLabel.string = '设置';
    this.panelBodyLabel.string = '音量调整会直接保存到本地配置。当前原型尚未接入正式 BGM / SFX，但数值会持久化。';

    this.makeSettingRow('Master', '总音量', 'master', this.settings.master, 56);
    this.makeSettingRow('Music', '音乐', 'music', this.settings.music, 6);
    this.makeSettingRow('Sfx', '音效', 'sfx', this.settings.sfx, -44);
  }

  private renderAchievementsPanel(): void {
    if (!this.panelTitleLabel || !this.panelBodyLabel || !this.panelContentNode) return;
    this.panelTitleLabel.string = '成就';
    this.panelBodyLabel.string = '当前仅接入一个基础成就，用于确认单关通关链路。';

    const unlocked = this.achievements.firstClear;
    const row = new Node('AchievementRow');
    row.layer = Layers.Enum.UI_2D;
    this.panelContentNode.addChild(row);
    row.setPosition(new Vec3(0, 18, 0));
    row.addComponent(UITransform).setContentSize(420, 64);
    const bg = row.addComponent(Sprite);
    bg.color = unlocked ? new Color(21, 128, 61, 255) : new Color(51, 65, 85, 255);

    const title = this.makeInlineLabel(row, 'AchTitle', -190, 12, 360, 16, new Color(248, 250, 252, 255));
    title.string = '初次通关';
    const desc = this.makeInlineLabel(row, 'AchDesc', -190, -12, 360, 12, new Color(226, 232, 240, 255));
    desc.string = unlocked ? '已解锁：完成当前唯一关卡并进入 victory。' : '未解锁：完成当前唯一关卡并进入 victory。';
    const badge = this.makeInlineLabel(row, 'AchBadge', 132, 0, 120, 14, new Color(253, 224, 71, 255));
    badge.string = unlocked ? '已解锁' : '未解锁';
  }

  private makeSettingRow(name: string, labelText: string, key: keyof SavedAudioSettings, value: number, y: number): void {
    if (!this.panelContentNode) return;
    const row = new Node(`${name}Row`);
    row.layer = Layers.Enum.UI_2D;
    this.panelContentNode.addChild(row);
    row.setPosition(new Vec3(0, y, 0));
    row.addComponent(UITransform).setContentSize(420, 40);

    const label = this.makeInlineLabel(row, `${name}Label`, -190, 0, 120, 14, new Color(248, 250, 252, 255));
    label.string = labelText;
    const valueLabel = this.makeInlineLabel(row, `${name}Value`, 0, 0, 80, 14, new Color(251, 191, 36, 255));
    valueLabel.string = `${value}%`;

    this.makePanelButton(row, `${name}Minus`, '-', 110, 0, 34, 28, new Color(30, 41, 59, 255), () => this.adjustSetting(key, -10));
    this.makePanelButton(row, `${name}Plus`, '+', 156, 0, 34, 28, new Color(30, 41, 59, 255), () => this.adjustSetting(key, 10));
  }

  private adjustSetting(key: keyof SavedAudioSettings, delta: number): void {
    const nextValue = Math.max(0, Math.min(100, this.settings[key] + delta));
    this.onSettingAdjusted?.(key, nextValue);
  }

  private syncLoadButtonState(): void {
    if (!this.footerLabel) return;
    this.footerLabel.string = this.hasRunSave
      ? '当前版本：检测到本地存档，可直接载入继续。'
      : this.footerLabel.string;
  }

  private createPanel(): void {
    this.panelNode = new Node('MenuPanel');
    this.panelNode.layer = Layers.Enum.UI_2D;
    this.node.addChild(this.panelNode);
    this.panelNode.addComponent(UITransform).setContentSize(520, 340);
    this.panelNode.setPosition(new Vec3(0, -8, 0));
    const bg = this.panelNode.addComponent(Sprite);
    bg.color = new Color(15, 23, 42, 242);
    this.panelNode.active = false;

    this.panelTitleLabel = this.makePanelLabel(this.panelNode, 'PanelTitle', -220, 132, 440, 24, new Color(251, 191, 36, 255));
    this.panelBodyLabel = this.makePanelLabel(this.panelNode, 'PanelBody', -220, 84, 440, 72, new Color(226, 232, 240, 255));
    if (this.panelBodyLabel) {
      this.panelBodyLabel.lineHeight = 20;
    }

    this.panelContentNode = new Node('PanelContent');
    this.panelContentNode.layer = Layers.Enum.UI_2D;
    this.panelNode.addChild(this.panelContentNode);
    this.panelContentNode.setPosition(new Vec3(0, -10, 0));
    this.panelContentNode.addComponent(UITransform).setContentSize(440, 150);

    this.makePanelButton(this.panelNode, 'ClosePanel', '关闭', 0, -136, 136, 40, new Color(30, 41, 59, 255), () => this.hidePanel());
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

  private async loadBackground(bg: Sprite): Promise<void> {
    const frame = await this.backgroundResolver.resolve('menu_arena_01');
    if (!frame || !bg.node.parent) return;
    bg.spriteFrame = frame;
    bg.color = new Color(255, 255, 255, 255);
  }

  private makeDifficultyButton(name: string, text: string, x: number, y: number, difficulty: DifficultyId): void {
    this.makePanelButton(this.node, name, text, x, y, 108, 34, new Color(30, 64, 175, 255), () => {
      this.selectedDifficulty = difficulty;
      this.onDifficultySelected?.(difficulty);
      this.setFooterText(`当前难度：${this.getDifficultyName(difficulty)}。点击开始选择初始职业。`);
    });
  }

  private getDifficultyName(difficulty: DifficultyId): string {
    if (difficulty === 'beginner') return '新手';
    if (difficulty === 'normal') return '普通';
    if (difficulty === 'hard') return '困难';
    return '无尽';
  }

  private makePanelButton(parent: Node, name: string, text: string, x: number, y: number, width: number, height: number, color: Color, onClick: () => void): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, height);
    const sprite = node.addComponent(Sprite);
    sprite.color = color;
    node.addComponent(Button);
    node.on(Button.EventType.CLICK, onClick, this);

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
    node.addComponent(UITransform).setContentSize(width, fontSize + 14);
    const label = node.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 8;
    label.color = color;
    return label;
  }

  private makePanelLabel(parent: Node, name: string, x: number, y: number, width: number, fontSize: number, color: Color): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, 120);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 6;
    label.color = color;
    return label;
  }

  private makeInlineLabel(parent: Node, name: string, x: number, y: number, width: number, fontSize: number, color: Color): Label {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(new Vec3(x, y, 0));
    node.addComponent(UITransform).setContentSize(width, fontSize + 10);
    const label = node.addComponent(Label);
    label.fontSize = fontSize;
    label.lineHeight = fontSize + 4;
    label.color = color;
    return label;
  }

  private makePanelBodyNote(name: string, text: string, x: number, y: number, width: number, color: Color): void {
    if (!this.panelContentNode) return;
    const label = this.makeInlineLabel(this.panelContentNode, name, x, y, width, 13, color);
    label.string = text;
    label.lineHeight = 20;
  }
}
