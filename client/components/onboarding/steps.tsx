import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Tray, useTrayNavigation, useTrayNavigationState } from 'react-native-morpheus';

import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { useKingImages } from '@/components/trays/shared/king-images';
import { OptionGrid, OptionTile } from '@/components/trays/shared/option-ui';
import { TrayButton } from '@/components/trays/shared/tray-button';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameConfig } from '@/types/games';

import { FEATURES, LAST_SETUP_STEP, PLAY_OPTIONS, stepsToNextSetup } from './content';

const OPEN_DELAY_MS = 450;

// opens onboarding once the saved library loads without a finished setup
export function OpenOnFirstLaunch({ when }: { when: boolean }) {
  const { open } = useTrayNavigation();

  useEffect(() => {
    if (!when) return;
    const timer = setTimeout(open, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open, when]);

  return null;
}

// Continue walks past the info page to the next setup page and finishes setup from the last one
export function ContinueButton({ onFinish }: { onFinish: () => void }) {
  const { close, next } = useTrayNavigation();
  const { index } = useTrayNavigationState();

  const handlePress = () => {
    if (index < LAST_SETUP_STEP) {
      for (let step = stepsToNextSetup(index); step > 0; step -= 1) next();
      return;
    }
    onFinish();
    close();
  };

  return <TrayButton label="Continue" onPress={handlePress} style={{ width: '100%' }} tone="primary" />;
}

export function WelcomeStep() {
  const { colors } = useSheetColors();

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 32, paddingTop: 36 }}>
        <View style={{ alignItems: 'center', gap: 14 }}>
          <SfSymbol
            fallback="extension-puzzle-outline"
            name="crown.fill"
            size={44}
            tintColor={colors.text}
          />
          <Text className="font-semibold" style={[trayText.LargeTitle, { color: colors.text, textAlign: 'center' }]}>
            Welcome to Forkline
          </Text>
        </View>
        <View style={{ gap: 26 }}>
          {FEATURES.map(feature => (
            <View
              key={feature.title}
              style={{ alignItems: 'flex-start', flexDirection: 'row', gap: 18 }}>
              <View style={{ alignItems: 'center', paddingTop: 2, width: 36 }}>
                <SfSymbol
                  fallback={feature.fallback}
                  name={feature.icon}
                  size={28}
                  tintColor={colors.trayIcon}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text className="font-semibold" style={[trayText.Title2, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text
                  className="font-medium"
                  style={[trayText.Title3, { color: colors.mutedText }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Tray.Section>
    </Tray.Body>
  );
}

const isSelected = (option: (typeof PLAY_OPTIONS)[number], config: GameConfig) =>
  option.config.gameMode === config.gameMode &&
  (config.gameMode === 'agent-vs-agent' || option.config.humanColor === config.humanColor);

export function PlayStep({
  config,
  onChange,
}: {
  config: GameConfig;
  onChange: (changes: Partial<GameConfig>) => void;
}) {
  const kings = useKingImages();
  const tile = (option: (typeof PLAY_OPTIONS)[number]) => (
    <OptionTile
      key={option.label}
      label={option.label}
      onPress={() => onChange(option.config)}
      selected={isSelected(option, config)}
      visual={
        option.config.gameMode === 'agent-vs-agent'
          ? { fallback: option.fallback, icon: option.icon }
          : { image: kings[option.config.humanColor] }
      }
    />
  );

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 12 }}>
        <OptionGrid>{PLAY_OPTIONS.filter(option => option.config.gameMode === 'human-vs-agent').map(tile)}</OptionGrid>
        <OptionGrid columns={1}>{PLAY_OPTIONS.filter(option => option.config.gameMode === 'agent-vs-agent').map(tile)}</OptionGrid>
      </Tray.Section>
    </Tray.Body>
  );
}
