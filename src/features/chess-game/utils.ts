import type { Side } from './types';
import type React from 'react';
import type { View } from 'react-native';
import type { MoveResult } from 'react-native-chessboard';

export const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

export const measureInWindow = (
  ref: React.RefObject<View | null>,
): Promise<{ x: number; y: number; width: number; height: number } | null> =>
  new Promise(resolve => {
    const node = ref.current;
    if (!node) return resolve(null);
    node.measureInWindow((x, y, width, height) =>
      resolve({ x, y, width, height }),
    );
  });

export const kingFromFen = (
  fen: string,
  color: Side,
): { file: number; rowFromTop: number } | null => {
  const ranks = fen.split(' ')[0].split('/');
  const target = color === 'w' ? 'K' : 'k';

  for (let row = 0; row < ranks.length; row += 1) {
    let file = 0;
    for (const character of ranks[row]) {
      if (character >= '1' && character <= '9') {
        file += parseInt(character, 10);
      } else {
        if (character === target) return { file, rowFromTop: row };
        file += 1;
      }
    }
  }

  return null;
};

export const toRgba = (rgb: number[], alphaValue: number) => {
  'worklet';
  const alpha = Math.max(0, Math.min(1, alphaValue)).toFixed(3);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
};

export const statusFor = (result: MoveResult): string => {
  const { isCheckmate, isStalemate, isCheck } = result.state;
  if (isCheckmate) return 'Checkmate';
  if (isStalemate) return 'Stalemate';
  if (isCheck) return 'Check';
  return result.move.color === 'w' ? 'Black to move' : 'White to move';
};
