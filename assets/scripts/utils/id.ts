let idSeed = 1;

export function nextId(prefix: string): string {
  const id = `${prefix}_${idSeed}`;
  idSeed += 1;
  return id;
}
