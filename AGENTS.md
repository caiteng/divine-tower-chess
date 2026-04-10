# AGENTS.md

## Project goal
Build a complete playable prototype in Cocos Creator with TypeScript.
The game is a tower defense prototype with auto-chess style merge and divine evolution mechanics.

## Priorities
1. Playability first
2. Clear architecture
3. Config-driven data
4. Easy future extension
5. Placeholder assets are acceptable

## Scope rules
- Only one map in v1
- Focus on beginner difficulty first
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
- Use config files for units, enemies, waves, tasks, difficulties, shop data
- Keep managers and data models separated

## Output rules
After each implementation step:
- summarize changed files
- explain current playable status
- provide manual verification steps
- update PLANS.md

## Gameplay rules
- Shop refreshes automatically at the start of each round
- Shop shows 3 units per refresh
- Units can be bought with gold
- 3 same 1-star units merge into 1 2-star unit
- 3 same 2-star units merge into 1 3-star unit
- 3-star units have a 10% chance each round to receive a divine advancement task
- Current divine tasks:
  - Warrior -> Berserker: kill 1000 enemies
  - Priest -> Light Mage: heal 100000 HP
- Task progress accumulates across rounds within the same run