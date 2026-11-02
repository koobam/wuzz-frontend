import { memo, useCallback } from 'react';
import { AnimatedFlashList } from '@components/atoms/animated-flash-list';
import { RefreshControl, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@components/atoms';
import {
  ItemSeparator,
  ListHeader,
  PostItem,
} from '@features/bottom/clip/clip-list';
import { useClipList } from '@features/bottom/clip/clip-list';
import { MOCK_POST_DATA } from '@features/bottom/clip/clip-list';

const ClipList = memo(() => {
  const { top } = useSafeAreaInsets();
  const { refreshing, handleRefresh, handleScroll, logoAnimatedStyle } =
    useClipList();

  const renderItem = useCallback(
    ({ item }: { item: any }) => <PostItem item={item} />,
    [],
  );

  const ListHeaderComponent = useCallback(
    () => <ListHeader top={top} logoAnimatedStyle={logoAnimatedStyle} />,
    [top, logoAnimatedStyle],
  );
  return (
    <AnimatedFlashList
      contentContainerStyle={styles.containerStyle}
      ItemSeparatorComponent={() => <ItemSeparator />}
      ListHeaderComponent={ListHeaderComponent}
      data={MOCK_POST_DATA}
      onScroll={handleScroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          progressViewOffset={top}
          titleColor={theme.pallate.neutral['02']}
          title="Refreshing..."
          colors={[theme.pallate.neutral['02']]}
          tintColor={theme.pallate.neutral['02']}
          progressBackgroundColor={theme.pallate.neutral['02']}
        />
      }
      removeClippedSubviews
      renderItem={renderItem}
      scrollEventThrottle={16}
    />
  );
});

ClipList.displayName = 'ClipList';

const styles = StyleSheet.create({
  containerStyle: {
    paddingTop: theme.spacing.standard,
    paddingBottom: theme.spacing.large * 3,
  },
});

export default ClipList;
