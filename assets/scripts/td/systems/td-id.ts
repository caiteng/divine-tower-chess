let tdIdSeed = 1;

export function nextTdId(prefix: string): string {
  const id = `${prefix}_${tdIdSeed}`;
  tdIdSeed += 1;
  return id;
}

export function resetTdIdSeed(seed = 1): void {
  tdIdSeed = Math.max(1, Math.floor(seed));
}

export function syncTdIdSeedFromIds(ids: string[]): void {
  let maxSeed = 0;
  for (const id of ids) {
    const match = /_(\d+)$/.exec(id);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value)) maxSeed = Math.max(maxSeed, value);
  }
  tdIdSeed = Math.max(tdIdSeed, maxSeed + 1);
}
