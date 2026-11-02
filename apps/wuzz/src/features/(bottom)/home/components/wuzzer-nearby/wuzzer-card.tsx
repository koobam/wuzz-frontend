import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send2, Star1 } from 'iconsax-react-native';
import { Button, HStack, Text, theme, VStack } from '@components/atoms';
import Image from '@components/atoms/image';
import { StyleSheet } from 'react-native';
import type { Wuzzer } from './wuzzer-nearby.types';

/** Fixed, so the list can snap from one card to the next. */
export const WUZZER_CARD_WIDTH = 264;
export const WUZZER_CARD_HEIGHT = 76;

const AVATAR_SIZE = 44;
const AVATAR_RADIUS = 10;

/** 450 m below a kilometre, "1,2 km" above. */
const formatDistance = (km: number): string =>
  km < 1
    ? `${Math.round(km * 100) * 10} m`
    : `${km.toFixed(1).replace('.', ',')} km`;

type WuzzerCardProps = {
  wuzzer: Wuzzer;
  /** The card in view, which is also the selected pin on the map. */
  selected: boolean;
  /** Fill a row of a vertical list instead of being one page of the Home carousel. */
  fullWidth?: boolean;
  onCall?: (wuzzer: Wuzzer) => void;
};

export const WuzzerCard = memo(
  ({ wuzzer, selected, fullWidth = false, onCall }: WuzzerCardProps) => {
    const { t } = useTranslation('home');

    return (
      <HStack
        width={fullWidth ? undefined : WUZZER_CARD_WIDTH}
        backgroundColor={selected ? theme.pallate.primary['01'] : undefined}
        height={WUZZER_CARD_HEIGHT}
        items="center"
        justify={fullWidth ? 'flex-start' : 'center'}
        gap={theme.spacing.standard}
      >
        <VStack items="center">
          <Image
            uri={wuzzer.photoUri}
            resizeMode="cover"
            style={styles.avatar}
          />
          {wuzzer.rating != null && (
            <HStack
              items="center"
              gap={2}
              style={styles.rating}
              backgroundColor={theme.pallate.neutral['05']}
              borderRadius={10}
              padding={{
                paddingVertical: 2,
                paddingHorizontal: theme.spacing.small,
              }}
            >
              <Star1
                size={13}
                variant="Bold"
                color={theme.pallate.secondary['03']}
              />
              <Text type="l1" weight="bold" color={theme.pallate.neutral['01']}>
                {wuzzer.rating.toFixed(1)}
              </Text>
            </HStack>
          )}
        </VStack>
        <VStack fill={fullWidth}>
          <Text type="b2" weight="bold" numberOfLines={1}>
            {wuzzer.name}
          </Text>
          <Text type="l1" color={theme.pallate.neutral['04']} numberOfLines={1}>
            {t('wuzzerNearby.distance', {
              distance: formatDistance(wuzzer.distanceKm),
            })}
          </Text>
        </VStack>
        <Button
          rounded
          size="sm"
          variant="primary"
          direction="row"
          gap={theme.spacing.small}
          onPress={onCall != null ? () => onCall(wuzzer) : undefined}
        >
          <Send2 size={16} variant="Bold" color={theme.pallate.neutral['01']} />
          <Text type="l1" weight="semibold" color={theme.pallate.neutral['01']}>
            {t('wuzzerNearby.order')}
          </Text>
        </Button>
      </HStack>
    );
  },
);
WuzzerCard.displayName = 'WuzzerCard';

const styles = StyleSheet.create({
  // Tucked up over the photo's lower edge.
  rating: { marginTop: -10 },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_RADIUS,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: theme.pallate.neutral['02'],
  },
});
