import { memo, useCallback, useMemo } from 'react';
import { Linking, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Box, Text, theme, VStack } from '@components/atoms';
import type { LaundryService } from '@core/api';
import { EmptyStatePlaceholder } from '@components/molecules';
import { isNetworkError } from '@http/errors';
import { Danger, InfoCircle, WifiSquare } from 'iconsax-react-native';
import type { CategoryGridProps } from './category-grid.types';
import {
  CategoryCard,
  CATEGORY_ICON_AREA,
  CATEGORY_LABEL_HEIGHT,
} from './category-card';
import { CategoryGridLoading } from './category-grid-loading';
import { useTranslation } from 'react-i18next';

/** Width of one category cell; the label wraps inside it. */
const CELL_WIDTH = 84;

/** Space between the two rows and between columns. */
const ROW_GAP = theme.spacing.standard;
const COLUMN_GAP = theme.spacing.small;

/** Icon area + gap + a two-line label. */
const CELL_HEIGHT =
  CATEGORY_ICON_AREA + theme.spacing.small + CATEGORY_LABEL_HEIGHT;
const LIST_HEIGHT = CELL_HEIGHT * 2 + ROW_GAP;

/** Categories sit in two rows and scroll sideways: each list item is a column
 *  holding the top and bottom cell. */
const toColumns = (items: LaundryService[]): LaundryService[][] => {
  const columns: LaundryService[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    columns.push(items.slice(i, i + 2));
  }
  return columns;
};

const columnKey = (column: LaundryService[]): string =>
  column.map(c => c.id).join('-');

const ColumnSeparator = memo(() => <Box width={COLUMN_GAP} />);
ColumnSeparator.displayName = 'ColumnSeparator';

export const CategoryGrid = memo(
  ({
    onCategoryPress,
    items: itemsProp,
    isLoading = false,
    isError = false,
    error,
    onRetry,
  }: CategoryGridProps) => {
    const { t } = useTranslation('home');
    const items = itemsProp;
    const errorMessage = useMemo(() => {
      if (error instanceof Error) return error.message;
      if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message?: string }).message);
      }
      return null;
    }, [error]);

    const columns = useMemo(() => toColumns(items), [items]);

    const renderColumn = useCallback(
      ({ item: column }: { item: LaundryService[] }) => (
        <VStack gap={ROW_GAP}>
          {column.map(service => (
            <CategoryCard
              key={service.id}
              item={service}
              width={CELL_WIDTH}
              onPress={() => onCategoryPress(service)}
            />
          ))}
        </VStack>
      ),
      [onCategoryPress],
    );

    const content = useMemo(() => {
      if (isLoading) return <CategoryGridLoading />;

      if (isError) {
        const network = isNetworkError(error);
        return (
          <EmptyStatePlaceholder
            iconSize={48}
            icon={
              network ? (
                <WifiSquare
                  size={48}
                  color={theme.pallate.neutral['04']}
                  variant="Bulk"
                />
              ) : (
                <Danger
                  size={48}
                  color={theme.pallate.neutral['04']}
                  variant="Bulk"
                />
              )
            }
            title={
              network
                ? t('category.error.noConnection')
                : t('category.error.loadFailed')
            }
            description={
              network
                ? t('category.error.checkConnection')
                : errorMessage ?? t('category.error.generic')
            }
            primaryButton={
              onRetry ? { label: t('category.error.reload'), onPress: onRetry } : undefined
            }
            secondaryButton={
              network
                ? {
                    label: t('category.error.settings'),
                    onPress: () => {
                      Linking.openSettings();
                    },
                  }
                : {
                    label: t('category.error.needHelp'),
                    onPress: () => {
                      Linking.openSettings();
                    },
                  }
            }
          />
        );
      }

      if (items.length === 0) {
        return (
          <EmptyStatePlaceholder
            iconSize={48}
            icon={
              <InfoCircle
                size={48}
                color={theme.pallate.neutral['04']}
                variant="Linear"
              />
            }
            title={t('category.empty.title')}
            description={t('category.empty.description')}
            primaryButton={
              onRetry ? { label: t('category.error.reload'), onPress: onRetry } : undefined
            }
          />
        );
      }

      return (
        <FlashList
          data={columns}
          horizontal
          keyExtractor={columnKey}
          renderItem={renderColumn}
          ItemSeparatorComponent={ColumnSeparator}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      );
    }, [
      isLoading,
      isError,
      items,
      error,
      errorMessage,
      onRetry,
      columns,
      renderColumn,
      t,
    ]);

    return (
      <VStack gap={theme.spacing.standard}>
        <VStack padding={{ paddingHorizontal: theme.spacing.large }}>
          <Text type="s2" weight="semibold">
            {t('category.title')}
          </Text>
          <Text type="l1" color={theme.pallate.neutral['04']}>
            {t('category.description')}
          </Text>
        </VStack>
        {content}
      </VStack>
    );
  },
);

CategoryGrid.displayName = 'CategoryGrid';

const styles = StyleSheet.create({
  list: { height: LIST_HEIGHT },
  listContent: { paddingHorizontal: theme.spacing.large },
});
