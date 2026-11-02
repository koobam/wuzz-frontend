import { memo, useCallback, useEffect, useState } from 'react';
import { Box, Flex, HStack, Pressable, theme } from '@components/atoms';
import { Shimmer } from '@components/atoms/shimmer';
import { FlashList } from '@shopify/flash-list';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import Image from '@components/atoms/image';
import type { Banner } from '@api/banners.types';
import { useFetchBanners, useFetchLoginBanners } from '@hooks/apis/banners';
import { useAnalytics } from '@hooks/utils/useAnalytics';
import { openDeeplink, parseDeeplink } from '@navigation/deeplink';
import { useSelectedOutlet } from '@services/contexts';
import { useBannerPager, useStretchyBannerStyle } from '../../hooks';
import { BannerDot } from '../banner-dot';
import { WoozlyMascot } from '@assets/index';
import type { HomeBannerProps } from './home-banner.types';

/**
 * How far the banner bleeds above the content.
 *
 * Only has to outlast a fast flick, and it sits off-screen at rest, so the
 * number is generous rather than measured.
 */
const BLEED_HEIGHT = 400;

/** The fill above the banner: the primary blue, deeper at the top (see where it is used). Not the palette's pure blue. */
const BLEED_GRADIENT = [theme.pallate.primary['04'], '#5A66FF'];

/** How far the banner picture reaches below the banner's own layout box, down
 *  to the League card: quick-actions row (+ its spacing) sits in this stretch. */
const BANNER_OVERLAP = 64;

/** How far above the banner's layout edge the mascot sits (it is 80px tall). */
const MASCOT_LIFT = 54;

const styles = StyleSheet.create({
  overflowHidden: { overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Anchored to the bottom of the bleed box and flipped, so the image's own top
  // row lands exactly on the banner's top edge: the join is seamless by
  // construction rather than by a colour someone has to keep in sync.
  bleedImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transform: [{ scaleY: -1 }],
  },
});

/** Banners already shown to the customer in this session: one impression each, however often the list is reopened. */
const seenThisSession = new Set<string>();

/** A banner opens something only when the server says it does and the link reads; otherwise it is a picture. */
const isTappable = (banner: Banner) =>
  banner.target_type !== 'none' && parseDeeplink(banner.deeplink) !== null;

/** The same box the carousel takes, so the page below does not jump when the banners arrive. */
function useBannerHeights(screenWidth: number, plain: boolean) {
  // height : width. The banner spans the full screen width, so the height
  // follows from it rather than being a fixed number that reads small on most
  // devices. Capped against the window height so a wide/short screen doesn't
  // get a banner taller than itself.
  const { height: windowHeight } = useWindowDimensions();
  const BANNER_RATIO = 0.85;
  const MAX_HEIGHT_SHARE = 0.65;
  const bannerHeight = Math.min(
    screenWidth * BANNER_RATIO,
    windowHeight * MAX_HEIGHT_SHARE,
  );
  // The picture runs this much further down than the space the banner takes in
  // the layout, so what follows (quick actions, then the League card) sits on
  // the photo instead of on white. Layout height is still `bannerHeight`. A plain banner (the login screen's) has none of
  // that: the picture is exactly the space it takes.
  const overlap = plain ? 0 : BANNER_OVERLAP;
  return { bannerHeight, imageHeight: bannerHeight + overlap, overlap };
}

const HomeBannerSkeleton = memo(({ screenWidth, plain }: { screenWidth: number; plain: boolean }) => {
  const { imageHeight, overlap } = useBannerHeights(screenWidth, plain);
  return (
    <Box height={imageHeight} margin={{ marginBottom: -overlap }}>
      <Shimmer width="100%" height={imageHeight} borderRadius={0} />
    </Box>
  );
});
HomeBannerSkeleton.displayName = 'HomeBannerSkeleton';

type CarouselProps = HomeBannerProps & { banners: Banner[] };

const HomeBannerCarousel = memo(({ banners, screenWidth, scrollY, plain = false, dotsBottomInset = 0 }: CarouselProps) => {
  const {
    bannerListRef,
    scrollOffsetX,
    handleBannerScrollUpdate,
    handleDotPress,
  } = useBannerPager();

  const { bannerHeight, imageHeight, overlap } = useBannerHeights(screenWidth, plain);

  // Stands in when the screen doesn't pass a scroll offset, so the hook is
  // still called unconditionally and the banner just keeps its fixed height.
  const idleScrollY = useSharedValue(0);
  const stretchyStyle = useStretchyBannerStyle({
    scrollY: scrollY ?? idleScrollY,
    height: imageHeight,
  });

  const { logEvent } = useAnalytics();

  const handleBannerPress = useCallback(
    (banner: Banner) => {
      logEvent('banner_tap', { banner_id: banner.id, target_type: banner.target_type });
      openDeeplink(banner.deeplink);
    },
    [logEvent],
  );

  const renderBannerItem = useCallback(
    ({ item }: { item: Banner }) => {
      const picture = (
        <Image uri={item.image_url} resizeMode="cover" style={styles.bannerImage} />
      );
      return (
        <Box width={screenWidth} height={imageHeight} style={styles.overflowHidden}>
          {isTappable(item) ? (
            <Pressable
              onPress={() => handleBannerPress(item)}
              accessibilityRole="link"
              accessibilityLabel={item.title}
              style={styles.fill}
            >
              {picture}
            </Pressable>
          ) : (
            picture
          )}
        </Box>
      );
    },
    [screenWidth, imageHeight, handleBannerPress],
  );

  const keyExtractor = useCallback((item: Banner) => ['banner', item.id].join('-'), []);

  // Which banner the bleed mirror should show. Derived on the UI thread and
  // pushed to JS only when the page actually changes, not on every scroll frame.
  const [activeIndex, setActiveIndex] = useState(0);
  useAnimatedReaction(
    () => Math.round(scrollOffsetX.value / screenWidth),
    (index, previous) => {
      if (index !== previous) {
        runOnJS(setActiveIndex)(index);
      }
    },
  );
  const active = banners[Math.min(Math.max(activeIndex, 0), banners.length - 1)];

  // One impression per banner per session, when its slide is the one on screen.
  useEffect(() => {
    if (!active || seenThisSession.has(active.id)) return;
    seenThisSession.add(active.id);
    logEvent('banner_impression', { banner_id: active.id });
  }, [active, logEvent]);

  const dots = banners.map((banner, index) => (
    <BannerDot
      key={['banner-dot', banner.id].join('-')}
      index={index}
      count={banners.length}
      scrollOffsetX={scrollOffsetX}
      screenWidth={screenWidth}
      onPress={handleDotPress}
    />
  ));

  return (
    <>
      {/* What the screen would otherwise show as white when the banner cannot
          cover the gap. The stretch is driven by scroll events, and a native
          scroll can always move a frame before the transform that follows it is
          committed — on a fast flick that one frame is a white band across the
          top. No amount of tuning removes it: it is a race, not a mis-measure.

          So the area above the content is already filled, with the app's blue
          as a gradient: deeper at the very top, lighter where it meets the
          picture. It sits entirely off-screen while the page is at rest, and
          it is the same whether or not there is a banner picture. */}
      <Box
        position={{ top: -BLEED_HEIGHT, left: 0, right: 0 }}
        height={BLEED_HEIGHT}
        style={styles.overflowHidden}
        pointerEvents="none"
        as={<LinearGradient colors={BLEED_GRADIENT} />}
      />
      <Box
        height={imageHeight}
        // Gives back the overlap, so the layout below starts at `bannerHeight`.
        margin={{ marginBottom: -overlap }}
      >
        <Animated.View style={[{ height: imageHeight }, stretchyStyle]}>
          <FlashList
            ref={bannerListRef}
            data={banners}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleBannerScrollUpdate}
            renderItem={renderBannerItem}
            keyExtractor={keyExtractor}
          />
        </Animated.View>
        {plain ? null : (
          <Box
            position={{
              bottom: 0,
              left: 0,
              right: 0,
            }}
            as={
              <LinearGradient
                colors={[
                  'transparent',
                  'transparent',
                  theme.pallate.neutral['01'],
                ]}
                locations={[0, 0.62, 1]}
              />
            }
            height={imageHeight}
            pointerEvents="none"
          />
        )}
        {plain ? (
          // The dots sit on the picture's own bottom edge: nothing is drawn below the picture, and a card laid over its bottom
          // edge is cleared by `dotsBottomInset`.
          <HStack
            items="center"
            position={{ bottom: theme.spacing.standard + dotsBottomInset, left: theme.spacing.large }}
            gap={theme.spacing.small}
          >
            {dots}
          </HStack>
        ) : null}
      </Box>
      {plain ? null : (
        <HStack
          items="center"
          margin={{
            marginTop: theme.spacing.large * 3.5 * -1,
            marginHorizontal: theme.spacing.large,
          }}
          gap={theme.spacing.small}
        >
          {dots}
        </HStack>
      )}
      {plain ? null : (
        <Flex direction="column" items="center" justify="space-between">
          <Box
            as={<WoozlyMascot width={80} height={80} />}
            width={80}
            height={80}
            position={{
              // High enough that most of it shows above the search field it sits
              // behind; only its feet are tucked in.
              top: -MASCOT_LIFT,
              right: theme.spacing.large,
            }}
            zIndex={2}
          />
        </Flex>
      )}
    </>
  );
});

HomeBannerCarousel.displayName = 'HomeBannerCarousel';

type BannerQuery = ReturnType<typeof useFetchBanners>;

/**
 * A carousel for the banners a query returned. While they load there is a skeleton of the same height; with no live banners,
 * or when they cannot be read, there is nothing (never made-up pictures) and the rest of the screen carries on.
 */
const BannerSource = memo(
  ({ query, logName, ...props }: HomeBannerProps & { query: BannerQuery; logName: string }) => {
    const { data: banners, isPending, isError, error } = query;

    useEffect(() => {
      if (isError) console.error(`[${logName}] banners failed to load`, error);
    }, [isError, error, logName]);

    if (isPending) return <HomeBannerSkeleton screenWidth={props.screenWidth} plain={props.plain ?? false} />;
    if (isError || !banners || banners.length === 0) return null;
    return <HomeBannerCarousel {...props} banners={banners} />;
  },
);

BannerSource.displayName = 'BannerSource';

/** The home carousel, fed by the server. */
export const HomeBanner = memo((props: HomeBannerProps) => {
  const { selectedOutlet } = useSelectedOutlet();
  const query = useFetchBanners({ outlet_id: selectedOutlet?.id ?? undefined });
  return <BannerSource {...props} query={query} logName="HomeBanner" />;
});

HomeBanner.displayName = 'HomeBanner';

/** The login screen's carousel: a list of its own (banners whose placement is login), drawn plain: no fade, no overlap, no mascot. */
export const LoginBanner = memo((props: HomeBannerProps) => {
  const { selectedOutlet } = useSelectedOutlet();
  const query = useFetchLoginBanners({ outlet_id: selectedOutlet?.id ?? undefined });
  return <BannerSource {...props} plain query={query} logName="LoginBanner" />;
});

LoginBanner.displayName = 'LoginBanner';
