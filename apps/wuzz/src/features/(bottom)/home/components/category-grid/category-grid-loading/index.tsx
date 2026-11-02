import { memo } from 'react';
import { HStack, Shimmer, theme, VStack } from '@components/atoms';
import { StyleSheet } from 'react-native';
import {
  CATEGORY_ICON_AREA,
  CATEGORY_LABEL_HEIGHT,
} from '../category-card';
import type { CategoryGridLoadingProps } from './category-grid-loading.types';

/** Same measurements as the grid: a 84 wide cell, two rows, the columns side by side. */
const CELL_WIDTH = 84;
const COLUMNS = 4;
const LABEL_LINE_HEIGHT = 12;

const styles = StyleSheet.create({
  row: { paddingHorizontal: theme.spacing.large },
  cell: { width: CELL_WIDTH, alignItems: 'center' },
});

/** One cell: the icon circle and a two-line label, as the real card draws them. */
const CellSkeleton = memo(() => (
  <VStack
    gap={theme.spacing.small}
    items="center"
    height={CATEGORY_ICON_AREA + theme.spacing.small + CATEGORY_LABEL_HEIGHT}
    style={styles.cell}
  >
    <Shimmer
      width={CATEGORY_ICON_AREA}
      height={CATEGORY_ICON_AREA}
      borderRadius={CATEGORY_ICON_AREA / 2}
    />
    <Shimmer width={CELL_WIDTH - 20} height={LABEL_LINE_HEIGHT} borderRadius={6} />
    <Shimmer width={CELL_WIDTH - 36} height={LABEL_LINE_HEIGHT} borderRadius={6} />
  </VStack>
));
CellSkeleton.displayName = 'CellSkeleton';

/** What the category grid shows while the services load: the same two rows of cells, so nothing below jumps when they arrive. */
export const CategoryGridLoading = memo((_props: CategoryGridLoadingProps) => (
  <HStack gap={theme.spacing.small} style={styles.row}>
    {Array.from({ length: COLUMNS }, (_, column) => (
      <VStack key={`column-${column}`} gap={theme.spacing.standard}>
        <CellSkeleton />
        <CellSkeleton />
      </VStack>
    ))}
  </HStack>
));

CategoryGridLoading.displayName = 'CategoryGridLoading';
