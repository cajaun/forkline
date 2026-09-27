import { useMemo } from 'react';

import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { SHEET_BOARD_COLORS } from '../config';
import { occupiedCellsFromFen } from '../utils';
import { AnimatedView } from '../../../shared/uniwind';

function HexagonMarker({ size }: { size: number }) {
  return (
    <Svg height={size} viewBox="0 0 100 100" width={size}>
      <Path
        d="M46 4Q50 2 54 4L91 25Q96 28 96 33V67Q96 72 91 75L54 96Q50 98 46 96L9 75Q4 72 4 67V33Q4 28 9 25Z"
        fill="#bfbfbf"
      />
    </Svg>
  );
}

export function PreviewSurface({
  boardSize,
  fen,
  showPieces,
}: {
  boardSize: number;
  fen: string;
  showPieces: boolean;
}) {
  const occupied = useMemo(() => occupiedCellsFromFen(fen), [fen]);
  return (
    <AnimatedView
      className="absolute inset-0 z-[2]"
      pointerEvents="none"
      style={{ opacity: showPieces ? 0 : 1 }}>
      {Array.from({ length: 64 }, (_, index) => {
        const cell = boardSize / 8;
        const col = index % 8;
        const row = Math.floor(index / 8);
        const dot = Math.max(6, cell * 0.40);

        return (
          <View
            key={index}
            className="absolute items-center justify-center"
            style={{
              backgroundColor: occupied.has(index)
                ? (row + col) % 2 === 0
                  ? SHEET_BOARD_COLORS.white
                  : SHEET_BOARD_COLORS.black
                : 'transparent',
              height: cell,
              left: col * cell,
              top: row * cell,
              width: cell,
            }}>
            {occupied.has(index) ? (
              <HexagonMarker size={dot} />
            ) : null}
          </View>
        );
      })}
    </AnimatedView>
  );
}
