import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { Tray, useTrayNavigation, useTrayNavigationState } from 'react-native-morpheus';

import { PressableScale } from '@/components/shared/pressable-scale';
import { SfSymbol } from '@/components/shared/sf-symbol';
import { trayText } from '@/components/shared/tokens';
import { ChoiceRow } from '@/components/trays/settings/components/choice-row';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import type { GameConfig } from '@/types/games';

import { FEATURES, LAST_SETUP_STEP, PLAY_OPTIONS, stepsToNextSetup } from './content';

const OPEN_DELAY_MS = 450;

// Tray.Root renders this inside the tray's scope, so it can open the tray on first launch
export function OpenOnFirstLaunch({ when }: { when: boolean }) {
  const { open } = useTrayNavigation();

  useEffect(() => {
    if (!when) return;
    // the home screen settles before the tray rises over it
    const timer = setTimeout(open, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open, when]);

  return null;
}

// Continue jumps to the next setup step and finishes from the last one or its info step
export function OnboardingFooter({ onFinish }: { onFinish: () => void }) {
  const { close, next } = useTrayNavigation();
  const { index } = useTrayNavigationState();
  const { colors } = useSheetColors();

  const handlePress = () => {
    if (index < LAST_SETUP_STEP) {
      for (let step = stepsToNextSetup(index); step > 0; step -= 1) next();
      return;
    }
    onFinish();
    close();
  };

  return (
    <Tray.Footer style={{ width: '100%' }}>
      <PressableScale
        accessibilityLabel="Continue"
        onPress={handlePress}
        style={{
          alignItems: 'center',
          backgroundColor: colors.playButton,
          borderRadius: 50,
          height: 56,
          justifyContent: 'center',
          width: '100%',
        }}>
        <Text className="font-bold" style={[trayText.Title3, { color: colors.playButtonForeground }]}>
          Continue
        </Text>
      </PressableScale>
    </Tray.Footer>
  );
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
          <Text
            className="font-bold"
            style={{
              color: colors.text,
              fontSize: 32,
              letterSpacing: 0.2,
              lineHeight: 38,
              textAlign: 'center',
            }}>
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
                <Text className="font-bold" style={[trayText.Title3, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text
                  className="font-medium"
                  style={[trayText.Callout, { color: colors.weekdayText }]}>
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

// in AI vs AI the colour doesn't matter, so only the mode has to match
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
  return (
    <Tray.Body>
      <Tray.Section>
        {PLAY_OPTIONS.map(option => (
          <ChoiceRow
            key={option.label}
            fallback={option.fallback}
            icon={option.icon}
            label={option.label}
            onPress={() => onChange(option.config)}
            selected={isSelected(option, config)}
            surface
          />
        ))}
      </Tray.Section>
    </Tray.Body>
  );
}
