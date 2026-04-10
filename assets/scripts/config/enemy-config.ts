import { EnemyConfig, EnemyId } from '../models/types';

export const ENEMY_CONFIG: Record<EnemyId, EnemyConfig> = {
  slime: { id: 'slime', name: '史莱姆', maxHp: 80, speed: 1.2, goldReward: 1, crystalDamage: 1 },
  wolf: { id: 'wolf', name: '恶狼', maxHp: 140, speed: 1.6, goldReward: 2, crystalDamage: 1 },
  brute: { id: 'brute', name: '重甲怪', maxHp: 320, speed: 0.8, goldReward: 4, crystalDamage: 2 },
};
