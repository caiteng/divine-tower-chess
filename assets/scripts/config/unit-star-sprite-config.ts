import type { UnitId } from '../models/types';

export type StarLevel = 1 | 2 | 3;

export type UnitStarSpritePathConfig = Record<UnitId, Record<StarLevel, string>>;

const makeDefaultStarPaths = (unitId: UnitId): Record<StarLevel, string> => ({
  1: `textures/avatars/${unitId}/star1`,
  2: `textures/avatars/${unitId}/star2`,
  3: `textures/avatars/${unitId}/star3`,
});

export const UNIT_STAR_SPRITE_PATHS: UnitStarSpritePathConfig = {
  archer: {
    1: 'textures/units/archer/archer_star1',
    2: 'textures/units/archer/archer_star2',
    3: 'textures/units/archer/archer_star3',
  },
  shield_guard: {
    1: 'textures/units/shield_guard/shield_guard_star1',
    2: 'textures/units/shield_guard/shield_guard_star2',
    3: 'textures/units/shield_guard/shield_guard_star3',
  },
  warrior: {
    1: 'textures/units/warrior/warrior_star1',
    2: 'textures/units/warrior/warrior_star2',
    3: 'textures/units/warrior/warrior_star3',
  },
  mage: makeDefaultStarPaths('mage'),
  priest: makeDefaultStarPaths('priest'),
  spearman: makeDefaultStarPaths('spearman'),
  berserker: makeDefaultStarPaths('berserker'),
  light_mage: makeDefaultStarPaths('light_mage'),
};

export const UNIT_STAR_SPRITE_BASE_FALLBACK: Record<UnitId, string> = {
  archer: 'textures/units/archer/portrait',
  shield_guard: 'textures/units/shield_guard/portrait',
  warrior: 'textures/units/warrior/portrait',
  mage: 'textures/avatars/mage',
  priest: 'textures/avatars/priest',
  spearman: 'textures/avatars/spearman',
  berserker: 'textures/avatars/berserker',
  light_mage: 'textures/avatars/light_mage',
};
