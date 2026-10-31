import {
  Divider,
  HStack,
  Pressable,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import {
  getOutletTags,
  OutletListCard,
  OutletListCardSkeleton,
  OutletMapMarker,
  useOutletListData,
} from '@features/(outlet)/outlet-list';
import type { OutletListItem } from '@features/(outlet)/outlet-list';
import BottomSheet, { useBottomSheetScrollableCreator } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import MapView, { Marker } from 'react-native-maps';
import { useSelectedOutlet } from '@services/contexts';
import { ArrowDown2, Location, Setting4 } from 'iconsax-react-native';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dimensions } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconChevronLeft } from 'tabler-icons-react-native';

// Snap points sheet (fraksi tinggi layar), urut dari paling rendah. Makin rendah
// sheet-nya, makin luas map yang terlihat → kamera re-fit & zoom bertambah.
const SNAP_RATIOS = [0.1, 0.4, 1];

/** Jumlah kartu skeleton saat daftar outlet masih loading. */
const SKELETON_KEYS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'];

/** Zoom mode fokus (outlet terpilih) mengikuti posisi sheet: sheet turun
 *  (padding kecil) → zoom in, sheet naik (padding besar) → zoom out. */
const FOCUS_ZOOM_MAX = 15; // sheet paling bawah
const FOCUS_ZOOM_MIN = 13; // sheet naik

const OutletList = memo((props: any) => {
  const { navigation } = props;
  const { top, bottom } = useSafeAreaInsets();
  const { height } = Dimensions.get('window');
  const snapPoints = useMemo(
    () => SNAP_RATIOS.map((r) => `${Math.round(r * 100)}%`),
    [],
  );
  // Index snap aktif; dipakai sebagai nilai padding kamera saat settle & initial.
  const [sheetIndex, setSheetIndex] = useState(1);
  // Kamera cuma bereaksi antara index 0 (40%) & index 1 (75%). Di index 1 ke atas
  // (menuju 100%) padding dikunci di padMax → map berhenti berubah.
  const padMin = height * SNAP_RATIOS[0]; // padding di index 0 (paling rendah)
  const padMax = height * SNAP_RATIOS[1]; // padding di index 1 (batas atas kamera)
  const bottomSheetHeight = sheetIndex >= 1 ? padMax : padMin;

  const { outletList, mapMarkers, mapBounds, isLoading } = useOutletListData();

  // Real-time: ikuti index sheet tiap frame (bukan cuma pas settle). `sheetAnimatedIndex`
  // interpolasi kontinu: 0 = 40%, 1 = 75%, 2 = 100%. Di-clamp ke [0,1] supaya di atas
  // index 1 kamera beku. Pakai index (bukan posisi piksel) biar akurat & bebas topInset.
  const mapRef = useRef<MapView>(null);
  const sheetAnimatedIndex = useSharedValue(1);
  const lastPaddingBottom = useSharedValue(-1);
  // Target fokus kamera (outlet yang di-tap). Null = fit-all bounds. Diupdate tiap
  // render, dibaca applyCameraPadding (worklet path) supaya saat sheet digeser,
  // outlet terfokus tetap di tengah — bukan balik ke fit-all.
  const focusTargetRef = useRef<{ lng: number; lat: number } | null>(null);
  const bottomSheetHeightRef = useRef(bottomSheetHeight);
  bottomSheetHeightRef.current = bottomSheetHeight;
  // mapPadding: prop statis MapView (bukan per-panggilan seperti Mapbox Camera dulu).
  const [mapPadding, setMapPadding] = useState({
    top: 0,
    right: 0,
    bottom: bottomSheetHeight,
    left: 0,
  });

  // Zoom mode fokus dari padding sheet: padding kecil (sheet turun) → zoom in.
  const computeFocusZoom = useCallback(
    (paddingBottom: number) => {
      const range = padMax - padMin;
      const ratio =
        range > 0
          ? Math.min(Math.max((paddingBottom - padMin) / range, 0), 1)
          : 0;
      return FOCUS_ZOOM_MAX - ratio * (FOCUS_ZOOM_MAX - FOCUS_ZOOM_MIN);
    },
    [padMin, padMax],
  );

  const applyCameraPadding = useCallback(
    (paddingBottom: number) => {
      setMapPadding({ top: 0, right: 0, bottom: paddingBottom, left: 0 });
      const target = focusTargetRef.current;
      if (target) {
        // Fokus: cuma ubah zoom, TANPA center → biar pan manual user tidak
        // ketimpa balik ke marker saat sheet digeser.
        mapRef.current?.animateCamera(
          { zoom: computeFocusZoom(paddingBottom) },
          { duration: 0 },
        );
        return;
      }
      mapRef.current?.fitToCoordinates(
        [
          { latitude: mapBounds.maxLat, longitude: mapBounds.maxLng },
          { latitude: mapBounds.minLat, longitude: mapBounds.minLng },
        ],
        {
          edgePadding: { top: 0, right: 0, bottom: paddingBottom, left: 0 },
          animated: false,
        },
      );
    },
    [mapBounds, computeFocusZoom],
  );

  // Fit-all-bounds tiap kali mapBounds berubah (data baru/lokasi user resolved) —
  // setara reaktivitas prop `bounds` Camera Mapbox dulu.
  useEffect(() => {
    applyCameraPadding(bottomSheetHeightRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapBounds]);

  useAnimatedReaction(
    () => sheetAnimatedIndex.value,
    (idx) => {
      // clamp 0..1 → di atas index 1 (menuju 100%) kamera beku di padMax.
      const t = Math.min(Math.max(idx, 0), 1);
      const paddingBottom = padMin + (padMax - padMin) * t;
      // throttle ~2px biar nggak flooding thread JS tiap sub-piksel
      if (Math.abs(paddingBottom - lastPaddingBottom.value) < 2) return;
      lastPaddingBottom.value = paddingBottom;
      runOnJS(applyCameraPadding)(paddingBottom);
    },
    [applyCameraPadding, padMin, padMax],
  );
  // Sumber kebenaran selection = context global (di-init dari nearest, diubah
  // saat pilih dari daftar).
  const { selectedOutlet, setSelectedOutlet } = useSelectedOutlet();

  // Opened by a link to one outlet (wuzz://outlet/3, a banner): pick it once the list has it. Only once, so
  // it never overrides what the customer picks afterwards; an outlet the list does not have picks nothing.
  const linkedOutletId: string | undefined = props.route?.params?.outletId;
  const linkedOutletApplied = useRef(false);
  useEffect(() => {
    if (!linkedOutletId || linkedOutletApplied.current) return;
    const linked = outletList.find((o) => String(o.id) === linkedOutletId);
    if (!linked) return;
    linkedOutletApplied.current = true;
    setSelectedOutlet(linked);
  }, [linkedOutletId, outletList, setSelectedOutlet]);
  const selectedOutletId = selectedOutlet?.id ?? null;

  // Kamera fokus mengikuti outlet terpilih (selectedOutletId). Kalau tidak ada
  // yang terpilih → null → kamera fit-all bounds.
  const selectedMarker = useMemo(
    () => mapMarkers.find((m) => m.id === selectedOutletId) ?? null,
    [mapMarkers, selectedOutletId],
  );
  focusTargetRef.current = selectedMarker
    ? { lng: selectedMarker.lng, lat: selectedMarker.lat }
    : null;

  // Kamera terbang ke outlet HANYA saat seleksi berubah (bukan tiap sheet
  // bergerak) → pan manual user tidak ketimpa. Pakai id sebagai key.
  const selectedMarkerId = selectedMarker?.id ?? null;
  useEffect(() => {
    if (!selectedMarker) return;
    setMapPadding({ top: 0, right: 0, bottom: bottomSheetHeightRef.current, left: 0 });
    mapRef.current?.animateCamera(
      {
        center: { latitude: selectedMarker.lat, longitude: selectedMarker.lng },
        zoom: computeFocusZoom(bottomSheetHeightRef.current),
      },
      { duration: 500 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarkerId]);

  // Render marker terpilih paling akhir + zIndex tertinggi → tampil paling atas &
  // tidak ketutup marker lain.
  const orderedMarkers = useMemo(() => {
    if (selectedMarker == null) return mapMarkers;
    return [
      ...mapMarkers.filter((m) => m.id !== selectedMarker.id),
      selectedMarker,
    ];
  }, [mapMarkers, selectedMarker]);

  // Hanya dipakai sekali untuk render pertama (MapView.initialRegion tidak reaktif) —
  // fit sebenarnya ke mapBounds dilakukan lewat effect applyCameraPadding di atas.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialRegion = useMemo(
    () => ({
      latitude: (mapBounds.maxLat + mapBounds.minLat) / 2,
      longitude: (mapBounds.maxLng + mapBounds.minLng) / 2,
      latitudeDelta: Math.max((mapBounds.maxLat - mapBounds.minLat) * 1.4, 0.01),
      longitudeDelta: Math.max((mapBounds.maxLng - mapBounds.minLng) * 1.4, 0.01),
    }),
    [],
  );

  const listContentStyle = useMemo(
    () => ({
      paddingBottom: bottom + theme.spacing.standard,
    }),
    [bottom],
  );

  const handleOutletPress = useCallback((item: OutletListItem) => {
    setSelectedOutlet(item);
    // TODO: navigate to outlet detail or expand map to outlet
    navigation.pop();
  }, [navigation, setSelectedOutlet]);

  const renderOutletItem = useCallback(
    ({ item }: { item: OutletListItem }) => (
      <OutletListCard
        name={item.name}
        address={item.address}
        distanceKm={item.distance_in_km}
        services={item.services}
        photos={item.photos}
        tags={getOutletTags(item)}
        isSelected={selectedOutletId === item.id}
        onPress={() => handleOutletPress(item)}
      />
    ),
    [handleOutletPress, selectedOutletId],
  );

  const itemSeparator = useCallback(
    () => <Divider thickness={theme.spacing.standard} />,
    [],
  );

  const renderScrollComponent = useBottomSheetScrollableCreator();

  // Saat loading (list masih kosong), FlatList menampilkan skeleton lewat
  // ListEmptyComponent.
  const listEmptyComponent = useMemo(
    () =>
      isLoading ? (
        <VStack gap={theme.spacing.standard}>
          {SKELETON_KEYS.map((key) => (
            <OutletListCardSkeleton key={key} />
          ))}
        </VStack>
      ) : null,
    [isLoading],
  );

  return (
    <VStack fill backgroundColor={theme.pallate.neutral['01']}>
      <HStack
        position={{
          top,
          left: 0,
          right: 0,
        }}
        zIndex={1}
        padding={{
          paddingHorizontal: theme.spacing.large,
          paddingTop: theme.spacing.small,
        }}
        gap={theme.spacing.standard}
        justify="space-between"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          padding={{
            paddingVertical: theme.spacing.standard,
            paddingHorizontal: theme.spacing.medium,
          }}
          items="center"
          gap={theme.spacing.small}
          borderRadius={999}
          backgroundColor={theme.pallate.neutral['01']}
        >
          <IconChevronLeft
            size={24}
            color={theme.pallate.neutral['05']}
          />
          <Text type="b2" weight="semibold" color={theme.pallate.neutral['05']}>
            Back
          </Text>
        </Pressable>
       
      <Pressable
        onPress={() => navigation.navigate('deliveryaddress')}
        padding={{
          paddingVertical: theme.spacing.standard,
          paddingHorizontal: theme.spacing.medium,
        }}
        fill
        items="center"
        gap={theme.spacing.standard}
        borderRadius={999}
        backgroundColor={theme.pallate.neutral['01']}
      >
        <Location
          size={20}
          variant="Bulk"
          color={theme.pallate.primary['03']}
        />
        <VStack fill>
        <Text type="l1" weight="semibold" color={theme.pallate.neutral['05']}>
          Nearby Outlet
        </Text>
        <Text type="l2" numberOfLines={1} color={theme.pallate.neutral['05']}>
          Tangerang Selatan, Banten
        </Text>
        </VStack>
        <ArrowDown2 size={14} color={theme.pallate.neutral['05']} />
      </Pressable>
      </HStack>
      <MapView
        ref={mapRef}
        style={{
          flex: 1,
        }}
        initialRegion={initialRegion}
        mapPadding={mapPadding}
        scrollEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        showsCompass={false}
        toolbarEnabled={false}
        showsUserLocation
      >
        {orderedMarkers.map((marker) => (
          <Marker
            key={`marker-${marker.id}`}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            zIndex={selectedOutletId === marker.id ? 1 : 0}
            tracksViewChanges={false}
          >
            <OutletMapMarker
              marker={marker}
              isSelected={selectedOutletId === marker.id}
            />
          </Marker>
        ))}
      </MapView>
      <BottomSheet
        animationConfigs={{
          stiffness: 120,
          damping: 20,
          mass: 1,
          overshootClamping: true,
        }}
        topInset={top + theme.spacing.standard + 60}
        snapPoints={snapPoints}
        index={1}
        animatedIndex={sheetAnimatedIndex}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        handleIndicatorStyle={{
          backgroundColor: theme.pallate.neutral['03'],
          height: 5,
          width: 38,
        }}
        backgroundStyle={{ backgroundColor: theme.pallate.neutral['01'] }}
        enableDynamicSizing={false}
      >
        <FlashList
          data={outletList}
          keyExtractor={(item: OutletListItem) => String(item.id)}
          renderItem={renderOutletItem}
          renderScrollComponent={renderScrollComponent}
          ItemSeparatorComponent={itemSeparator}
          ListEmptyComponent={listEmptyComponent}
          contentContainerStyle={listContentStyle}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheet>
    </VStack>
  );
});

export default OutletList;