import { LayoutChangeEvent, Text, View } from 'react-native';

import React, { memo, useEffect } from 'react';

import { LinearGradient } from 'expo-linear-gradient';
import { useAtomValue, useSetAtom } from 'jotai';
import { PressableScale } from 'pressto';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  interactedAtom,
  isPlySelectedFamily,
  movesAtom,
  plyFrameFamily,
  selectedPlyAtom,
  selectMoveAtom,
} from '@/stores/chess-game';
import { theme, withAlpha } from '@/constants/theme';
import { AnimatedText, AnimatedView } from '@/components/shared/uniwind';

const timing = { duration: 200, easing: Easing.out(Easing.cubic) };
const fadeTiming = { duration: 180, easing: Easing.out(Easing.cubic) };
const dimColor = withAlpha(theme.text, 0.4);
const fadeSolid = theme.surfaceHi;
const fadeClear = withAlpha(theme.surfaceHi, 0);

const enterToken = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateX: 8 }] },
    animations: {
      opacity: withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      }),
      transform: [
        {
          translateX: withTiming(0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    },
  };
};

const MoveCell = memo<{ ply: number; san: string }>(({ ply, san }) => {
  const selected = useAtomValue(isPlySelectedFamily(ply));
  const select = useSetAtom(selectMoveAtom);
  const setFrame = useSetAtom(plyFrameFamily(ply));
  const selectedValue = useSharedValue(selected ? 1 : 0);
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(selectedValue.get(), [0, 1], [dimColor, theme.text]),
  }));

  useEffect(() => {
    selectedValue.set(withTiming(selected ? 1 : 0, fadeTiming));
  }, [selected, selectedValue]);

  return (
    <>
      {ply % 2 === 0 ? (
        <AnimatedText
          className="text-[13px] text-[#60636a]"
          entering={enterToken}
         >
          {ply / 2 + 1}.
        </AnimatedText>
      ) : null}
      <AnimatedView
        entering={enterToken}
        onLayout={(event: LayoutChangeEvent) => setFrame(event.nativeEvent.layout)}>
        <PressableScale
          onPress={() => select(ply)}
          style={{ borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 }}>
          <AnimatedText
            className="text-sm text-[#f0f2f5]"
            style={textStyle}>
            {san}
          </AnimatedText>
        </PressableScale>
      </AnimatedView>
    </>
  );
});

MoveCell.displayName = 'MoveCell';

const HighlightPill: React.FC = () => {
  const selectedPly = useAtomValue(selectedPlyAtom);
  const frame = useAtomValue(plyFrameFamily(selectedPly));
  const interacted = useAtomValue(interactedAtom);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const shown = useSharedValue(0);
  const ready = useSharedValue(false);

  useEffect(() => {
    if (!interacted || selectedPly < 0 || !frame) {
      shown.set(withTiming(0, { duration: 120 }));
      ready.set(false);
      return;
    }
    const animate = ready.get();
    x.set(animate ? withTiming(frame.x, timing) : frame.x);
    y.set(animate ? withTiming(frame.y, timing) : frame.y);
    width.set(animate ? withTiming(frame.width, timing) : frame.width);
    height.set(animate ? withTiming(frame.height, timing) : frame.height);
    shown.set(withTiming(1, { duration: 220 }));
    ready.set(true);
  }, [frame, height, interacted, ready, selectedPly, shown, width, x, y]);

  const style = useAnimatedStyle(() => ({
    height: height.get(),
    opacity: shown.get(),
    transform: [{ translateX: x.get() }, { translateY: y.get() }],
    width: width.get(),
  }));

  return (
    <AnimatedView
      className="absolute left-0 top-0 rounded-lg bg-[rgba(58,145,248,0.18)]"
      pointerEvents="none"
      style={style}
    />
  );
};

export const MoveHistory: React.FC = () => {
  const moves = useAtomValue(movesAtom);
  const hasMoves = moves.length > 0;
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offsetX = useSharedValue(0);
  const contentWidth = useSharedValue(0);
  const viewWidth = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(event => {
    offsetX.set(event.contentOffset.x);
    contentWidth.set(event.contentSize.width);
    viewWidth.set(event.layoutMeasurement.width);
  });
  const shown = useSharedValue(hasMoves ? 1 : 0);
  const emptyShown = useSharedValue(0);

  useEffect(() => {
    // delay the empty state until the move list has faded out
    shown.set(withTiming(hasMoves ? 1 : 0, fadeTiming));
    emptyShown.set(
      hasMoves ? withTiming(0, fadeTiming) : withDelay(600, withTiming(1, fadeTiming)),
    );
  }, [emptyShown, hasMoves, shown]);

  const listStyle = useAnimatedStyle(() => ({ opacity: shown.get() }));
  const emptyStyle = useAnimatedStyle(() => ({ opacity: emptyShown.get() }));
  const leftFadeStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, offsetX.get() / 16)) * shown.get(),
  }));
  const rightFadeStyle = useAnimatedStyle(() => ({
    opacity:
      Math.min(1, Math.max(0, (contentWidth.get() - viewWidth.get() - offsetX.get()) / 16)) *
      shown.get(),
  }));

  return (
    <View className="h-13 justify-center overflow-hidden rounded-[18px] border border-[#2c2f35] bg-[#202329]">
      <AnimatedView className="h-full justify-center" style={listStyle}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 12 }}
          onContentSizeChange={widthValue => {
            contentWidth.set(widthValue);
            if (widthValue > viewWidth.get()) {
              scrollRef.current?.scrollToEnd({ animated: true });
            }
          }}
          onLayout={(event: LayoutChangeEvent) => {
            viewWidth.set(event.nativeEvent.layout.width);
          }}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}>
          <HighlightPill />
          {moves.map((san, ply) => (
            <MoveCell key={ply} ply={ply} san={san} />
          ))}
        </Animated.ScrollView>
      </AnimatedView>

      <AnimatedView
        className="absolute bottom-0 left-0 top-0 w-7"
        pointerEvents="none"
        style={leftFadeStyle}>
        <LinearGradient
          colors={[fadeSolid, fadeClear]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
        />
      </AnimatedView>
      <AnimatedView
        className="absolute bottom-0 right-0 top-0 w-7"
        pointerEvents="none"
        style={rightFadeStyle}>
        <LinearGradient
          colors={[fadeClear, fadeSolid]}
          end={{ x: 1, y: 0.5 }}
          start={{ x: 0, y: 0.5 }}
          style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
        />
      </AnimatedView>
      <AnimatedView
        className="absolute inset-0 items-center justify-center"
        pointerEvents="none"
        style={emptyStyle}>
        <Text
          className="text-[13px] text-[#60636a]"
         >
          No moves yet
        </Text>
      </AnimatedView>
    </View>
  );
};
