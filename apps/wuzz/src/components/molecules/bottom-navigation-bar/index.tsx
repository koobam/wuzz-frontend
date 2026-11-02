import {
  glassSurface,
  HStack,
  Icon,
  Pressable,
  PressableAnimated,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { Fragment, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight2, Headphone, Magicpen } from 'iconsax-react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAuthState } from '@hooks/utils/useAuth';
import { useBottomNavHeight } from '@services/contexts/bottom-nav-height';
import { useOrderDraft } from '@services/contexts';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useTranslation } from 'react-i18next';
import { IS_IOS } from '../../../../env';

/** Stronger than the shared glass (16): the cart sits over busy content and
 *  should read as properly frosted, not just tinted. */
const CART_BLUR_AMOUNT = 40;

/** The square pictures in the cart card: size, how much they overlap, how many show. */
const THUMB_SIZE = 36;
const THUMB_RADIUS = 10;
const THUMB_OVERLAP = 16;
const MAX_THUMBS = 3;

const SCREEN_WIDTH = Dimensions.get('window').width;

const TAB_COLOR_DURATION = 500;
const UNFOCUSED_COLOR = theme.pallate.neutral['04'];
const FOCUSED_COLOR_PRIMARY = theme.pallate.primary['03'];
const FOCUSED_COLOR_MENU = theme.pallate.coffee['03'];

const TOTAL_WIDTH = SCREEN_WIDTH - theme.spacing.large * 2;
const SPECIAL_WIDTH = 80;
const REMAINING_WIDTH = TOTAL_WIDTH - SPECIAL_WIDTH;
/** Width of a normal tab: what is left beside the centre button, shared out. */
const itemWidthFor = (tabCount: number): number =>
  REMAINING_WIDTH / Math.max(1, tabCount - 1);

type AnimatedTabItemProps = {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  tabBarIcon?: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => React.ReactNode;
  label: string;
  itemWidth: number;
  focusedColor: string;
};

const AnimatedTabItem = React.memo(
  ({
    isFocused,
    onPress,
    onLongPress,
    tabBarIcon,
    label,
    itemWidth,
    focusedColor,
  }: AnimatedTabItemProps) => {
    return (
      <Pressable
        onPress={onPress}
        gap={2}
        width={itemWidth}
        height={70}
        items="center"
        justify="center"
        direction="column"
        onLongPress={onLongPress}
      >
        {label !== 'Menu' ? (
          tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? focusedColor : UNFOCUSED_COLOR,
            size: 28,
          })
        ) : (
          <VStack items="center">
            <Text
              color={isFocused ? focusedColor : UNFOCUSED_COLOR}
              type="b1"
              weight="stylized"
              text="Can"
            />
            <Text
              color={isFocused ? focusedColor : UNFOCUSED_COLOR}
              margin={{ marginTop: -8 }}
              type="b1"
              weight="stylized"
              text="teen"
            />
          </VStack>
        )}
        {label !== 'Menu' && (
          <Text
            type="l1"
            color={isFocused ? focusedColor : UNFOCUSED_COLOR}
            weight={isFocused ? 'semibold' : 'regular'}
            text={label}
          />
        )}
      </Pressable>
    );
  },
);

AnimatedTabItem.displayName = 'AnimatedTabItem';

const CART_BG_PRIMARY = theme.pallate.primary['03'];
const CART_BG_MENU = theme.pallate.coffee['03'];
const CART_BUTTON_PRIMARY = theme.pallate.primary['04'];
const CART_BUTTON_MENU = theme.pallate.coffee['04'];
const SCAN_CIRCLE_PRIMARY = theme.pallate.primary['03'];
const SCAN_CIRCLE_MENU = theme.pallate.coffee['03'];

export const BottomNavigationBar = React.memo((props: BottomTabBarProps) => {
  const { state, descriptors, navigation } = props;
  const { bottom } = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthState();
  const { onLayout } = useBottomNavHeight();
  const { items, total } = useOrderDraft();
  const isMenuTab = state.routes[state.index]?.name === 'menu';
  const menuProgress = useSharedValue(isMenuTab ? 1 : 0);

  useEffect(() => {
    menuProgress.value = withTiming(isMenuTab ? 1 : 0, {
      duration: TAB_COLOR_DURATION,
    });
  }, [isMenuTab, menuProgress]);

  const animatedCartBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      menuProgress.value,
      [0, 1],
      [CART_BG_PRIMARY, CART_BG_MENU],
    ),
  }));

  const animatedButtonBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      menuProgress.value,
      [0, 1],
      [CART_BUTTON_PRIMARY, CART_BUTTON_MENU],
    ),
  }));

  const animatedScanCircleBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      menuProgress.value,
      [0, 1],
      [SCAN_CIRCLE_PRIMARY, SCAN_CIRCLE_MENU],
    ),
  }));

  return (
    // Absolute, so the page runs on behind the floating card instead of stopping
    // above the bar. Screens clear it with their own bottom padding (navHeight).
    <VStack onLayout={onLayout} style={styles.bar} pointerEvents="box-none">
      {/* Keranjang kosong: kartu melayang jadi ajakan bertanya untuk yang bingung
          mau pesan apa. Avatar AI nanti menggantikan lingkaran ikonnya. */}
      {isAuthenticated && items.length === 0 && (
        <HStack
          style={[glassSurface, styles.cartCard]}
          borderRadius={16}
          items="center"
          gap={theme.spacing.small}
        >
          {IS_IOS && (
            <BlurView
              pointerEvents="none"
              blurType="light"
              blurAmount={CART_BLUR_AMOUNT}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Pressable
            fill
            direction="row"
            items="center"
            gap={theme.spacing.standard}
            onPress={() => navigation.getParent()?.navigate('chat')}
            padding={{
              paddingHorizontal: theme.spacing.medium,
              paddingVertical: theme.spacing.standard,
            }}
          >
            <PressableAnimated
              width={40}
              height={40}
              borderRadius={20}
              items="center"
              justify="center"
              style={animatedButtonBgStyle}
            >
              <Magicpen
                size={22}
                variant="Bulk"
                color={theme.pallate.neutral['01']}
              />
            </PressableAnimated>
            <VStack fill>
              <Text
                type="l1"
                weight="semibold"
                color={theme.pallate.neutral['05']}
              >
                {t('bottomBar.help.title')}
              </Text>
              <Text type="l2" color={theme.pallate.neutral['04']}>
                {t('bottomBar.help.subtitle')}
              </Text>
            </VStack>
            <VStack style={styles.arrow}>
              <ArrowRight2 size={24} color={theme.pallate.neutral['04']} />
            </VStack>
          </Pressable>
        </HStack>
      )}
      {/* Isi keranjang: layanan yang sudah ditambahkan, dibayar sekali di checkout. */}
      {isAuthenticated && items.length > 0 && (
        <VStack style={styles.cartWrap}>
          <HStack
            style={[glassSurface, styles.cartGlass]}
            borderRadius={16}
            items="center"
            gap={theme.spacing.small}
          >
            {IS_IOS && (
              <BlurView
                pointerEvents="none"
                blurType="light"
                blurAmount={CART_BLUR_AMOUNT}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Pressable
              fill
              direction="row"
              items="center"
              gap={theme.spacing.standard}
              onPress={() => navigation.getParent()?.navigate('checkout')}
              padding={{
                paddingHorizontal: theme.spacing.medium,
                paddingVertical: theme.spacing.standard,
              }}
            >
              {/* The services in the cart as a stack of small rounded-square icon
                  tiles. Three tiles at most, the "+N" tile counted among them: with
                  more than three services, two show and the third says how many
                  more there are. */}
              <View
                style={[
                  styles.stack,
                  {
                    width:
                      THUMB_SIZE +
                      (Math.min(items.length, MAX_THUMBS) - 1) *
                        (THUMB_SIZE - THUMB_OVERLAP),
                  },
                ]}
              >
                {items
                  .slice(
                    0,
                    items.length > MAX_THUMBS ? MAX_THUMBS - 1 : MAX_THUMBS,
                  )
                  .map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.thumb,
                        { left: index * (THUMB_SIZE - THUMB_OVERLAP) },
                      ]}
                    >
                      {item.icon ? (
                        <Icon
                          icon={item.icon}
                          size={THUMB_SIZE - 10}
                          color={theme.pallate.neutral['01']}
                        />
                      ) : null}
                    </View>
                  ))}
                {items.length > MAX_THUMBS ? (
                  <View
                    style={[
                      styles.thumb,
                      styles.thumbMore,
                      { left: (MAX_THUMBS - 1) * (THUMB_SIZE - THUMB_OVERLAP) },
                    ]}
                  >
                    <Text
                      type="l1"
                      weight="extrabold"
                      color={theme.pallate.neutral['05']}
                    >
                      {`+${items.length - (MAX_THUMBS - 1)}`}
                    </Text>
                  </View>
                ) : null}
              </View>
              <VStack fill>
                <Text
                  type="l1"
                  weight="semibold"
                  color={theme.pallate.neutral['05']}
                >
                  {`Rp ${total.toLocaleString('id-ID')} · ${
                    items.length
                  } Layanan`}
                </Text>
                <Text
                  numberOfLines={2}
                  type="l2"
                  color={theme.pallate.neutral['04']}
                >
                  {items.map(item => item.name).join(', ')}
                </Text>
              </VStack>
              <VStack style={styles.arrow}>
                <ArrowRight2 size={24} color={theme.pallate.neutral['04']} />
              </VStack>
            </Pressable>
          </HStack>
          <Animated.View
            pointerEvents="none"
            style={[styles.tag, animatedCartBgStyle]}
          >
            <Text
              type="l1"
              weight="bold"
              color={theme.pallate.neutral['01']}
              text={t('bottomBar.cart')}
            />
          </Animated.View>
        </VStack>
      )}
      {/* Guests get a login/register prompt floating above the tab row. */}
      {!isAuthenticated && (
        <HStack
          style={[glassSurface, styles.cartCard]}
          borderRadius={16}
          items="center"
          gap={theme.spacing.small}
        >
          {IS_IOS && (
            <BlurView
              pointerEvents="none"
              blurType="light"
              blurAmount={CART_BLUR_AMOUNT}
              style={StyleSheet.absoluteFill}
            />
          )}
          <HStack
            fill
            items="center"
            gap={theme.spacing.small}
            padding={{
              paddingHorizontal: theme.spacing.medium,
              paddingVertical: theme.spacing.standard,
            }}
          >
            <Text
              type="l1"
              fill
              numberOfLines={2}
              color={theme.pallate.neutral['05']}
            >
              Laundry, food & coffee, dalam satu aplikasi.
            </Text>

            <PressableAnimated
              onPress={() => navigation.getParent()?.navigate('login')}
              padding={{
                paddingHorizontal: theme.spacing.large,
                paddingVertical: theme.spacing.standard,
              }}
              borderRadius={999}
              style={animatedButtonBgStyle}
            >
              <Text
                type="l1"
                color={theme.pallate.neutral['01']}
                weight="semibold"
              >
                Masuk
              </Text>
            </PressableAnimated>

            <PressableAnimated
              onPress={() => navigation.getParent()?.navigate('register')}
              padding={{
                paddingHorizontal: theme.spacing.large,
                paddingVertical: theme.spacing.standard,
              }}
              borderRadius={999}
              backgroundColor={theme.pallate.neutral['02']}
            >
              <Text
                type="l1"
                color={theme.pallate.neutral['05']}
                weight="semibold"
              >
                Daftar
              </Text>
            </PressableAnimated>
          </HStack>
        </HStack>
      )}
      <HStack
        padding={{
          paddingBottom: bottom,
        }}
        height={bottom + 70}
        justify="center"
        items="center"
        backgroundColor={theme.pallate.neutral['01']}
        borderColor={theme.pallate.neutral['02']}
        borderRadius={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        borderWidth={{
          borderTopWidth: 1,
          borderRightWidth: 1,
          borderLeftWidth: 1,
        }}
      >
        {state.routes.map((route: any, index: any) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              if (route.name === 'profile' && !isAuthenticated) {
                navigation.getParent()?.navigate('login');
                return;
              }
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          if (route.name === 'support') {
            return (
              <Pressable
                key={route.key}
                width={SPECIAL_WIDTH}
                direction="column"
                onPress={onPress}
                gap={theme.spacing.tiny}
                margin={{
                  marginTop: -20,
                }}
                onLongPress={onLongPress}
                items="center"
                justify="center"
              >
                <PressableAnimated
                  onPress={onPress}
                  width={55}
                  height={55}
                  borderRadius={999}
                  items="center"
                  justify="center"
                  borderWidth={2}
                  borderColor={theme.pallate.neutral['01']}
                  style={animatedScanCircleBgStyle}
                >
                  <Headphone
                    size={28}
                    color={theme.pallate.neutral['01']}
                    variant="Bulk"
                  />
                </PressableAnimated>
                <Text
                  type="l1"
                  color={theme.pallate.neutral['04']}
                  weight="medium"
                  text={t('tabs.message')}
                />
              </Pressable>
            );
          }
          const focusedColor =
            route.name === 'menu' ? FOCUSED_COLOR_MENU : FOCUSED_COLOR_PRIMARY;

          return (
            <AnimatedTabItem
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              tabBarIcon={options.tabBarIcon}
              label={label as string}
              itemWidth={itemWidthFor(state.routes.length)}
              focusedColor={focusedColor}
            />
          );
        })}
      </HStack>
    </VStack>
  );
});

const styles = StyleSheet.create({
  stack: { height: THUMB_SIZE },
  thumbMore: { backgroundColor: theme.pallate.neutral['03'] },
  thumb: {
    position: 'absolute',
    top: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: theme.pallate.neutral['01'],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.pallate.neutral['02'],
  },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  // Much less white than the shared glass tint, so the blur itself shows through.
  // The empty-cart and guest cards float on their own: the margin is on the card.
  cartCard: {
    marginHorizontal: theme.spacing.standard,
    marginBottom: theme.spacing.standard,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cartGlass: { backgroundColor: 'rgba(255,255,255,0.08)' },
  // Label di tepi atas kartu, miring sedikit seperti stiker.
  tag: {
    position: 'absolute',
    top: -20,
    left: theme.spacing.standard,
    borderRadius: 999,
    borderCurve: 'continuous',
    paddingHorizontal: theme.spacing.standard,
    paddingVertical: theme.spacing.tiny,
    borderWidth: 2,
    borderColor: theme.pallate.neutral['01'],
    transform: [{ rotate: '-3deg' }],
  },
  arrow: { transform: [{ rotate: '-45deg' }] },
  cartWrap: {
    marginHorizontal: theme.spacing.standard,
    marginBottom: theme.spacing.standard,
  },
});

BottomNavigationBar.displayName = 'components/molecules/BottomNavigationBar';
export default BottomNavigationBar;
