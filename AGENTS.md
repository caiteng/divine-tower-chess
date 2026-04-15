# AGENTS.md

## Project goal
Build a complete playable prototype in Cocos Creator with TypeScript.
The game direction is: **Battleheart-style 2D squad real-time command combat** + growth systems (shop, merge, divine evolution).

## Priorities
1. Playability first
2. Clear architecture
3. Config-driven data
4. Easy future extension
5. Placeholder assets are acceptable

## Scope rules
- One combat map in v1
- Beginner difficulty first
- No networking
- No leaderboard
- No ads
- No equipment system
- No complex synergy system
- No polish-first decisions

## Tech rules
- Use TypeScript
- Keep code readable and modular
- Avoid overengineering
- Prefer simple systems that can run
- Use config files for units, enemies, waves, divine tasks, difficulties, shop data
- Keep managers and data models separated

## Output rules
After each implementation step:
- summarize changed files
- explain current playable status
- provide manual verification steps
- update PLANS.md

## Core gameplay rules (must keep)
- Shop refreshes automatically at the start of each round
- Shop shows 3 units per refresh
- Units can be bought with gold
- Failed purchases must not remove shop entries
- 3 same 1-star units merge into 1 2-star unit
- 3 same 2-star units merge into 1 3-star unit
- 3-star units do not merge further through ordinary star merging
- Merge candidates can come from bench and deployed units
- Units with active divine tasks must not be consumed by ordinary star merges
- Divine task assignment is instance-based (not class-shared)
- Every eligible 3-star non-divine unit instance rolls its own 10% task chance at round start
- Multiple unit instances can hold divine tasks simultaneously
- Each unit instance can hold at most one active divine task at a time
- Divine progress binds to unit instance ID and accumulates across rounds in one run
- Current divine tasks:
  - Warrior -> Berserker: kill 1000 enemies (per instance)
  - Priest -> Light Mage: heal 100000 HP as actual healing only (per instance)
- Healing task progress must use actual restored HP only; overheal, full-HP targets, and virtual healing must not count

## Squad combat rules (v0.4)
- 2D continuous-space combat only (x/y)
- Max 5 deployed characters per battle
- Default round start formation: deployed squad appears in center area in one row
- Enemies mainly spawn from right side, with conditional small random left-side spawns for anti-camping
- Defeat condition: all 5 deployed characters are down
- Wave clear condition: at least 1 allied character survives and all enemies are defeated
- New wave start resets HP and normal battle states; divine task progress is preserved

## Command-driven behavior constraints (hard requirement)
- No-command state must **not** become full-map auto battle
- Ranged units do not auto-push toward distant enemies
- Melee units only react within short threat range and do limited pursuit
- Priests have no attack behavior
- Priests only perform continuous healing after explicit player command to an allied target
- Priest healing action keeps channeling even when target is at full HP

## Unified architecture constraints (v0.4+)
- Do not revert combat model to board-grid path abstractions
- Deployment anchors are optional spawn/formation helpers, not board semantics
- Core logic layers (types / unit-system / session / controller / wave-system) should align with command-driven squad combat abstractions
- Divine tasks must remain instance-level independent assignment and accumulation

## Resume checklist (must do first in next session)
Before writing any new feature code, first complete this sequence:
1. Run `npm test` and confirm baseline green.
2. Read latest `PLANS.md` sections:
   - `停机前状态固化（2026-04-15）`
   - latest phase status block
3. Continue from “interaction/readability polish” scope first; do not expand new gameplay systems unless explicitly requested.
4. Keep single mainline only:
   - `assets/scripts/squad/squad-battle-session.ts`
   - `assets/scripts/squad/systems/*`
   - `assets/scripts/ui/squad-battle-ui.ts`
