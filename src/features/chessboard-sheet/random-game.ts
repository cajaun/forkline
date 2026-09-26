import { Chess } from 'chess.js';

export const createRandomGameFen = (): string => {
  const game = new Chess();
  const plies = 12 + Math.floor(Math.random() * 5) * 2;

  for (let ply = 0; ply < plies && !game.isGameOver(); ply += 1) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) break;
    game.move(moves[Math.floor(Math.random() * moves.length)]);
  }

  return game.fen();
};
