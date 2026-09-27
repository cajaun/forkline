import { View } from 'react-native';

import React, { memo } from 'react';

import Chessboard from 'react-native-chessboard';

import { BOARD_COLORS } from '@/constants/chess-game';

import type { ChessboardRef, MoveResult } from 'react-native-chessboard';

export const Board = memo(function Board({
  chessRef,
  boxRef,
  boardSize,
  flipped,
  fen,
  onMove,
}: {
  chessRef: React.RefObject<ChessboardRef | null>;
  boxRef: React.RefObject<View | null>;
  boardSize: number;
  flipped: boolean;
  fen: string;
  onMove: (result: MoveResult) => void;
}) {
  // keep the measured board box available for checkmate overlays
  return (
    <View ref={boxRef} collapsable={false}>
      <Chessboard
        ref={chessRef}
        boardSize={boardSize}
        fen={fen}
        flipped={flipped}
        onMove={onMove}
        colors={BOARD_COLORS}
      />
    </View>
  );
});
