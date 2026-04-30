import type { TDHeroId } from '../types';

export interface TDCaptainSkillConfig {
  skillId: string;
  name: string;
  captainId: TDHeroId;
  cooldown: number;
  radius: number;
  damage: number;
  slowSeconds?: number;
  description: string;
}

export const TD_CAPTAIN_SKILLS: Record<string, TDCaptainSkillConfig> = {
  ranger_arrow_rain: {
    skillId: 'ranger_arrow_rain',
    name: '箭雨',
    captainId: 'archer',
    cooldown: 12,
    radius: 170,
    damage: 120,
    description: '对范围内敌人造成物理箭雨伤害。',
  },
  paladin_bulwark: {
    skillId: 'paladin_bulwark',
    name: '圣盾领域',
    captainId: 'knight',
    cooldown: 16,
    radius: 180,
    damage: 40,
    slowSeconds: 2,
    description: '对范围敌人造成少量伤害并减速。',
  },
  arcane_meteor: {
    skillId: 'arcane_meteor',
    name: '奥术陨星',
    captainId: 'mage',
    cooldown: 15,
    radius: 150,
    damage: 180,
    description: '对范围敌人造成魔法爆发伤害。',
  },
};

export const TD_CAPTAIN_XP_THRESHOLDS = [0, 30, 75, 135, 220];
