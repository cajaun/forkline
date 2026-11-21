import AsyncStorage from '@react-native-async-storage/async-storage';

import type { GameLibrary, GameMoves } from '@/types/games';

// the index holds settings and game summaries, and each move list gets its own key so a move never rewrites the history
const LIBRARY_KEY = 'forkline/library/v1';
const movesKey = (gameId: string) => `forkline/game/v1/${gameId}`;

export async function loadLibrary(): Promise<GameLibrary | null> {
  const raw = await AsyncStorage.getItem(LIBRARY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameLibrary;
    return parsed?.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveLibrary(library: GameLibrary): Promise<void> {
  await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
}

export async function loadMoves(gameId: string): Promise<GameMoves | null> {
  const raw = await AsyncStorage.getItem(movesKey(gameId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameMoves;
  } catch {
    return null;
  }
}

// development only: forget every saved game and setting
export async function clearAllGames(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter(key => key.startsWith('forkline/')));
}

export async function saveMoves(gameId: string, moves: GameMoves): Promise<void> {
  await AsyncStorage.setItem(movesKey(gameId), JSON.stringify(moves));
}
