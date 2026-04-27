# Merge Recovery

Use this when a local working branch diverges from the shared mainline and normal merge conflicts are too heavy.

## Recommended flow

1. Checkout your latest target branch and pull latest:

```bash
git checkout <target-branch>
git pull origin <target-branch>
```

2. Create a temporary recovery branch before resolving conflicts:

```bash
git checkout -b recovery/<date>
```

3. Resolve conflicts by keeping the current project architecture as source of truth:

- Combat logic: `assets/scripts/squad/squad-battle-session.ts` and `assets/scripts/squad/systems/*`
- Cocos UI: `assets/scripts/ui/battle-scene-controller.ts` and `assets/scripts/ui/controllers/*`
- Verification tools: `tools/verify-squad-rules.ts`, `tools/verify-art-resources.ts`, `tools/run-web-e2e.js`

4. Run verification:

```bash
npm test
```

## Notes

- Do not commit generated `build/`, `temp/`, `local/`, `library/`, `tmp/`, or `node_modules/` content.
- If Cocos regenerates `.meta` files for real assets under `assets/**`, review and commit those `.meta` changes with the matching assets.
