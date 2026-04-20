import { SHOP_UNIT_POOL } from '../config/unit-config';
import { UnitId } from '../models/types';
import { SQUAD_SHOP_SLOTS } from '../squad/config/squad-ui-layout-config';
import { pickN } from '../utils/random';

export class ShopSystem {
  private entries: UnitId[] = [];

  public refresh(): UnitId[] {
    this.entries = pickN(SHOP_UNIT_POOL, SQUAD_SHOP_SLOTS);
    return [...this.entries];
  }

  public getEntries(): UnitId[] {
    return [...this.entries];
  }

  public setEntries(entries: UnitId[]): void {
    this.entries = [...entries];
  }

  public peek(slotIndex: number): UnitId | null {
    if (slotIndex < 0 || slotIndex >= this.entries.length) {
      return null;
    }
    return this.entries[slotIndex];
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
