import { Text, View } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { Tray } from 'react-native-morpheus';

import { SfSymbol, type SymbolFallback, type SymbolName } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { OptionLink } from '@/components/trays/shared/option-ui';
import { StatCard } from '@/components/trays/shared/stats/stat-card';
import { StatTiles, useOpenStep } from '@/components/trays/shared/stats/stat-steps';
import { TrayCard } from '@/components/trays/shared/tray-ui';
import { useSheetColors } from '@/hooks/use-sheet-colors';

import { MATCH_REPORT, gameOutcome, type ReportGame } from './report-data';
import { matchReportPages } from './report-pages';

const LIST_MAX_HEIGHT = 440;

const [STANDINGS, ...MATCH_TILE_PAGES] = matchReportPages();
export { MATCH_TILE_PAGES };

// a layout unlike the stats home keeps the two step heights apart for Morpheus
export function MatchSummaryBody({ cardsStep, gamesStep }: { cardsStep: number; gamesStep: number }) {
  const openStep = useOpenStep();

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <StatCard page={STANDINGS} />
        <StatTiles columns={3} firstStep={cardsStep} pages={MATCH_TILE_PAGES} />
        <OptionLink
          fallback="list-outline"
          icon="list.bullet"
          onPress={() => openStep(gamesStep)}
          title="Every game"
          value="Each opening and how it ended"
        />
      </Tray.Section>
    </Tray.Body>
  );
}

function endingSymbol(termination: string): { fallback: SymbolFallback; icon: SymbolName } {
  if (termination === 'checkmate') return { fallback: 'flag', icon: 'flag.checkered' };
  if (termination.includes('repetition')) return { fallback: 'repeat', icon: 'repeat' };
  return { fallback: 'remove-circle-outline', icon: 'equal' };
}

function GameRow({ game }: { game: ReportGame }) {
  const { colors } = useSheetColors();
  const symbol = endingSymbol(game.termination);

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 14, minHeight: 60, paddingVertical: 8 }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.background,
          borderRadius: 18,
          height: 36,
          justifyContent: 'center',
          width: 36,
        }}
      >
        <SfSymbol fallback={symbol.fallback} name={symbol.icon} size={15} tintColor={colors.icon} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text className="font-semibold" numberOfLines={1} style={[trayText.Title3, { color: colors.text }]}>
          {game.opening}
        </Text>
        <Text className="font-medium" numberOfLines={1} style={[trayText.Body, { color: colors.mutedText }]}>
          {gameOutcome(game)}
        </Text>
      </View>
    </View>
  );
}

export function MatchGamesBody() {
  return (
    <Tray.Body>
      <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }}>
        <Tray.Section>
          <TrayCard>
            {MATCH_REPORT.results.map(game => (
              <GameRow key={game.game_number} game={game} />
            ))}
          </TrayCard>
        </Tray.Section>
      </ScrollView>
    </Tray.Body>
  );
}
