import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { EasingGradient } from '@components/atoms/easing-gradient';
import { IS_IOS } from '../../../../../../env';
import {
  GlassBlur,
  glassSurface,
  HStack,
  Pressable,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import { Coin1, Location, Login, Notification } from 'iconsax-react-native';
import { IconChevronDown } from 'tabler-icons-react-native';
import type { HomeHeaderProps } from './home-header.types';

/** Size of the location, points and notification icons. */
const HEADER_ICON_SIZE = 20;

type PointsButtonProps = { points: number };
const PointsButton = memo(({ points }: PointsButtonProps) => {
  const { t } = useTranslation('home');

  return (
    <Pressable style={styles.pointsPressable} removeClippedSubviews>
      <GlassBlur />
      <Coin1
        color={theme.pallate.secondary['03']}
        size={HEADER_ICON_SIZE}
        variant="Bulk"
      />
      <Text type="l1" weight="bold" numberOfLines={1}>
        {t('header.points', {
          points: new Intl.NumberFormat('id-ID').format(points),
        })}
      </Text>
    </Pressable>
  );
});
PointsButton.displayName = 'PointsButton';

const MessageButton = memo(() => (
  <Pressable style={styles.iconPressable} removeClippedSubviews>
    <GlassBlur />
    <Notification
      color={theme.pallate.neutral['05']}
      size={HEADER_ICON_SIZE}
      variant="Bulk"
    />
  </Pressable>
));
MessageButton.displayName = 'MessageButton';

type LoginButtonProps = { onPress: () => void };
const LoginButton = memo(({ onPress }: LoginButtonProps) => {
  const { t } = useTranslation('home');

  return (
    <Pressable
      style={styles.loginPressable}
      onPress={onPress}
      removeClippedSubviews
    >
      <GlassBlur />
      <Login size={20} color={theme.pallate.neutral['05']} />
      <Text type="b2" weight="bold" color={theme.pallate.neutral['05']}>
        {t('header.login')}
      </Text>
    </Pressable>
  );
});
LoginButton.displayName = 'LoginButton';

/** Height of the row itself (the 45px buttons) plus breathing room below. */
const HEADER_ROW_PADDING_BOTTOM = theme.spacing.standard;
const HEADER_ROW_HEIGHT = 55;
/** Header buttons are rounded squares, not pills. */
const HEADER_BUTTON_RADIUS = 14;
/** Header buttons share one horizontal padding (and the shared glass edge). */
const HEADER_BUTTON_PADDING = theme.spacing.standard;
/** How far the glass bleeds below the row so content dissolves into it. */
const HEADER_FADE_HEIGHT = 24;
const BLUR_AMOUNT = 10;
/** Slide duration when the header tucks away or comes back. */
const HEADER_SLIDE_MS = 220;
const BLUR_MASK_STEPS = 24;

type LocationCardProps = { label: string };

/** "Your Current Location" as a card, so it reads on any photo behind it. */
const LocationCard = memo(({ label }: LocationCardProps) => {
  const { t } = useTranslation('home');

  return (
    <HStack
      self="flex-start"
      items="center"
      fill
      gap={theme.spacing.small}
      height={HEADER_ROW_HEIGHT}
      padding={{ paddingHorizontal: HEADER_BUTTON_PADDING }}
      borderRadius={HEADER_BUTTON_RADIUS}
      style={glassSurface}
    >
      <GlassBlur />
      <Location
        size={HEADER_ICON_SIZE}
        variant="Bold"
        color={theme.pallate.secondary['03']}
      />
      <VStack fill>
        <Text type="l2" color={theme.pallate.neutral['04']} numberOfLines={1}>
          {t('header.location')}
        </Text>
        <Text
          type="l1"
          weight="bold"
          color={theme.pallate.neutral['05']}
          numberOfLines={1}
        >
          {label}
        </Text>
      </VStack>
      <IconChevronDown size={18} color={theme.pallate.neutral['04']} />
    </HStack>
  );
});
LocationCard.displayName = 'LocationCard';

/** Height the header occupies at the top of the screen (status bar included). */
export const getHomeHeaderHeight = (topInset: number): number =>
  topInset + HEADER_ROW_HEIGHT + HEADER_ROW_PADDING_BOTTOM;

export const HomeHeader = memo(
  ({
    topInset,
    isAuthenticated,
    onLoginPress,
    locationLabel,
    points,
    hidden,
  }: HomeHeaderProps) => {
    const glassHeight = getHomeHeaderHeight(topInset) + HEADER_FADE_HEIGHT;

    // The row slides fully above the screen. The glass slides up less, leaving a
    // soft blurred strip under the status bar so the clock and icons stay legible
    // over whatever scrolls beneath.
    const slide = (distance: number) => {
      'worklet';
      return {
        transform: [
          {
            translateY: withTiming(hidden?.value ? -distance : 0, {
              duration: HEADER_SLIDE_MS,
              easing: Easing.out(Easing.cubic),
            }),
          },
        ],
      };
    };
    const rowDistance = getHomeHeaderHeight(topInset);
    const glassDistance = HEADER_ROW_HEIGHT + HEADER_ROW_PADDING_BOTTOM;
    const rowSlideStyle = useAnimatedStyle(
      () => slide(rowDistance)
    );
    const glassSlideStyle = useAnimatedStyle(
      () => slide(glassDistance)
    );

    return (
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          pointerEvents="none"
          style={[styles.glass, { height: glassHeight }, glassSlideStyle]}
        >
          {IS_IOS ? (
            // One blur, faded out by an alpha mask: opaque at the top, clear at
            // the bottom edge. Stacking several blurs instead compounds their
            // saturation boost and leaves a visible edge at each layer.
            <MaskedView
              style={StyleSheet.absoluteFill}
              maskElement={
                <EasingGradient
                  easing={Easing.inOut(Easing.quad)}
                  startColor="#000000"
                  endColor="#000000"
                  startOpacity={1}
                  endOpacity={0}
                  startPosition={{ x: 0.5, y: 0 }}
                  endPosition={{ x: 0.5, y: 1 }}
                  steps={BLUR_MASK_STEPS}
                  style={StyleSheet.absoluteFill}
                />
              }
            >
              <BlurView
                blurType="light"
                blurAmount={BLUR_AMOUNT}
                style={StyleSheet.absoluteFill}
              />
            </MaskedView>
          ) : null}
          {/* Soft white tint fading out with the blur. */}
          <EasingGradient
            easing={Easing.inOut(Easing.quad)}
            startColor={theme.pallate.neutral['01']}
            endColor={theme.pallate.neutral['01']}
            startOpacity={IS_IOS ? 0.35 : 0.98}
            endOpacity={0}
            startPosition={{ x: 0.5, y: 0 }}
            endPosition={{ x: 0.5, y: 1 }}
            steps={24}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={rowSlideStyle} pointerEvents="box-none">
          <HStack
            padding={{
              paddingTop: topInset,
              paddingBottom: HEADER_ROW_PADDING_BOTTOM,
              paddingHorizontal: theme.spacing.large,
            }}
            items="center"
            gap={theme.spacing.small}
          >
            <LocationCard label={locationLabel} />
            {isAuthenticated ? (
              <>
                {points != null && <PointsButton points={points} />}
                <MessageButton />
              </>
            ) : (
              <LoginButton onPress={onLoginPress} />
            )}
          </HStack>
        </Animated.View>
      </View>
    );
  },
);

HomeHeader.displayName = 'HomeHeader';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  glass: { position: 'absolute', top: 0, left: 0, right: 0 },
  container: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
    gap: theme.spacing.small,
  },
  titleContainer: {
    flex: 1,
  },
  pointsPressable: {
    ...glassSurface,
    flexDirection: 'row',
    borderRadius: HEADER_BUTTON_RADIUS,
    borderCurve: 'continuous',
    alignItems: 'center',
    height: HEADER_ROW_HEIGHT,
    paddingHorizontal: HEADER_BUTTON_PADDING,
    gap: theme.spacing.small,
  },
  iconPressable: {
    ...glassSurface,
    borderRadius: HEADER_BUTTON_RADIUS,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    height: HEADER_ROW_HEIGHT,
    width: HEADER_ROW_HEIGHT,
  },
  loginPressable: {
    ...glassSurface,
    flexDirection: 'row',
    borderRadius: HEADER_BUTTON_RADIUS,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    height: HEADER_ROW_HEIGHT,
    paddingHorizontal: HEADER_BUTTON_PADDING,
    gap: theme.spacing.small,
  },
});
