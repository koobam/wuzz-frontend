import { useCallback, useEffect } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  SEARCH_SLIDE_DURATION_MS,
  SEARCH_SLIDE_OFFSET,
} from '../utils/search';

export interface UseMenuSearchAnimationParams {
  onCloseComplete: () => void;
}

export interface UseMenuSearchAnimationResult {
  searchProgress: SharedValue<number>;
  scrollY: SharedValue<number>;
  cardWrapperStyle: ReturnType<typeof useAnimatedStyle>;
  searchBarAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  handleClose: () => void;
}

export function useMenuSearchAnimation(
  params: UseMenuSearchAnimationParams,
): UseMenuSearchAnimationResult {
  const { onCloseComplete } = params;

  const searchProgress = useSharedValue(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    searchProgress.value = withTiming(1, {
      duration: SEARCH_SLIDE_DURATION_MS,
    });
  }, [searchProgress]);

  const handleClose = useCallback(() => {
    searchProgress.value = withTiming(
      0,
      { duration: SEARCH_SLIDE_DURATION_MS },
      finished => {
        if (finished) {
          runOnJS(onCloseComplete)();
        }
      },
    );
  }, [searchProgress, onCloseComplete]);

  const cardWrapperStyle = useAnimatedStyle(() => {
    'worklet';
    return { opacity: searchProgress.value };
  });

  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: -SEARCH_SLIDE_OFFSET * (1 - searchProgress.value) },
      ],
    };
  });

  return {
    searchProgress,
    scrollY,
    cardWrapperStyle,
    searchBarAnimatedStyle,
    handleClose,
  };
}
