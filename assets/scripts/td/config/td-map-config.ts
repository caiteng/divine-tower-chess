import type { TDMapConfig, TDStageId, TDTowerSlotState } from '../types';
import { TD_STAGE_IDS } from './td-stage-ids';

function slots(points: Array<[string, number, number, string[]?]>): TDTowerSlotState[] {
  return points.map(([slotId, x, y, tags]) => ({
    slotId,
    position: { x, y },
    tags: tags ?? [],
  }));
}

export const TD_MAP_CONFIG: Record<TDStageId, TDMapConfig> = {
  stage_1_forest_loop: {
    stageId: 'stage_1_forest_loop',
    name: '林地外环',
    size: { width: 1280, height: 720 },
    backgroundId: 'td/maps/stage_1_forest_loop/background',
    groundPaths: [{
      pathId: 'stage_1_ground_main',
      kind: 'ground',
      points: [
        { x: 0, y: 430 },
        { x: 220, y: 430 },
        { x: 320, y: 250 },
        { x: 620, y: 250 },
        { x: 760, y: 500 },
        { x: 1040, y: 500 },
        { x: 1280, y: 360 },
      ],
    }],
    airPaths: [{
      pathId: 'stage_1_air_main',
      kind: 'air',
      points: [
        { x: 0, y: 180 },
        { x: 480, y: 220 },
        { x: 920, y: 300 },
        { x: 1280, y: 260 },
      ],
    }],
    towerSlots: slots([
      ['slot_01', 220, 520, ['ranged']],
      ['slot_02', 320, 330, ['melee']],
      ['slot_03', 520, 170, ['ranged']],
      ['slot_04', 640, 350, ['melee']],
      ['slot_05', 760, 590, ['ranged']],
      ['slot_06', 900, 420, ['melee']],
      ['slot_07', 1030, 610, ['ranged']],
      ['slot_08', 1080, 280, ['ranged']],
    ]),
    captainAnchors: [
      { anchorId: 'anchor_left', position: { x: 260, y: 390 } },
      { anchorId: 'anchor_mid', position: { x: 680, y: 360 } },
      { anchorId: 'anchor_right', position: { x: 980, y: 430 } },
    ],
    entranceMarkers: [{ x: 0, y: 430 }, { x: 0, y: 180 }],
    exitMarker: { x: 1280, y: 360 },
  },
  stage_2_twin_bridge: {
    stageId: 'stage_2_twin_bridge',
    name: '双桥峡谷',
    size: { width: 1280, height: 720 },
    backgroundId: 'td/maps/stage_2_twin_bridge/background',
    groundPaths: [
      {
        pathId: 'stage_2_ground_top',
        kind: 'ground',
        points: [{ x: 0, y: 230 }, { x: 300, y: 230 }, { x: 560, y: 360 }, { x: 900, y: 360 }, { x: 1280, y: 420 }],
      },
      {
        pathId: 'stage_2_ground_bottom',
        kind: 'ground',
        points: [{ x: 0, y: 540 }, { x: 330, y: 540 }, { x: 560, y: 360 }, { x: 900, y: 360 }, { x: 1280, y: 420 }],
      },
    ],
    airPaths: [{
      pathId: 'stage_2_air_main',
      kind: 'air',
      points: [{ x: 0, y: 120 }, { x: 420, y: 240 }, { x: 860, y: 260 }, { x: 1280, y: 320 }],
    }],
    towerSlots: slots([
      ['slot_01', 210, 150], ['slot_02', 260, 310], ['slot_03', 250, 620], ['slot_04', 460, 500],
      ['slot_05', 610, 250], ['slot_06', 720, 430], ['slot_07', 860, 270], ['slot_08', 960, 500],
      ['slot_09', 1080, 340], ['slot_10', 1140, 520],
    ]),
    captainAnchors: [
      { anchorId: 'anchor_top', position: { x: 360, y: 280 } },
      { anchorId: 'anchor_merge', position: { x: 610, y: 360 } },
      { anchorId: 'anchor_exit', position: { x: 1030, y: 390 } },
    ],
    entranceMarkers: [{ x: 0, y: 230 }, { x: 0, y: 540 }],
    exitMarker: { x: 1280, y: 420 },
  },
  stage_3_lost_corridor: {
    stageId: 'stage_3_lost_corridor',
    name: '失落回廊',
    size: { width: 1280, height: 720 },
    backgroundId: 'td/maps/stage_3_lost_corridor/background',
    groundPaths: [{
      pathId: 'stage_3_ground_main',
      kind: 'ground',
      points: [{ x: 0, y: 600 }, { x: 200, y: 600 }, { x: 200, y: 160 }, { x: 720, y: 160 }, { x: 720, y: 540 }, { x: 1080, y: 540 }, { x: 1080, y: 280 }, { x: 1280, y: 280 }],
    }],
    airPaths: [{
      pathId: 'stage_3_air_main',
      kind: 'air',
      points: [{ x: 0, y: 120 }, { x: 520, y: 240 }, { x: 960, y: 220 }, { x: 1280, y: 180 }],
    }],
    towerSlots: slots([
      ['slot_01', 120, 520], ['slot_02', 300, 430], ['slot_03', 320, 200], ['slot_04', 560, 250],
      ['slot_05', 640, 90], ['slot_06', 810, 390], ['slot_07', 880, 610], ['slot_08', 1040, 450],
      ['slot_09', 1160, 340], ['slot_10', 980, 180],
    ]),
    captainAnchors: [
      { anchorId: 'anchor_outer', position: { x: 260, y: 520 } },
      { anchorId: 'anchor_inner', position: { x: 690, y: 340 } },
      { anchorId: 'anchor_exit', position: { x: 1110, y: 290 } },
    ],
    entranceMarkers: [{ x: 0, y: 600 }, { x: 0, y: 120 }],
    exitMarker: { x: 1280, y: 280 },
  },
  stage_4_forge_cross: {
    stageId: 'stage_4_forge_cross',
    name: '熔炉十字',
    size: { width: 1280, height: 720 },
    backgroundId: 'td/maps/stage_4_forge_cross/background',
    groundPaths: [
      {
        pathId: 'stage_4_ground_left',
        kind: 'ground',
        points: [{ x: 0, y: 360 }, { x: 520, y: 360 }, { x: 760, y: 480 }, { x: 1280, y: 480 }],
      },
      {
        pathId: 'stage_4_ground_top',
        kind: 'ground',
        points: [{ x: 520, y: 0 }, { x: 520, y: 360 }, { x: 760, y: 480 }, { x: 1280, y: 480 }],
      },
    ],
    airPaths: [{
      pathId: 'stage_4_air_main',
      kind: 'air',
      points: [{ x: 0, y: 100 }, { x: 460, y: 180 }, { x: 820, y: 260 }, { x: 1280, y: 220 }],
    }],
    towerSlots: slots([
      ['slot_01', 190, 270], ['slot_02', 250, 450], ['slot_03', 420, 250], ['slot_04', 580, 250],
      ['slot_05', 610, 450], ['slot_06', 720, 350], ['slot_07', 820, 560], ['slot_08', 910, 420],
      ['slot_09', 990, 580], ['slot_10', 1080, 360], ['slot_11', 1120, 180], ['slot_12', 660, 100],
    ]),
    captainAnchors: [
      { anchorId: 'anchor_cross', position: { x: 560, y: 360 } },
      { anchorId: 'anchor_forge', position: { x: 800, y: 470 } },
      { anchorId: 'anchor_exit', position: { x: 1070, y: 470 } },
    ],
    entranceMarkers: [{ x: 0, y: 360 }, { x: 520, y: 0 }],
    exitMarker: { x: 1280, y: 480 },
  },
  stage_5_sky_sanctum: {
    stageId: 'stage_5_sky_sanctum',
    name: '天穹圣坛',
    size: { width: 1280, height: 720 },
    backgroundId: 'td/maps/stage_5_sky_sanctum/background',
    groundPaths: [{
      pathId: 'stage_5_ground_main',
      kind: 'ground',
      points: [{ x: 0, y: 610 }, { x: 180, y: 610 }, { x: 180, y: 180 }, { x: 520, y: 180 }, { x: 520, y: 560 }, { x: 900, y: 560 }, { x: 900, y: 260 }, { x: 1280, y: 260 }],
    }],
    airPaths: [{
      pathId: 'stage_5_air_main',
      kind: 'air',
      points: [{ x: 0, y: 100 }, { x: 360, y: 160 }, { x: 720, y: 180 }, { x: 1280, y: 160 }],
    }],
    towerSlots: slots([
      ['slot_01', 120, 520], ['slot_02', 290, 430], ['slot_03', 290, 150], ['slot_04', 440, 270],
      ['slot_05', 610, 130], ['slot_06', 650, 500], ['slot_07', 780, 620], ['slot_08', 860, 430],
      ['slot_09', 1000, 520], ['slot_10', 1040, 310], ['slot_11', 1120, 180], ['slot_12', 760, 260],
    ]),
    captainAnchors: [
      { anchorId: 'anchor_outer', position: { x: 240, y: 520 } },
      { anchorId: 'anchor_spiral', position: { x: 640, y: 520 } },
      { anchorId: 'anchor_sanctum', position: { x: 980, y: 280 } },
    ],
    entranceMarkers: [{ x: 0, y: 610 }, { x: 0, y: 100 }],
    exitMarker: { x: 1280, y: 260 },
  },
};

export function getTDMapConfig(stageId: TDStageId): TDMapConfig {
  return TD_MAP_CONFIG[stageId] ?? TD_MAP_CONFIG.stage_1_forest_loop;
}

export function getAllTDMapConfigs(): TDMapConfig[] {
  return TD_STAGE_IDS.map((stageId) => getTDMapConfig(stageId));
}
