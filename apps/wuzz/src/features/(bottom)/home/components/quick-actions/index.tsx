import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  GlassBlur,
  glassSurface,
  HStack,
  Pressable,
  Text,
  theme,
} from '@components/atoms';
import { Heart, ScanBarcode, SearchNormal1 } from 'iconsax-react-native';

/** Gap between the banner's pager dots and the row. The dots are inset over the
 *  photo, so the row below them still sits on the photo's faded bottom edge. The
 *  banner's mascot stays in front, hanging ~40px over the row's right end — which
 *  is why the scan button sits on the left and the (left-aligned) search hint
 *  fills the right, instead of the mascot covering a button. */
const ROW_TOP_GAP = 18;

/** Scan QR and Likes: square icon buttons left of the search field. On first load
 *  they are wider, showing a label, before collapsing to the icon. */
const ICON_BUTTON_SIZE = 46;
const ICON_SIZE = 22;

/** The icon sits where it ends up (centred in the collapsed button), so this is
 *  the space either side of it. The expanded button keeps the same space on its
 *  right, which is what makes it look evenly padded. */
const BUTTON_PADDING = (ICON_BUTTON_SIZE - ICON_SIZE) / 2;
const ICON_LABEL_GAP = theme.spacing.small;

/** Natural width of each label (14pt semibold), measured on screen. Update these
 *  if the label text or its font changes. */
const SCAN_LABEL_WIDTH = 54;
const LIKES_LABEL_WIDTH = 32;

/** Button width while its label shows: padding, icon, gap, label, padding. */
const expandedWidth = (labelWidth: number): number =>
  BUTTON_PADDING + ICON_SIZE + ICON_LABEL_GAP + labelWidth + BUTTON_PADDING;
const SCAN_EXPANDED_WIDTH = expandedWidth(SCAN_LABEL_WIDTH);
const LIKES_EXPANDED_WIDTH = expandedWidth(LIKES_LABEL_WIDTH);
const COPY_VISIBLE_MS = 2500;
const COLLAPSE_MS = 450;

type QuickActionsProps = {
  onSearchPress: () => void;
  onScanPress: () => void;
  /** Favorite services. There is no favorites screen yet, so Home leaves this unset. */
  onFavoritePress?: () => void;
};

type SearchFieldProps = { onPress: () => void };

/** Looks like a search field: icon then hint, left-aligned, on frosted glass. */
const SearchField = memo(({ onPress }: SearchFieldProps) => {
  const { t } = useTranslation('home');

  return (
    <View style={[glassSurface, styles.search]}>
      <GlassBlur />
      <Pressable
        fill
        onPress={onPress}
        direction="row"
        items="center"
        justify="flex-start"
        gap={theme.spacing.small}
        padding={{ paddingHorizontal: theme.spacing.medium }}
      >
        <SearchNormal1
          size={20}
          variant="Linear"
          color={theme.pallate.neutral['05']}
        />
        <Text type="l1" color={theme.pallate.neutral['05']} numberOfLines={1}>
          {t('quickActions.search')}
        </Text>
      </Pressable>
    </View>
  );
});
SearchField.displayName = 'SearchField';

type ExpandingActionProps = {
  label: string;
  icon: React.ReactNode;
  /** Width while the label is shown. */
  expandedWidth: number;
  /** 0 = label shown, 1 = icon only. */
  progress: SharedValue<number>;
  onPress?: () => void;
};

/** Shows its label on first load so people know what the icon does, then the
 *  label fades and the button shrinks to just the icon. */
const ExpandingAction = memo(
  ({ label, icon, expandedWidth, progress, onPress }: ExpandingActionProps) => {
    const widthStyle = useAnimatedStyle(() => ({
      width: interpolate(
        progress.value,
        [0, 1],
        [expandedWidth, ICON_BUTTON_SIZE],
      ),
    }));
    const labelStyle = useAnimatedStyle(() => ({
      opacity: interpolate(progress.value, [0, 0.5], [1, 0], 'clamp'),
    }));

    return (
      <Animated.View style={[glassSurface, styles.action, widthStyle]}>
        <GlassBlur />
        <Pressable
          fill
          onPress={onPress}
          accessibilityLabel={label}
          direction="row"
          items="center"
          justify="flex-start"
          gap={ICON_LABEL_GAP}
          // The icon sits where it will end up (centred in the collapsed button),
          // so only the label moves away.
          padding={{ paddingLeft: BUTTON_PADDING }}
          borderRadius={16}
        >
          {icon}
          <Animated.View style={labelStyle}>
            <Text
              type="b2"
              weight="semibold"
              color={theme.pallate.neutral['05']}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  },
);
ExpandingAction.displayName = 'ExpandingAction';

export const QuickActions = memo(
  ({ onSearchPress, onScanPress, onFavoritePress }: QuickActionsProps) => {
    const { t } = useTranslation('home');
    // Runs once when the row first appears: copy visible, then it collapses.
    const progress = useSharedValue(0);
    useEffect(() => {
      progress.value = withDelay(
        COPY_VISIBLE_MS,
        withTiming(1, {
          duration: COLLAPSE_MS,
          easing: Easing.out(Easing.cubic),
        }),
      );
    }, [progress]);

    return (
      <HStack
        // Above the banner's mascot (which hangs ~40px into this row), so the mascot
        // peeks out from behind the search field instead of over it.
        zIndex={3}
        margin={{ marginTop: ROW_TOP_GAP }}
        gap={theme.spacing.small}
        padding={{
          paddingHorizontal: theme.spacing.large,
          paddingBottom: theme.spacing.standard,
        }}
      >
        <ExpandingAction
          label={t('quickActions.scan')}
          expandedWidth={SCAN_EXPANDED_WIDTH}
          progress={progress}
          onPress={onScanPress}
          icon={
            <ScanBarcode
              size={ICON_SIZE}
              variant="Bold"
              color={theme.pallate.neutral['05']}
            />
          }
        />
        <ExpandingAction
          label={t('quickActions.likes')}
          expandedWidth={LIKES_EXPANDED_WIDTH}
          progress={progress}
          onPress={onFavoritePress}
          icon={
            <Heart
              size={ICON_SIZE}
              variant="Bold"
              color={theme.pallate.danger['03']}
            />
          }
        />
        <SearchField onPress={onSearchPress} />
      </HStack>
    );
  },
);
QuickActions.displayName = 'QuickActions';

const styles = StyleSheet.create({
  action: { height: ICON_BUTTON_SIZE, borderRadius: 16 },
  search: { flex: 1, height: ICON_BUTTON_SIZE, borderRadius: 16 },
});
