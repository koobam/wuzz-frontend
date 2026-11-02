import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { ArrowRight2 } from 'iconsax-react-native';
import { Button, HStack, Text, VStack, theme } from '@components/atoms';
import { OngoingOrderCard, type OngoingOrder } from './ongoing-order-card';

/**
 * PLACEHOLDER orders. There is no orders endpoint yet, so these stand in to
 * design the strip with (`title` holds a translation key, resolved when
 * rendered); replace with the real query (the same one History's
 * "Sedang Diproses" tab will use) and delete this list.
 */
const PLACEHOLDER_ORDERS: OngoingOrder[] = [
  {
    id: 'TRX-20251009-8F3A9C2B',
    title: 'ongoingOrders.status.wuzzerOnTheWay',
    dateLabel: '9 Okt 2025',
    code: 'TRX-20251009-8F3A9C2B',
    stepIndex: 0,
    itemSummary: 'Cuci Pakaian Kiloan 3 kg, Sepatu & Sandal, +1 lainnya',
    outletName: 'Wuzz Supermall Karawaci',
    itemCount: 3,
    total: 40000,
  },
  {
    id: 'TRX-20251008-2B7D41AA',
    title: 'ongoingOrders.status.processing',
    dateLabel: '8 Okt 2025',
    code: 'TRX-20251008-2B7D41AA',
    stepIndex: 2,
    itemSummary: 'Perlengkapan Tidur & Mandi 2 pcs',
    outletName: 'Wuzz Pusat',
    itemCount: 2,
    total: 56000,
  },
];

/** How much of the next card peeks in from the right edge, the cue that the
 *  strip scrolls. */
const CARD_PEEK = 32;

export interface OngoingOrdersSectionProps {
  onOrderPress: (orderId: string) => void;
  /** "Lihat Semua": on to History, whose "Sedang Diproses" tab lists the same. */
  onSeeAllPress: () => void;
}

/**
 * A horizontal strip of the orders still in flight, laid out as in the Reddog
 * Home: a heading with a dark "Lihat Semua" pill, then cards that are the same
 * card History shows, so an order looks the same wherever it is seen.
 */
export const OngoingOrdersSection = memo(
  ({ onOrderPress, onSeeAllPress }: OngoingOrdersSectionProps) => {
    const { t } = useTranslation('home');
    const { width: windowWidth } = useWindowDimensions();
    const cardWidth = windowWidth - theme.spacing.large * 2 - CARD_PEEK;

    return (
      <VStack gap={theme.spacing.standard}>
        <HStack
          items="center"
          gap={theme.spacing.standard}
          padding={{ paddingHorizontal: theme.spacing.large }}
        >
          {/* minWidth 0 lets the title shrink and truncate instead of pushing the
              button off the row. */}
          <VStack fill style={styles.heading}>
            <Text type="s2" weight="semibold" numberOfLines={1}>
              {t('ongoingOrders.title')}
            </Text>
            <Text
              type="l1"
              color={theme.pallate.neutral['04']}
              numberOfLines={1}
            >
              {t('ongoingOrders.subtitle')}
            </Text>
          </VStack>
          <Button
            rounded
            size="sm"
            variant="dark"
            direction="row"
            gap={theme.spacing.tiny}
            style={styles.seeAll}
            onPress={onSeeAllPress}
          >
            <Text
              type="l1"
              weight="semibold"
              color={theme.pallate.neutral['01']}
            >
              {t('ongoingOrders.seeAll')}
            </Text>
            <ArrowRight2 size={16} color={theme.pallate.neutral['01']} />
          </Button>
        </HStack>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {PLACEHOLDER_ORDERS.map(order => (
            <View key={order.id} style={{ width: cardWidth }}>
              <OngoingOrderCard
                order={{
                  ...order,
                  title: t(order.title as 'ongoingOrders.status.processing'),
                }}
                onPress={() => onOrderPress(order.id)}
              />
            </View>
          ))}
        </ScrollView>
      </VStack>
    );
  },
);
OngoingOrdersSection.displayName = 'OngoingOrdersSection';

const styles = StyleSheet.create({
  heading: { minWidth: 0 },
  // Slimmer than the shared small button: a link-like pill beside a heading.
  seeAll: { height: 28, paddingHorizontal: theme.spacing.standard },
  list: {
    paddingHorizontal: theme.spacing.large,
    gap: theme.spacing.standard,
  },
});
