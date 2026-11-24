import { memo } from 'react';
import { Text, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SfSymbol } from '@/components/shared/sf-symbol';
import { SHEET_RESULT } from '@/constants/sheet';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameSummary } from '@/types/games';
import { formatElapsed } from '@/utils/days';
import { resultOf } from '@/utils/game-ending';

import { fold } from '../expanding/fold';
import type { BoardMotion } from '../expanding/use-board-motion';

const TIME_SIZE = 64;
// the overlay rides the board transform so its sizes undo the won board scale to read true when open
const UNSCALE = 1 / SHEET_RESULT.boardScale;

// the time and win banner sit on the faded board edge on the open sheet and the closed card alike
export const ResultBadge = memo(function ResultBadge({
  boardSize,
  game,
  left,
  motion,
  progress,
  result,
  reveal,
  top,
}: {
  boardSize: number;
  game: GameSummary | null;
  left: number;
  motion: BoardMotion;
  progress: SharedValue<number>;
  result: SharedValue<number>;
  reveal: SharedValue<number>;
  top: number;
}) {
  const { colors } = useSheetColors();
  const { scale, translate } = motion;
  const fadeHeight = boardSize * SHEET_RESULT.fadeShare;

  const followStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value.x }, { translateY: translate.value.y }, { scale: scale.value }],
  }));
  // the closed card follows the game switch and the open sheet waits for the board to settle
  const shown = useDerivedValue(() => {
    const open = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP);
    const settled = interpolate(result.value, [0.5, 1], [0, 1], Extrapolation.CLAMP);
    return reveal.value * (1 - open) + settled * open;
  });
  // the badge and its fade fold in and out on the same curve as the Play button
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fold(1 - shown.value).opacity }));
  const badgeStyle = useAnimatedStyle(() => {
    const { opacity, scale } = fold(1 - shown.value);
    return { opacity, transform: [{ scale: scale * UNSCALE }] };
  });

  const outcome = resultOf(game);
  if (!game || !outcome) return null;
  const { agent, depths, gameMode } = game.config;
  // a watched game shows both depths with White first
  const opponent = agent === 'material-mobility' ? 'king-safety-position' : 'material-mobility';
  const depthLabel =
    gameMode === 'agent-vs-agent'
      ? `DEPTH ${depths[agent]} VS ${depths[opponent]}`
      : `DEPTH ${depths[agent]}`;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { height: boardSize, left, position: 'absolute', top, width: boardSize, zIndex: 4 },
        followStyle,
      ]}
    >
      <Animated.View
        style={[{ bottom: -4, height: fadeHeight + 4, left: -4, position: 'absolute', right: -4 }, fadeStyle]}
      >
        <LinearGradient
          colors={[`${colors.background}00`, `${colors.background}CC`, colors.background]}
          locations={[0, 0.55, 1]}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            left: 0,
            position: 'absolute',
            right: 0,
            top: boardSize - TIME_SIZE * 1.15 * UNSCALE,
            transformOrigin: 'top',
          },
          badgeStyle,
        ]}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.playButton,
            borderRadius: 13,
            flexDirection: 'row',
            gap: 5,
            marginBottom: -6,
            paddingHorizontal: 10,
            paddingVertical: 4,
            zIndex: 1,
          }}
        >
          <SfSymbol fallback="flag" name="flag.checkered" size={12} tintColor={colors.playButtonForeground} />
          <Text
            style={{
              color: colors.playButtonForeground,
              fontSize: 13,
              fontWeight: '800',
              letterSpacing: 0.4,
            }}
          >
            {outcome.ending}
          </Text>
        </View>
        <Text
          style={{
            color: colors.text,
            fontSize: TIME_SIZE,
            fontVariant: ['tabular-nums'],
            fontWeight: '900',
            letterSpacing: -2,
            lineHeight: TIME_SIZE * 1.1,
          }}
        >
          {formatElapsed(game.elapsedMs)}
        </Text>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 2 }}>
          <SfSymbol fallback="leaf-outline" name="laurel.leading" size={30} tintColor={colors.mutedText} />
          <View style={{ borderColor: colors.text, borderRadius: 12, borderWidth: 2, overflow: 'hidden' }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.text,
                paddingHorizontal: 22,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: colors.background, fontSize: 12, fontWeight: '900', letterSpacing: 1 }}>
                {`★ ${outcome.banner} ★`}
              </Text>
            </View>
            <View style={{ alignItems: 'center', paddingVertical: 3 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '900', letterSpacing: 0.6 }}>
                {depthLabel}
              </Text>
            </View>
          </View>
          <SfSymbol fallback="leaf-outline" name="laurel.trailing" size={30} tintColor={colors.mutedText} />
        </View>
      </Animated.View>
    </Animated.View>
  );
});
