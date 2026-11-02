import { useCallback, useMemo, useState } from 'react';
import { queryClient } from '@wuzz/native/query';
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import type { HomeType } from '@features/(bottom)/home/types';
import { getHomeHeaderHeight } from '@features/(bottom)/home/components/home-header';
import type { OnlyServiceItem } from '@features/(bottom)/home/components/only-service-section/only-service-section.types';
import {
  useFetchLaundryServices,
  useFetchLaundryServicesAlacarte,
  useFetchMemberSummary,
  useFetchMoods,
} from '@services/index';
import type { LaundryService } from '@core/api';
import { useAuthState } from '@hooks/utils/useAuth';
import { useBottomNavHeight } from '@services/contexts/bottom-nav-height';
import { useCoverageLabel } from './useCoverageLabel';
import { useNearbyWuzzers } from './useNearbyWuzzers';

/** The header only reacts to a deliberate swipe: this far down in one direction
 *  to tuck away, this far up to come back. Smaller wobbles (momentum, bounce,
 *  content loading in) are ignored so it does not flicker in and out. */
const HEADER_HIDE_DISTANCE = 56;
const HEADER_SHOW_DISTANCE = 24;

export type HomeNavigation = HomeType['navigation'];

/**
 * Everything the home screen does, so the page itself only draws: the data of each section, the pull-to-refresh, the
 * buttons' handlers, and the scroll state that stretches the banner and tucks the header away. Give it the screen's
 * `navigation`.
 */
export const useHomeController = (navigation: HomeNavigation) => {
  const { top } = useSafeAreaInsets();
  const { navHeight } = useBottomNavHeight();
  const screenWidth = Dimensions.get('screen').width;
  const { isAuthenticated } = useAuthState();
  const { label: locationLabel, refetch: refetchLocation, location } = useCoverageLabel();
  const {
    data: memberSummary,
    isLoading: isLoadingMember,
    isError: isErrorMember,
    refetch: refetchMember,
  } = useFetchMemberSummary({ enabled: isAuthenticated });

  // Pull-to-refresh: ulangi lokasi + refetch SEMUA query aktif (outlet, services,
  // alacarte, moods, order tracking, dst) supaya seluruh section ikut segar.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handlePullRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      refetchLocation();
      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchLocation]);

  const {
    data: laundryServiceQueries,
    isLoading: isLoadingLaundryServices,
    isError: isErrorLaundryServices,
    error: errorLaundryServices,
    refetch: refetchLaundryServices,
  } = useFetchLaundryServices();

  const { data: alacarteData, isLoading: isLoadingAlacarte } = useFetchLaundryServicesAlacarte();
  const {
    data: moodsData,
    isLoading: isLoadingMoods,
    isError: isErrorMoods,
    error: errorMoods,
  } = useFetchMoods();
  const moods = moodsData?.moods ?? null;

  const wuzzers = useNearbyWuzzers(location.coords);

  const handleSeeAllWuzzers = useCallback(() => {
    navigation.navigate('wuzzerlist', location.coords ?? undefined);
  }, [navigation, location.coords]);

  const handleLoginPress = useCallback(() => {
    navigation.navigate('login');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('menusearch');
  }, [navigation]);

  const handleScanPress = useCallback(() => {
    navigation.navigate('scan');
  }, [navigation]);

  const handleCategoryPress = useCallback(
    (item: LaundryService) => {
      navigation.navigate({
        name: 'laundry',
        params: { serviceId: String(item.id) },
      });
    },
    [navigation],
  );

  const handleSeeAllOrders = useCallback(() => {
    navigation.navigate('history');
  }, [navigation]);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      navigation.navigate('orderstatus', { orderId });
    },
    [navigation],
  );

  const handleOnlyServicePress = useCallback(
    (item: OnlyServiceItem) => {
      navigation.navigate('laundry', {
        type: (item.serviceType ?? 'satuan') as 'satuan' | 'kiloan',
        serviceId: String(item.id),
      });
    },
    [navigation],
  );

  const toServiceItems = useCallback(
    (services: LaundryService[], onItemPress?: () => void) =>
      services.map(service => {
        const promo =
          service.discount > 0
            ? service.discount_type === 'percentage'
              ? `${service.discount}%`
              : String(service.discount)
            : undefined;
        const item: OnlyServiceItem = {
          id: service.id,
          name: service.name,
          description: service.description,
          icon: service.icon,
          iconUrl: service.icon_url,
          promo,
          serviceType: service.service_type === 'multiple' ? 'kiloan' : 'satuan',
        };
        return {
          ...item,
          onPress: onItemPress ?? (() => handleOnlyServicePress(item)),
        };
      }),
    [handleOnlyServicePress],
  );

  // Self service dipakai di mesin outlet: memilih salah satu kartu membuka scan
  // QR dulu, bukan halaman pesan.
  const selfServiceItems = useMemo(
    () => toServiceItems(alacarteData?.services ?? [], handleScanPress),
    [alacarteData?.services, toServiceItems, handleScanPress],
  );

  const handleContactPress = useCallback(() => {
    navigation.navigate('chat');
  }, [navigation]);

  // Kept on the UI thread and handed to the banner, which stretches itself
  // while the list is over-scrolled. A state variable would re-render the
  // whole screen on every scroll frame to move one image.
  const scrollY = useSharedValue(0);
  // The header tucks away while scrolling down and returns on scrolling up. Near
  // the top it is always shown, so the bounce there never leaves it hidden or
  // flickering.
  const lastScrollY = useSharedValue(0);
  // Where the current run in one direction began, and which way it goes.
  const runStartY = useSharedValue(0);
  const runDirection = useSharedValue(0);
  const headerHidden = useSharedValue(false);
  // True only while a finger (or its momentum) is moving the list. Content that
  // loads in or resizes also shifts the offset, and that must not tuck the
  // header away: the user did nothing, so it vanished for no visible reason.
  const userScrolling = useSharedValue(false);
  const revealZone = getHomeHeaderHeight(top);

  // Coming back to Home always starts with the header showing, whatever state
  // the last scroll left it in.
  useFocusEffect(
    useCallback(() => {
      headerHidden.value = false;
    }, [headerHidden]),
  );

  const handleScroll = useAnimatedScrollHandler({
    onBeginDrag: () => {
      userScrolling.value = true;
    },
    onEndDrag: event => {
      // No momentum follows a drag that ends at rest.
      if (Math.abs(event.velocity?.y ?? 0) < 0.05) {
        userScrolling.value = false;
      }
    },
    onMomentumEnd: () => {
      userScrolling.value = false;
    },
    onScroll: event => {
      const y = event.contentOffset.y;
      const dy = y - lastScrollY.value;
      scrollY.value = y;
      lastScrollY.value = y;

      if (y > revealZone && !userScrolling.value) {
        // Offset moved by itself (layout shift): restart the run, leave the header.
        runDirection.value = 0;
        return;
      }

      if (dy !== 0) {
        const direction = dy > 0 ? 1 : -1;
        if (direction !== runDirection.value) {
          runDirection.value = direction;
          runStartY.value = y - dy;
        }
      }

      if (y <= revealZone) {
        headerHidden.value = false;
      } else if (runDirection.value === 1 && y - runStartY.value > HEADER_HIDE_DISTANCE) {
        headerHidden.value = true;
      } else if (runDirection.value === -1 && runStartY.value - y > HEADER_SHOW_DISTANCE) {
        headerHidden.value = false;
      }
    },
  });

  return {
    // Layout: the safe-area top, the tab bar's height (the last section clears it), the screen's width.
    top,
    navHeight,
    screenWidth,
    isAuthenticated,
    // The scroll state: the banner stretches by `scrollY`, the header tucks away by `headerHidden`.
    scrollY,
    headerHidden,
    handleScroll,
    // Pull to refresh.
    isRefreshing,
    handlePullRefresh,
    // The header.
    locationLabel,
    // The member card.
    memberSummary,
    isLoadingMember,
    isErrorMember,
    refetchMember,
    // The sections.
    laundryServices: laundryServiceQueries?.services ?? [],
    isLoadingLaundryServices,
    isErrorLaundryServices,
    errorLaundryServices,
    refetchLaundryServices,
    selfServiceItems,
    isLoadingAlacarte,
    moods,
    isLoadingMoods,
    isErrorMoods,
    errorMoods,
    wuzzers,
    location,
    // The buttons.
    handleLoginPress,
    handleSearchPress,
    handleScanPress,
    handleCategoryPress,
    handleSeeAllOrders,
    handleOrderPress,
    handleContactPress,
    handleSeeAllWuzzers,
  };
};
