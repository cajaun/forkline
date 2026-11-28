import { Tray, useTrayNavigation, useTrayNavigationState } from 'react-native-morpheus';

import { OptionGrid, OptionTile } from '@/components/trays/shared/option-ui';

import { StatCard, type StatPage } from './stat-card';

// walks forward from the current step to the target step
export function useOpenStep() {
  const { next } = useTrayNavigation();
  const index = useTrayNavigationState(state => state.index);

  return (target: number) => {
    for (let step = index; step < target; step += 1) next();
  };
}

// a stride of two leaves room for each card's explainer step right after it
export function StatTiles({
  columns = 2,
  firstStep,
  pages,
  stride = 1,
}: {
  columns?: number;
  firstStep: number;
  pages: StatPage[];
  stride?: number;
}) {
  const openStep = useOpenStep();

  return (
    <OptionGrid columns={columns}>
      {pages.map((page, offset) => (
        <OptionTile
          key={page.key}
          label={page.title}
          onPress={() => openStep(firstStep + offset * stride)}
          visual={{ fallback: page.fallback, icon: page.icon }}
        />
      ))}
    </OptionGrid>
  );
}

export function StatCardBody({ page }: { page: StatPage }) {
  return (
    <Tray.Body>
      <Tray.Section>
        <StatCard page={page} />
      </Tray.Section>
    </Tray.Body>
  );
}
