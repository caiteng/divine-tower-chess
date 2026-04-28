import { ENEMY_STATS, SQUAD_UNIT_STATS } from '../config/squad-battle-config';
import { getSkillConfig } from '../config/skill-config';
import type { UnitSkillConfig } from '../config/skill-config';
import type { BattleEffectState, EnemyUnitState, SquadUnitState } from '../types';
import { applyArmor, scaleArmorPierce } from './attack-system';
import { distance } from './math';

export interface SkillCastResult {
  casted: boolean;
  reason?: string;
  kills: number;
  effects: Omit<BattleEffectState, 'id' | 'age'>[];
}

export class SkillSystem {
  public tickCooldowns(allies: SquadUnitState[], dt: number): void {
    for (const ally of allies) {
      if (!ally.skillCooldowns) continue;
      for (const [skillId, cooldown] of Object.entries(ally.skillCooldowns)) {
        ally.skillCooldowns[skillId] = Math.max(0, cooldown - dt);
      }
    }
  }

  public cast(skillId: string, caster: SquadUnitState, enemies: EnemyUnitState[]): SkillCastResult {
    const skill = getSkillConfig(skillId);
    if (!skill) return this.fail('技能不存在。');
    if (!caster.alive) return this.fail('施放失败：单位已倒下。');
    if (skill.unitId !== caster.unitId || caster.star < skill.minStar) return this.fail('施放失败：该单位未解锁此技能。');
    if ((caster.skillCooldowns?.[skill.id] ?? 0) > 0) return this.fail('施放失败：技能冷却中。');

    if (skill.effectType === 'damage') {
      return this.castDamageSkill(skill, caster, enemies);
    }

    return this.fail('施放失败：该技能类型已预留，尚未接入效果。');
  }

  private castDamageSkill(skill: UnitSkillConfig, caster: SquadUnitState, enemies: EnemyUnitState[]): SkillCastResult {
    const range = skill.range ?? SQUAD_UNIT_STATS[caster.unitId].attackRange * (skill.rangeMultiplier ?? 1);
    const target = this.pickLockedTarget(caster, enemies, range, skill);
    if (!target) return this.fail('施放失败：范围内没有可锁定敌人。');

    const casterStats = SQUAD_UNIT_STATS[caster.unitId];
    const starMultiplier = caster.star === 3 && skill.id === 'archer_snipe' ? 3.3 / Math.max(0.001, skill.damageMultiplier ?? 1) : 1;
    const rawDamage = (casterStats.attackDamage * (skill.damageMultiplier ?? 1) * starMultiplier + (skill.flatBonus ?? 0)) * (1 + (caster.star - 1) * 0.8);
    const pierce = scaleArmorPierce(casterStats.armorPierceRatio + (skill.armorPierceBonus ?? 0), caster.star);
    const damage = applyArmor(rawDamage, ENEMY_STATS[target.enemyType].armor, pierce);
    target.currentHp = Math.max(0, target.currentHp - damage);
    target.alive = target.currentHp > 0;
    caster.skillCooldowns = {
      ...(caster.skillCooldowns ?? {}),
      [skill.id]: skill.cooldown,
    };
    caster.skillAnimationTimeLeft = skill.castTime ?? 0.45;

    const effects: Omit<BattleEffectState, 'id' | 'age'>[] = [
      { kind: 'archer_lockon', to: { ...target.position }, ttl: 0.45, variant: 'archer_precision' },
      { kind: 'archer_charge', to: { ...caster.position }, ttl: 0.45, variant: 'archer_precision' },
      { kind: 'projectile', from: { ...caster.position }, to: { ...target.position }, ttl: 0.22, variant: 'archer_precision' },
      { kind: 'damage', to: { ...target.position }, value: damage, ttl: 0.8 },
      { kind: 'archer_hit', to: { ...target.position }, ttl: 0.38, variant: 'archer_precision' },
    ];
    if (!target.alive) {
      effects.push({ kind: 'death', to: { ...target.position }, ttl: 0.62 });
    }
    return { casted: true, kills: target.alive ? 0 : 1, effects };
  }

  private pickLockedTarget(caster: SquadUnitState, enemies: EnemyUnitState[], range: number, skill: UnitSkillConfig): EnemyUnitState | undefined {
    const focused = caster.command.type === 'focus_enemy' && caster.command.targetEnemyId
      ? enemies.find((enemy) => enemy.instanceId === caster.command.targetEnemyId && enemy.alive)
      : undefined;
    if (focused && distance(caster.position, focused.position) <= range) return focused;

    const candidates = enemies.filter((enemy) => enemy.alive && distance(caster.position, enemy.position) <= range);
    if (skill.bossPriority) {
      const boss = candidates.find((enemy) => enemy.enemyType === 'boss');
      if (boss) return boss;
      const brute = candidates.find((enemy) => enemy.enemyType === 'brute');
      if (brute) return brute;
    }

    return candidates
      .sort((a, b) => b.currentHp - a.currentHp || distance(caster.position, a.position) - distance(caster.position, b.position))[0];
  }

  private fail(reason: string): SkillCastResult {
    return { casted: false, reason, kills: 0, effects: [] };
  }
}
