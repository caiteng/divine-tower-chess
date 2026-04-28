import type { UnitId } from '../../models/types';

export type SkillEffectType = 'damage' | 'aoe_damage' | 'buff' | 'taunt' | 'warcry' | 'heal';

export interface UnitSkillConfig {
  id: string;
  unitId: UnitId;
  name: string;
  minStar: 1 | 2 | 3;
  cooldown: number;
  range?: number;
  rangeMultiplier?: number;
  castTime?: number;
  effectType: SkillEffectType;
  damageMultiplier?: number;
  flatBonus?: number;
  armorPierceBonus?: number;
  radius?: number;
  bossPriority?: boolean;
  skillIcon?: string;
}

export const UNIT_SKILL_CONFIGS: UnitSkillConfig[] = [
  {
    id: 'archer_snipe',
    unitId: 'archer',
    name: '精准狙击',
    minStar: 2,
    cooldown: 8,
    rangeMultiplier: 1.25,
    castTime: 0.45,
    effectType: 'damage',
    damageMultiplier: 2.8,
    flatBonus: 18,
    armorPierceBonus: 0.35,
    bossPriority: true,
    skillIcon: 'textures/units/archer/skill_icon_precision_snipe',
  },
];

export function getAvailableSkills(unitId: UnitId, star: 1 | 2 | 3): UnitSkillConfig[] {
  return UNIT_SKILL_CONFIGS.filter((skill) => skill.unitId === unitId && star >= skill.minStar);
}

export function getSkillConfig(skillId: string): UnitSkillConfig | undefined {
  return UNIT_SKILL_CONFIGS.find((skill) => skill.id === skillId);
}
