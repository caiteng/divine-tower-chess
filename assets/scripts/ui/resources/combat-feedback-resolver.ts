import { ImageAsset, SpriteFrame, resources } from 'cc';

export type CombatFeedbackSequenceId = 'hit_flash' | 'knockback_dust' | 'death_smoke';
export type CombatNumberSetId = 'damage' | 'heal';

const frameCache = new Map<string, Promise<SpriteFrame | null>>();
const sequenceCache = new Map<string, Promise<SpriteFrame[]>>();

const loadFrame = (resourcePath: string): Promise<SpriteFrame | null> => {
  const cached = frameCache.get(resourcePath);
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
  frameCache.set(resourcePath, pending);
  return pending;
};

const sequencePath = (sequenceId: CombatFeedbackSequenceId, index: number): string => {
  const padded = String(index).padStart(2, '0');
  return `textures/vfx/${sequenceId}/${sequenceId}_${padded}`;
};

export class CombatFeedbackResolver {
  public async resolveSequence(sequenceId: CombatFeedbackSequenceId): Promise<SpriteFrame[]> {
    const cached = sequenceCache.get(sequenceId);
    if (cached) return cached;

    const pending = Promise.all(
      Array.from({ length: 6 }, (_, index) => loadFrame(sequencePath(sequenceId, index + 1))),
    ).then((frames) => frames.filter((frame): frame is SpriteFrame => Boolean(frame)));
    sequenceCache.set(sequenceId, pending);
    return pending;
  }

  public async resolveNumberFrames(setId: CombatNumberSetId, value: number, includePlus = false): Promise<SpriteFrame[]> {
    const digits = String(Math.max(0, Math.round(value))).split('');
    const prefix = includePlus ? [loadFrame('textures/ui/combat_numbers/heal/heal_plus')] : [];
    const digitFrames = digits.map((digit) => loadFrame(`textures/ui/combat_numbers/${setId}/${setId}_${digit}`));
    const frames = await Promise.all([...prefix, ...digitFrames]);
    return frames.filter((frame): frame is SpriteFrame => Boolean(frame));
  }

  public async resolveBossBanner(): Promise<SpriteFrame | null> {
    return loadFrame('textures/ui/boss_banner/boss_entrance_banner');
  }
}
