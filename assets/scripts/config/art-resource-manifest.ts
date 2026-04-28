import type { EnemyId, UnitId } from '../models/types';

export type StarLevel = 1 | 2 | 3;

export interface UnitArtEntry {
  unitId: UnitId;
  directory: string;
  stars?: Partial<Record<StarLevel, string>>;
  starSprites?: Partial<Record<StarLevel, string>>;
  divineOverride?: string;
  portrait?: string;
  skillIcon?: string;
  classEmblem?: string;
  idleFrames?: string[];
  idleExtraFrames?: string[];
  idleHeavyFrames?: string[];
  moveFrames?: string[];
  attackFrames?: string[];
  skillFrames?: string[];
  blockFrames?: string[];
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
      unitId: 'archer',
      directory: 'assets/resources/textures/units/archer',
      stars: {
        1: 'star1.png',
        2: 'star2.png',
        3: 'star3.png',
      },
      starSprites: {
        1: 'textures/units/archer/archer_star1',
        2: 'textures/units/archer/archer_star2',
        3: 'textures/units/archer/archer_star3',
      },
      portrait: 'textures/units/archer/portrait',
      skillIcon: 'textures/units/archer/skill_icon_precision_snipe',
      classEmblem: 'textures/units/archer/class_emblem',
      idleFrames: [
        'textures/units/archer/idle_01',
        'textures/units/archer/idle_02',
        'textures/units/archer/idle_03',
        'textures/units/archer/idle_04',
      ],
      idleExtraFrames: [
        'textures/units/archer/idle_extra_01',
        'textures/units/archer/idle_extra_02',
      ],
      moveFrames: [
        'textures/units/archer/move_01',
        'textures/units/archer/move_02',
        'textures/units/archer/move_03',
        'textures/units/archer/move_04',
        'textures/units/archer/move_05',
        'textures/units/archer/move_06',
      ],
      attackFrames: [
        'textures/units/archer/attack_01',
        'textures/units/archer/attack_02',
        'textures/units/archer/attack_03',
        'textures/units/archer/attack_04',
        'textures/units/archer/attack_05',
        'textures/units/archer/attack_06',
      ],
      skillFrames: [
        'textures/units/archer/skill_01',
        'textures/units/archer/skill_02',
        'textures/units/archer/skill_03',
        'textures/units/archer/skill_04',
        'textures/units/archer/skill_05',
        'textures/units/archer/skill_06',
      ],
      hurtFrames: [
        'textures/units/archer/hurt_01',
        'textures/units/archer/hurt_02',
        'textures/units/archer/hurt_03',
      ],
      deathFrames: [
        'textures/units/archer/death_01',
        'textures/units/archer/death_02',
        'textures/units/archer/death_03',
        'textures/units/archer/death_04',
        'textures/units/archer/death_05',
        'textures/units/archer/death_06',
      ],
    },
    shield_guard: {
      unitId: 'shield_guard',
      directory: 'assets/resources/textures/units/shield_guard',
      stars: {
        1: 'star1.png',
        2: 'star2.png',
        3: 'star3.png',
      },
      starSprites: {
        1: 'textures/units/shield_guard/shield_guard_star1',
        2: 'textures/units/shield_guard/shield_guard_star2',
        3: 'textures/units/shield_guard/shield_guard_star3',
      },
      portrait: 'textures/units/shield_guard/portrait',
      idleFrames: [
        'textures/units/shield_guard/idle_01',
        'textures/units/shield_guard/idle_02',
        'textures/units/shield_guard/idle_03',
        'textures/units/shield_guard/idle_04',
      ],
      idleHeavyFrames: [
        'textures/units/shield_guard/idle_heavy_01',
        'textures/units/shield_guard/idle_heavy_02',
        'textures/units/shield_guard/idle_heavy_03',
        'textures/units/shield_guard/idle_heavy_04',
        'textures/units/shield_guard/idle_heavy_05',
        'textures/units/shield_guard/idle_heavy_06',
      ],
      moveFrames: [
        'textures/units/shield_guard/move_01',
        'textures/units/shield_guard/move_02',
        'textures/units/shield_guard/move_03',
        'textures/units/shield_guard/move_04',
        'textures/units/shield_guard/move_05',
        'textures/units/shield_guard/move_06',
      ],
      attackFrames: [
        'textures/units/shield_guard/attack_01',
        'textures/units/shield_guard/attack_02',
        'textures/units/shield_guard/attack_03',
        'textures/units/shield_guard/attack_04',
        'textures/units/shield_guard/attack_05',
        'textures/units/shield_guard/attack_06',
      ],
      blockFrames: [
        'textures/units/shield_guard/block_01',
        'textures/units/shield_guard/block_02',
        'textures/units/shield_guard/block_03',
        'textures/units/shield_guard/block_04',
        'textures/units/shield_guard/block_05',
        'textures/units/shield_guard/block_06',
      ],
      hurtFrames: [
        'textures/units/shield_guard/hurt_01',
        'textures/units/shield_guard/hurt_02',
        'textures/units/shield_guard/hurt_03',
      ],
      deathFrames: [
        'textures/units/shield_guard/death_01',
        'textures/units/shield_guard/death_02',
        'textures/units/shield_guard/death_03',
        'textures/units/shield_guard/death_04',
        'textures/units/shield_guard/death_05',
        'textures/units/shield_guard/death_06',
      ],
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
