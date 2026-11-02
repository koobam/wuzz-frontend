import { Box, BoxAnimated, HStack, Pressable, theme } from '@components/atoms';
import Image from '@components/atoms/image';
import { type FlashListRef } from '@shopify/flash-list';
import { AnimatedFlashList } from '@components/atoms/animated-flash-list';
import { memo, useCallback, useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from 'react-native';
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import {
  MENU_BANNER_DOT_WIDTH_ACTIVE,
  MENU_BANNER_DOT_WIDTH_INACTIVE,
  MENU_BANNER_IMAGES,
} from '../../utils/constants';
import type { MenuBannerProps } from './menu-banner.types';

const AUTO_PLAY_INTERVAL_MS = 4000;
const BANNER_COUNT = MENU_BANNER_IMAGES.length;

const styles = StyleSheet.create({
  overflowHidden: { overflow: 'hidden', borderRadius: 10 },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

const keyExtractor = (_: string, index: number) => `menu-banner-${index}`;

interface MenuBannerDotProps {
  index: number;
  scrollOffsetX: SharedValue<number>;
  bannerWidth: number;
  colorInactive: string;
  colorActive: string;
  onPress: (index: number) => void;
}

const MenuBannerDot = memo(
  ({ index, scrollOffsetX, bannerWidth, colorInactive, colorActive, onPress }: MenuBannerDotProps) => {
    const handlePress = useCallback(() => {
      onPress(index);
    }, [index, onPress]);

    const animatedStyle = useAnimatedStyle(() => {
      'worklet';
      const width = interpolate(
        scrollOffsetX.value,
        [
          (index - 1) * bannerWidth,
          index * bannerWidth,
          (index + 1) * bannerWidth,
        ],
        [
          MENU_BANNER_DOT_WIDTH_INACTIVE,
          MENU_BANNER_DOT_WIDTH_ACTIVE,
          MENU_BANNER_DOT_WIDTH_INACTIVE,
        ],
        Extrapolation.CLAMP,
      );
      const backgroundColor = interpolateColor(
        scrollOffsetX.value,
        [
          (index - 0.5) * bannerWidth,
          index * bannerWidth,
          (index + 0.5) * bannerWidth,
        ],
        [colorInactive, colorActive, colorInactive],
      );
      return { width, backgroundColor };
    });

    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Banner slide ${index + 1}`}
      >
        <BoxAnimated height={8} borderRadius={4} style={animatedStyle} />
      </Pressable>
    );
  },
);

MenuBannerDot.displayName = 'MenuBannerDot';

export const MenuBanner = memo(({ width }: MenuBannerProps) => {
  const listRef = useRef<FlashListRef<string>>(null);
  const scrollOffsetX = useSharedValue(0);
  const currentIndexRef = useRef(0);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToNext = useCallback(() => {
    const next = (currentIndexRef.current + 1) % BANNER_COUNT;
    currentIndexRef.current = next;
    listRef.current?.scrollToIndex({ index: next, animated: true });
  }, []);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    autoPlayTimerRef.current = setInterval(goToNext, AUTO_PLAY_INTERVAL_MS);
  }, [goToNext]);

  useEffect(() => {
    if (BANNER_COUNT <= 1) return;
    resetAutoPlay();
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [resetAutoPlay]);

  // Runs on the UI thread, so the dots follow the swipe without a round trip through JS.
  const handleScroll = useAnimatedScrollHandler(
    (event) => {
      scrollOffsetX.value = event.contentOffset.x;
    }
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      const index = Math.round(x / width);
      currentIndexRef.current = Math.min(index, BANNER_COUNT - 1);
      resetAutoPlay();
    },
    [width, resetAutoPlay],
  );

  const handleDotPress = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      listRef.current?.scrollToIndex({ index, animated: true });
      resetAutoPlay();
    },
    [resetAutoPlay],
  );

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Box width={width} height={width / 2} style={styles.overflowHidden}>
        <Image uri={item} resizeMode="cover" style={styles.bannerImage} />
      </Box>
    ),
    [width],
  );

  return (
    <Box padding={{ paddingTop: theme.spacing.standard }}>
      <Box width={width} height={width / 2} style={styles.overflowHidden}>
        <AnimatedFlashList
          ref={listRef}
          data={MENU_BANNER_IMAGES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
          removeClippedSubviews
          renderItem={renderItem}
          keyExtractor={keyExtractor}
        />
      </Box>
      <HStack
        items="center"
        justify="center"
        gap={theme.spacing.tiny}
        margin={{ marginTop: theme.spacing.standard }}
      >
        {MENU_BANNER_IMAGES.map((_, index) => (
          <MenuBannerDot
            key={keyExtractor('', index)}
            index={index}
            scrollOffsetX={scrollOffsetX}
            bannerWidth={width}
            colorInactive={theme.pallate.neutral['03']}
            colorActive={theme.pallate.coffee['03']}
            onPress={handleDotPress}
          />
        ))}
      </HStack>
    </Box>
  );
});

MenuBanner.displayName = 'MenuBanner';

export type { MenuBannerProps } from './menu-banner.types';
