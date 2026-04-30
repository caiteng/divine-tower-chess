import type { TDEnemyInstanceState, TDMapConfig, TDPathConfig, TDPathKind, TDVec2 } from '../types';

function distance(a: TDVec2, b: TDVec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function getPathLength(path: TDPathConfig): number {
  let total = 0;
  for (let i = 1; i < path.points.length; i += 1) {
    total += distance(path.points[i - 1], path.points[i]);
  }
  return total;
}

export function getPositionAtProgress(path: TDPathConfig, progress: number): TDVec2 {
  if (path.points.length === 0) return { x: 0, y: 0 };
  if (path.points.length === 1) return { ...path.points[0] };

  const clamped = Math.max(0, Math.min(1, progress));
  const totalLength = getPathLength(path);
  if (totalLength <= 0) return { ...path.points[0] };

  let remaining = totalLength * clamped;
  for (let i = 1; i < path.points.length; i += 1) {
    const from = path.points[i - 1];
    const to = path.points[i];
    const segmentLength = distance(from, to);
    if (remaining <= segmentLength || i === path.points.length - 1) {
      const t = segmentLength <= 0 ? 0 : remaining / segmentLength;
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
    }
    remaining -= segmentLength;
  }

  return { ...path.points[path.points.length - 1] };
}

export function choosePath(map: TDMapConfig, kind: TDPathKind, indexSeed = 0): TDPathConfig {
  const paths = kind === 'air' ? map.airPaths : map.groundPaths;
  const fallback = map.groundPaths[0] ?? map.airPaths[0];
  if (!paths.length) return fallback;
  return paths[Math.abs(indexSeed) % paths.length];
}

export class EnemyPathSystem {
  public getPathLength(path: TDPathConfig): number {
    return getPathLength(path);
  }

  public getPositionAtProgress(path: TDPathConfig, progress: number): TDVec2 {
    return getPositionAtProgress(path, progress);
  }

  public advanceEnemy(enemy: TDEnemyInstanceState, path: TDPathConfig, dt: number): TDEnemyInstanceState {
    if (!enemy.alive || enemy.leaked) return enemy;
    const length = Math.max(1, getPathLength(path));
    const speed = Math.max(0, enemy.speed * enemy.speedMultiplier);
    enemy.pathProgress = Math.min(1, enemy.pathProgress + (speed * Math.max(0, dt)) / length);
    enemy.position = getPositionAtProgress(path, enemy.pathProgress);
    return enemy;
  }

  public hasReachedExit(enemy: TDEnemyInstanceState): boolean {
    return enemy.pathProgress >= 1;
  }
}
