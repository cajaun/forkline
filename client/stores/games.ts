// the game library's public surface: constants, stable actions and subscription hooks
export { gameActions } from './library/actions';
export { useGameLibrary, useOnboardingState, useSettingsSlice } from './library/selectors';
export { INITIAL_GAME_CONFIG, START_FEN } from './library/state';
