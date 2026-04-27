import type { UnitConfig, UnitId } from '../models/types';

export const UNIT_CONFIG: Record<UnitId, UnitConfig> = {
  archer: {
    id: 'archer', name: '猎人', cost: 3, baseDamage: 16, armor: 2, armorPierceRatio: 0.05, attackInterval: 0.8, maxHp: 135,
    detectionRange: 340, attackRange: 250, moveSpeed: 120, projectileSpeed: 560, skillType: 'single', behaviorRole: 'ranged',
  },
  shield_guard: {
    id: 'shield_guard', name: '盾卫', cost: 3, baseDamage: 10, armor: 14, armorPierceRatio: 0.05, attackInterval: 1.6, maxHp: 320,
    detectionRange: 240, attackRange: 68, moveSpeed: 90, skillType: 'none', behaviorRole: 'melee',
  },
  warrior: {
    id: 'warrior', name: '战士', cost: 3, baseDamage: 22, armor: 8, armorPierceRatio: 0.2, attackInterval: 1.05, maxHp: 220,
    detectionRange: 260, attackRange: 72, moveSpeed: 130, skillType: 'single', behaviorRole: 'melee',
  },
  mage: {
    id: 'mage', name: '法师', cost: 4, baseDamage: 26, armor: 1, armorPierceRatio: 0.65, attackInterval: 1.75, maxHp: 120,
    detectionRange: 360, attackRange: 230, moveSpeed: 105, projectileSpeed: 500, skillRadius: 100, skillType: 'aoe', behaviorRole: 'mage',
  },
  priest: {
    id: 'priest', name: '牧师', cost: 4, baseDamage: 0, armor: 7, armorPierceRatio: 0, attackInterval: 0.8, maxHp: 185,
    detectionRange: 360, attackRange: 210, moveSpeed: 110, healPower: 20, skillType: 'heal', behaviorRole: 'healer',
  },
  spearman: {
    id: 'spearman', name: '枪兵', cost: 3, baseDamage: 20, armor: 3, armorPierceRatio: 0.45, attackInterval: 1.2, maxHp: 190,
    detectionRange: 270, attackRange: 90, moveSpeed: 125, skillType: 'single', behaviorRole: 'melee',
  },
  berserker: {
    id: 'berserker', name: '狂战士', isDivine: true, cost: 0, baseDamage: 46, armor: 9, armorPierceRatio: 0.35, attackInterval: 0.75, maxHp: 360,
    detectionRange: 300, attackRange: 80, moveSpeed: 160, skillType: 'single', behaviorRole: 'melee',
  },
  light_mage: {
    id: 'light_mage', name: '圣谕者', isDivine: true, cost: 0, baseDamage: 0, armor: 9, armorPierceRatio: 0, attackInterval: 0.68, maxHp: 260,
    detectionRange: 400, attackRange: 260, moveSpeed: 120, projectileSpeed: 620, healPower: 40, skillType: 'heal', behaviorRole: 'healer',
  },
};

export const SHOP_UNIT_POOL: UnitId[] = [
  'archer', 'shield_guard', 'warrior', 'mage', 'priest', 'spearman',
];
