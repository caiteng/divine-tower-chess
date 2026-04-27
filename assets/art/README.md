# Art Intake Layout

This directory is the staging area for manually imported art.

Current rule:
- Missing files here must never block gameplay.
- Runtime must continue to use code fallbacks until specific assets are wired in.
- When new art arrives, place it in the exact filenames below.
- Unit art intake follows a style-bundle rule:
  - Keep the same unit's portrait, battle sprites, and later animation frames together in one unit folder.
  - New uploads for the same visual style must stay grouped instead of being scattered across unrelated folders.
  - When a second job/class set arrives, create the same bundled structure for that class first, then wire it into runtime.

## Units

- `units/warrior/`
  - `warrior_star1.png`
  - `warrior_star2.png`
  - `warrior_star3.png`
  - `warrior_portrait.png`
  - `warrior_move_01.png` to `warrior_move_05.png`
  - `warrior_attack_01.png` to `warrior_attack_05.png`
  - `warrior_death_fall_01.png` to `warrior_death_fall_05.png`
  - `warrior_corpse_fade_01.png` to `warrior_corpse_fade_05.png`
  - `berserker_divine.png`
  - `berserker_move_01.png` to `berserker_move_05.png`
  - `berserker_attack_01.png` to `berserker_attack_05.png`
  - `berserker_death_fall_01.png` to `berserker_death_fall_05.png`
  - `berserker_corpse_fade_01.png` to `berserker_corpse_fade_05.png`
- `units/mage/`
  - `mage_star1.png`
  - `mage_star2.png`
  - `mage_star3.png`
  - `mage_portrait.png`
  - `mage_move_01.png` to `mage_move_05.png`
  - `mage_attack_01.png` to `mage_attack_05.png`
  - `mage_death_fall_01.png` to `mage_death_fall_05.png`
  - `mage_corpse_fade_01.png` to `mage_corpse_fade_05.png`
- `units/priest/`
  - `priest_star1.png`
  - `priest_star2.png`
  - `priest_star3.png`
  - `priest_portrait.png`
  - `priest_move_01.png` to `priest_move_05.png`
  - `priest_attack_01.png` to `priest_attack_05.png`
  - `priest_death_fall_01.png` to `priest_death_fall_05.png`
  - `priest_corpse_fade_01.png` to `priest_corpse_fade_05.png`
  - `light_mage_divine.png`
  - `light_mage_move_01.png` to `light_mage_move_05.png`
  - `light_mage_attack_01.png` to `light_mage_attack_05.png`
  - `light_mage_death_fall_01.png` to `light_mage_death_fall_05.png`
  - `light_mage_corpse_fade_01.png` to `light_mage_corpse_fade_05.png`
- `units/archer/`
  - `archer_star1.png`
  - `archer_star2.png`
  - `archer_star3.png`
  - `archer_portrait.png`
  - `archer_move_01.png` to `archer_move_05.png`
  - `archer_attack_01.png` to `archer_attack_05.png`
  - `archer_death_fall_01.png` to `archer_death_fall_05.png`
  - `archer_corpse_fade_01.png` to `archer_corpse_fade_05.png`
- `units/shield_guard/`
  - `shield_guard_star1.png`
  - `shield_guard_star2.png`
  - `shield_guard_star3.png`
  - `shield_guard_portrait.png`
  - `shield_guard_move_01.png` to `shield_guard_move_05.png`
  - `shield_guard_attack_01.png` to `shield_guard_attack_05.png`
  - `shield_guard_death_fall_01.png` to `shield_guard_death_fall_05.png`
  - `shield_guard_corpse_fade_01.png` to `shield_guard_corpse_fade_05.png`
- `units/cavalry/`
  - `cavalry_star1.png`
  - `cavalry_star2.png`
  - `cavalry_star3.png`
  - `cavalry_portrait.png`
  - `cavalry_move_01.png` to `cavalry_move_05.png`
  - `cavalry_attack_01.png` to `cavalry_attack_05.png`
  - `cavalry_death_fall_01.png` to `cavalry_death_fall_05.png`
  - `cavalry_corpse_fade_01.png` to `cavalry_corpse_fade_05.png`
- `units/spearman/`
  - `spearman_star1.png`
  - `spearman_star2.png`
  - `spearman_star3.png`
  - `spearman_portrait.png`
  - `spearman_move_01.png` to `spearman_move_05.png`
  - `spearman_attack_01.png` to `spearman_attack_05.png`
  - `spearman_death_fall_01.png` to `spearman_death_fall_05.png`
  - `spearman_corpse_fade_01.png` to `spearman_corpse_fade_05.png`

## Enemies

- `enemies/grunt.png`
- `enemies/brute.png`
- `enemies/boss.png`
- `enemies/<enemy>_move_01.png` to `enemies/<enemy>_move_05.png`
- `enemies/<enemy>_attack_01.png` to `enemies/<enemy>_attack_05.png`
- `enemies/<enemy>_death_fall_01.png` to `enemies/<enemy>_death_fall_05.png`
- `enemies/<enemy>_corpse_fade_01.png` to `enemies/<enemy>_corpse_fade_05.png`

## UI

- `ui/icons/gold.png`
- `ui/icons/refresh.png`
- `ui/icons/sell.png`
- `ui/icons/start_wave.png`
- `ui/icons/star_1.png`
- `ui/icons/star_2.png`
- `ui/icons/star_3.png`

## Backgrounds

- `backgrounds/battlefield_01.png`

## Notes

- Suggested source spec:
  - units/enemies: transparent PNG, 1024x1024
  - ui icons: transparent PNG, 512x512
  - backgrounds: PNG or JPG, 1920x1080
- These files are not required yet. The project must stay playable without them.
- Batch-generated stickman action frames can be regenerated with:
  - `tools/generate_stickman_action_frames.ps1`
- Current generated action frame prefixes for stickman units:
  - `move`
  - `attack`
  - `death_fall`
  - `corpse_fade`
