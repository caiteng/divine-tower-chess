import type { TDDifficultyId, TDStageId, TDWaveDefinition, TDWaveEntry } from '../types';
import { TD_STAGE_IDS } from './td-stage-ids';

function e(enemyId: TDWaveEntry['enemyId'], count: number, level: number, interval = 0.55, spawnDelay = 0, pathKind?: TDWaveEntry['pathKind']): TDWaveEntry {
  return { enemyId, count, level, interval, spawnDelay, pathKind };
}

function wave(stageId: TDStageId, waveIndex: number, rewardGold: number, entries: TDWaveEntry[], previewTags: string[]): TDWaveDefinition {
  return { stageId, waveIndex, rewardGold, entries, previewTags };
}

const s1: TDWaveDefinition[] = [
  wave('stage_1_forest_loop', 1, 5, [e('slime', 12, 1, 0.42)], ['小怪']),
  wave('stage_1_forest_loop', 2, 6, [e('slime', 16, 1, 0.38)], ['小怪群']),
  wave('stage_1_forest_loop', 3, 7, [e('shieldling', 6, 1, 0.8), e('slime', 10, 1, 0.35, 1.5)], ['护甲']),
  wave('stage_1_forest_loop', 4, 8, [e('slime', 18, 2, 0.34), e('bat', 4, 1, 0.7, 2, 'air')], ['飞行']),
  wave('stage_1_forest_loop', 5, 9, [e('shieldling', 8, 2, 0.65), e('slime', 12, 2, 0.32, 1.5)], ['护甲', '小怪']),
  wave('stage_1_forest_loop', 6, 10, [e('boneguard', 4, 1, 0.9), e('slime', 16, 2, 0.32, 1.2)], ['重甲']),
  wave('stage_1_forest_loop', 7, 11, [e('shadehound', 8, 1, 0.45), e('shieldling', 10, 2, 0.55, 1.4)], ['潜行']),
  wave('stage_1_forest_loop', 8, 12, [e('bat', 10, 2, 0.45, 0, 'air'), e('boneguard', 6, 1, 0.7, 1.5)], ['飞行', '重甲']),
  wave('stage_1_forest_loop', 9, 14, [e('shadehound', 10, 2, 0.42), e('shieldling', 10, 3, 0.52, 1.2)], ['潜行', '护甲']),
  wave('stage_1_forest_loop', 10, 18, [e('gate_golem', 1, 1, 1.0), e('slime', 18, 3, 0.26, 1.5), e('bat', 6, 2, 0.5, 3, 'air')], ['Boss', '飞行']),
];

function cloneForStage(stageId: TDStageId, base: TDWaveDefinition[], levelOffset: number, rewardOffset: number): TDWaveDefinition[] {
  return base.map((w) => ({
    ...w,
    stageId,
    rewardGold: w.rewardGold + rewardOffset,
    entries: w.entries.map((entry) => ({
      ...entry,
      level: Math.max(1, entry.level + levelOffset),
      count: Math.max(1, Math.round(entry.count * (1 + levelOffset * 0.12))),
    })),
  }));
}

export const TD_WAVE_CONFIG: Record<TDStageId, TDWaveDefinition[]> = {
  stage_1_forest_loop: s1,
  stage_2_twin_bridge: [
    wave('stage_2_twin_bridge', 1, 6, [e('slime', 14, 2, 0.35), e('bat', 4, 1, 0.55, 1, 'air')], ['双路', '飞行']),
    wave('stage_2_twin_bridge', 2, 7, [e('shieldling', 10, 2, 0.55)], ['护甲']),
    wave('stage_2_twin_bridge', 3, 8, [e('shadehound', 6, 1, 0.42), e('slime', 14, 2, 0.3, 1)], ['潜行']),
    wave('stage_2_twin_bridge', 4, 9, [e('bat', 8, 2, 0.42, 0, 'air'), e('shieldling', 8, 2, 0.55, 1)], ['飞行', '护甲']),
    wave('stage_2_twin_bridge', 5, 10, [e('boneguard', 6, 2, 0.7), e('slime', 10, 3, 0.28, 1.2)], ['重甲']),
    wave('stage_2_twin_bridge', 6, 12, [e('shadehound', 10, 2, 0.35), e('bat', 10, 2, 0.4, 1.5, 'air')], ['潜行', '飞行']),
    wave('stage_2_twin_bridge', 7, 13, [e('warlock', 3, 1, 0.9), e('shieldling', 12, 3, 0.45, 1)], ['术士']),
    wave('stage_2_twin_bridge', 8, 14, [e('boneguard', 6, 2, 0.65), e('shadehound', 8, 3, 0.34, 1)], ['重甲', '潜行']),
    wave('stage_2_twin_bridge', 9, 16, [e('bat', 12, 3, 0.35, 0, 'air'), e('spore', 10, 1, 0.38, 1)], ['飞行', '自爆']),
    wave('stage_2_twin_bridge', 10, 20, [e('gate_golem', 1, 1, 1), e('warlock', 4, 2, 0.7, 1), e('shadehound', 10, 3, 0.32, 2)], ['Boss', '术士']),
  ],
  stage_3_lost_corridor: cloneForStage('stage_3_lost_corridor', s1, 2, 4).map((w, i) => (
    i === 9 ? { ...w, entries: [e('gate_golem', 1, 2), e('warlock', 5, 2, 0.7, 1), e('boneguard', 8, 3, 0.5, 2)] } : w
  )),
  stage_4_forge_cross: cloneForStage('stage_4_forge_cross', s1, 4, 7).map((w, i) => (
    i === 9 ? { ...w, entries: [e('gate_golem', 1, 2), e('spore', 16, 4, 0.28, 1), e('warlock', 6, 3, 0.6, 2)] } : w
  )),
  stage_5_sky_sanctum: cloneForStage('stage_5_sky_sanctum', s1, 6, 10).map((w, i) => (
    i === 9 ? { ...w, entries: [e('sky_lord', 1, 1), e('boneguard', 10, 7, 0.45, 1), e('warlock', 8, 4, 0.55, 2), e('bat', 14, 6, 0.32, 3, 'air')] } : w
  )),
};

export function getTDWaveDefinitions(stageId: TDStageId, difficulty: TDDifficultyId): TDWaveDefinition[] {
  const base = TD_WAVE_CONFIG[stageId] ?? TD_WAVE_CONFIG.stage_1_forest_loop;
  const levelBoost = difficulty === 'hard' ? 1 : difficulty === 'beginner' ? -1 : 0;
  return base.map((w) => ({
    ...w,
    entries: w.entries.map((entry) => ({
      ...entry,
      level: Math.max(1, entry.level + levelBoost),
    })),
  }));
}

export function getAllTDWaveDefinitions(): TDWaveDefinition[] {
  return TD_STAGE_IDS.flatMap((stageId) => TD_WAVE_CONFIG[stageId]);
}
