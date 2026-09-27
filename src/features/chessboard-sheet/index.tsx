import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { createRandomGameFen } from './random-game';
import { ExpandingBoard } from './components/expanding-board';
import { HomeChrome } from './components/home-chrome';
import { OpenBottomControls } from './components/open-bottom-controls';
import { OpenControls } from './components/open-controls';
import { PreviewCard } from './components/preview-card';
import { SHEET_LAYOUT } from './config';
import { useSheetAnimation } from './use-sheet-animation';
import { AnimatedView } from '../../shared/uniwind';

export function ChessboardSheet() {
  const { height, width } = useWindowDimensions();
  const [boardFen] = useState(createRandomGameFen);
  const { closeSheet, open, openSheet, progress, sheetStyle } = useSheetAnimation(height);
  const previewSize = Math.round(width * SHEET_LAYOUT.previewBoardRatio);
  const expandedSize =
    width * SHEET_LAYOUT.openBoardRatio - SHEET_LAYOUT.openBoardGutter * 2;
  const closedCenterY = height * SHEET_LAYOUT.closedBoardCenter;
  const openCenterY = height * SHEET_LAYOUT.openBoardCenter;

  return (
    <View className="flex-1">
      <StatusBar style="dark" />

      <AnimatedView className="absolute inset-0" pointerEvents="none">
        <HomeChrome progress={progress} />
      </AnimatedView>

      <AnimatedView className="absolute overflow-visible bg-white" style={sheetStyle}>
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
        <OpenBottomControls progress={progress} />
      </AnimatedView>
    </View>
  );
}
