import { Tray } from 'react-native-morpheus';

import { StatCard } from '@/components/trays/shared/stats/stat-card';
import { StatTiles } from '@/components/trays/shared/stats/stat-steps';

import type { MatchReport } from './report-data';
import { matchReportPages } from './report-pages';

// the standings card leads the summary and the other cards open as their own steps
export function matchPages(report: MatchReport) {
  const [standings, ...tiles] = matchReportPages(report);
  return { standings, tiles };
}

export function MatchSummaryBody({ cardsStep, report }: { cardsStep: number; report: MatchReport }) {
  const { standings, tiles } = matchPages(report);

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <StatCard page={standings} />
        <StatTiles columns={3} firstStep={cardsStep} pages={tiles} stride={2} />
      </Tray.Section>
    </Tray.Body>
  );
}
