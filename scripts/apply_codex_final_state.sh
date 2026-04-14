#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --verify 88e7330 >/dev/null 2>&1; then
  echo "Missing commit 88e7330 in current repo history."
  exit 1
fi

echo "Applying Codex final-state commit (88e7330) with ours-preferred strategy..."
git cherry-pick -X ours 88e7330

echo "Running verification..."
npm test

echo "Done."
