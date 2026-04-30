import { TD_CAPTAIN_SKILLS, TD_CAPTAIN_XP_THRESHOLDS } from '../config/td-skill-config';
import type { TDCaptainState, TDEffectState, TDEnemyInstanceState, TDHeroId, TDVec2 } from '../types';
import { nextTdId } from './td-id';

function distance(a: TDVec2, b: TDVec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class TDCaptainSystem {
  public addXp(captain: TDCaptainState, amount: number): void {
    captain.xp += Math.max(0, Math.floor(amount));
    while (captain.level < TD_CAPTAIN_XP_THRESHOLDS.length && captain.xp >= TD_CAPTAIN_XP_THRESHOLDS[captain.level]) {
      captain.level += 1;
    }
  }

  public tick(captain: TDCaptainState, dt: number): void {
    for (const [skillId, cooldown] of Object.entries(captain.skillCooldowns)) {
      captain.skillCooldowns[skillId] = Math.max(0, cooldown - dt);
    }
  }

  public getDefaultSkillId(captainId?: TDHeroId): string {
    if (captainId === 'knight') return 'paladin_bulwark';
    if (captainId === 'mage') return 'arcane_meteor';
    return 'ranger_arrow_rain';
  }

  public cast(captain: TDCaptainState, skillId: string | undefined, target: TDVec2, enemies: TDEnemyInstanceState[]): { casted: boolean; effects: TDEffectState[]; killed: number; gold: number; xp: number; reason?: string } {
    const resolvedSkillId = skillId ?? this.getDefaultSkillId(captain.captainId);
    const skill = TD_CAPTAIN_SKILLS[resolvedSkillId];
    if (!skill) return { casted: false, effects: [], killed: 0, gold: 0, xp: 0, reason: 'unknown skill' };
    if ((captain.skillCooldowns[resolvedSkillId] ?? 0) > 0) return { casted: false, effects: [], killed: 0, gold: 0, xp: 0, reason: 'cooldown' };

    let killed = 0;
    let gold = 0;
    let xp = 0;
    const effects: TDEffectState[] = [{
      effectId: nextTdId('td_effect'),
      kind: 'skill',
      position: { ...target },
      label: skill.name,
      ttl: 1.2,
      age: 0,
    }];

    for (const enemy of enemies) {
      if (!enemy.alive || distance(enemy.position, target) > skill.radius) continue;
      enemy.currentHp = Math.max(0, enemy.currentHp - skill.damage);
      if (skill.slowSeconds) {
        enemy.status.slowedSeconds = Math.max(enemy.status.slowedSeconds ?? 0, skill.slowSeconds);
        enemy.speedMultiplier = Math.min(enemy.speedMultiplier, 0.5);
      }
      effects.push({
        effectId: nextTdId('td_effect'),
        kind: 'damage',
        position: { ...enemy.position },
        value: skill.damage,
        ttl: 0.9,
        age: 0,
      });
      if (enemy.currentHp <= 0 && enemy.alive) {
        enemy.alive = false;
        killed += 1;
        gold += enemy.tags.includes('boss') ? 8 : enemy.tags.includes('elite') ? 3 : 1;
        xp += enemy.tags.includes('boss') ? 25 : enemy.tags.includes('elite') ? 6 : 2;
      }
    }

    captain.skillCooldowns[resolvedSkillId] = skill.cooldown;
    this.addXp(captain, xp);
    return { casted: true, effects, killed, gold, xp };
  }
}
