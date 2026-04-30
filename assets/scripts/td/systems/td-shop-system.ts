import { TD_SHOP_SLOTS } from '../config/td-game-config';
import { getTDHeroConfig } from '../config/td-hero-config';
import { TD_SHOP_WEIGHT_TABLE } from '../config/td-shop-config';
import type { TDHeroId, TDShopSlotState } from '../types';

export class TDShopSystem {
  private entries: Array<TDHeroId | undefined> = new Array<TDHeroId | undefined>(TD_SHOP_SLOTS).fill(undefined);
  private cursor = 0;

  public refresh(): TDShopSlotState[] {
    for (let i = 0; i < TD_SHOP_SLOTS; i += 1) {
      this.entries[i] = this.pickWeightedHero();
    }
    return this.getEntries();
  }

  public getEntries(): TDShopSlotState[] {
    return this.entries.map((heroId, slotIndex) => ({
      slotIndex,
      heroId,
      cost: heroId ? getTDHeroConfig(heroId).cost : 0,
    }));
  }

  public setEntries(heroIds: Array<TDHeroId | undefined>): void {
    this.entries = new Array<TDHeroId | undefined>(TD_SHOP_SLOTS).fill(undefined);
    heroIds.slice(0, TD_SHOP_SLOTS).forEach((heroId, index) => {
      this.entries[index] = heroId;
    });
  }

  public peek(slotIndex: number): TDHeroId | undefined {
    return this.entries[slotIndex];
  }

  public take(slotIndex: number): TDHeroId | undefined {
    const heroId = this.entries[slotIndex];
    if (!heroId) return undefined;
    this.entries[slotIndex] = undefined;
    return heroId;
  }

  private pickWeightedHero(): TDHeroId {
    const total = TD_SHOP_WEIGHT_TABLE.reduce((sum, entry) => sum + entry.weight, 0);
    const value = this.cursor % total;
    this.cursor += 17;
    let acc = 0;
    for (const entry of TD_SHOP_WEIGHT_TABLE) {
      acc += entry.weight;
      if (value < acc) return entry.heroId;
    }
    return TD_SHOP_WEIGHT_TABLE[0].heroId;
  }
}
