import {
  Flex,
  HStack,
  Icon,
  Pressable,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import { FlashList } from '@shopify/flash-list';
import { Sun1 } from 'iconsax-react-native';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';
import { MoodItemSeparator } from '../mood-item-separator';
import { MoodSectionError } from './mood-section-error';
import { MoodSectionLoading } from './mood-section-loading';
import type {
  MoodDisplayItem,
  MoodItemProps,
  MoodSectionProps,
} from './mood-section.types';

const mapMoodsToDisplay = (
  moods: MoodSectionProps['moods'],
): MoodDisplayItem[] => {
  if (!moods?.length) return [];
  return moods.map(m => ({
    id: m.id,
    name: m.label,
    icon: m.code,
  }));
};

const styles = StyleSheet.create({
  moodBadge: {
    marginBottom: -theme.spacing.small,
    transform: [{ rotate: '-2deg' }],
  },
});

const ITEM_TOP_WIDTH =
  Dimensions.get('screen').width / 3 - theme.spacing.standard * 2;

const MoodItem = memo((props: MoodItemProps) => {
  const { name, icon, index } = props;
  const alignSelf = useMemo(
    () =>
      [3, 0].includes(index)
        ? 'flex-end'
        : [2, 4].includes(index)
        ? 'flex-start'
        : 'center',
    [index],
  );

  const width = useMemo(() => {
    return index < 3 ? ITEM_TOP_WIDTH : 'auto';
  }, [index]);

  return (
    <Pressable
      width={width}
      padding={{
        paddingHorizontal: theme.spacing.large,
        paddingVertical: theme.spacing.standard,
      }}
      fill
      self={alignSelf}
      gap={theme.spacing.tiny}
      borderRadius={50}
      margin={{
        marginHorizontal: theme.spacing.tiny,
      }}
      items="center"
      justify="center"
      backgroundColor={theme.pallate.neutral['03']}
    >
      <Icon icon={icon} size={32} color={theme.pallate.neutral['01']} />
      <Text type="l1" color={theme.pallate.neutral['05']} weight="medium">
        {name}
      </Text>
    </Pressable>
  );
});

MoodItem.displayName = 'MoodItem';

export const MoodSection = memo((props: MoodSectionProps) => {
  const { t } = useTranslation('home');
  const { moods, isLoading = false, isError = false, error } = props;
  const data = useMemo(() => mapMoodsToDisplay(moods ?? null), [moods]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String((error as { message?: string }).message);
    }
    if (isError) return t('mood.loadFailed');
    return null;
  }, [error, isError, t]);

  const renderItem = useCallback(
    ({ item, index }: { item: MoodDisplayItem; index: number }) => (
      <MoodItem icon={item.icon} name={item.name} index={index} />
    ),
    [],
  );

  return (
    <VStack
      gap={theme.spacing.standard}
      padding={{ paddingHorizontal: theme.spacing.large }}
    >
      <Flex direction="column" items="center" justify="center">
        <HStack
          style={styles.moodBadge}
          gap={theme.spacing.small}
          height={44}
          items="center"
          justify="center"
          padding={{
            paddingHorizontal: theme.spacing.large,
          }}
          borderRadius={30}
          backgroundColor={theme.pallate.primary['03']}
        >
          <Text type="b2" weight="bold" color={theme.pallate.neutral['01']}>
            {t('mood.title')}
          </Text>
          <Sun1 variant="Bulk" size={24} color={theme.pallate.neutral['01']} />
        </HStack>
        <Text type="s2" color={theme.pallate.neutral['05']} weight="semibold">
          {t('mood.subtitle')}
        </Text>
      </Flex>
      {isLoading ? (
        <MoodSectionLoading />
      ) : (
        <FlashList<MoodDisplayItem>
          data={data}
          scrollEnabled={false}
          overrideItemLayout={(layout, _, index: number) => {
            if (index < 3) {
              layout.span = 2 / 3;
            }
            return layout;
          }}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          removeClippedSubviews
          ItemSeparatorComponent={MoodItemSeparator}
          renderItem={renderItem}
        />
      )}
      {isError && errorMessage ? (
        <MoodSectionError message={errorMessage} />
      ) : null}
    </VStack>
  );
});

MoodSection.displayName = 'MoodSection';
