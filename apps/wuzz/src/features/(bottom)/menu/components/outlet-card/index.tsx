import { Box, Pressable, Text, theme, VStack } from '@components/atoms';
import { OutletServiceBadge } from '@features/(outlet)/outlet-list';
import { Location } from 'iconsax-react-native';
import { IconChevronDown } from 'tabler-icons-react-native';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { OutletCardProps } from './outlet-card.types';

const CARD_BORDER_RADIUS = 20;

/** How far the pill sits above the card's top edge. Most of it hangs outside;
 *  only a sliver overlaps down onto the card, which is what makes it read as
 *  attached to the card rather than dropped on top of it. Mirrors reddog's
 *  shared OutletCard (libs/native), which uses the same pill for its menu header. */
const PILL_OVERHANG = 15;
/** Sticker tilt, in degrees, applied anticlockwise. */
const PILL_TILT_DEG = 3;

export const OutletCard = memo((props: OutletCardProps) => {
  const {
    outletName,
    outletAddress,
    outletServices,
    onOutletPress,
    locationColor,
    showBadge,
  } = props;

  return (
    // marginTop reserves the room the pill hangs into above the card, so the
    // menu header's collapsing wrapper (overflow: hidden) doesn't clip it —
    // it sees this whole margin as part of the card's box, not empty space.
    <Box margin={{ marginTop: PILL_OVERHANG }}>
      <Box
        position={{ top: -PILL_OVERHANG, left: theme.spacing.medium }}
        zIndex={2}
        borderRadius={999}
        borderWidth={2}
        borderColor={theme.pallate.neutral['01']}
        backgroundColor={theme.pallate.primary['03']}
        padding={{
          paddingHorizontal: theme.spacing.standard,
          paddingVertical: theme.spacing.tiny,
        }}
        style={styles.pill}
      >
        <Text
          type="l1"
          weight="bold"
          color={theme.pallate.neutral['01']}
          text="Outlet Terpilih"
        />
      </Box>
      {/* Single bordered card, like reddog's — the pill overlaps it directly.
          Home's version frames this in a second, outer white box with a bolder
          colored border; layering the pill on top of THAT border is what was
          cutting a visible notch out of it where the two overlapped. One thin
          neutral border, one overlap, no seam. */}
      <Pressable
        onPress={onOutletPress}
        borderWidth={1}
        direction="row"
        borderColor={theme.pallate.neutral['03']}
        backgroundColor={theme.pallate.neutral['01']}
        borderRadius={CARD_BORDER_RADIUS}
        padding={{
          paddingHorizontal: theme.spacing.medium,
          paddingVertical: theme.spacing.standard,
        }}
        gap={theme.spacing.standard}
        items="center"
        style={styles.card}
      >
        {showBadge ? (
          <OutletServiceBadge
            services={outletServices ?? []}
            isSelected
            iconOnly
            selectedBackgroundColor={theme.pallate.coffee['01']}
            selectedContentColor={theme.pallate.coffee['03']}
          />
        ) : (
          <Location size={20} color={locationColor} variant="Bulk" />
        )}
        <VStack fill>
          <Text
            type="l1"
            weight="semibold"
            numberOfLines={1}
            text={outletName ?? 'Choose outlet'}
            color={theme.pallate.neutral['05']}
          />
          {outletAddress != null && outletAddress !== '' && (
            <Text
              type="l2"
              color={theme.pallate.neutral['04']}
              numberOfLines={1}
              text={outletAddress}
            />
          )}
        </VStack>
        <IconChevronDown color={theme.pallate.primary['03']} size={24} />
      </Pressable>
    </Box>
  );
});

OutletCard.displayName = 'OutletCard';

// Tilted like a sticker. Rotating the container, not the text, keeps the
// rounded background square with the label.
const styles = StyleSheet.create({
  pill: { transform: [{ rotate: `-${PILL_TILT_DEG}deg` }] },
  card: { overflow: 'hidden' },
});

export type { OutletCardProps } from './outlet-card.types';
