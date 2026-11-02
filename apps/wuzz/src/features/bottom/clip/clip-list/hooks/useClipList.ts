import { useCallback, useState } from 'react';
import { useAnimatedStyle, useAnimatedScrollHandler, interpolate, Extrapolate } from 'react-native-reanimated';
import { useHapticFeedback, useScroll } from '@hooks/utils';
import { LOGO_ANIMATION_CONFIG } from '../constants';

export const useClipList = () => {
  const { triggerHaptic } = useHapticFeedback();
  const [refreshing, setRefreshing] = useState(false);
  const { scrollY } = useScroll();

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    triggerHaptic('light');
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [triggerHaptic]);

  // Runs on the UI thread, so the logo turns with the scroll without a round trip through JS.
  const handleScroll = useAnimatedScrollHandler(
    (event) => {
      scrollY.value = event.contentOffset.y;
    }
  );

  const logoAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      scrollY.value,
      LOGO_ANIMATION_CONFIG.INPUT_RANGE,
      LOGO_ANIMATION_CONFIG.OUTPUT_RANGE,
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return {
    refreshing,
    handleRefresh,
    handleScroll,
    logoAnimatedStyle,
  };
};

