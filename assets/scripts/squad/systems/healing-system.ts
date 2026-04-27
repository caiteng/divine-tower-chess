import { SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import type { SquadUnitState } from '../types';
import { distance } from './math';

export class HealingSystem {
  public healIfPossible(priest: SquadUnitState, ally: SquadUnitState, allyMaxHp: number): { casted: boolean; actualHeal: number } {
    if (!priest.alive || !ally.alive) return { casted: false, actualHeal: 0 };
    const cfg = SQUAD_UNIT_STATS[priest.unitId];
    const scaledHeal = (cfg.healPower ?? 0) * priest.star;
    if (scaledHeal <= 0 || priest.attackCooldownLeft > 0) return { casted: false, actualHeal: 0 };

    const dist = distance(priest.position, ally.position);
    if (dist > cfg.attackRange) {
      return { casted: false, actualHeal: 0 };
    }

    // 满血也保持治疗动作：这里仍触发冷却并维持 channel 语义。
    const before = ally.currentHp;
    ally.currentHp = Math.min(allyMaxHp, ally.currentHp + scaledHeal);
    const actualHeal = Math.max(0, ally.currentHp - before);
    priest.attackCooldownLeft = cfg.attackInterval;
    return { casted: true, actualHeal };
  }
}
