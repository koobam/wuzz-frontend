import { FlashList, type FlashListProps, type FlashListRef } from '@shopify/flash-list';
import type { ReactElement, Ref } from 'react';
import Animated, { type ScrollHandlerProcessed } from 'react-native-reanimated';

type AnimatedFlashListProps<T> = Omit<FlashListProps<T>, 'onScroll'> & {
  // A handler from useAnimatedScrollHandler runs on the UI thread; a plain function still runs on JS.
  onScroll?: FlashListProps<T>['onScroll'] | ScrollHandlerProcessed<Record<string, unknown>>;
  ref?: Ref<FlashListRef<T>>;
};

/**
 * FlashList whose onScroll can be a Reanimated scroll handler, so a scroll-linked animation is driven on the UI thread
 * instead of sending every scroll event over to JS first.
 */
export const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as unknown as <T>(
  props: AnimatedFlashListProps<T>,
) => ReactElement;
