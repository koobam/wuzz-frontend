import type { SharedValue } from 'react-native-reanimated';
import { useAnimatedStyle } from 'react-native-reanimated';

export interface UseStretchyBannerStyleParams {
  scrollY: SharedValue<number>;
  width: number;
}

export function useStretchyBannerStyle({
  scrollY,
  width,
}: UseStretchyBannerStyleParams) {
  return useAnimatedStyle(() => {
    const bounce = scrollY.value < 0 ? -scrollY.value : 0;
    return {
      width,
      height: width + bounce,
      marginTop: -bounce,
    };
  });
}
