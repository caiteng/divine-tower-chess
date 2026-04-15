import { EnemyId, UnitId } from '../models/types';

export type StarLevel = 1 | 2 | 3;

export interface UnitArtEntry {
  unitId: UnitId;
  directory: string;
  stars?: Partial<Record<StarLevel, string>>;
  divineOverride?: string;
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
      ...unitDir('assets/art/units/warrior', 'warrior'),
      divineOverride: 'berserker_divine.png',
    },
    mage: unitDir('assets/art/units/mage', 'mage'),
    priest: {
      ...unitDir('assets/art/units/priest', 'priest'),
      divineOverride: 'light_mage_divine.png',
    },
    archer: unitDir('assets/art/units/archer', 'archer'),
    paladin: unitDir('assets/art/units/paladin', 'paladin'),
    shield_guard: unitDir('assets/art/units/shield_guard', 'shield_guard'),
    cavalry: unitDir('assets/art/units/cavalry', 'cavalry'),
    spearman: unitDir('assets/art/units/spearman', 'spearman'),
    berserker: {
      unitId: 'berserker',
      directory: 'assets/art/units/warrior',
      divineOverride: 'berserker_divine.png',
    },
    light_mage: {
      unitId: 'light_mage',
      directory: 'assets/art/units/priest',
      divineOverride: 'light_mage_divine.png',
    },
  },
  enemies: {
    slime: 'assets/art/enemies/slime.png',
    wolf: 'assets/art/enemies/wolf.png',
    brute: 'assets/art/enemies/brute.png',
  },
  optionalEnemies: [
    'assets/art/enemies/boss_1.png',
  ],
  uiIcons: [
    'assets/art/ui/icons/gold.png',
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
