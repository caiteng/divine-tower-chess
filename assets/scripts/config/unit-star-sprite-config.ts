import type { UnitId } from '../models/types';

export type StarLevel = 1 | 2 | 3;

export type UnitStarSpritePathConfig = Record<UnitId, Record<StarLevel, string>>;

const makeDefaultStarPaths = (unitId: UnitId): Record<StarLevel, string> => ({
  1: `textures/avatars/${unitId}/star1`,
  2: `textures/avatars/${unitId}/star2`,
  3: `textures/avatars/${unitId}/star3`,
});

export const UNIT_STAR_SPRITE_PATHS: UnitStarSpritePathConfig = {
  archer: makeDefaultStarPaths('archer'),
  shield_guard: makeDefaultStarPaths('shield_guard'),
  warrior: makeDefaultStarPaths('warrior'),
  mage: makeDefaultStarPaths('mage'),
  priest: makeDefaultStarPaths('priest'),
  spearman: makeDefaultStarPaths('spearman'),
  berserker: makeDefaultStarPaths('berserker'),
  light_mage: makeDefaultStarPaths('light_mage'),
};

export const UNIT_STAR_SPRITE_BASE_FALLBACK: Record<UnitId, string> = {
  archer: 'textures/avatars/archer',
  shield_guard: 'textures/avatars/shield_guard',
  warrior: 'textures/avatars/warrior',
  mage: 'textures/avatars/mage',
  priest: 'textures/avatars/priest',
  spearman: 'textures/avatars/spearman',
  berserker: 'textures/avatars/berserker',
  light_mage: 'textures/avatars/light_mage',
};
