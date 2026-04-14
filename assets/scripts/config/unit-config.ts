import { UnitConfig, UnitId } from '../models/types';

export const UNIT_CONFIG: Record<UnitId, UnitConfig> = {
  archer: {
    id: 'archer', name: '弓箭手', cost: 3, baseDamage: 18, attackInterval: 1, maxHp: 140,
    detectionRange: 340, attackRange: 250, moveSpeed: 120, projectileSpeed: 560, skillType: 'single', behaviorRole: 'ranged',
  },
  paladin: {
    id: 'paladin', name: '圣骑士', cost: 4, baseDamage: 16, attackInterval: 1.2, maxHp: 260,
    detectionRange: 220, attackRange: 70, moveSpeed: 110, skillType: 'none', behaviorRole: 'melee',
  },
  shield_guard: {
    id: 'shield_guard', name: '盾卫', cost: 3, baseDamage: 12, attackInterval: 1.1, maxHp: 300,
    detectionRange: 240, attackRange: 68, moveSpeed: 90, skillType: 'none', behaviorRole: 'melee',
  },
  warrior: {
    id: 'warrior', name: '战士', cost: 3, baseDamage: 22, attackInterval: 1, maxHp: 220,
    detectionRange: 260, attackRange: 72, moveSpeed: 130, skillType: 'single', behaviorRole: 'melee',
  },
  mage: {
    id: 'mage', name: '法师', cost: 4, baseDamage: 14, attackInterval: 1.4, maxHp: 130,
    detectionRange: 360, attackRange: 230, moveSpeed: 105, projectileSpeed: 500, skillRadius: 100, skillType: 'aoe', behaviorRole: 'mage',
  },
  priest: {
    id: 'priest', name: '牧师', cost: 4, baseDamage: 6, attackInterval: 1.5, maxHp: 160,
    detectionRange: 360, attackRange: 210, moveSpeed: 110, healPower: 20, skillType: 'heal', behaviorRole: 'healer',
  },
  cavalry: {
    id: 'cavalry', name: '骑兵', cost: 4, baseDamage: 24, attackInterval: 0.95, maxHp: 200,
    detectionRange: 280, attackRange: 78, moveSpeed: 170, skillType: 'single', behaviorRole: 'melee',
  },
  spearman: {
    id: 'spearman', name: '枪兵', cost: 3, baseDamage: 19, attackInterval: 1, maxHp: 170,
    detectionRange: 270, attackRange: 90, moveSpeed: 125, skillType: 'single', behaviorRole: 'melee',
  },
  berserker: {
    id: 'berserker', name: '狂战士', isDivine: true, cost: 0, baseDamage: 50, attackInterval: 0.7, maxHp: 360,
    detectionRange: 300, attackRange: 80, moveSpeed: 160, skillType: 'single', behaviorRole: 'melee',
  },
  light_mage: {
    id: 'light_mage', name: '光法师', isDivine: true, cost: 0, baseDamage: 28, attackInterval: 1.1, maxHp: 240,
    detectionRange: 400, attackRange: 260, moveSpeed: 120, projectileSpeed: 620, healPower: 40, skillType: 'heal', behaviorRole: 'healer',
  },
};

export const SHOP_UNIT_POOL: UnitId[] = [
  'archer', 'paladin', 'shield_guard', 'warrior', 'mage', 'priest', 'cavalry', 'spearman',
];
