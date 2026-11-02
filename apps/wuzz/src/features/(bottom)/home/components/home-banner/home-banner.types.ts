import type { SharedValue } from 'react-native-reanimated';

export type HomeBannerProps = {
  screenWidth: number;
  /** Page scroll offset, for the stretchy over-scroll effect. Optional — the
   *  banner just keeps its fixed height if the screen doesn't pass one. */
  scrollY?: SharedValue<number>;
  /** Draws only the picture and its dots: no fade into the page, no overlap with what follows, no mascot. */
  plain?: boolean;
  /** With `plain`: how far above the picture's bottom edge the dots sit, for a card that overlaps the picture. */
  dotsBottomInset?: number;
};
