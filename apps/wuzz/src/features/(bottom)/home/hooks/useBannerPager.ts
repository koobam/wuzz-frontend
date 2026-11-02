import { useCallback, useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { FlashListRef } from '@shopify/flash-list';
import { useSharedValue } from 'react-native-reanimated';
import type { Banner } from '@api/banners.types';

export const useBannerPager = () => {
  const bannerListRef = useRef<FlashListRef<Banner>>(null);
  const scrollOffsetX = useSharedValue(0);
  const currentIndex = useRef(0);

  // useEffect(() => {
  //   if (!isFocused) return;
  //   const id = setInterval(() => {
  //     const next = (currentIndex.current + 1) % 0;
  //     currentIndex.current = next;
  //     bannerListRef.current?.scrollToIndex({ index: next, animated: true });
  //   }, AUTO_SCROLL_MS);
  //   return () => clearInterval(id);
  // }, [isFocused]);

  const handleBannerScrollUpdate = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      scrollOffsetX.value = x;
      currentIndex.current = Math.round(
        x / event.nativeEvent.layoutMeasurement.width,
      );
    },
    [scrollOffsetX],
  );

  const handleDotPress = useCallback((index: number) => {
    currentIndex.current = index;
    bannerListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  return {
    bannerListRef,
    scrollOffsetX,
    handleBannerScrollUpdate,
    handleDotPress,
  };
};
