import { GameSession } from './game-session';
import { DifficultyId } from '../models/types';

/**
 * Cocos Creator 接入建议：
 * 1. 将该控制器挂在主场景节点上。
 * 2. 将按钮事件绑定到 startGame/refreshShop/buy/place/movePlaced/beginBattle。
 * 3. 在 update(dt) 中调用 tick。
 */
export class GameController {
  private readonly session = new GameSession();

  public startGame(difficulty: DifficultyId): void {
    this.session.startNewGame(difficulty);
  }

  public refreshShop(): boolean {
    return this.session.refreshShopByCost();
  }

  public buy(slotIndex: number): boolean {
    return this.session.buyShopUnit(slotIndex);
  }

  public place(instanceId: string, lane: number, tileIndex: number): boolean {
    return this.session.placeUnit(instanceId, lane, tileIndex);
  }

  public movePlaced(instanceId: string, lane: number, tileIndex: number): boolean {
    return this.session.movePlacedUnit(instanceId, lane, tileIndex);
  }

  public beginBattle(): void {
    this.session.beginBattle();
  }

  public tick(dt: number): void {
    this.session.tickBattle(dt);
  }

  public snapshot() {
    return this.session.getSnapshot();
  }
}
