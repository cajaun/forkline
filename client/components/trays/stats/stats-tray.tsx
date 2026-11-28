import { memo, useMemo } from 'react';

import { Tray } from 'react-native-morpheus';

import { SettingsHeader } from '@/components/trays/settings/components/settings-header';
import { InfoBody } from '@/components/trays/settings/components/settings-info';
import { StatCardBody, StatTiles } from '@/components/trays/shared/stats/stat-steps';
import { TrayTriggerButton } from '@/components/trays/shared/tray-ui';
import { usePlayerStats } from '@/stores/library/stats';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

import { PLAYER_CARD_INFO } from './player-stat-info';
import { PLAYER_CARDS, playerStatPages } from './player-stat-pages';

// each card in the flat stats tray is followed by its explainer step
const PLAYER_CARDS_STEP = 1;
const PAGE_STEPS = 2;

function usePlayerPages() {
  const stats = usePlayerStats();
  return useMemo(() => playerStatPages(stats), [stats]);
}

function StatsHomeBody() {
  const pages = usePlayerPages();

  return (
    <Tray.Body>
      <Tray.Section>
        <StatTiles firstStep={PLAYER_CARDS_STEP} pages={pages} stride={PAGE_STEPS} />
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
      {PLAYER_CARDS.flatMap((page, index) => [
        <Tray.Step key={`stats-${page.key}`}>
          <SettingsHeader backSteps={PLAYER_CARDS_STEP + index * PAGE_STEPS} info title={page.title} />
          <PlayerCardBody index={index} />
        </Tray.Step>,
        <Tray.Step key={`stats-${page.key}-info`}>
          <SettingsHeader backSteps={1} title={page.title} />
          <InfoBody content={PLAYER_CARD_INFO[page.key]} />
        </Tray.Step>,
      ])}
    </Tray.Root>
  );
});
