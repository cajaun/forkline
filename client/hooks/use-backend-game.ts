import { useCallback, useEffect, useRef, useState } from 'react';

import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import {
  createAgentMatch,
  createHumanGame,
  moveFromUci,
  requestHumanGameAiMove,
  requestMatchAiMove,
  submitHumanMove,
  type BackendMove,
  type BackendMoveResponse,
  type BackendState,
} from '@/services/chess-api';
import type {
  GameSettings,
  SettingsState,
} from '@/components/trays/settings/types';

type ActiveSession =
  | { id: string; kind: 'game'; state: BackendState }
  | { id: string; kind: 'match'; state: BackendState };

export type RemoteMove = {
  id: string;
  move: ReturnType<typeof moveFromUci>;
};

export type SyncRequest = {
  id: number;
  fen: string;
};

function moveId(sessionId: string, move: BackendMove) {
  return `${sessionId}:${move.ply}:${move.uci}`;
}

function isAiTurn(state: BackendState, game: GameSettings) {
  if (state.is_game_over) return false;
  if (game.gameMode === 'agent-vs-agent') return true;
  return state.turn !== game.humanColor;
}

export function useBackendGame({
  initialFen,
  settings,
}: {
  initialFen: string;
  settings: SettingsState;
}) {
  const { game, gameplay } = settings;
  const [, setActiveSession] = useState<ActiveSession | null>(null);
  const [boardFen, setBoardFen] = useState(initialFen);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteMove, setRemoteMove] = useState<RemoteMove | null>(null);
  const [syncRequest, setSyncRequest] = useState<SyncRequest | null>(null);
  const generationRef = useRef(0);
  const sessionRef = useRef<ActiveSession | null>(null);
  const busyRef = useRef(true);
  const remoteMoveRef = useRef<RemoteMove | null>(null);
  const syncIdRef = useRef(0);

  const setBusyState = useCallback((value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  }, []);

  const queueBoardSync = useCallback((fen: string) => {
    syncIdRef.current += 1;
    setSyncRequest({ id: syncIdRef.current, fen });
  }, []);

  const updateSession = useCallback((session: ActiveSession) => {
    sessionRef.current = session;
    setActiveSession(session);
  }, []);

  const applyAiResponse = useCallback(
    (session: ActiveSession, response: BackendMoveResponse) => {
      const nextSession: ActiveSession = { ...session, state: response };
      updateSession(nextSession);
      const nextMove = {
        id: moveId(session.id, response.move),
        move: moveFromUci(response.move.uci),
      };
      remoteMoveRef.current = nextMove;
      setRemoteMove(nextMove);
    },
    [updateSession],
  );

  const requestAiMove = useCallback(
    async (generation: number, force = false) => {
      const session = sessionRef.current;
      if (
        !session ||
        generation !== generationRef.current ||
        (!force && busyRef.current)
      ) {
        return;
      }

      setBusyState(true);
      try {
        const response =
          session.kind === 'game'
            ? await requestHumanGameAiMove(session.id)
            : await requestMatchAiMove(session.id);
        if (generation !== generationRef.current) return;
        applyAiResponse(session, response);
        setError(null);
        // Keep the board locked until the animated server move is acknowledged.
      } catch (requestError) {
        if (generation !== generationRef.current) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'The AI could not make a move.',
        );
        setBusyState(false);
      }
    },
    [applyAiResponse, setBusyState],
  );

  const acknowledgeRemoteMove = useCallback(
    (id: string) => {
      if (remoteMoveRef.current?.id !== id) return;
      remoteMoveRef.current = null;
      setRemoteMove(null);
      const session = sessionRef.current;
      if (!session) {
        setBusyState(false);
        return;
      }
      if (session.state.is_game_over) {
        setBusyState(false);
        return;
      }
      if (session.kind === 'match' || isAiTurn(session.state, game)) {
        void requestAiMove(generationRef.current, true);
        return;
      }
      setBusyState(false);
    },
    [game, requestAiMove, setBusyState],
  );

  const onUserMove = useCallback(
    async (result: MoveResult) => {
      const session = sessionRef.current;
      if (!session || session.kind !== 'game' || busyRef.current) return;

      const generation = generationRef.current;
      setBusyState(true);
      try {
        const response = await submitHumanMove(
          session.id,
          result.move.from + result.move.to + (result.move.promotion ?? ''),
        );
        if (generation !== generationRef.current) return;
        updateSession({ ...session, state: response });
        setError(null);
        if (isAiTurn(response, game)) {
          await requestAiMove(generation, true);
        } else {
          setBusyState(false);
        }
      } catch (requestError) {
        const current = sessionRef.current;
        if (current) {
          queueBoardSync(current.state.fen);
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'The move could not be sent to the chess server.',
        );
        setBusyState(false);
      }
    },
    [game, queueBoardSync, requestAiMove, setBusyState, updateSession],
  );

  const createSession = useCallback(async () => {
    const generation = ++generationRef.current;
    setBusyState(true);
    setError(null);
    setRemoteMove(null);
    remoteMoveRef.current = null;
    sessionRef.current = null;
    setActiveSession(null);

    try {
      if (game.gameMode === 'agent-vs-agent') {
        const response = await createAgentMatch(
          game,
          gameplay,
          initialFen,
        );
        if (generation !== generationRef.current) return;
        const session: ActiveSession = {
          id: response.match_id,
          kind: 'match',
          state: response,
        };
        setBoardFen(response.fen);
        queueBoardSync(response.fen);
        updateSession(session);
        await requestAiMove(generation, true);
        return;
      }

      const response = await createHumanGame(
        game,
        gameplay,
        initialFen,
      );
      if (generation !== generationRef.current) return;
      const session: ActiveSession = {
        id: response.game_id,
        kind: 'game',
        state: response,
      };
      setBoardFen(response.fen);
      queueBoardSync(response.fen);
      updateSession(session);
      if (isAiTurn(response, game)) {
        await requestAiMove(generation, true);
      } else {
        setBusyState(false);
      }
    } catch (requestError) {
      if (generation !== generationRef.current) return;
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The chess server could not create a game.',
      );
      setBusyState(false);
    }
  }, [
    initialFen,
    queueBoardSync,
    requestAiMove,
    setBusyState,
    game,
    gameplay,
    updateSession,
  ]);

  useEffect(() => {
    void createSession();
    return () => {
      generationRef.current += 1;
    };
  }, [createSession]);

  return {
    acknowledgeRemoteMove,
    boardFen,
    busy,
    error,
    onUserMove,
    remoteMove,
    syncRequest,
  };
}
