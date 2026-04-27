import type { EnemyId, UnitId } from '../models/types';

export type StarLevel = 1 | 2 | 3;

export interface UnitArtEntry {
  unitId: UnitId;
  directory: string;
  stars?: Partial<Record<StarLevel, string>>;
  divineOverride?: string;
  portrait?: string;
}

export interface ArtResourceManifest {
  units: Record<UnitId, UnitArtEntry>;
  enemies: Record<EnemyId, string>;
  optionalEnemies: string[];
  uiIcons: string[];
  backgrounds: string[];
}

const unitDir = (directory: string, unitId: string): UnitArtEntry => ({
  unitId: unitId as UnitId,
  directory,
  stars: {
    1: `${unitId}_star1.png`,
    2: `${unitId}_star2.png`,
    3: `${unitId}_star3.png`,
  },
});

export const ART_RESOURCE_MANIFEST: ArtResourceManifest = {
  units: {
    warrior: {
      ...unitDir('assets/resources/textures/units/warrior', 'warrior'),
      divineOverride: 'berserker_divine.png',
      portrait: 'warrior_portrait.png',
    },
    mage: {
      ...unitDir('assets/resources/textures/units/mage', 'mage'),
      portrait: 'mage_portrait.png',
    },
    priest: {
      ...unitDir('assets/resources/textures/units/priest', 'priest'),
      divineOverride: 'light_mage_divine.png',
      portrait: 'priest_portrait.png',
    },
    archer: {
      ...unitDir('assets/resources/textures/units/archer', 'archer'),
      portrait: 'archer_portrait.png',
    },
    shield_guard: {
      ...unitDir('assets/resources/textures/units/shield_guard', 'shield_guard'),
      portrait: 'shield_guard_portrait.png',
    },
    spearman: {
      ...unitDir('assets/resources/textures/units/spearman', 'spearman'),
      portrait: 'spearman_portrait.png',
    },
    berserker: {
      unitId: 'berserker',
      directory: 'assets/resources/textures/units/warrior',
      divineOverride: 'berserker_divine.png',
    },
    light_mage: {
      unitId: 'light_mage',
      directory: 'assets/resources/textures/units/priest',
      divineOverride: 'light_mage_divine.png',
    },
  },
  enemies: {
    grunt: 'assets/resources/textures/enemies/grunt.png',
    brute: 'assets/resources/textures/enemies/brute.png',
    boss: 'assets/resources/textures/enemies/boss.png',
  },
  optionalEnemies: [
    'assets/art/enemies/boss_1.png',
  ],
  uiIcons: [
    'assets/resources/textures/ui/gold.png',
    'assets/art/ui/icons/refresh.png',
    'assets/art/ui/icons/sell.png',
    'assets/art/ui/icons/start_wave.png',
    'assets/art/ui/icons/star_1.png',
    'assets/art/ui/icons/star_2.png',
    'assets/art/ui/icons/star_3.png',
  ],
  backgrounds: [
    'assets/art/backgrounds/battlefield_01.png',
  ],
};
