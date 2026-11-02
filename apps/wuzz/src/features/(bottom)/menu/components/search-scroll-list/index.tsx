import {
  Box,
  Pressable,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import { MenuEmptyPlaceholder } from '@assets/index';
import type { MenuItem } from '../../types';
import { AnimatedFlashList } from '@components/atoms/animated-flash-list';
import { memo, useCallback, useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAnimatedScrollHandler, type SharedValue } from 'react-native-reanimated';
import { filteredMenuItems, formatSearchPrice } from '../../utils/search';
import type { SearchScrollListProps } from './search-scroll-list.types';

const styles = StyleSheet.create({
  scrollList: {
    flex: 1,
    minHeight: '100%',
  },
  scrollListContent: {
    flexGrow: 1,
    minHeight: '100%',
    paddingHorizontal: theme.spacing.standard,
  },
  resultRowImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  listHeaderWrap: {
    position: 'relative',
  },
});

export const SearchScrollList = memo((props: SearchScrollListProps) => {
  const { query, scrollY, listPaddingTop } = props;

  const items = useMemo(() => filteredMenuItems(query), [query]);

  const handleScroll = useAnimatedScrollHandler(
    (e) => {
      scrollY.value = e.contentOffset.y;
    }
  );

  const listHeader = useMemo(
    () =>
      query.trim().length > 0 ? (
        <View style={styles.listHeaderWrap}>
          <Text
            type="s2"
            weight="semibold"
            text={`Results for "${query}"`}
            color={theme.pallate.neutral['05']}
            padding={{
              paddingVertical: theme.spacing.standard,
              paddingHorizontal: theme.spacing.standard,
            }}
          />
        </View>
      ) : null,
    [query],
  );

  const contentContainerStyle = useMemo(
    () => [styles.scrollListContent, { paddingTop: listPaddingTop }],
    [listPaddingTop],
  );

  const renderItem = useCallback(
    ({ item }: { item: MenuItem }) => (
      <Pressable
        padding={{
          paddingVertical: theme.spacing.standard,
          paddingHorizontal: theme.spacing.standard,
        }}
        gap={theme.spacing.standard}
        items="center"
      >
        <Image
          source={MenuEmptyPlaceholder}
          style={styles.resultRowImage}
          resizeMode="contain"
        />
        <VStack gap={theme.spacing.tiny}>
          <Box>
            <Text
              type="b2"
              weight="semibold"
              text={item.name}
              color={theme.pallate.neutral['05']}
            />
            {item.description ? (
              <Text
                type="l1"
                text={item.description}
                color={theme.pallate.neutral['04']}
                numberOfLines={2}
              />
            ) : null}
          </Box>
          <Text
            type="b2"
            text={formatSearchPrice(item.price)}
            color={theme.pallate.neutral['05']}
          />
        </VStack>
      </Pressable>
    ),
    [],
  );

  const keyExtractor = useCallback((item: MenuItem) => item.id, []);

  const listEmpty = useMemo(
    () =>
      query.trim().length > 0 ? (
        <Box
          padding={{
            paddingHorizontal: theme.spacing.standard,
            paddingVertical: theme.spacing.large,
          }}
        >
          <Text
            type="l1"
            text="No items match your search."
            color={theme.pallate.neutral['04']}
          />
        </Box>
      ) : null,
    [query],
  );

  return (
    <AnimatedFlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.scrollList}
      contentContainerStyle={contentContainerStyle}
      keyboardShouldPersistTaps="handled"
    />
  );
});

SearchScrollList.displayName = 'SearchScrollList';

export type { SearchScrollListProps } from './search-scroll-list.types';
