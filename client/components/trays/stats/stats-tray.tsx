import { memo, useMemo } from 'react';

import { Tray } from 'react-native-morpheus';

import {
  MATCH_TILE_PAGES,
  MatchGamesBody,
  MatchSummaryBody,
} from '@/components/trays/match-report/match-report-steps';
import { SettingsHeader } from '@/components/trays/settings/components/settings-header';
import { OptionLink } from '@/components/trays/shared/option-ui';
import { StatCardBody, StatTiles, useOpenStep } from '@/components/trays/shared/stats/stat-steps';
import { TrayTriggerButton } from '@/components/trays/shared/tray-ui';
import { usePlayerStats } from '@/stores/library/stats';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

import { PLAYER_CARDS, playerStatPages } from './player-stat-pages';

// step positions inside the flat stats tray
const PLAYER_CARDS_STEP = 1;
const MATCH_STEP = 5;
const MATCH_CARDS_STEP = 6;
const MATCH_GAMES_STEP = 9;

function usePlayerPages() {
  const stats = usePlayerStats();
  return useMemo(() => playerStatPages(stats), [stats]);
}

function StatsHomeBody() {
  const openStep = useOpenStep();
  const pages = usePlayerPages();

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <StatTiles firstStep={PLAYER_CARDS_STEP} pages={pages} />
        <OptionLink
          fallback="hardware-chip-outline"
          icon="cpu"
          onPress={() => openStep(MATCH_STEP)}
          title="AI match report"
          value="The two strategies played head to head"
        />
      </Tray.Section>
    </Tray.Body>
  );
}

function PlayerCardBody({ index }: { index: number }) {
  const pages = usePlayerPages();
  return <StatCardBody page={pages[index]} />;
}

export const StatsTray = memo(function StatsTray({ size = 48 }: { size?: number }) {
  return (
    <Tray.Root stepOptions={TRAY_STEP_OPTIONS}>
      <TrayTriggerButton fallback="bar-chart-outline" icon="chart.bar.fill" label="Stats" size={size} />

      <Tray.Step key="stats">
        <SettingsHeader title="Stats" />
        <StatsHomeBody />
      </Tray.Step>
      {PLAYER_CARDS.map((page, index) => (
        <Tray.Step key={`stats-${page.key}`}>
          <SettingsHeader backSteps={PLAYER_CARDS_STEP + index} title={page.title} />
          <PlayerCardBody index={index} />
        </Tray.Step>
      ))}

      <Tray.Step key="match-summary">
        <SettingsHeader backSteps={MATCH_STEP} title="AI match report" />
        <MatchSummaryBody cardsStep={MATCH_CARDS_STEP} gamesStep={MATCH_GAMES_STEP} />
      </Tray.Step>
      {MATCH_TILE_PAGES.map((page, index) => (
        <Tray.Step key={`match-${page.key}`}>
          <SettingsHeader backSteps={MATCH_CARDS_STEP + index - MATCH_STEP} title={page.title} />
          <StatCardBody page={page} />
        </Tray.Step>
      ))}
      <Tray.Step key="match-games">
        <SettingsHeader backSteps={MATCH_GAMES_STEP - MATCH_STEP} title="Every game" />
        <MatchGamesBody />
      </Tray.Step>
    </Tray.Root>
  );
});
