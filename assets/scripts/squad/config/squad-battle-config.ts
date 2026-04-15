import { UnitId } from '../../models/types';
import { EnemyBattleStats, UnitBattleStats, WaveSpawnPlan } from '../types';

export const SQUAD_BATTLEFIELD = {
  width: 1200,
  height: 700,
  centerLineX: 520,
  centerLineY: 350,
  allySpawnGapY: 70,
  rightSpawnX: 1120,
  leftSpawnX: 80,
  spawnYMin: 120,
  spawnYMax: 580,
};

export const SQUAD_UNIT_STATS: Record<UnitId, UnitBattleStats> = {
  warrior: { maxHp: 420, attackDamage: 40, attackInterval: 0.8, moveSpeed: 180, attackRange: 48, reactionRange: 180 },
  berserker: { maxHp: 500, attackDamage: 65, attackInterval: 0.6, moveSpeed: 205, attackRange: 54, reactionRange: 210 },
  paladin: { maxHp: 520, attackDamage: 35, attackInterval: 1, moveSpeed: 160, attackRange: 50, reactionRange: 170 },
  shield_guard: { maxHp: 650, attackDamage: 28, attackInterval: 1.1, moveSpeed: 145, attackRange: 46, reactionRange: 165 },
  cavalry: { maxHp: 440, attackDamage: 48, attackInterval: 0.85, moveSpeed: 240, attackRange: 52, reactionRange: 220 },
  spearman: { maxHp: 390, attackDamage: 45, attackInterval: 0.95, moveSpeed: 170, attackRange: 165, reactionRange: 180 },
  archer: { maxHp: 310, attackDamage: 38, attackInterval: 0.65, moveSpeed: 130, attackRange: 270, reactionRange: 270 },
  mage: { maxHp: 300, attackDamage: 46, attackInterval: 1, moveSpeed: 125, attackRange: 255, reactionRange: 255 },
  light_mage: { maxHp: 340, attackDamage: 58, attackInterval: 0.9, moveSpeed: 140, attackRange: 270, reactionRange: 270 },
  priest: { maxHp: 290, attackDamage: 0, attackInterval: 0.45, moveSpeed: 150, attackRange: 190, reactionRange: 0, healPower: 30 },
};

export const SQUAD_ROLE_MAP: Record<UnitId, 'melee' | 'ranged' | 'priest'> = {
  warrior: 'melee',
  berserker: 'melee',
  paladin: 'melee',
  shield_guard: 'melee',
  cavalry: 'melee',
  spearman: 'ranged',
  archer: 'ranged',
  mage: 'ranged',
  light_mage: 'ranged',
  priest: 'priest',
};

export const ENEMY_STATS: Record<'grunt' | 'brute' | 'boss', EnemyBattleStats> = {
  grunt: { maxHp: 210, attackDamage: 28, attackInterval: 0.9, moveSpeed: 160, attackRange: 45 },
  brute: { maxHp: 420, attackDamage: 42, attackInterval: 1.1, moveSpeed: 125, attackRange: 52 },
  boss: { maxHp: 1800, attackDamage: 90, attackInterval: 1.3, moveSpeed: 135, attackRange: 62 },
};

export const DEFAULT_WAVES: WaveSpawnPlan[] = [
  { waveNumber: 1, enemies: [{ enemyType: 'grunt', count: 6 }] },
  { waveNumber: 2, enemies: [{ enemyType: 'grunt', count: 4 }, { enemyType: 'brute', count: 2 }] },
  { waveNumber: 3, enemies: [{ enemyType: 'boss', count: 1 }, { enemyType: 'grunt', count: 4 }] },
];
