import type { ImageSourcePropType } from 'react-native';

import type { Side } from '@/types/chess';

// map chess piece codes to the board image assets
export const PIECE_IMG: Record<Side, Record<string, ImageSourcePropType>> = {
  w: {
    p: require('react-native-chessboard/src/assets/wp.png'),
    n: require('react-native-chessboard/src/assets/wn.png'),
    b: require('react-native-chessboard/src/assets/wb.png'),
    r: require('react-native-chessboard/src/assets/wr.png'),
    q: require('react-native-chessboard/src/assets/wq.png'),
    k: require('react-native-chessboard/src/assets/wk.png'),
  },
  b: {
    p: require('react-native-chessboard/src/assets/bp.png'),
    n: require('react-native-chessboard/src/assets/bn.png'),
    b: require('react-native-chessboard/src/assets/bb.png'),
    r: require('react-native-chessboard/src/assets/br.png'),
    q: require('react-native-chessboard/src/assets/bq.png'),
    k: require('react-native-chessboard/src/assets/bk.png'),
  },
};

export const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
