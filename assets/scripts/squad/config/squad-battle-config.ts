import type { UnitId } from '../../models/types';
import type { EnemyBattleStats, UnitBattleStats, WaveSpawnPlan } from '../types';

export const SQUAD_BATTLEFIELD = {
  width: 1200,
  height: 700,
  centerLineX: 520,
  centerLineY: 350,
  allySpawnGapY: 92,
  rightSpawnX: 1120,
  leftSpawnX: 80,
  spawnYMin: 120,
  spawnYMax: 580,
};

export const SQUAD_UNIT_STATS: Record<UnitId, UnitBattleStats> = {
  warrior: { maxHp: 450, attackDamage: 42, armor: 8, armorPierceRatio: 0.2, attackInterval: 1.05, moveSpeed: 118, attackRange: 52, reactionRange: 175, collisionRadius: 26 },
  berserker: { maxHp: 560, attackDamage: 66, armor: 9, armorPierceRatio: 0.35, attackInterval: 0.75, moveSpeed: 132, attackRange: 56, reactionRange: 205, collisionRadius: 28 },
  shield_guard: { maxHp: 760, attackDamage: 24, armor: 16, armorPierceRatio: 0.05, attackInterval: 1.65, moveSpeed: 82, attackRange: 48, reactionRange: 155, collisionRadius: 30 },
  spearman: { maxHp: 400, attackDamage: 38, armor: 4, armorPierceRatio: 0.45, attackInterval: 1.15, moveSpeed: 110, attackRange: 155, reactionRange: 170, collisionRadius: 24 },
  archer: { maxHp: 290, attackDamage: 31, armor: 2, armorPierceRatio: 0.05, attackInterval: 0.78, moveSpeed: 94, attackRange: 285, reactionRange: 285, collisionRadius: 21 },
  mage: { maxHp: 260, attackDamage: 56, armor: 1, armorPierceRatio: 0.65, attackInterval: 1.8, moveSpeed: 82, attackRange: 250, reactionRange: 250, collisionRadius: 21 },
  light_mage: { maxHp: 390, attackDamage: 0, armor: 9, armorPierceRatio: 0, attackInterval: 0.68, moveSpeed: 98, attackRange: 245, reactionRange: 0, collisionRadius: 22, healPower: 56 },
  priest: { maxHp: 360, attackDamage: 0, armor: 7, armorPierceRatio: 0, attackInterval: 0.78, moveSpeed: 100, attackRange: 195, reactionRange: 0, collisionRadius: 22, healPower: 34 },
};

export const SQUAD_ROLE_MAP: Record<UnitId, 'melee' | 'ranged' | 'priest'> = {
  warrior: 'melee',
  berserker: 'melee',
  shield_guard: 'melee',
  spearman: 'ranged',
  archer: 'ranged',
  mage: 'ranged',
  light_mage: 'priest',
  priest: 'priest',
};

export const ENEMY_STATS: Record<'grunt' | 'brute' | 'boss', EnemyBattleStats> = {
  grunt: { maxHp: 210, attackDamage: 31, armor: 2, attackInterval: 1.4, moveSpeed: 105, attackRange: 45, collisionRadius: 20 },
  brute: { maxHp: 460, attackDamage: 46, armor: 8, attackInterval: 1.65, moveSpeed: 84, attackRange: 52, collisionRadius: 28 },
  boss: { maxHp: 1850, attackDamage: 96, armor: 14, attackInterval: 2, moveSpeed: 86, attackRange: 62, collisionRadius: 36 },
};

export const DEFAULT_WAVES: WaveSpawnPlan[] = [
  { waveNumber: 1, enemies: [{ enemyType: 'grunt', count: 6 }] },
  { waveNumber: 2, enemies: [{ enemyType: 'grunt', count: 4 }, { enemyType: 'brute', count: 2 }] },
  { waveNumber: 3, enemies: [{ enemyType: 'boss', count: 1 }, { enemyType: 'grunt', count: 4 }] },
];
