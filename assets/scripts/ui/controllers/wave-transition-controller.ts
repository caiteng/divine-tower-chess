import { _decorator, Component, Node, Tween, tween, Vec3 } from 'cc';
import type { SquadBattleSnapshot } from '../../squad/types';

const { ccclass } = _decorator;

@ccclass('WaveTransitionController')
export class WaveTransitionController extends Component {
  private prepPanelNode: Node | null = null;
  private battlefieldNode: Node | null = null;
  private prevPrepState: string | null = null;

  public bind(prepPanelNode: Node, battlefieldNode: Node): void {
    this.prepPanelNode = prepPanelNode;
    this.battlefieldNode = battlefieldNode;
  }

  public sync(snapshot: SquadBattleSnapshot): void {
    if (!this.prepPanelNode || !this.battlefieldNode) return;
    const prepState = snapshot.uiState.prepPanel;
    if (prepState !== this.prevPrepState) {
      this.prevPrepState = prepState;
      if (prepState === 'visible' || prepState === 'rising') {
        this.prepPanelNode.active = true;
        this.tweenPrepTo(new Vec3(0, -120, 0));
      } else if (prepState === 'falling') {
        this.prepPanelNode.active = true;
        this.tweenPrepTo(new Vec3(0, -420, 0));
      } else {
        this.prepPanelNode.active = false;
        this.prepPanelNode.setPosition(new Vec3(0, -420, 0));
      }
    }
  }

  private tweenPrepTo(target: Vec3): void {
    if (!this.prepPanelNode) return;
    Tween.stopAllByTarget(this.prepPanelNode);
    tween(this.prepPanelNode)
      .to(0.35, { position: target } as any)
      .start();
  }
}
