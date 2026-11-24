import type { useBoardConfig, useBoardStateValues } from 'react-native-chessboard/src/state';

export type BoardState = ReturnType<typeof useBoardStateValues>;

export type BoardConfig = ReturnType<typeof useBoardConfig>;
