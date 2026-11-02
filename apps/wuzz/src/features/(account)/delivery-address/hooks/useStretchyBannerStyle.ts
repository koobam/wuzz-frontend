import type { SharedValue } from 'react-native-reanimated';
import { useAnimatedStyle } from 'react-native-reanimated';

export interface UseStretchyBannerStyleParams {
  scrollY: SharedValue<number>;
  width: number;
  /** Tinggi dasar banner. Default: setengah lebar layar. */
  baseHeight?: number;
}

/** Banner meregang mengikuti over-scroll ke atas (efek stretchy). */
export function useStretchyBannerStyle({
  scrollY,
  width,
  baseHeight,
}: UseStretchyBannerStyleParams) {
  const height = baseHeight ?? width / 2;
  return useAnimatedStyle(() => {
    const bounce = scrollY.value < 0 ? -scrollY.value : 0;
    return {
      width,
      height: height + bounce,
      marginTop: -bounce,
    };
  });
}
