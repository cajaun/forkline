import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { createRandomGameFen } from '@/utils/random-game';
import { ExpandingBoard } from '@/components/sheet/expanding-board';
import { HomeChrome } from '@/components/sheet/home-chrome';
import { OpenBottomControls } from '@/components/sheet/open-bottom-controls';
import { OpenControls } from '@/components/sheet/open-controls';
import { PreviewCard, PreviewTimer } from '@/components/sheet/preview-card';
import { SHEET_LAYOUT } from '@/constants/sheet';
import { useSheetAnimation } from '@/hooks/use-sheet-animation';
import { AnimatedView } from '@/components/shared/uniwind';

export function ChessboardSheet() {
  const { height, width } = useWindowDimensions();
  const [boardFen] = useState(createRandomGameFen);
  const { closeSheet, open, openSheet, progress, sheetStyle } = useSheetAnimation(height);
  // keep the preview geometry tied to the device width
  const previewSize = Math.round(width * SHEET_LAYOUT.previewBoardRatio);
  // reserve the full board size for the open state
  const expandedSize =
    width * SHEET_LAYOUT.openBoardRatio - SHEET_LAYOUT.openBoardGutter * 2;
  const closedCenterY = height * SHEET_LAYOUT.closedBoardCenter;
  const openCenterY = height * SHEET_LAYOUT.openBoardCenter;

  return (
    <View className="flex-1">
      <StatusBar style="dark" />

      <AnimatedView
        className="absolute inset-0"
        pointerEvents={open ? 'none' : 'auto'}>
        <HomeChrome progress={progress} />
      </AnimatedView>

      <AnimatedView className="absolute overflow-visible bg-[#FEFFFF]" style={sheetStyle}>
        <PreviewCard
          onClose={closeSheet}
          onOpen={openSheet}
          open={open}
          progress={progress}
        />
        <ExpandingBoard
          boardFen={boardFen}
          boardSize={expandedSize}
          closedCenterY={closedCenterY}
          onOpen={openSheet}
          open={open}
          openCenterY={openCenterY}
          previewSize={previewSize}
          progress={progress}
        />
        <OpenControls onClose={closeSheet} open={open} progress={progress} />
        <OpenBottomControls open={open} progress={progress} />
      </AnimatedView>
      <PreviewTimer height={height} progress={progress} />
    </View>
  );
}
