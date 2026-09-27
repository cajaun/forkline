import { View, useWindowDimensions } from 'react-native';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  makeImageFromView,
} from '@shopify/react-native-skia';
import {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { GameReviewCard } from '@/components/chess/game-review-card';
import { DEEP, EXIT_MS, GLOW, SPARK, WAVE, WAVE_MS } from '@/components/chess/wave-shader';
import { AnimatedView } from '@/components/shared/uniwind';

import type { SkImage } from '@shopify/react-native-skia';
import type { ShowOpts } from '@/types/chess-game';

type AuraApi = { show: (opts: ShowOpts) => void; hide: () => void };
const AuraContext = createContext<AuraApi>({ show: () => {}, hide: () => {} });

export const useCheckmateAura = () => useContext(AuraContext);

export const CheckmateAuraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { width, height } = useWindowDimensions();
  const rootRef = useRef<View>(null);
  const contentRef = useRef<View>(null);
  const busy = useRef(false);
  const snapshot = useSharedValue<SkImage | null>(null);
  const progress = useSharedValue(0);
  const breath = useSharedValue(0);
  const visibility = useSharedValue(0);
  const origin = useSharedValue({ x: width / 2, y: height * 0.4 });
  const [card, setCard] = useState<ShowOpts | null>(null);
  const alive = useRef(true);
  const frameId = useRef<number | null>(null);
  const cardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (frameId.current != null) cancelAnimationFrame(frameId.current);
      if (cardTimer.current != null) clearTimeout(cardTimer.current);
    };
  }, []);

  const maxRadius = useDerivedValue(() => {
    const x = origin.get().x;
    const y = origin.get().y;
    return (
      Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y),
      ) * 1.28
    );
  });

  const uniforms = useDerivedValue(() => ({
    u_amplitude: 50,
    u_band: 64,
    u_breath: breath.get(),
    u_chroma: 0.28,
    u_deep: DEEP,
    u_glow: GLOW,
    u_glowStrength: 0.55,
    u_maxBlur: 24,
    u_maxRadius: maxRadius.get(),
    u_origin: [origin.get().x, origin.get().y],
    u_progress: progress.get(),
    u_res: [width, height],
    u_spark: SPARK,
    u_tint: 0.8,
    u_wobble: 0.04,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: visibility.get(),
    pointerEvents: visibility.get() > 0.5 ? 'auto' : 'none',
  }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: visibility.get() }));

  const clearCard = useCallback(() => {
    busy.current = false;
    setCard(null);
  }, []);

  useAnimatedReaction(
    () => visibility.get(),
    (value, previous) => {
      if (previous !== null && previous > 0.01 && value <= 0.01) {
        snapshot.set(null);
        progress.set(0);
        scheduleOnRN(clearCard);
      }
    },
  );

  const show = useCallback(
    async (opts: ShowOpts) => {
      // ignore overlapping aura requests while one is active
      if (busy.current) return;
      busy.current = true;
      origin.set({ x: opts.x, y: opts.y });
      const image = await makeImageFromView(contentRef);
      // release the lock when the source view cannot be captured
      if (!image || !alive.current) {
        busy.current = false;
        return;
      }
      snapshot.set(image);
      progress.set(0);
      frameId.current = requestAnimationFrame(() => {
        frameId.current = null;
        if (!alive.current) return;
        visibility.set(1);
        progress.set(withTiming(1, { duration: WAVE_MS, easing: Easing.linear }));
        breath.set(0);
        breath.set(
          withRepeat(
            withTiming(1, {
              duration: 4200,
              easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true,
          ),
        );
      });
      cardTimer.current = setTimeout(
        () => {
          cardTimer.current = null;
          if (alive.current) setCard(opts);
        },
        Math.round(WAVE_MS * 0.55) - 750,
      );
    },
    [breath, origin, progress, snapshot, visibility],
  );

  const hide = useCallback(() => {
    visibility.set(
      withTiming(0, { duration: EXIT_MS, easing: Easing.in(Easing.cubic) }),
    );
  }, [visibility]);

  const api = useMemo(() => ({ hide, show }), [hide, show]);

  return (
    <AuraContext.Provider value={api}>
      <View ref={rootRef} collapsable={false} className="flex-1">
        <View ref={contentRef} collapsable={false} className="flex-1">
          {children}
        </View>
        <AnimatedView
          pointerEvents="box-none"
          style={[{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }, overlayStyle]}>
          <Canvas pointerEvents="none" style={{ flex: 1 }}>
            <Fill>
              <Shader source={WAVE} uniforms={uniforms}>
                <ImageShader image={snapshot} fit="cover" height={height} width={width} />
              </Shader>
            </Fill>
          </Canvas>
          {card ? <GameReviewCard card={card} onHide={hide} style={cardStyle} /> : null}
        </AnimatedView>
      </View>
    </AuraContext.Provider>
  );
};
