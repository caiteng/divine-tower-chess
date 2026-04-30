import type { TDHeroInstanceState, TDTowerSlotState } from '../types';

export class TDPlacementSystem {
  public canPlace(hero: TDHeroInstanceState | undefined, slot: TDTowerSlotState | undefined): boolean {
    if (!hero || !slot) return false;
    if (slot.locked) return false;
    if (slot.occupiedBy) return false;
    return true;
  }

  public place(hero: TDHeroInstanceState, slot: TDTowerSlotState): boolean {
    if (!this.canPlace(hero, slot)) return false;
    slot.occupiedBy = hero.instanceId;
    hero.deployedSlotId = slot.slotId;
    return true;
  }

  public clearSlotForHero(slots: TDTowerSlotState[], heroInstanceId: string): void {
    for (const slot of slots) {
      if (slot.occupiedBy === heroInstanceId) {
        slot.occupiedBy = undefined;
      }
    }
  }
}
