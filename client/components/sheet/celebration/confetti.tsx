import { forwardRef, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CannonConfetti, type ConfettiMethods } from 'react-native-fast-confetti';

import { useSheetColors } from '@/hooks/use-sheet-colors';

// the board greys with the check orange as the one bright colour
const PIECE_GREY = '#BABABA';
const MUTED_GREY = '#777777';
const PER_CANNON = 120;

// two cannons at the screen edges throw paper up and in when a game is won
export const Confetti = memo(
  forwardRef<ConfettiMethods>(function Confetti(_, ref) {
    const { colors, isDark, kingColors } = useSheetColors();
    const orange = isDark ? kingColors.checkmate.marker : kingColors.checkmate.dot;

    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
        <CannonConfetti
          ref={ref}
          autoplay={false}
          colors={[colors.text, PIECE_GREY, MUTED_GREY, orange]}
          fadeOutOnEnd
          flakeStyle="solid"
          gravity={2}
        >
          <CannonConfetti.Origin
            count={PER_CANNON}
            initialSpeed={3}
            position="center-left"
            target="top-center"
          >
            <CannonConfetti.Flake width={8} height={12} radius={1.5} />
            <CannonConfetti.Flake size={8} radius={4} />
          </CannonConfetti.Origin>
          <CannonConfetti.Origin
            count={PER_CANNON}
            initialSpeed={3}
            position="center-right"
            target="top-center"
          >
            <CannonConfetti.Flake width={8} height={12} radius={1.5} />
            <CannonConfetti.Flake size={8} radius={4} />
          </CannonConfetti.Origin>
        </CannonConfetti>
      </View>
    );
  }),
);
