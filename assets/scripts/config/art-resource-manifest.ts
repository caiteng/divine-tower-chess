import type { EnemyId, UnitId } from '../models/types';

export type StarLevel = 1 | 2 | 3;

export interface UnitArtEntry {
  unitId: UnitId;
  directory: string;
  stars?: Partial<Record<StarLevel, string>>;
  starSprites?: Partial<Record<StarLevel, string>>;
  divineOverride?: string;
  portrait?: string;
  idleFrames?: string[];
  moveFrames?: string[];
  attackFrames?: string[];
  hurtFrames?: string[];
  deathFrames?: string[];
}

export interface ArtResourceManifest {
  units: Record<UnitId, UnitArtEntry>;
  enemies: Record<EnemyId, string>;
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
      starSprites: {
        1: 'textures/units/warrior/warrior_star1',
        2: 'textures/units/warrior/warrior_star2',
        3: 'textures/units/warrior/warrior_star3',
      },
      portrait: 'textures/units/warrior/portrait',
      idleFrames: [
        'textures/units/warrior/idle_01',
        'textures/units/warrior/idle_02',
        'textures/units/warrior/idle_03',
        'textures/units/warrior/idle_04',
      ],
      moveFrames: [
        'textures/units/warrior/move_01',
        'textures/units/warrior/move_02',
        'textures/units/warrior/move_03',
        'textures/units/warrior/move_04',
        'textures/units/warrior/move_05',
        'textures/units/warrior/move_06',
      ],
      attackFrames: [
        'textures/units/warrior/attack_01',
        'textures/units/warrior/attack_02',
        'textures/units/warrior/attack_03',
        'textures/units/warrior/attack_04',
        'textures/units/warrior/attack_05',
        'textures/units/warrior/attack_06',
      ],
      hurtFrames: [
        'textures/units/warrior/hurt_01',
        'textures/units/warrior/hurt_02',
        'textures/units/warrior/hurt_03',
      ],
      deathFrames: [
        'textures/units/warrior/death_01',
        'textures/units/warrior/death_02',
        'textures/units/warrior/death_03',
        'textures/units/warrior/death_04',
        'textures/units/warrior/death_05',
        'textures/units/warrior/death_06',
      ],
    },
    mage: {
      ...unitDir('assets/resources/textures/units/mage', 'mage'),
      portrait: 'mage_portrait.png',
    },
    priest: {
      ...unitDir('assets/resources/textures/units/priest', 'priest'),
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
      directory: 'assets/resources/textures/units/berserker',
      divineOverride: 'berserker_divine.png',
    },
    light_mage: {
      unitId: 'light_mage',
      directory: 'assets/resources/textures/units/light_mage',
      divineOverride: 'light_mage_divine.png',
    },
  },
  enemies: {
    grunt: 'assets/resources/textures/enemies/grunt.png',
    brute: 'assets/resources/textures/enemies/brute.png',
    boss: 'assets/resources/textures/enemies/boss.png',
  },
  uiIcons: [
    'assets/resources/textures/ui/gold.png',
  ],
  backgrounds: [
    'assets/resources/textures/backgrounds/menu_arena_01.png',
    'assets/resources/textures/backgrounds/battlefield_01.png',
  ],
};
