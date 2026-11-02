import { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  MAX_KG,
  MIN_KG,
  THUMB_SIZE,
  TOOLTIP_WIDTH,
} from '../utils';

export interface UseWeightEstimateSliderParams {
  minKg?: number;
  maxKg?: number;
  initialKg?: number;
  onChange?: (kg: number) => void;
}

export function useWeightEstimateSlider({
  minKg = MIN_KG,
  maxKg = MAX_KG,
  initialKg = MIN_KG,
  onChange,
}: UseWeightEstimateSliderParams) {
  const range = maxKg - minKg;
  const [valueKg, setValueKg] = useState(initialKg);

  const trackWidthSv = useSharedValue(0);
  const offset = useSharedValue(
    Math.max(0, Math.min(1, (initialKg - minKg) / range)),
  );
  const startOffsetSv = useSharedValue(0);

  const onValueChange = useCallback(
    (kg: number) => {
      setValueKg(kg);
      onChange?.(kg);
    },
    [onChange],
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    trackWidthSv.value = e.nativeEvent.layout.width;
  }, [trackWidthSv]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          'worklet';
          startOffsetSv.value = offset.value;
        })
        .onUpdate(e => {
          'worklet';
          const w = trackWidthSv.value;
          if (w <= 0) return;
          const newOffset = startOffsetSv.value + e.translationX / w;
          const clamped = Math.max(0, Math.min(1, newOffset));
          const kg = Math.round(minKg + clamped * range);
          const stepKg = Math.max(minKg, Math.min(maxKg, kg));
          const stepOffset = (stepKg - minKg) / range;
          offset.value = stepOffset;
          runOnJS(onValueChange)(stepKg);
        }),
    [trackWidthSv, offset, startOffsetSv, minKg, maxKg, range, onValueChange],
  );

  const trackFillStyle = useAnimatedStyle(() => {
    'worklet';
    const w = trackWidthSv.value;
    if (w <= 0) return { width: 0 };
    const fillWidth =
      offset.value * (w - THUMB_SIZE) + THUMB_SIZE / 2;
    return { width: fillWidth };
  });

  const thumbStyle = useAnimatedStyle(() => {
    'worklet';
    const w = trackWidthSv.value;
    const x = w > 0 ? offset.value * (w - THUMB_SIZE) : 0;
    return { transform: [{ translateX: x }] };
  });

  const tooltipStyle = useAnimatedStyle(() => {
    'worklet';
    const w = trackWidthSv.value;
    const x =
      w > 0
        ? offset.value * (w - THUMB_SIZE) + THUMB_SIZE / 2 - TOOLTIP_WIDTH / 2
        : 0;
    return { transform: [{ translateX: x }] };
  });

  return {
    valueKg,
    handleLayout,
    panGesture,
    trackFillStyle,
    thumbStyle,
    tooltipStyle,
  };
}
