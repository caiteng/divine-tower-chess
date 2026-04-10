import { SHOP_UNIT_POOL } from '../config/unit-config';
import { UnitId } from '../models/types';
import { pickN } from '../utils/random';

export class ShopSystem {
  private entries: UnitId[] = [];

  public refresh(): UnitId[] {
    this.entries = pickN(SHOP_UNIT_POOL, 3);
    return [...this.entries];
  }

  public getEntries(): UnitId[] {
    return [...this.entries];
  }

  public take(slotIndex: number): UnitId | null {
    if (slotIndex < 0 || slotIndex >= this.entries.length) {
      return null;
    }
    const unitId = this.entries[slotIndex];
    this.entries.splice(slotIndex, 1);
    return unitId;
  }
}
