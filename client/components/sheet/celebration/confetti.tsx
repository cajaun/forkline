import { forwardRef, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CannonConfetti, type ConfettiMethods } from 'react-native-fast-confetti';

import { useSheetColors } from '@/hooks/use-sheet-colors';

const GOLD = '#D9A520';
const GREY = '#A3A3A3';
const PER_CANNON = 120;

// two cannons at the screen edges throw paper up and in when a game is won
export const Confetti = memo(
  forwardRef<ConfettiMethods>(function Confetti(_, ref) {
    const { colors } = useSheetColors();

    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
        <CannonConfetti
          ref={ref}
          autoplay={false}
          colors={[colors.text, GOLD, GREY]}
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
