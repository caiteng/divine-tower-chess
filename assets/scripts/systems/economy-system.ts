export class EconomySystem {
  private gold = 0;

  public setStartingGold(value: number): void {
    this.gold = value;
  }

  public setGold(value: number): void {
    this.gold = Math.max(0, Math.floor(value));
  }

  public canSpend(cost: number): boolean {
    return this.gold >= cost;
  }

  public spend(cost: number): boolean {
    if (!this.canSpend(cost)) {
      return false;
    }
    this.gold -= cost;
    return true;
  }

  public earn(amount: number): void {
    this.gold += amount;
  }

  public getGold(): number {
    return this.gold;
  }
}
