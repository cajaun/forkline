import { useCallback, useEffect, useRef, useState } from 'react';

import type { MoveResult } from 'react-native-chessboard/src/state/move-executor';

import {
  requestHint as requestHintFromServer,
  requestHumanGameAiMove,
  requestMatchAiMove,
  submitHumanMove,
  type BackendState,
} from '@/services/chess-api';
import type { GameConfig, GameMoves, GameSummary, RecordedState } from '@/types/games';

import {
  errorMessage,
  isAiTurn,
  openSession,
  remoteMoveFrom,
  sessionKey,
  toRecordedState,
  type ActiveSession,
  type RemoteMove,
  type SyncRequest,
} from './backend-game/session';
import { useSessionValue } from './backend-game/use-session-value';

export type { RemoteMove, SyncRequest } from './backend-game/session';

// runs the selected game on the server and lets the AI move while active
export function useBackendGame({
  active,
  game,
  getMoves,
  recordState,
}: {
  active: boolean;
  game: GameSummary | null;
  getMoves: (id: string) => Promise<GameMoves>;
  recordState: (id: string, state: RecordedState) => void;
}) {
  const key = sessionKey(game);
  const keyRef = useRef(key);
  const [sessionFen, setSessionFen] = useSessionValue<string>(key, keyRef);
  const [error, setError] = useSessionValue<string>(key, keyRef);
  const [remoteMove, setRemoteMove] = useSessionValue<RemoteMove>(key, keyRef);
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const [busyState, setBusy] = useState(false);
  const [syncRequest, setSyncRequest] = useState<SyncRequest | null>(null);
  // each new session bumps the generation so replies from an older one drop
  const generationRef = useRef(0);
  const sessionRef = useRef<ActiveSession | null>(null);
  const busyRef = useRef(true);
  const activeRef = useRef(active);
  const configRef = useRef<GameConfig | null>(game?.config ?? null);
  const remoteMoveRef = useRef<RemoteMove | null>(null);
  const syncIdRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
    configRef.current = game?.config ?? null;
    keyRef.current = key;
  });

  const setBusyState = useCallback((value: boolean) => {
    busyRef.current = value;
    setBusy(value);
  }, []);

  const queueBoardSync = useCallback((fen: string) => {
    syncIdRef.current += 1;
    setSyncRequest({ fen, id: syncIdRef.current });
  }, []);

  const storeState = useCallback(
    (session: ActiveSession, state: BackendState) => {
      sessionRef.current = { ...session, state };
      recordState(session.gameId, toRecordedState(state));
    },
    [recordState],
  );

  // asks the server for an AI move on its turn and reports whether it asked
  const requestAiMove = useCallback(
    async (generation: number) => {
      const session = sessionRef.current;
      const config = configRef.current;
      if (
        !session ||
        !config ||
        generation !== generationRef.current ||
        !activeRef.current ||
        !isAiTurn(session.state, config)
      ) {
        return false;
      }

      setBusyState(true);
      try {
        const response =
          session.kind === 'game'
            ? await requestHumanGameAiMove(session.id)
            : await requestMatchAiMove(session.id);
        if (generation !== generationRef.current) return true;
        storeState(session, response);
        const nextMove = remoteMoveFrom(session.id, response.move);
        remoteMoveRef.current = nextMove;
        setRemoteMove(nextMove);
        setError(null);
      } catch (requestError) {
        if (generation !== generationRef.current) return true;
        setError(errorMessage(requestError, "The AI couldn't make a move"));
        setBusyState(false);
      }
      return true;
    },
    [setBusyState, setError, setRemoteMove, storeState],
  );

  const continueOrUnlock = useCallback(
    async (generation: number) => {
      const requested = await requestAiMove(generation);
      if (!requested && generation === generationRef.current) setBusyState(false);
    },
    [requestAiMove, setBusyState],
  );

  // the board finished animating a server move so the next AI move may follow
  const acknowledgeRemoteMove = useCallback(
    (id: string) => {
      if (remoteMoveRef.current?.id !== id) return;
      remoteMoveRef.current = null;
      setRemoteMove(null);
      void continueOrUnlock(generationRef.current);
    },
    [continueOrUnlock, setRemoteMove],
  );

  const onUserMove = useCallback(
    async (result: MoveResult) => {
      const session = sessionRef.current;
      if (!session || session.kind !== 'game' || busyRef.current) return;

      const generation = generationRef.current;
      setBusyState(true);
      try {
        const { from, promotion, to } = result.move;
        const response = await submitHumanMove(session.id, from + to + (promotion ?? ''));
        if (generation !== generationRef.current) return;
        storeState(session, response);
        setError(null);
        await continueOrUnlock(generation);
      } catch (requestError) {
        const current = sessionRef.current;
        if (current) queueBoardSync(current.state.fen);
        setError(errorMessage(requestError, "Forkline couldn't send the move to the chess server"));
        setBusyState(false);
      }
    },
    [continueOrUnlock, queueBoardSync, setBusyState, setError, storeState],
  );

  useEffect(() => {
    if (!game || !key) return;
    const generation = ++generationRef.current;
    const { config, fen: savedFen, id: gameId } = game;
    busyRef.current = true;
    remoteMoveRef.current = null;
    sessionRef.current = null;

    void (async () => {
      try {
        const history = await getMoves(gameId);
        if (generation !== generationRef.current) return;
        // the board shows the saved position while the server replays it
        queueBoardSync(savedFen);
        const session = await openSession(gameId, config, history);
        if (generation !== generationRef.current) return;
        storeState(session, session.state);
        setSessionFen(session.state.fen, key);
        if (session.state.fen !== savedFen) queueBoardSync(session.state.fen);
        setReadyKey(key);
        setBusyState(false);
        await continueOrUnlock(generation);
      } catch (requestError) {
        if (generation !== generationRef.current) return;
        setError(errorMessage(requestError, "The chess server couldn't resume this game"));
        setReadyKey(key);
        setBusyState(false);
      }
    })();

    return () => {
      generationRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // a move or a new session since the ask makes the hint stale
  const requestHint = useCallback(async () => {
    const session = sessionRef.current;
    const config = configRef.current;
    if (!session || !config || session.kind !== 'game' || busyRef.current) return null;
    if (isAiTurn(session.state, config) || session.state.is_game_over) return null;
    const generation = generationRef.current;
    try {
      const { uci } = await requestHintFromServer(session.id);
      if (generation !== generationRef.current || sessionRef.current !== session) return null;
      return uci;
    } catch (requestError) {
      setError(errorMessage(requestError, "The AI couldn't find a hint"));
      return null;
    }
  }, [setError]);

  useEffect(() => {
    if (!active || busyRef.current || remoteMoveRef.current) return;
    void continueOrUnlock(generationRef.current);
  }, [active, continueOrUnlock]);

  return {
    acknowledgeRemoteMove,
    boardFen: sessionFen ?? game?.fen ?? '',
    busy: busyState || readyKey !== key,
    error,
    onUserMove,
    remoteMove,
    requestHint,
    syncRequest,
  };
}
