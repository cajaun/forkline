import { memo } from 'react';
import { Text, View } from 'react-native';

import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { AGENT_LABELS } from '@/components/trays/settings/constants';
import { HINTS_PER_GAME } from '@/constants/game-rules';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { AgentName } from '@/components/trays/settings/types';
import type { GameSummary } from '@/types/games';
import { formatElapsed } from '@/utils/days';
import { capturedFromFen } from '@/utils/fen';

import { RESULT_OPEN_RANGE } from './result-layout';

type Stat = { fallback: SymbolFallback; icon: SymbolName; label: string; value: string };

const shortName = (agent: AgentName) => AGENT_LABELS[agent].split(' + ')[0];

// a played game shows the player's side of it and a watched game shows both agents
function statsOf(game: GameSummary): Stat[] {
  const { agent, depths, gameMode, humanColor } = game.config;
  const moves: Stat = {
    fallback: 'swap-horizontal',
    icon: 'arrow.left.arrow.right',
    label: 'Moves',
    value: String(Math.ceil(game.moveCount / 2)),
  };
  if (gameMode === 'agent-vs-agent') {
    const black: AgentName = agent === 'material-mobility' ? 'king-safety-position' : 'material-mobility';
    const captured = capturedFromFen(game.fen);
    return [
      moves,
      { fallback: 'time-outline', icon: 'clock', label: 'Time', value: formatElapsed(game.elapsedMs) },
      {
        fallback: 'remove-circle-outline',
        icon: 'minus.circle',
        label: 'Captures',
        value: String(captured.w.length + captured.b.length),
      },
      { fallback: 'ellipse-outline', icon: 'circle', label: 'White', value: shortName(agent) },
      { fallback: 'ellipse', icon: 'circle.fill', label: 'Black', value: shortName(black) },
      {
        fallback: 'layers-outline',
        icon: 'square.stack.3d.up',
        label: 'Depths',
        value: `${depths[agent]} v ${depths[black]}`,
      },
    ];
  }
  return [
    moves,
    {
      fallback: 'bulb-outline',
      icon: 'lightbulb',
      label: 'Hints',
      value: `${game.hintsUsed ?? 0}/${HINTS_PER_GAME}`,
    },
    {
      fallback: 'arrow-undo-outline',
      icon: 'arrow.uturn.backward',
      label: 'Undos',
      value: String(game.undoCount ?? 0),
    },
    {
      fallback: 'ellipse-outline',
      icon: 'circle.lefthalf.filled',
      label: 'Played as',
      value: humanColor === 'white' ? 'White' : 'Black',
    },
    { fallback: 'sparkles-outline', icon: 'sparkles', label: 'Opponent', value: shortName(agent) },
    { fallback: 'layers-outline', icon: 'square.stack.3d.up', label: 'Depth', value: String(depths[agent]) },
  ];
}

function StatCell({ stat }: { stat: Stat }) {
  const { colors } = useSheetColors();
  return (
    <View style={{ alignItems: 'center', gap: 4, width: '33.33%' }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
        <SfSymbol fallback={stat.fallback} name={stat.icon} size={12} tintColor={colors.mutedText} />
        <Text style={{ color: colors.mutedText, fontSize: 13, fontWeight: '600' }}>{stat.label}</Text>
      </View>
      {/* a long agent name shrinks to fit its column on one line */}
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        numberOfLines={1}
        style={{
          alignSelf: 'stretch',
          color: colors.text,
          fontSize: 24,
          fontVariant: ['tabular-nums'],
          fontWeight: '800',
          paddingHorizontal: 4,
          textAlign: 'center',
        }}
      >
        {stat.value}
      </Text>
    </View>
  );
}

// the stats grow in the way the bottom buttons do when the sheet opens
export const ResultStats = memo(function ResultStats({
  game,
  progress,
  result,
  top,
}: {
  game: GameSummary | null;
  progress: SharedValue<number>;
  result: SharedValue<number>;
  top: number;
}) {
  const style = useAnimatedStyle(() => {
    const shown =
      interpolate(result.value, [0.5, 1], [0, 1], Extrapolation.CLAMP) *
      interpolate(progress.value, RESULT_OPEN_RANGE, [0, 1], Extrapolation.CLAMP);
    return {
      opacity: interpolate(shown, [0, 0.6, 1], [0, 0.75, 1]),
      transform: [
        { translateY: interpolate(shown, [0, 1], [8, 0]) },
        { scale: interpolate(shown, [0, 1], [0.92, 1]) },
      ],
    };
  });

  if (!game) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          left: 24,
          position: 'absolute',
          right: 24,
          rowGap: 20,
          top,
          zIndex: 3,
        },
        style,
      ]}
    >
      {statsOf(game).map(stat => (
        <StatCell key={stat.label} stat={stat} />
      ))}
    </Animated.View>
  );
});
