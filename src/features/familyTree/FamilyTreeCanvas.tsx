import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';

import { PersonNode } from '@/components/family/person-node';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { RelatedPerson, Relationship } from '@/types/models';
import { NODE, computeLayout } from './layout';

interface Props {
  people: RelatedPerson[];
  relationships: Relationship[];
  onSelect: (id: string) => void;
}

const MAX_SCALE = 2.5;

/** Pan- and pinch-enabled 2D family tree. */
export function FamilyTreeCanvas({ people, relationships, onSelect }: Props) {
  const { colors } = useAppTheme();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const layout = useMemo(
    () => computeLayout(people, relationships),
    [people, relationships],
  );

  // Fit the whole tree inside the viewport on first render (scale to width and
  // the visible height), so every member is on screen. Pinch to zoom in.
  const { fitScale, initialX, initialY, minScale } = useMemo(() => {
    const availW = screenW - 24;
    const availH = screenH * 0.62; // body area (below header, above tabs)
    const s = Math.min(1, availW / layout.width, availH / Math.max(1, layout.height));
    return {
      fitScale: s,
      // Scaling is about the box centre, so centring is scale-independent.
      initialX: (screenW - layout.width) / 2,
      initialY: 8 - (layout.height * (1 - s)) / 2,
      minScale: Math.min(0.35, s),
    };
  }, [screenW, screenH, layout.width, layout.height]);

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const savedX = useSharedValue(initialX);
  const savedY = useSharedValue(initialY);
  const scale = useSharedValue(fitScale);
  const savedScale = useSharedValue(fitScale);

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      translateX.value = savedX.value + e.translationX;
      translateY.value = savedY.value + e.translationY;
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.min(MAX_SCALE, Math.max(minScale, next));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      // Reset to the fitted view.
      scale.value = withTiming(fitScale);
      savedScale.value = fitScale;
      translateX.value = withTiming(initialX);
      translateY.value = withTiming(initialY);
      savedX.value = initialX;
      savedY.value = initialY;
    });

  // Re-fit when the tree size settles (e.g. data finishes loading).
  useEffect(() => {
    scale.value = withTiming(fitScale);
    savedScale.value = fitScale;
    translateX.value = withTiming(initialX);
    translateY.value = withTiming(initialY);
    savedX.value = initialX;
    savedY.value = initialY;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitScale, initialX, initialY]);

  const gesture = Gesture.Simultaneous(pan, pinch, doubleTap);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.viewport}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.canvas, { width: layout.width, height: layout.height }, canvasStyle]}>
          <Svg
            width={layout.width}
            height={layout.height}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            {layout.segments.map((s, i) => (
              <Line
                key={i}
                x1={s.from.x}
                y1={s.from.y}
                x2={s.to.x}
                y2={s.to.y}
                stroke={colors.accent}
                strokeWidth={2}
                strokeOpacity={0.6}
              />
            ))}
          </Svg>

          {layout.nodes.map((n) => (
            <View
              key={n.id}
              style={[
                styles.nodeWrap,
                { left: n.x - 48, top: n.y - NODE / 2 },
              ]}
            >
              <PersonNode person={n} onPress={onSelect} />
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden' },
  canvas: { position: 'relative' },
  nodeWrap: { position: 'absolute', width: 96, alignItems: 'center' },
});
