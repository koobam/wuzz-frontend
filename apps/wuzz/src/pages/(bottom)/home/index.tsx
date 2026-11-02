import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { theme, VStack } from '@components/atoms';
import type { HomeType } from '@features/(bottom)/home/types';
import {
  BusinessCard,
  CategoryGrid,
  HomeBanner,
  HomeHeader,
  MoodSection,
  OngoingOrdersSection,
  OnlyServiceSection,
  MemberCard,
  QuickActions,
  TermsAndPrivacySection,
  WuzzerNearby,
} from '@features/(bottom)/home/components';
import { Probe } from '../../../__bisect/probe';
import { useHomeController } from '@features/(bottom)/home/hooks';

const styles = StyleSheet.create({
  content: { gap: theme.spacing.large },
});

/** Setiap kartu membawa onPress sendiri; ini hanya syarat tipe props section. */
const noop = () => {};

const HomeInner = memo((props: HomeType) => {
  const { t } = useTranslation('home');
  const { navigation } = props;
  const {
    top,
    navHeight,
    screenWidth,
    isAuthenticated,
    scrollY,
    headerHidden,
    handleScroll,
    isRefreshing,
    handlePullRefresh,
    locationLabel,
    memberSummary,
    isLoadingMember,
    isErrorMember,
    refetchMember,
    laundryServices,
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
    handleLoginPress,
    handleSearchPress,
    handleScanPress,
    handleCategoryPress,
    handleSeeAllOrders,
    handleOrderPress,
    handleContactPress,
    handleSeeAllWuzzers,
  } = useHomeController(navigation);

  return (
    // The header sits outside the scroll view so it stays pinned and the page
    // scrolls underneath its frosted glass.
    <View style={{ flex: 1 }}>
      <VStack
        as={
          <Animated.ScrollView
            // Without this iOS adds its own safe-area inset and parks the resting
            // contentOffset at a small negative number rather than 0. The banner
            // reads a negative offset as over-scroll, so it would sit permanently
            // zoomed and every stretch would start from the wrong place.
            contentInsetAdjustmentBehavior="never"
            // One gap between every section, so no section carries its own bottom
            // space. On the content container: the scroll view's own style would
            // not reach its children.
            contentContainerStyle={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handlePullRefresh}
              />
            }
          />
        }
        fill
      >
        <VStack
          borderRadius={{
            borderBottomLeftRadius: 40,
          }}
        >
          <HomeBanner screenWidth={screenWidth} scrollY={scrollY} />
          <QuickActions
            onSearchPress={handleSearchPress}
            onScanPress={handleScanPress}
          />
          <MemberCard
            isAuthenticated={isAuthenticated}
            summary={memberSummary}
            isLoading={isLoadingMember}
            isError={isErrorMember}
            onRetry={refetchMember}
            onLoginPress={handleLoginPress}
          />
        </VStack>

        <CategoryGrid
          onCategoryPress={handleCategoryPress}
          items={laundryServices}
          isLoading={isLoadingLaundryServices}
          isError={isErrorLaundryServices}
          error={errorLaundryServices}
          onRetry={refetchLaundryServices}
        />
        {(selfServiceItems.length > 0 || isLoadingAlacarte) && (
          <OnlyServiceSection
            title={t('selfService.title')}
            subtitle={t('selfService.subtitle')}
            items={selfServiceItems}
            isLoading={isLoadingAlacarte}
            onServicePress={noop}
          />
        )}
        <OngoingOrdersSection
          onOrderPress={handleOrderPress}
          onSeeAllPress={handleSeeAllOrders}
        />
        <BusinessCard onContactPress={handleContactPress} />
        <WuzzerNearby
          wuzzers={wuzzers}
          onSeeAll={handleSeeAllWuzzers}
          coords={location.coords}
          isLocating={location.isLoading}
          isLocationError={location.isLocationError}
        />
        {(moods || isLoadingMoods) && (
          <MoodSection
            moods={moods}
            isLoading={isLoadingMoods}
            isError={isErrorMoods}
            error={errorMoods}
          />
        )}
        <TermsAndPrivacySection />
        {/* The tab bar floats over the page; this keeps the last section clear. */}
        <VStack height={navHeight} />
      </VStack>
      <HomeHeader
        topInset={top}
        isAuthenticated={isAuthenticated}
        onLoginPress={handleLoginPress}
        locationLabel={locationLabel}
        points={memberSummary?.points}
        hidden={headerHidden}
      />
    </View>
  );
});

HomeInner.displayName = 'HomeInner';
export const Home = memo((props: HomeType) => <Probe id="Home"><HomeInner {...props} /></Probe>);
Home.displayName = 'Home';

export type { HomeType } from '@features/(bottom)/home/types';
