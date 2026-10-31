import { memo, useCallback } from 'react';
import { BoxAnimated, Flex, Pressable, theme } from '@components/atoms';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { DOT_WIDTH_ACTIVE, DOT_WIDTH_INACTIVE } from '../../utils';
import type { BannerDotProps } from './banner-dot.types';

export const BannerDot = memo(({
  index,
  count,
  scrollOffsetX,
  screenWidth,
  onPress,
}: BannerDotProps) => {
  const handlePress = useCallback(() => {
    onPress(index);
  }, [onPress, index]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const width = interpolate(
      scrollOffsetX.value,
      [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ],
      [DOT_WIDTH_INACTIVE, DOT_WIDTH_ACTIVE, DOT_WIDTH_INACTIVE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollOffsetX.value,
      [
        (index - 0.5) * screenWidth,
        index * screenWidth,
        (index + 0.5) * screenWidth,
      ],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );
    return { width, opacity };
  });

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Slide ${index + 1} of ${count}`}
    >
      <Flex
        borderRadius={999}
        padding={2}
        backgroundColor={theme.pallate.neutral['01']}
      >
        <BoxAnimated
          borderWidth={1}
          borderColor={theme.pallate.primary['03']}
          height={10}
          borderRadius={20}
          backgroundColor={theme.pallate.neutral['01']}
          style={animatedStyle}
        />
      </Flex>
    </Pressable>
  );
});

BannerDot.displayName = 'BannerDot';
