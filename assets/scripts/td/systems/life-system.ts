export class TDLifeSystem {
  public damage(currentLife: number, amount: number): number {
    const damage = Math.max(0, Math.floor(amount));
    return Math.max(0, currentLife - damage);
  }

  public isDefeated(life: number): boolean {
    return life <= 0;
  }
}
