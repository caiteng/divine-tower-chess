import { UnitConfig, UnitId } from '../models/types';

export const UNIT_CONFIG: Record<UnitId, UnitConfig> = {
  archer: { id: 'archer', name: '弓箭手', cost: 3, baseDamage: 18, attackInterval: 1, range: 4, maxHp: 140, skillType: 'single' },
  paladin: { id: 'paladin', name: '圣骑士', cost: 4, baseDamage: 16, attackInterval: 1.2, range: 1.8, maxHp: 260, skillType: 'none' },
  shield_guard: { id: 'shield_guard', name: '盾卫', cost: 3, baseDamage: 12, attackInterval: 1.1, range: 1.5, maxHp: 300, skillType: 'none' },
  warrior: { id: 'warrior', name: '战士', cost: 3, baseDamage: 22, attackInterval: 1, range: 1.8, maxHp: 220, skillType: 'single' },
  mage: { id: 'mage', name: '法师', cost: 4, baseDamage: 14, attackInterval: 1.4, range: 3.8, maxHp: 130, skillType: 'aoe' },
  priest: { id: 'priest', name: '牧师', cost: 4, baseDamage: 6, attackInterval: 1.5, range: 3.5, maxHp: 160, healPower: 20, skillType: 'heal' },
  cavalry: { id: 'cavalry', name: '骑兵', cost: 4, baseDamage: 24, attackInterval: 0.95, range: 2.2, maxHp: 200, skillType: 'single' },
  spearman: { id: 'spearman', name: '枪兵', cost: 3, baseDamage: 19, attackInterval: 1, range: 2.6, maxHp: 170, skillType: 'single' },
  berserker: { id: 'berserker', name: '狂战士', isDivine: true, cost: 0, baseDamage: 50, attackInterval: 0.7, range: 2.2, maxHp: 360, skillType: 'single' },
  light_mage: { id: 'light_mage', name: '光法师', isDivine: true, cost: 0, baseDamage: 28, attackInterval: 1.1, range: 4.2, maxHp: 240, healPower: 40, skillType: 'aoe' },
};

export const SHOP_UNIT_POOL: UnitId[] = [
  'archer',
  'paladin',
  'shield_guard',
  'warrior',
  'mage',
  'priest',
  'cavalry',
  'spearman',
];
