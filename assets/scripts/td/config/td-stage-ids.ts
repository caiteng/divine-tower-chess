
import type { TDStageId } from '../types';

export const TD_STAGE_IDS = ['stage_1_forest_loop'] as const satisfies readonly TDStageId[];

export const TD_DEFAULT_STAGE_ID: TDStageId = 'stage_1_forest_loop';

export function isTDStageId(value: string): value is TDStageId {
  return (TD_STAGE_IDS as readonly string[]).includes(value);
}
