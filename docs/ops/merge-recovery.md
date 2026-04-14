# Merge Recovery (keep Codex final state as source of truth)

This repository branch has been squashed to a single integration commit:

- `88e7330` (`work` branch)

Use this when your latest target branch has diverged and web merge conflicts are too heavy.

## Recommended flow

1. Checkout your latest target branch and pull latest:

```bash
git checkout <target-branch>
git pull origin <target-branch>
```

2. Apply Codex final-state commit with ours-preferred merge strategy:

```bash
git cherry-pick -X ours 88e7330
```

3. If conflicts still remain in a few files, resolve by keeping the `88e7330` side as final source of truth.

4. Run verification:

```bash
npm test
```

## Notes

- Binary art files are intentionally not included in this page-Codex flow.
- Add real image via local git client at:
  - `assets/art/reference/unit_star_progression.png`
- Keep placeholder text file tracked in repo:
  - `assets/art/reference/unit_star_progression.placeholder.txt`
