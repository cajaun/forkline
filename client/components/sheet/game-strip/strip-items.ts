import type { GameSummary } from '@/types/games';

export type StripGame = {
  game: GameSummary;
  numberInDay: number | null;
};

// the new game cell rides at the end of the list as an item
export const NEW_GAME_ENTRY = { kind: 'new-game' } as const;

export type StripEntry = StripGame | typeof NEW_GAME_ENTRY;

// games oldest first and numbered within a day that holds several
export function stripGames(days: string[], gamesByDay: Record<string, GameSummary[]>): StripGame[] {
  return days.flatMap(dayKey => {
    const games = gamesByDay[dayKey] ?? [];
    return games.map((game, index) => ({
      game,
      numberInDay: games.length > 1 ? index + 1 : null,
    }));
  });
}
