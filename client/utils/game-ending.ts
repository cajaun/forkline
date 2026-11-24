import type { GameConfig, GameSummary } from '@/types/games';

// the app ends these games itself and the server knows nothing of them
const APP_ENDINGS = ['resignation', 'timeout'];

export function endedByApp(termination: string | null) {
  return termination !== null && APP_ENDINGS.includes(termination);
}

export function aiWinResult(config: GameConfig) {
  return config.humanColor === 'white' ? '0-1' : '1-0';
}

// the human king shows red after a resignation or timeout against the AI
export function lossSideOf(game: GameSummary | null): 'w' | 'b' | null {
  if (!game || game.config.gameMode !== 'human-vs-agent' || !endedByApp(game.termination)) return null;
  return game.config.humanColor === 'white' ? 'w' : 'b';
}
