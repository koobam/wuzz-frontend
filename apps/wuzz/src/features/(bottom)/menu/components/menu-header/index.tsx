import { VStack, theme } from '@components/atoms';
import { getDistanceStyles } from '@features/(outlet)/outlet-list';
import { memo, useMemo } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { DeliveryAddressRow } from '../delivery-address-row';
import { OutletCard } from '../outlet-card';
import { MENU_HEADER_OUTLET_SECTION_HEIGHT } from '../../utils/constants';
import type { MenuHeaderProps } from './menu-header.types';

export const MenuHeader = memo((props: MenuHeaderProps) => {
  const {
    topInset,
    deliveryLocationLabel,
    outletName,
    outletAddress,
    distanceKm,
    outletStatus,
    outletServices,
    onOutletPress,
    onSearchPress,
    collapseProgress,
  } = props;

  const outletAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    if (collapseProgress == null) return {};
    const p = collapseProgress.value;
    return {
      maxHeight: interpolate(
        p,
        [0, 1],
        [MENU_HEADER_OUTLET_SECTION_HEIGHT, 0],
      ),
      opacity: interpolate(p, [0, 1], [1, 0]),
      overflow: 'hidden' as const,
    };
  });

  const showBadge = outletServices != null && outletServices.length > 0;
  const locationColor = useMemo(() => {
    if (distanceKm != null) return getDistanceStyles(distanceKm).color;
    return theme.pallate.primary['03'];
  }, [distanceKm]);

  const headerPadding = useMemo(
    () => ({
      paddingTop: topInset + theme.spacing.standard,
      paddingBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
    }),
    [topInset],
  );

  const outletCardProps = useMemo(
    () => ({
      outletName,
      outletAddress,
      distanceKm,
      outletStatus,
      outletServices,
      onOutletPress,
      locationColor,
      showBadge,
    }),
    [
      outletName,
      outletAddress,
      distanceKm,
      outletStatus,
      outletServices,
      onOutletPress,
      locationColor,
      showBadge,
    ],
  );

  return (
    <VStack
      borderWidth={{ borderBottomWidth: 1 }}
      borderColor={theme.pallate.neutral['02']}
      padding={headerPadding}
    >
      <DeliveryAddressRow
        deliveryLocationLabel={deliveryLocationLabel}
        onSearchPress={onSearchPress}
      />
      {collapseProgress != null ? (
        <Animated.View style={outletAnimatedStyle}>
          <OutletCard {...outletCardProps} />
        </Animated.View>
      ) : (
        <OutletCard {...outletCardProps} />
      )}
    </VStack>
  );
});

MenuHeader.displayName = 'MenuHeader';

export type { MenuHeaderProps } from './menu-header.types';
