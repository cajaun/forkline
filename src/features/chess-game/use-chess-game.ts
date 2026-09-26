import { Alert } from 'react-native';

import { useCallback, useEffect, useRef } from 'react';

import { useSetAtom } from 'jotai';

import { useCheckmateAura } from './checkmate-aura';
import {
  FOOLS_MATE,
  PLAYERS,
  REPLAY,
  REVIEW_ACCURACY,
  REVIEW_MOVES,
} from './constants';
import {
  capturedAtom,
  clockSv,
  gameOverSv,
  pausedAtom,
  pliesAtom,
  resetGameAtom,
  runningAtom,
  selectedPlyAtom,
  startedSv,
  statusAtom,
  turnSv,
} from './state';
import { delay, kingFromFen, measureInWindow, statusFor } from './utils';

import type { Side } from './types';
import type { View } from 'react-native';
import type { ChessboardRef, MoveResult } from 'react-native-chessboard';

export const useChessGame = ({
  flipped,
  pieceSize,
  initialFen,
}: {
  flipped: boolean;
  pieceSize: number;
  initialFen: string;
}) => {
  const boardRef = useRef<ChessboardRef>(null);
  const boardBoxRef = useRef<View>(null);
  const { show, hide } = useCheckmateAura();
  const setPlies = useSetAtom(pliesAtom);
  const setSelectedPly = useSetAtom(selectedPlyAtom);
  const setRunning = useSetAtom(runningAtom);
  const setPausedAtom = useSetAtom(pausedAtom);
  const setCaptured = useSetAtom(capturedAtom);
  const setStatus = useSetAtom(statusAtom);
  const resetGame = useSetAtom(resetGameAtom);
  const alive = useRef(true);
  const runningRef = useRef(false);
  const auraTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replayGeneration = useRef(0);
  const pausedRef = useRef(false);

  const setPaused = useCallback(
    (value: boolean) => {
      pausedRef.current = value;
      setPausedAtom(value);
    },
    [setPausedAtom],
  );

  const playSequence = useCallback(async () => {
    if (runningRef.current) return;
    const generation = ++replayGeneration.current;
    runningRef.current = true;
    setRunning(true);
    setPaused(false);
    boardRef.current?.resetBoard(initialFen);
    resetGame();
    await delay(REPLAY.START_DELAY);

    for (const [from, to] of FOOLS_MATE) {
      if (!alive.current || replayGeneration.current !== generation) return;
      while (pausedRef.current) {
        if (!alive.current || replayGeneration.current !== generation) return;
        await delay(REPLAY.PAUSE_POLL);
      }
      await boardRef.current?.move({ from, to });
      if (!alive.current || replayGeneration.current !== generation) return;
      await delay(REPLAY.MOVE_GAP);
    }

    if (replayGeneration.current !== generation) return;
    runningRef.current = false;
    setRunning(false);
  }, [initialFen, resetGame, setPaused, setRunning]);

  const togglePlay = useCallback(() => {
    if (!runningRef.current) {
      playSequence();
      return;
    }
    setPaused(!pausedRef.current);
  }, [playSequence, setPaused]);

  const rematch = useCallback(() => {
    replayGeneration.current += 1;
    runningRef.current = false;
    setRunning(false);
    setPaused(false);
    if (auraTimer.current != null) clearTimeout(auraTimer.current);
    hide();
    boardRef.current?.resetBoard(initialFen);
    resetGame();
  }, [hide, initialFen, resetGame, setPaused, setRunning]);

  const confirmNewGame = useCallback(() => {
    Alert.alert('New Game?', 'This clears the current board and starts fresh.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New Game', style: 'destructive', onPress: rematch },
    ]);
  }, [rematch]);

  const showAura = useCallback(
    async (fen: string, moverColor: Side) => {
      const kingColor: Side = moverColor === 'w' ? 'b' : 'w';
      const king = kingFromFen(fen, kingColor);
      if (!king) return;
      const box = await measureInWindow(boardBoxRef);
      if (!box || !alive.current) return;
      const column = flipped ? 7 - king.file : king.file;
      const row = flipped ? 7 - king.rowFromTop : king.rowFromTop;
      show({
        x: box.x + column * pieceSize + pieceSize / 2,
        y: box.y + row * pieceSize + pieceSize / 2,
        subtitle: `${PLAYERS[moverColor].name} wins`,
        oppName: PLAYERS.b.name,
        accuracy: REVIEW_ACCURACY,
        moves: REVIEW_MOVES,
        onReplay: playSequence,
        onBack: rematch,
      });
    },
    [flipped, pieceSize, playSequence, rematch, show],
  );

  const onMove = useCallback(
    (result: MoveResult) => {
      const { isCheckmate, isStalemate } = result.state;
      const mover = result.move.color as Side;
      const captured = result.move.captured;
      setPlies(previous => [
        ...previous,
        {
          san: result.move.san,
          fen: result.state.fen,
          from: result.move.from,
          to: result.move.to,
        },
      ]);
      setSelectedPly(previous => previous + 1);
      if (captured) {
        setCaptured(previous => ({
          ...previous,
          [mover]: [...previous[mover], captured],
        }));
      }
      setStatus(statusFor(result));
      turnSv.set(mover === 'w' ? 'b' : 'w');
      gameOverSv.set(isCheckmate || isStalemate);
      startedSv.set(true);

      if (isCheckmate) {
        auraTimer.current = setTimeout(
          () => showAura(result.state.fen, mover),
          REPLAY.AURA_DELAY,
        );
      }
    },
    [setCaptured, setPlies, setSelectedPly, setStatus, showAura],
  );

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (auraTimer.current != null) clearTimeout(auraTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || !startedSv.get() || gameOverSv.get()) return;
      const clock = clockSv[turnSv.get()];
      clock.set(Math.max(0, clock.get() - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return { boardRef, boardBoxRef, confirmNewGame, onMove, togglePlay };
};
