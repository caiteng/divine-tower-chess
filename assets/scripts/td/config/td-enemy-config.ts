import type { TDDifficultyId, TDEnemyConfig, TDEnemyId } from '../types';
import { getTDDifficultyConfig } from './td-game-config';

export const TD_ENEMY_CONFIG: Record<TDEnemyId, TDEnemyConfig> = {
  slime: {
    enemyId: 'slime',
    name: '软泥仔',
    maxHp: 55,
    speed: 90,
    armor: 0,
    magicResist: 0,
    leakDamage: 1,
    killGold: 1,
    pathKind: 'ground',
    tags: ['ground', 'small'],
  },
  shieldling: {
    enemyId: 'shieldling',
    name: '木盾兵',
    maxHp: 140,
    speed: 68,
    armor: 14,
    magicResist: 0,
    leakDamage: 1,
    killGold: 2,
    pathKind: 'ground',
    tags: ['ground', 'armored'],
  },
  boneguard: {
    enemyId: 'boneguard',
    name: '骨甲卫',
    maxHp: 220,
    speed: 58,
    armor: 28,
    magicResist: -0.1,
    leakDamage: 2,
    killGold: 3,
    pathKind: 'ground',
    tags: ['ground', 'armored', 'elite'],
  },
  bat: {
    enemyId: 'bat',
    name: '火羽蝠',
    maxHp: 85,
    speed: 120,
    armor: 0,
    magicResist: 0.2,
    leakDamage: 1,
    killGold: 2,
    pathKind: 'air',
    tags: ['air', 'flying'],
  },
  shadehound: {
    enemyId: 'shadehound',
    name: '幽影犬',
    maxHp: 95,
    speed: 130,
    armor: 4,
    magicResist: 0,
    leakDamage: 1,
    killGold: 2,
    pathKind: 'ground',
    tags: ['ground', 'stealth', 'fast'],
  },
  warlock: {
    enemyId: 'warlock',
    name: '诅咒术士',
    maxHp: 160,
    speed: 62,
    armor: 2,
    magicResist: 0.4,
    leakDamage: 2,
    killGold: 3,
    pathKind: 'ground',
    tags: ['ground', 'caster', 'elite'],
  },
  spore: {
    enemyId: 'spore',
    name: '爆裂孢子',
    maxHp: 70,
    speed: 105,
    armor: 0,
    magicResist: 0,
    leakDamage: 1,
    killGold: 2,
    pathKind: 'ground',
    tags: ['ground', 'explosive'],
  },
  gate_golem: {
    enemyId: 'gate_golem',
    name: '城门魔像',
    maxHp: 1600,
    speed: 42,
    armor: 35,
    magicResist: 0.2,
    leakDamage: 3,
    killGold: 8,
    pathKind: 'ground',
    tags: ['ground', 'boss', 'armored'],
  },
  sky_lord: {
    enemyId: 'sky_lord',
    name: '天穹主宰',
    maxHp: 2800,
    speed: 38,
    armor: 40,
    magicResist: 0.25,
    leakDamage: 3,
    killGold: 12,
    pathKind: 'ground',
    tags: ['ground', 'boss', 'armored', 'final'],
  },
};

export function getTDEnemyConfig(enemyId: TDEnemyId): TDEnemyConfig {
  return TD_ENEMY_CONFIG[enemyId];
}

export function scaleTDEnemyConfig(enemyId: TDEnemyId, level: number, difficulty: TDDifficultyId): TDEnemyConfig {
  const base = getTDEnemyConfig(enemyId);
  const difficultyConfig = getTDDifficultyConfig(difficulty);
  const waveLevel = Math.max(1, level);
  const levelHpMultiplier = 1 + (waveLevel - 1) * 0.16;
  const speedMultiplier = difficultyConfig.enemySpeedMultiplier * (1 + Math.max(0, waveLevel - 1) * 0.015);
  return {
    ...base,
    maxHp: Math.max(1, Math.round(base.maxHp * levelHpMultiplier * difficultyConfig.enemyHpMultiplier)),
    speed: Math.max(10, Math.round(base.speed * speedMultiplier)),
  };
}

export const TD_ALL_ENEMY_IDS: TDEnemyId[] = ['slime', 'shieldling', 'boneguard', 'bat', 'shadehound', 'warlock', 'spore', 'gate_golem', 'sky_lord'];
