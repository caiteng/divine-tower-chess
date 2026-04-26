import { ImageAsset, SpriteFrame, resources } from 'cc';
import { ART_RESOURCE_MANIFEST } from '../../config/art-resource-manifest';
import type { StarLevel } from '../../config/art-resource-manifest';
import { UNIT_STAR_SPRITE_BASE_FALLBACK, UNIT_STAR_SPRITE_PATHS } from '../../config/unit-star-sprite-config';
import type { EnemyId, UnitId } from '../../models/types';

const loadedFrames = new Map<string, Promise<SpriteFrame | null>>();
const loadedFrameSets = new Map<string, Promise<SpriteFrame[]>>();

export type UnitAnimationClip = 'move' | 'attack' | 'death_fall' | 'corpse_fade';
export type EnemyAnimationClip = UnitAnimationClip;

const asResourcePath = (rawPath: string): string | null => {
  if (rawPath.startsWith('assets/resources/')) {
    return rawPath.replace(/^assets\/resources\//, '').replace(/\.(png|jpg|jpeg)$/i, '');
  }
  if (rawPath.startsWith('assets/art/backgrounds/')) {
    const file = rawPath.split('/').pop()?.replace(/\.(png|jpg|jpeg)$/i, '');
    return file ? `textures/backgrounds/${file}` : null;
  }
  return null;
};

const loadFrame = (manifestPath: string | undefined): Promise<SpriteFrame | null> => {
  if (!manifestPath) return Promise.resolve(null);
  const cacheKey = manifestPath;
  const cached = loadedFrames.get(cacheKey);
  if (cached) return cached;

  const resourcePath = asResourcePath(manifestPath);
  if (!resourcePath) return Promise.resolve(null);

  const pending = new Promise<SpriteFrame | null>((resolve) => {
    resources.load(resourcePath, ImageAsset, (err, asset) => {
      if (err || !asset) {
        resolve(null);
        return;
      }
      resolve(SpriteFrame.createWithImage(asset));
    });
  });
  loadedFrames.set(cacheKey, pending);
  return pending;
};

const loadFrameFromResourcePath = (resourcePath: string | undefined): Promise<SpriteFrame | null> => {
  if (!resourcePath) return Promise.resolve(null);
  const cacheKey = `resource:${resourcePath}`;
  const cached = loadedFrames.get(cacheKey);
  if (cached) return cached;

  const pending = new Promise<SpriteFrame | null>((resolve) => {
    resources.load(resourcePath, ImageAsset, (err, asset) => {
      if (err || !asset) {
        resolve(null);
        return;
      }
      resolve(SpriteFrame.createWithImage(asset));
    });
  });
  loadedFrames.set(cacheKey, pending);
  return pending;
};

const loadFrameSet = (manifestPaths: string[]): Promise<SpriteFrame[]> => {
  const cacheKey = `set:${manifestPaths.join('|')}`;
  const cached = loadedFrameSets.get(cacheKey);
  if (cached) return cached;

  const pending = Promise.all(manifestPaths.map((path) => loadFrame(path))).then((frames) => frames.filter((frame): frame is SpriteFrame => Boolean(frame)));
  loadedFrameSets.set(cacheKey, pending);
  return pending;
};

const loadFirstFrameSet = async (candidateSets: string[][]): Promise<SpriteFrame[]> => {
  for (const paths of candidateSets) {
    const frames = await loadFrameSet(paths);
    if (frames.length > 0) return frames;
  }
  return [];
};

export class UnitSpriteResolver {
  public async resolve(unitId: UnitId, star: StarLevel, divineState: boolean): Promise<SpriteFrame | null> {
    const entry = ART_RESOURCE_MANIFEST.units[unitId];
    if (!entry) return null;
    const filename = divineState ? entry.divineOverride ?? entry.stars?.[star] : entry.stars?.[star] ?? entry.divineOverride;
    const path = filename ? `${entry.directory}/${filename}` : undefined;
    const primary = await loadFrame(path);
    if (primary) return primary;

    const starFallback = UNIT_STAR_SPRITE_PATHS[unitId]?.[star];
    const starFrame = await loadFrameFromResourcePath(starFallback);
    if (starFrame) return starFrame;

    return loadFrameFromResourcePath(UNIT_STAR_SPRITE_BASE_FALLBACK[unitId]);
  }

  public async resolvePortrait(unitId: UnitId, star: StarLevel, divineState: boolean): Promise<SpriteFrame | null> {
    const entry = ART_RESOURCE_MANIFEST.units[unitId];
    if (!entry) return this.resolve(unitId, star, divineState);

    const portraitPath = entry.portrait ? `${entry.directory}/${entry.portrait}` : undefined;
    const portraitFrame = await loadFrame(portraitPath);
    if (portraitFrame) return portraitFrame;

    return this.resolve(unitId, star, divineState);
  }

  public async resolveAvatar(unitId: UnitId): Promise<SpriteFrame | null> {
    return loadFrameFromResourcePath(UNIT_STAR_SPRITE_BASE_FALLBACK[unitId]);
  }

  public async resolveAnimation(unitId: UnitId, clip: UnitAnimationClip, divineState: boolean): Promise<SpriteFrame[]> {
    const entry = ART_RESOURCE_MANIFEST.units[unitId];
    if (!entry) return [];

    const baseId = divineState ? unitId : unitId;
    const clipNames = [clip];
    const candidates = clipNames.map((clipName) => (
      Array.from({ length: 5 }, (_, index) => `${entry.directory}/${baseId}_${clipName}_${String(index + 1).padStart(2, '0')}.png`)
    ));

    return loadFirstFrameSet(candidates);
  }
}

export class EnemySpriteResolver {
  public async resolve(enemyType: EnemyId): Promise<SpriteFrame | null> {
    return loadFrame(ART_RESOURCE_MANIFEST.enemies[enemyType]);
  }

  public async resolveAnimation(enemyType: EnemyId, clip: EnemyAnimationClip): Promise<SpriteFrame[]> {
    const staticPath = ART_RESOURCE_MANIFEST.enemies[enemyType];
    const directory = staticPath.split('/').slice(0, -1).join('/');
    const frames = Array.from({ length: 5 }, (_, index) => `${directory}/${enemyType}_${clip}_${String(index + 1).padStart(2, '0')}.png`);
    return loadFrameSet(frames);
  }
}

export type UiIconId = 'gold' | 'refresh' | 'sell' | 'start_wave' | 'star_1' | 'star_2' | 'star_3';

export class UiIconResolver {
  public async resolve(iconId: UiIconId): Promise<SpriteFrame | null> {
    const found = ART_RESOURCE_MANIFEST.uiIcons.find((path) => path.endsWith(`/${iconId}.png`));
    return loadFrame(found);
  }
}

export class BackgroundResolver {
  public async resolve(sceneId: 'battlefield_01' | string): Promise<SpriteFrame | null> {
    const found = ART_RESOURCE_MANIFEST.backgrounds.find((path) => path.includes(sceneId));
    return loadFrame(found);
  }
}
