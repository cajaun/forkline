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

// how a finished human game went from the player's side
export function humanOutcome(game: GameSummary | null): 'draw' | 'loss' | 'win' | null {
  if (!game || game.status !== 'finished' || game.config.gameMode !== 'human-vs-agent') return null;
  if (game.result === '1/2-1/2' || game.result === null) return 'draw';
  const humanResult = game.config.humanColor === 'white' ? '1-0' : '0-1';
  return game.result === humanResult ? 'win' : 'loss';
}

const ENDING_LABELS: Record<string, string> = {
  checkmate: 'CHECKMATE',
  'fifty-moves': '50 MOVES',
  'fivefold-repetition': 'REPETITION',
  'insufficient-material': 'NO MATERIAL',
  resignation: 'STOPPED',
  'seventyfive-moves': '75 MOVES',
  stalemate: 'STALEMATE',
  'threefold-repetition': 'REPETITION',
  timeout: 'TIME',
};

export type GameResult = { banner: string; ending: string; win: boolean };

// the result screen covers wins and draws and watched games while a player loss gets its own tray
export function resultOf(game: GameSummary | null): GameResult | null {
  if (!game || game.status !== 'finished') return null;
  const ending = ENDING_LABELS[game.termination ?? ''] ?? 'GAME OVER';
  if (game.config.gameMode === 'human-vs-agent') {
    const outcome = humanOutcome(game);
    if (outcome === 'loss') return null;
    return { banner: outcome === 'win' ? 'YOU WON' : 'DRAW', ending, win: outcome === 'win' };
  }
  const banner =
    game.result === '1-0'
      ? 'WHITE WINS'
      : game.result === '0-1'
        ? 'BLACK WINS'
        : game.result
          ? 'DRAW'
          : 'NO RESULT';
  return { banner, ending, win: false };
}
