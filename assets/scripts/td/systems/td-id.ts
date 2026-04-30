
let tdIdSeed = 1;

export function nextTdId(prefix: string): string {
  const normalized = prefix.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || 'td';
  const id = `${normalized}_${tdIdSeed}`;
  tdIdSeed += 1;
  return id;
}

export function syncTdIdSeedFromIds(ids: string[]): void {
  let maxSeed = 0;
  for (const id of ids) {
    const match = /_(\d+)$/.exec(id);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value)) {
      maxSeed = Math.max(maxSeed, value);
    }
  }
  tdIdSeed = Math.max(tdIdSeed, maxSeed + 1);
}

export function resetTdIdSeedForTest(seed = 1): void {
  tdIdSeed = Math.max(1, Math.floor(seed));
}
