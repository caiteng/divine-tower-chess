export const SQUAD_DEPLOY_SLOTS = 5;
export const SQUAD_BENCH_SLOTS = 8;
export const SQUAD_SHOP_SLOTS = 3;

export type PrepPanelState = 'hidden' | 'rising' | 'visible' | 'falling';
export type BattlefieldLightingState = 'dim' | 'brightening' | 'bright';

export interface WaveTransitionUiState {
  prepPanel: PrepPanelState;
  battlefieldLighting: BattlefieldLightingState;
  transitionProgress: number;
  nextWaveReady: boolean;
}
