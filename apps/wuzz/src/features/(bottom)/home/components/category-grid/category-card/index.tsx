import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Pressable, ServiceIcon, Text, theme } from '@components/atoms';
import type { CategoryCardProps } from './category-card.types';

const ICON_SIZE = 46;
const CIRCLE_SIZE = 52;

/** Height of the icon area and of the label area (two lines). The grid sizes its
 *  rows from these; a fixed label height keeps rows aligned whether a name wraps
 *  or not. */
export const CATEGORY_ICON_AREA = CIRCLE_SIZE;
export const CATEGORY_LABEL_HEIGHT = 40;

/** A service as an icon on a round backdrop, with its name underneath. */
export const CategoryCard = memo(
  ({ item, width, onPress }: CategoryCardProps) => (
    <Pressable
      direction="column"
      onPress={onPress}
      items="center"
      width={width}
      gap={theme.spacing.small}
    >
      <Box
        width={CATEGORY_ICON_AREA}
        height={CATEGORY_ICON_AREA}
        items="center"
        justify="center"
      >
        <Box style={styles.circle} />
        <ServiceIcon
          uri={item.icon_url}
          icon={item.icon}
          size={ICON_SIZE}
          color={theme.pallate.neutral['01']}
        />
      </Box>
      <Box width={width} height={CATEGORY_LABEL_HEIGHT} items="center">
        <Text
          type="l1"
          weight="medium"
          align="center"
          numberOfLines={2}
          color={theme.pallate.neutral['05']}
        >
          {item.name}
        </Text>
      </Box>
    </Pressable>
  ),
);

CategoryCard.displayName = 'CategoryCard';

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderCurve: 'continuous',
    backgroundColor: theme.pallate.neutral['02'],
  },
});
