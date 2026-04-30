import { getScaledTDHeroConfig, getTDHeroConfig } from '../config/td-hero-config';
import { TD_BENCH_SLOTS, TD_MERGE_STARS_CAP } from '../config/td-game-config';
import type { TDHeroId, TDHeroInstanceState, TDStar } from '../types';
import { nextTdId } from './td-id';

export function createTDHeroInstance(heroId: TDHeroId, star: TDStar = 1): TDHeroInstanceState {
  const cfg = getScaledTDHeroConfig(heroId, star);
  return {
    instanceId: nextTdId('td_hero'),
    heroId,
    star,
    level: 1,
    currentHp: cfg.maxHp,
    maxHp: cfg.maxHp,
    attackCooldownLeft: 0,
    targetPriority: 'first',
    kills: 0,
    skillCooldowns: {},
  };
}

export class TDRosterSystem {
  private bench: TDHeroInstanceState[] = [];
  private deployed: TDHeroInstanceState[] = [];

  public reset(): void {
    this.bench = [];
    this.deployed = [];
  }

  public setState(bench: TDHeroInstanceState[], deployed: TDHeroInstanceState[]): void {
    this.bench = bench.map((h) => ({ ...h, skillCooldowns: { ...h.skillCooldowns } }));
    this.deployed = deployed.map((h) => ({ ...h, skillCooldowns: { ...h.skillCooldowns } }));
  }

  public getBench(): TDHeroInstanceState[] {
    return this.bench;
  }

  public getDeployed(): TDHeroInstanceState[] {
    return this.deployed;
  }

  public getAll(): TDHeroInstanceState[] {
    return [...this.bench, ...this.deployed];
  }

  public addToBench(heroId: TDHeroId): TDHeroInstanceState | null {
    if (this.bench.length >= TD_BENCH_SLOTS) return null;
    const hero = createTDHeroInstance(heroId, 1);
    this.bench.push(hero);
    this.mergeAll();
    return this.getAll().find((h) => h.instanceId === hero.instanceId) ?? this.getAll().find((h) => h.heroId === heroId) ?? null;
  }

  public addInstanceToBench(hero: TDHeroInstanceState): boolean {
    if (this.bench.length >= TD_BENCH_SLOTS) return false;
    this.bench.push({ ...hero, deployedSlotId: undefined, skillCooldowns: { ...hero.skillCooldowns } });
    this.mergeAll();
    return true;
  }

  public find(instanceId: string): TDHeroInstanceState | undefined {
    return this.getAll().find((h) => h.instanceId === instanceId);
  }

  public place(instanceId: string, slotId: string): TDHeroInstanceState | null {
    const index = this.bench.findIndex((h) => h.instanceId === instanceId);
    if (index < 0) return null;
    const [hero] = this.bench.splice(index, 1);
    hero.deployedSlotId = slotId;
    this.deployed.push(hero);
    return hero;
  }

  public recall(instanceId: string): TDHeroInstanceState | null {
    if (this.bench.length >= TD_BENCH_SLOTS) return null;
    const index = this.deployed.findIndex((h) => h.instanceId === instanceId);
    if (index < 0) return null;
    const [hero] = this.deployed.splice(index, 1);
    hero.deployedSlotId = undefined;
    this.bench.push(hero);
    this.mergeAll();
    return hero;
  }

  public remove(instanceId: string): TDHeroInstanceState | null {
    const benchIndex = this.bench.findIndex((h) => h.instanceId === instanceId);
    if (benchIndex >= 0) {
      const [hero] = this.bench.splice(benchIndex, 1);
      return hero;
    }
    const deployedIndex = this.deployed.findIndex((h) => h.instanceId === instanceId);
    if (deployedIndex >= 0) {
      const [hero] = this.deployed.splice(deployedIndex, 1);
      return hero;
    }
    return null;
  }

  public mergeAll(): number {
    let merges = 0;
    let changed = true;
    while (changed) {
      changed = false;
      for (const star of [1, 2] as TDStar[]) {
        const byKey = new Map<string, TDHeroInstanceState[]>();
        for (const hero of this.getAll()) {
          if (hero.star !== star || hero.locked || hero.star >= TD_MERGE_STARS_CAP) continue;
          const key = `${hero.heroId}:${hero.star}`;
          const list = byKey.get(key) ?? [];
          list.push(hero);
          byKey.set(key, list);
        }

        for (const list of byKey.values()) {
          if (list.length < 3) continue;
          const sorted = [...list].sort((a, b) => {
            const aDeployed = a.deployedSlotId ? 1 : 0;
            const bDeployed = b.deployedSlotId ? 1 : 0;
            if (aDeployed !== bDeployed) return bDeployed - aDeployed;
            return b.kills - a.kills;
          });
          const keeper = sorted[0];
          const consumed = sorted.slice(1, 3);
          keeper.star = (star + 1) as TDStar;
          const scaled = getScaledTDHeroConfig(keeper.heroId, keeper.star);
          keeper.maxHp = scaled.maxHp;
          keeper.currentHp = Math.min(keeper.maxHp, Math.max(keeper.currentHp, Math.round(keeper.maxHp * 0.75)));
          keeper.kills = Math.max(keeper.kills, ...consumed.map((h) => h.kills));
          for (const dead of consumed) {
            this.remove(dead.instanceId);
          }
          merges += 1;
          changed = true;
          break;
        }
        if (changed) break;
      }
    }
    return merges;
  }

  public getSellPrice(hero: TDHeroInstanceState): number {
    const base = getTDHeroConfig(hero.heroId).cost;
    return Math.max(1, Math.floor((base * hero.star) / 2));
  }
}
