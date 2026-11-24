import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Text } from 'react-native';

import type { PieceSymbol } from 'chess.js';
import { SymbolView } from 'expo-symbols';
import { atom, useAtom } from 'jotai';
import { Tray, useTrayNavigation } from 'react-native-morpheus';
import { TRAY_HEADER_CLOSE_ICON_SIZE } from 'react-native-morpheus/constants';

import { trayText } from '@/components/shared/tokens';
import { OptionGrid, OptionTile } from '@/components/trays/shared/option-ui';
import { TrayButton } from '@/components/trays/shared/tray-button';
import { DARK_PIECE_IMG, PIECE_IMG } from '@/constants/chess-pieces';
import { useSheetColors } from '@/hooks/use-sheet-colors';
import { TRAY_STEP_OPTIONS } from '@/components/trays/shared/tray-style';

type PieceColor = 'w' | 'b';

const CHOICES: { label: string; piece: PieceSymbol }[] = [
  { label: 'Queen', piece: 'q' },
  { label: 'Rook', piece: 'r' },
  { label: 'Bishop', piece: 'b' },
  { label: 'Knight', piece: 'n' },
];

// opens the tray while a promotion waits and closes it once answered
function PromotionPresenter({ active }: { active: boolean }) {
  const { close, open } = useTrayNavigation();
  const shownRef = useRef(false);

  useEffect(() => {
    if (active === shownRef.current) return;
    shownRef.current = active;
    if (active) open();
    else close();
  }, [active, close, open]);

  return null;
}

function PromotionHeader({ onCancel }: { onCancel: () => void }) {
  const { colors } = useSheetColors();

  return (
    <Tray.Header style={{ gap: 21 }}>
      <Tray.HeaderRow
        right={
          <Tray.HeaderButton
            accessibilityLabel="Cancel the move"
            onPress={onCancel}
            style={{ backgroundColor: colors.controlBackground }}>
            <SymbolView
              name="xmark"
              size={TRAY_HEADER_CLOSE_ICON_SIZE}
              tintColor={colors.trayIcon}
              type="palette"
              weight="bold"
            />
          </Tray.HeaderButton>
        }>
        <Text className="font-semibold" style={[trayText.Title1, { color: colors.text }]}>
          Promote pawn
        </Text>
      </Tray.HeaderRow>
      <Tray.Separator style={{ backgroundColor: colors.traySeparator }} />
    </Tray.Header>
  );
}

function PromotionBody({ color, onSelect }: { color: PieceColor; onSelect: (piece: PieceSymbol) => void }) {
  const { isDark } = useSheetColors();
  const images = isDark ? DARK_PIECE_IMG : PIECE_IMG;

  return (
    <Tray.Body>
      <Tray.Section style={{ gap: 14 }}>
        <OptionGrid>
          {CHOICES.map(choice => (
            <OptionTile
              key={choice.piece}
              label={choice.label}
              onPress={() => onSelect(choice.piece)}
              visual={{ image: images[color][choice.piece] }}
            />
          ))}
        </OptionGrid>
      </Tray.Section>
    </Tray.Body>
  );
}

// the tray cannot be swiped away so a promotion ends in a choice or a cancel
export const PromotionTray = memo(function PromotionTray({
  color,
  onCancel,
  onSelect,
}: {
  color: PieceColor | null;
  onCancel: () => void;
  onSelect: (piece: PieceSymbol) => void;
}) {
  const [shownColor, setShownColor] = useState<PieceColor>('w');
  if (color && color !== shownColor) setShownColor(color);

  return (
    <Tray.Root dismissible={false} stepOptions={TRAY_STEP_OPTIONS}>
      <PromotionPresenter active={color !== null} />
      <Tray.Step key="promotion">
        <PromotionHeader onCancel={onCancel} />
        <PromotionBody color={shownColor} onSelect={onSelect} />
        <Tray.Footer style={{ width: '100%' }}>
          <TrayButton label="Cancel move" onPress={onCancel} style={{ width: '100%' }} />
        </Tray.Footer>
      </Tray.Step>
    </Tray.Root>
  );
});

// a dev setting sets this to preview the tray without a real promotion
export const promotionPreviewAtom = atom<PieceColor | null>(null);

export function PromotionPreview() {
  const [color, setColor] = useAtom(promotionPreviewAtom);
  const dismiss = useMemo(() => () => setColor(null), [setColor]);

  return <PromotionTray color={color} onCancel={dismiss} onSelect={dismiss} />;
}
