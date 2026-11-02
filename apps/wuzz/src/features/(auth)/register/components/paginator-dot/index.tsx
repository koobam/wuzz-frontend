import React, { memo } from 'react';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { Dimensions, StyleSheet } from 'react-native';
import { theme } from '@components/atoms';
import type { PaginatorDotProps } from './paginator-dot.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** The dots not on this step: a solid grey that shows on the page's near-white, which a faded blue did not. */
const INACTIVE_COLOR = '#C7C7CC';

const styles = StyleSheet.create({
  paginatorDot: {
    height: 8,
    borderRadius: 4,
    borderCurve: 'continuous',
    backgroundColor: theme.pallate.primary['03'],
  },
});

export const PaginatorDot = memo(
  ({ index: dotIndex, scrollX: scrollXValue }: PaginatorDotProps) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (dotIndex - 1) * SCREEN_WIDTH,
        dotIndex * SCREEN_WIDTH,
        (dotIndex + 1) * SCREEN_WIDTH,
      ];

      const width = interpolate(scrollXValue.value, inputRange, [8, 24, 8]);
      const backgroundColor = interpolateColor(
        scrollXValue.value,
        inputRange,
        [INACTIVE_COLOR, theme.pallate.primary['03'], INACTIVE_COLOR],
      );

      return { width, backgroundColor };
    });

    return <Animated.View style={[styles.paginatorDot, animatedStyle]} />;
  },
);

PaginatorDot.displayName = 'PaginatorDot';
