import type { SharedValue } from 'react-native-reanimated';

export type BannerDotProps = {
  index: number;
  /** How many slides the carousel has, for the screen reader. */
  count: number;
  scrollOffsetX: SharedValue<number>;
  screenWidth: number;
  onPress: (index: number) => void;
};
