import { _decorator, Component } from 'cc';
import { BattleSceneController } from './battle-scene-controller';

const { ccclass } = _decorator;

/**
 * @deprecated DOM prototype entry has been retired.
 * Keep this shim temporarily for compatibility with existing scene bindings.
 */
@ccclass('SquadBattleUi')
export class SquadBattleUi extends Component {
  public onLoad(): void {
    if (!this.node.getComponent(BattleSceneController)) {
      this.node.addComponent(BattleSceneController);
    }
    this.enabled = false;
  }
}
