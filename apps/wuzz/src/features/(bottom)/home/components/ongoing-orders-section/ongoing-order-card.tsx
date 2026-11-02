import { memo, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { DARK_GRADIENT_COLORS, DARK_GRADIENT_END, DARK_GRADIENT_START } from '../dark-surface';
import {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  ArrowRight2,
  Box1,
  Home2,
  Shop,
  Timer,
  TruckFast,
} from 'iconsax-react-native';
import {
  Box,
  Flex,
  HStack,
  Pressable,
  Text,
  VStack,
  VStackAnimated,
  theme,
} from '@components/atoms';
import { formatPriceRupiah } from '@features/(order)/laundry/utils/format';

export type OngoingOrder = {
  id: string;
  title: string;
  dateLabel: string;
  code: string;
  /** Which stage the order is at; every node up to and including it is lit. */
  stepIndex: number;
  itemSummary: string;
  outletName: string;
  itemCount: number;
  total: number;
};

/** Wuzzer on the way, picked up, being washed, on its way back. */
const STEPS = [TruckFast, Box1, Timer, Home2];
const NODE_SIZE = 28;
const BAR_HEIGHT = 4;
const FOOTER_HEIGHT = 44;
const FOOTER_OVERLAP = 10;

const PULSE_DURATION = 1200;

/** A ring that grows outward and fades from behind the current stage, so it reads
 *  as "this is happening now" rather than as a spinner. Runs on the UI thread, and
 *  only on the one stage the order is at. */
const PulseRing = memo(() => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: PULSE_DURATION,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progress.value * 0.8 }],
    opacity: (1 - progress.value) * 0.5,
  }));

  return (
    <VStackAnimated
      pointerEvents="none"
      position={{ set: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
      borderRadius={999}
      backgroundColor={theme.pallate.primary['03']}
      style={style}
    />
  );
});
PulseRing.displayName = 'OngoingOrderPulseRing';

const Stepper = memo(({ currentIndex }: { currentIndex: number }) => (
  <HStack items="center" gap={theme.spacing.small}>
    {STEPS.map((Icon, index) => {
      const reached = index <= currentIndex;
      const isLast = index === STEPS.length - 1;
      return (
        <HStack
          key={index}
          items="center"
          gap={theme.spacing.small}
          fill={!isLast}
        >
          <VStack
            width={NODE_SIZE}
            height={NODE_SIZE}
            items="center"
            justify="center"
            borderRadius={999}
            backgroundColor={
              reached
                ? theme.pallate.primary['03']
                : theme.pallate.neutral['02']
            }
          >
            {index === currentIndex ? <PulseRing /> : null}
            <Icon
              size={18}
              variant="Bulk"
              color={
                reached
                  ? theme.pallate.neutral['01']
                  : theme.pallate.neutral['04']
              }
            />
          </VStack>
          {!isLast ? (
            <Flex
              fill
              height={BAR_HEIGHT}
              borderRadius={999}
              backgroundColor={
                index < currentIndex
                  ? theme.pallate.primary['03']
                  : theme.pallate.neutral['02']
              }
            />
          ) : null}
        </HStack>
      );
    })}
  </HStack>
));
Stepper.displayName = 'OngoingOrderStepper';

export interface OngoingOrderCardProps {
  order: OngoingOrder;
  onPress: () => void;
}

/**
 * One order in flight, in the shape of the Reddog order card: the title with its
 * date and code, a progress stepper, what is in it, and a dark tab tucked under
 * the card with the outlet and the total.
 */
export const OngoingOrderCard = memo(
  ({ order, onPress }: OngoingOrderCardProps) => {
    const { t } = useTranslation('home');

    return (
      <Pressable direction="column" onPress={onPress}>
        <VStack
          gap={theme.spacing.standard}
          padding={theme.spacing.medium}
          borderWidth={1}
          borderRadius={16}
          borderCurve="continuous"
          borderColor={theme.pallate.neutral['02']}
          backgroundColor={theme.pallate.neutral['01']}
          zIndex={1}
        >
          <HStack items="center" gap={theme.spacing.standard}>
            <VStack fill>
              <Text type="b2" weight="bold" color={theme.pallate.neutral['05']}>
                {order.title}
              </Text>
              <HStack items="center" gap={theme.spacing.tiny}>
                <Text type="l2" color={theme.pallate.neutral['04']}>
                  {order.dateLabel}
                </Text>
                <Box
                  width={2}
                  height={2}
                  borderRadius={20}
                  backgroundColor={theme.pallate.neutral['04']}
                />
                <Text
                  type="l2"
                  color={theme.pallate.neutral['04']}
                  numberOfLines={1}
                >
                  {order.code}
                </Text>
              </HStack>
            </VStack>
            <ArrowRight2
              size={24}
              color={theme.pallate.neutral['04']}
              style={{ transform: [{ rotate: '-40deg' }] }}
            />
          </HStack>
          <Stepper currentIndex={order.stepIndex} />
          <Text type="l1" color={theme.pallate.neutral['04']} numberOfLines={2}>
            {order.itemSummary}
          </Text>
        </VStack>
        <HStack
          items="center"
          gap={theme.spacing.standard}
          height={FOOTER_HEIGHT}
          zIndex={0}
          margin={{
            marginTop: -FOOTER_OVERLAP,
            marginHorizontal: theme.spacing.large,
          }}
          borderRadius={{
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
          borderCurve="continuous"
          style={styles.footer}
          padding={{
            paddingHorizontal: theme.spacing.medium,
            paddingTop: theme.spacing.tiny,
          }}
        >
          <LinearGradient
            colors={[...DARK_GRADIENT_COLORS]}
            start={DARK_GRADIENT_START}
            end={DARK_GRADIENT_END}
            style={StyleSheet.absoluteFill}
          />
          <HStack items="center" gap={theme.spacing.tiny} fill>
            <Shop
              size={18}
              variant="Bulk"
              color={theme.pallate.neutral['01']}
            />
            <Text
              type="l1"
              weight="semibold"
              color={theme.pallate.neutral['01']}
              numberOfLines={1}
              fill
            >
              {order.outletName}
            </Text>
          </HStack>
          <Text type="l1" color={theme.pallate.neutral['01']} numberOfLines={1}>
            {t('ongoingOrders.itemTotal', {
              count: order.itemCount,
              price: formatPriceRupiah(order.total),
            })}
          </Text>
        </HStack>
      </Pressable>
    );
  },
);
OngoingOrderCard.displayName = 'OngoingOrderCard';

const styles = StyleSheet.create({
  // Clips the gradient to the footer's round bottom corners.
  footer: { overflow: 'hidden' },
});
