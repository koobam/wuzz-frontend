import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';
import { IconChevronDown } from 'tabler-icons-react-native';
import MapView, { Marker } from 'react-native-maps';
import { OutletMapMarker } from '@features/(outlet)/outlet-list';
import { FlashList, type ViewToken } from '@shopify/flash-list';
import { ArrowRight2, Gps, SearchStatus } from 'iconsax-react-native';
import { HStack, Pressable, Text, theme, VStack } from '@components/atoms';
import {
  WUZZER_CARD_HEIGHT,
  WUZZER_CARD_WIDTH,
  WuzzerCard,
} from './wuzzer-card';
import type { Wuzzer, WuzzerNearbyProps } from './wuzzer-nearby.types';

const MAP_HEIGHT = 230;
const MAP_RADIUS = 20;

/** About 2.5 km across: close enough that "nearby" means a few minutes away. */
const MAP_DELTA = 0.025;

/** How much of the top of each card is tucked under the map. */
const MAP_OVERLAP = 0;

const EMPTY: Wuzzer[] = [];

/** The pin is 55 wide. The selected one stays that size; the rest are drawn smaller. */
const PIN_SIZE = 55;
const OTHER_PIN_SCALE = 0.72;

const keyExtractor = (wuzzer: Wuzzer): string => wuzzer.id;

/** Hairline between cards; part of each snap step. */
const SEPARATOR_WIDTH = 1;
const SNAP_INTERVAL = WUZZER_CARD_WIDTH + SEPARATOR_WIDTH;

const Separator = memo(() => <View style={styles.separator} />);
Separator.displayName = 'Separator';

type SeeAllCardProps = { onPress?: () => void };

/** The last page: a way on to the full list. Takes a card's width, with the
 *  hairline that would otherwise sit between it and the card before. */
const SeeAllCard = memo(({ onPress }: SeeAllCardProps) => {
  const { t } = useTranslation('home');

  return (
    <HStack height={WUZZER_CARD_HEIGHT}>
      <Separator />
      <Pressable
        onPress={onPress}
        direction="row"
        items="center"
        justify="center"
        gap={theme.spacing.small}
        width={WUZZER_CARD_WIDTH}
      >
        <Text type="b2" weight="bold" color={theme.pallate.primary['03']}>
          {t('wuzzerNearby.seeAll')}
        </Text>
        <ArrowRight2 size={18} color={theme.pallate.primary['03']} />
      </Pressable>
    </HStack>
  );
});
SeeAllCard.displayName = 'SeeAllCard';

/** A card counts as the current page once most of it is on screen. */
const VIEWABILITY = { itemVisiblePercentThreshold: 60 };

/** Stands where the cards would be while there is nobody to show. */
const EmptyCard = memo(() => {
  const { t } = useTranslation('home');

  return (
    <HStack
      width={WUZZER_CARD_WIDTH}
      height={WUZZER_CARD_HEIGHT}
      items="center"
      justify="center"
      gap={theme.spacing.small}
      padding={theme.spacing.standard}
    >
      <SearchStatus
        size={22}
        variant="Bulk"
        color={theme.pallate.neutral['04']}
      />
      <Text type="l1" weight="semibold" color={theme.pallate.neutral['05']}>
        {t('wuzzerNearby.empty')}
      </Text>
    </HStack>
  );
});
EmptyCard.displayName = 'EmptyCard';

/**
 * "Cari Wuzzer Terdekat Yuk!": a map of where the customer is, and under it the
 * drivers and technicians (Wuzzers) who come to the door and are close enough to
 * be called. The map sits on top of the cards and covers their upper edge. There
 * is no Wuzzer data behind it yet, so the list says so instead of inventing any.
 */
export const WuzzerNearby = memo(
  ({
    coords,
    isLocating,
    isLocationError,
    wuzzers = EMPTY,
    onCall,
    onSeeAll,
  }: WuzzerNearbyProps) => {
    const { t } = useTranslation('home');
    // The list is paged one card at a time, and the card in view is the selected
    // Wuzzer on the map.
    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleViewableChange = useCallback(
      ({ viewableItems }: { viewableItems: ViewToken<Wuzzer>[] }) => {
        const first = viewableItems[0]?.index;
        if (first != null) {
          setSelectedIndex(first);
        }
      },
      [],
    );
    const renderItem = useCallback(
      ({ item, index }: { item: Wuzzer; index: number }) => (
        <WuzzerCard
          wuzzer={item}
          selected={index === selectedIndex}
          onCall={onCall}
        />
      ),
      [onCall, selectedIndex],
    );

    return (
      <VStack
        gap={theme.spacing.standard}
        padding={{ paddingHorizontal: theme.spacing.large }}
      >
        <VStack>
          <Text type="s2" weight="semibold">
            {t('wuzzerNearby.title')}
          </Text>
          <Text type="l1" color={theme.pallate.neutral['04']}>
            {t('wuzzerNearby.description')}
          </Text>
        </VStack>

        <VStack
          borderRadius={MAP_RADIUS}
          borderWidth={1}
          borderColor={theme.pallate.neutral['03']}
          style={styles.frame}
        >
          {/* zIndex: the map is above the cards that tuck in under it. */}
          <View style={styles.mapFrame}>
            {coords != null ? (
              <MapView
                style={StyleSheet.absoluteFill}
                // initialRegion is read once, which is right: the map is only
                // mounted once the position is known.
                initialRegion={{
                  latitude: coords.lat,
                  longitude: coords.long,
                  latitudeDelta: MAP_DELTA,
                  longitudeDelta: MAP_DELTA,
                }}
                // A preview, not a map to roam: it sits inside a scrolling page.
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                showsCompass={false}
                toolbarEnabled={false}
                showsUserLocation
              >
                {wuzzers.map((wuzzer, index) => {
                  if (wuzzer.coords == null) {
                    return null;
                  }
                  // The Wuzzer whose card is showing is the selected one: full size,
                  // on top of the others, which are scaled down.
                  const selected = index === selectedIndex;
                  return (
                    <Marker
                      // The pin is drawn once (tracksViewChanges is off), so a new
                      // key redraws it when it gains or loses the selection.
                      key={`${wuzzer.id}-${selected}`}
                      zIndex={selected ? 1 : 0}
                      coordinate={{
                        latitude: wuzzer.coords.lat,
                        longitude: wuzzer.coords.long,
                      }}
                      tracksViewChanges={false}
                    >
                      <View style={selected ? undefined : styles.otherPin}>
                        <View
                          style={selected ? undefined : styles.otherPinScale}
                        >
                          <OutletMapMarker
                            isSelected={selected}
                            marker={{
                              id: 0,
                              lat: wuzzer.coords.lat,
                              lng: wuzzer.coords.long,
                              rating: wuzzer.rating ?? 0,
                              imageUri: wuzzer.photoUri,
                            }}
                          />
                        </View>
                      </View>
                    </Marker>
                  );
                })}
              </MapView>
            ) : (
              <HStack
                fill
                items="center"
                justify="center"
                gap={theme.spacing.small}
                padding={{ paddingHorizontal: theme.spacing.large }}
              >
                <Gps
                  size={22}
                  variant="Bulk"
                  color={theme.pallate.neutral['04']}
                />
                {isLocationError ? (
                  <Pressable onPress={() => Linking.openSettings()}>
                    <Text
                      type="l1"
                      weight="semibold"
                      color={theme.pallate.primary['03']}
                    >
                      {t('wuzzerNearby.enableLocation')}
                    </Text>
                  </Pressable>
                ) : (
                  <Text type="l1" color={theme.pallate.neutral['04']}>
                    {isLocating
                      ? t('wuzzerNearby.locating')
                      : t('wuzzerNearby.locationUnavailable')}
                  </Text>
                )}
              </HStack>
            )}
          </View>
          <FlashList
            data={wuzzers}
            extraData={selectedIndex}
            horizontal
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={EmptyCard}
            ListFooterComponent={
              wuzzers.length > 0 ? <SeeAllCard onPress={onSeeAll} /> : null
            }
            // Snaps one card at a time, like pages, but each card is its own width
            // rather than the whole list, so the next one peeks in.
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            onViewableItemsChanged={handleViewableChange}
            viewabilityConfig={VIEWABILITY}
            showsHorizontalScrollIndicator={false}
            style={styles.list}
          />
        </VStack>
      </VStack>
    );
  },
);

WuzzerNearby.displayName = 'WuzzerNearby';

const styles = StyleSheet.create({
  separator: {
    width: SEPARATOR_WIDTH,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: theme.pallate.neutral['03'],
  },
  // The smaller pins get a box of their own size, so the marker is not left
  // with the full-size footprint around a shrunken pin.
  otherPin: {
    width: PIN_SIZE * OTHER_PIN_SCALE,
    height: PIN_SIZE * OTHER_PIN_SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherPinScale: { transform: [{ scale: OTHER_PIN_SCALE }] },
  // Clips the map and the cards to the one border, which stays inside.
  frame: { overflow: 'hidden' },
  mapFrame: {
    zIndex: 2,
    height: MAP_HEIGHT,
    backgroundColor: theme.pallate.neutral['02'],
  },
  // Pulled up under the map; each card's top MAP_OVERLAP px is hidden by it.
  list: {
    height: WUZZER_CARD_HEIGHT + MAP_OVERLAP,
    marginTop: -MAP_OVERLAP,
  },
});
