import { _decorator, Color, Component, Label, Layers, Node, Sprite, UITransform, Vec3 } from 'cc';
import type { SquadBattleSnapshot } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('WaveTransitionController')
export class WaveTransitionController extends Component {
  private prepPanelNode: Node | null = null;
  private battlefieldNode: Node | null = null;
  private hudNode: Node | null = null;
  private commandNode: Node | null = null;
  private curtainNode: Node | null = null;
  private curtainLabel: Label | null = null;

  public bind(prepPanelNode: Node, battlefieldNode: Node, hudNode: Node, commandNode: Node): void {
    this.prepPanelNode = prepPanelNode;
    this.battlefieldNode = battlefieldNode;
    this.hudNode = hudNode;
    this.commandNode = commandNode;
    this.ensureCurtain();
  }

  public sync(snapshot: SquadBattleSnapshot): void {
    if (!this.prepPanelNode || !this.battlefieldNode || !this.hudNode || !this.commandNode) return;

    const showingPrep = snapshot.phase === 'prep' || snapshot.uiState.prepPanel === 'visible' || snapshot.uiState.prepPanel === 'rising';
    const showingBattle = snapshot.phase === 'battle' || snapshot.uiState.prepPanel === 'falling' || snapshot.uiState.prepPanel === 'hidden';
    const transitionActive = snapshot.uiState.transitionProgress < 1 || snapshot.uiState.prepPanel === 'rising' || snapshot.uiState.prepPanel === 'falling';

    this.prepPanelNode.active = showingPrep;
    this.battlefieldNode.active = showingBattle;
    this.hudNode.active = showingBattle;
    this.commandNode.active = showingBattle;

    this.prepPanelNode.setPosition(new Vec3(0, -20, 0));
    this.battlefieldNode.setPosition(new Vec3(0, -24, 0));
    this.syncCurtain(snapshot, transitionActive);
  }

  private ensureCurtain(): void {
    if (this.curtainNode) return;
    const curtain = new Node('SceneCurtain');
    curtain.layer = Layers.Enum.UI_2D;
    this.node.addChild(curtain);
    curtain.addComponent(UITransform).setContentSize(960, 640);

    const fade = new Node('FullFade');
    fade.layer = Layers.Enum.UI_2D;
    curtain.addChild(fade);
    fade.addComponent(UITransform).setContentSize(960, 640);
    const fadeSprite = fade.addComponent(Sprite);
    fadeSprite.color = new Color(2, 6, 23, 220);

    this.makeCurtainBand(curtain, 'TopBand', 168);
    this.makeCurtainBand(curtain, 'BottomBand', -168);

    const labelNode = new Node('CurtainLabel');
    labelNode.layer = Layers.Enum.UI_2D;
    curtain.addChild(labelNode);
    labelNode.addComponent(UITransform).setContentSize(520, 44);
    this.curtainLabel = labelNode.addComponent(Label);
    this.curtainLabel.fontSize = 24;
    this.curtainLabel.lineHeight = 30;
    this.curtainLabel.color = new Color(248, 250, 252, 255);

    curtain.active = false;
    this.curtainNode = curtain;
  }

  private makeCurtainBand(parent: Node, name: string, y: number): void {
    const node = new Node(name);
    node.layer = Layers.Enum.UI_2D;
    parent.addChild(node);
    node.setPosition(new Vec3(0, y, 0));
    node.addComponent(UITransform).setContentSize(960, 164);
    const sprite = node.addComponent(Sprite);
    sprite.color = new Color(2, 6, 23, 238);
  }

  private syncCurtain(snapshot: SquadBattleSnapshot, active: boolean): void {
    if (!this.curtainNode || !this.curtainLabel) return;
    this.curtainNode.active = active;
    if (!active) return;

    if (snapshot.uiState.prepPanel === 'falling') {
      this.curtainLabel.string = '进入战斗';
      return;
    }
    if (snapshot.uiState.prepPanel === 'rising') {
      this.curtainLabel.string = '备战阶段';
      return;
    }
    this.curtainLabel.string = snapshot.phase === 'battle' ? '进入战斗' : '备战阶段';
  }
}
