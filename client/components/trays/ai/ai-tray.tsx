import { memo } from 'react';

import { Tray } from 'react-native-morpheus';

import { MatchSummaryBody, matchPages } from '@/components/trays/match-report/match-report-steps';
import { MATCH_REPORTS } from '@/components/trays/match-report/report-data';
import { MATCH_CARD_INFO, matchInfo } from '@/components/trays/match-report/report-info';
import { SettingsHeader } from '@/components/trays/settings/components/settings-header';
import { InfoBody } from '@/components/trays/settings/components/settings-info';
import { OptionLink } from '@/components/trays/shared/option-ui';
import { StatCardBody, useOpenStep } from '@/components/trays/shared/stats/stat-steps';
import { TrayTriggerButton } from '@/components/trays/shared/tray-ui';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

import { AGENT_PAGES } from './agent-pages';

// the tray is flat and every page is followed by its explainer step
const PAGE_STEPS = 2;
const FIRST_AGENT_STEP = 1;
const FIRST_MATCH_STEP = FIRST_AGENT_STEP + AGENT_PAGES.length * PAGE_STEPS;
const MATCH_CARD_COUNT = matchPages(MATCH_REPORTS[0]).tiles.length;
// a match is its summary then each of its cards with an explainer after each one
const MATCH_STEP_COUNT = (1 + MATCH_CARD_COUNT) * PAGE_STEPS;

const agentStep = (index: number) => FIRST_AGENT_STEP + index * PAGE_STEPS;
const matchStep = (index: number) => FIRST_MATCH_STEP + index * MATCH_STEP_COUNT;

function AiHomeBody() {
  const openStep = useOpenStep();

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 10 }}>
        {AGENT_PAGES.map((page, index) => (
          <OptionLink
            key={page.key}
            fallback={page.fallback}
            icon={page.icon}
            onPress={() => openStep(agentStep(index))}
            title={page.title}
          />
        ))}
        {MATCH_REPORTS.map((report, index) => (
          <OptionLink
            key={report.depth}
            fallback="flag"
            icon="flag.checkered"
            onPress={() => openStep(matchStep(index))}
            title={`Depth ${report.depth} match`}
          />
        ))}
      </Tray.Section>
    </Tray.Body>
  );
}

// the left home button explains the two agents and shows how they fared against each other
export const AiTray = memo(function AiTray({ size = 48 }: { size?: number }) {
  return (
    <Tray.Root stepOptions={TRAY_STEP_OPTIONS}>
      <TrayTriggerButton fallback="hardware-chip" icon="brain.fill" label="AI" size={size} />

      <Tray.Step key="ai">
        <SettingsHeader title="AI" />
        <AiHomeBody />
      </Tray.Step>
      {AGENT_PAGES.flatMap((page, index) => [
        <Tray.Step key={`agent-${page.key}`}>
          <SettingsHeader backSteps={agentStep(index)} info title={page.title} />
          <StatCardBody page={page} />
        </Tray.Step>,
        <Tray.Step key={`agent-${page.key}-info`}>
          <SettingsHeader backSteps={1} title={page.title} />
          <InfoBody content={page.info} />
        </Tray.Step>,
      ])}
      {MATCH_REPORTS.flatMap((report, index) => {
        const summaryStep = matchStep(index);
        const title = `Depth ${report.depth} match`;
        return [
          <Tray.Step key={`match-${report.depth}`}>
            <SettingsHeader backSteps={summaryStep} info title={title} />
            <MatchSummaryBody cardsStep={summaryStep + PAGE_STEPS} report={report} />
          </Tray.Step>,
          <Tray.Step key={`match-${report.depth}-info`}>
            <SettingsHeader backSteps={1} title={title} />
            <InfoBody content={matchInfo(report)} />
          </Tray.Step>,
          ...matchPages(report).tiles.flatMap((page, offset) => [
            <Tray.Step key={`match-${report.depth}-${page.key}`}>
              <SettingsHeader backSteps={(offset + 1) * PAGE_STEPS} info title={page.title} />
              <StatCardBody page={page} />
            </Tray.Step>,
            <Tray.Step key={`match-${report.depth}-${page.key}-info`}>
              <SettingsHeader backSteps={1} title={page.title} />
              <InfoBody content={MATCH_CARD_INFO[page.key]} />
            </Tray.Step>,
          ]),
        ];
      })}
    </Tray.Root>
  );
});
