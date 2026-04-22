# Art Intake Layout

This directory is the staging area for manually imported art.

Current rule:
- Missing files here must never block gameplay.
- Runtime must continue to use code fallbacks until specific assets are wired in.
- When new art arrives, place it in the exact filenames below.
- Starting from the first `paladin` art set, unit art intake follows a style-bundle rule:
  - Keep the same unit's portrait, battle sprites, and later animation frames together in one unit folder.
  - New uploads for the same visual style must stay grouped instead of being scattered across unrelated folders.
  - When a second job/class set arrives, create the same bundled structure for that class first, then wire it into runtime.

## Units

- `units/warrior/`
  - `warrior_star1.png`
  - `warrior_star2.png`
  - `warrior_star3.png`
  - `berserker_divine.png`
- `units/mage/`
  - `mage_star1.png`
  - `mage_star2.png`
  - `mage_star3.png`
- `units/priest/`
  - `priest_star1.png`
  - `priest_star2.png`
  - `priest_star3.png`
  - `light_mage_divine.png`
- `units/archer/`
  - `archer_star1.png`
  - `archer_star2.png`
  - `archer_star3.png`
- `units/paladin/`
  - `paladin_star1.png`
  - `paladin_star2.png`
  - `paladin_star3.png`
  - `paladin_portrait.png`
  - `paladin_move_01.png` to `paladin_move_05.png`
  - `paladin_slash_01.png` to `paladin_slash_05.png`
  - `paladin_block_01.png` to `paladin_block_05.png`
  - `paladin_death_fall_01.png` to `paladin_death_fall_05.png`
  - `paladin_corpse_fade_01.png` to `paladin_corpse_fade_05.png`
- `units/shield_guard/`
  - `shield_guard_star1.png`
  - `shield_guard_star2.png`
  - `shield_guard_star3.png`
- `units/cavalry/`
  - `cavalry_star1.png`
  - `cavalry_star2.png`
  - `cavalry_star3.png`
- `units/spearman/`
  - `spearman_star1.png`
  - `spearman_star2.png`
  - `spearman_star3.png`

## Enemies

- `enemies/slime.png`
- `enemies/wolf.png`
- `enemies/brute.png`
- `enemies/boss_1.png`

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
