let idSeed = 1;

export function nextId(prefix: string): string {
  const id = `${prefix}_${idSeed}`;
  idSeed += 1;
  return id;
}

export function syncIdSeedFromIds(ids: string[]): void {
  let maxSeed = 0;
  for (const id of ids) {
    const match = /_(\d+)$/.exec(id);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > maxSeed) {
      maxSeed = value;
    }
  }
  idSeed = Math.max(idSeed, maxSeed + 1);
}
