export class TDEconomySystem {
  private gold = 0;
  private stardust = 0;

  public setGold(value: number): void {
    this.gold = Math.max(0, Math.floor(value));
  }

  public getGold(): number {
    return this.gold;
  }

  public earnGold(amount: number): number {
    this.gold += Math.max(0, Math.floor(amount));
    return this.gold;
  }

  public spendGold(amount: number): boolean {
    const cost = Math.max(0, Math.floor(amount));
    if (cost > this.gold) return false;
    this.gold -= cost;
    return true;
  }

  public setStardust(value: number): void {
    this.stardust = Math.max(0, Math.floor(value));
  }

  public getStardust(): number {
    return this.stardust;
  }

  public earnStardust(amount: number): number {
    this.stardust += Math.max(0, Math.floor(amount));
    return this.stardust;
  }
}
