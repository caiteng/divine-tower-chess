import { ImageAsset, SpriteFrame, resources } from 'cc';
import { ART_RESOURCE_MANIFEST, StarLevel } from '../../config/art-resource-manifest';
import { EnemyId, UnitId } from '../../models/types';

const loadedFrames = new Map<string, Promise<SpriteFrame | null>>();

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

export class UnitSpriteResolver {
  public async resolve(unitId: UnitId, star: StarLevel, divineState: boolean): Promise<SpriteFrame | null> {
    const entry = ART_RESOURCE_MANIFEST.units[unitId];
    if (!entry) return null;
    const filename = divineState ? entry.divineOverride ?? entry.stars?.[star] : entry.stars?.[star] ?? entry.divineOverride;
    const path = filename ? `${entry.directory}/${filename}` : undefined;
    return loadFrame(path);
  }
}

export class EnemySpriteResolver {
  public async resolve(enemyType: EnemyId): Promise<SpriteFrame | null> {
    return loadFrame(ART_RESOURCE_MANIFEST.enemies[enemyType]);
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
