import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Shimmer } from 'wuzz-shimmer';
import { People, Ticket, Wallet } from 'iconsax-react-native';
import { Box, HStack, Pressable, Text, theme, VStack } from '@components/atoms';
import { IconChevronRight } from 'tabler-icons-react-native';
import { Rank1White, Rank2White, Rank3White, Rank4White } from '@assets/index';
import type { MemberCardProps } from './member-card.types';

const CARD_RADIUS = 20;

const formatNumber = (n: number): string =>
  new Intl.NumberFormat('id-ID').format(n);
const formatRupiah = (n: number): string => `Rp${formatNumber(n)}`;

/** Size and corner of the stat icons: a solid rounded square in its own colour
 *  with a white glyph, the same for Voucher, Teman and the balance. */
const STAT_TILE_SIZE = 30;
const STAT_TILE_RADIUS = 9;
const STAT_GLYPH_SIZE = 18;

type StatTileProps = { color: string; children: React.ReactNode };
const StatTile = memo(({ color, children }: StatTileProps) => (
  <Box
    width={STAT_TILE_SIZE}
    height={STAT_TILE_SIZE}
    borderRadius={STAT_TILE_RADIUS}
    items="center"
    justify="center"
    backgroundColor={color}
  >
    {children}
  </Box>
));
StatTile.displayName = 'StatTile';

type StatProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  /** Takes the rest of the row and sits at its right end; the others hug their content. */
  fill?: boolean;
};
const Stat = memo(({ label, value, icon, fill = false }: StatProps) => (
  <HStack
    fill={fill}
    items="center"
    justify={fill ? 'flex-end' : 'flex-start'}
    gap={theme.spacing.small}
  >
    {icon}
    <VStack>
      <Text type="l2" color={theme.pallate.neutral['04']} numberOfLines={1}>
        {label}
      </Text>
      <Text
        type="b2"
        weight="bold"
        color={theme.pallate.neutral['05']}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {value}
      </Text>
    </VStack>
  </HStack>
));
Stat.displayName = 'Stat';

/** Height of the gradient header on top of the card. */
const HEADER_HEIGHT = 52;

/** Horizontal padding of everything inside the card, header included, so the
 *  greeting and the level line up with the card's content. */
const CONTENT_PADDING = theme.spacing.large;

/** How long each strip message stays before the cross-fade, and how long the
 *  cross-fade takes. */
const MESSAGE_HOLD_MS = 5000;
const MESSAGE_FADE_MS = 450;

/** How much of the right end the watermark covers; the level label stays clear of
 *  it (and the messages stop short of it) so no text ever sits on the artwork. */
const WATERMARK_CLEARANCE = 84;

/** Room kept free at the header's right end for the watermark. */
const BADGE_RESERVE = WATERMARK_CLEARANCE;

/** Colours of one level: the strip's gradient (light to base) and outline, and
 *  the text on it. Each comes from the palette that shares the level's name. The
 *  card itself stays white. */
type LevelTone = {
  stripColors: [string, string];
  border: string;
  onStrip: string;
};

const NEUTRAL_TONE: LevelTone = {
  stripColors: [theme.pallate.primary['03'], theme.pallate.primary['04']],
  border: theme.pallate.primary['02'],
  onStrip: theme.pallate.neutral['01'],
};

const LEVEL_TONES: Record<string, LevelTone> = {
  bronze: {
    stripColors: [theme.pallate.bronze['01'], theme.pallate.bronze['03']],
    border: theme.pallate.bronze['02'],
    onStrip: theme.pallate.neutral['05'],
  },
  silver: {
    stripColors: [theme.pallate.silver['01'], theme.pallate.silver['03']],
    border: theme.pallate.silver['02'],
    onStrip: theme.pallate.neutral['05'],
  },
  gold: {
    stripColors: [theme.pallate.gold['01'], theme.pallate.gold['03']],
    border: theme.pallate.gold['02'],
    onStrip: theme.pallate.neutral['05'],
  },
  platinum: {
    stripColors: [theme.pallate.diamond['01'], theme.pallate.diamond['03']],
    border: theme.pallate.diamond['02'],
    onStrip: theme.pallate.neutral['05'],
  },
};

const levelTone = (name?: string): LevelTone =>
  (name != null ? LEVEL_TONES[name.toLowerCase()] : undefined) ?? NEUTRAL_TONE;

/** The app's own level icons (white), keyed by level. */
const LEVEL_ICONS: Record<
  string,
  React.ComponentType<{ width?: number; height?: number }>
> = {
  bronze: Rank1White,
  silver: Rank2White,
  gold: Rank3White,
  platinum: Rank4White,
};

/** The same icon, large and faint, behind the header. */
const WATERMARK_SIZE = 110;
const WATERMARK_OPACITY = 0.8;

/** The level pill that floats on the line between the header and the card. */
const LEVEL_PILL_HEIGHT = 32;
const LEVEL_PILL_ICON_SIZE = 22;

type LevelPillProps = {
  name: string;
  tone: LevelTone;
  onPress?: () => void;
};

/** "Silver League": a white pill with the level's small rank icon. */
const LevelPill = memo(({ name, tone, onPress }: LevelPillProps) => {
  const { t } = useTranslation('home');
  const RankIcon = LEVEL_ICONS[name.toLowerCase()];
  return (
    <Pressable
      onPress={onPress}
      direction="row"
      items="center"
      gap={theme.spacing.tiny}
      height={LEVEL_PILL_HEIGHT}
      padding={{ paddingHorizontal: theme.spacing.standard }}
      borderRadius={999}
      borderWidth={1}
      borderColor={tone.border}
      backgroundColor={theme.pallate.neutral['01']}
    >
      {RankIcon != null && (
        <RankIcon width={LEVEL_PILL_ICON_SIZE} height={LEVEL_PILL_ICON_SIZE} />
      )}
      <Text
        type="b2"
        weight="bold"
        color={theme.pallate.neutral['05']}
        numberOfLines={1}
      >
        {t('memberCard.league', { name })}
      </Text>
      <IconChevronRight size={16} color={theme.pallate.neutral['05']} />
    </Pressable>
  );
});
LevelPill.displayName = 'LevelPill';

/** A looping fade, driven entirely on the UI thread. It is declared inside the
 *  animated style, so it starts when the view mounts: no useEffect, no JS timer
 *  and no re-render when the message changes. `visibleFirst` says whether the
 *  message is the one shown at the start of each cycle. */
const fadeLoop = (visibleFirst: boolean) => {
  'worklet';
  const [from, to] = visibleFirst ? [1, 0] : [0, 1];
  return withRepeat(
    withSequence(
      withTiming(from, { duration: 0 }),
      withDelay(MESSAGE_HOLD_MS, withTiming(to, { duration: MESSAGE_FADE_MS })),
      withDelay(
        MESSAGE_HOLD_MS,
        withTiming(from, { duration: MESSAGE_FADE_MS }),
      ),
    ),
    -1,
  );
};

/** Cross-fades between the strip's messages (the first two). Each message is a
 *  single Animated.View holding its Text, laid over the strip row (absolute, so
 *  they overlap and swap in place). */
const StripMessages = memo(
  ({ messages, color }: { messages: string[]; color: string }) => {
    const [first, second] = messages;
    const hasSecond = second != null;

    const firstStyle = useAnimatedStyle(
      () => ({ opacity: hasSecond ? fadeLoop(true) : 1 })
    );
    const secondStyle = useAnimatedStyle(
      () => ({ opacity: fadeLoop(false) })
    );

    return (
      <>
        <Animated.View style={[styles.message, firstStyle]}>
          <Text type="b2" weight="bold" color={color} numberOfLines={1}>
            {first}
          </Text>
        </Animated.View>
        {hasSecond && (
          <Animated.View style={[styles.message, secondStyle]}>
            <Text type="b2" weight="bold" color={color} numberOfLines={1}>
              {second}
            </Text>
          </Animated.View>
        )}
      </>
    );
  },
);
StripMessages.displayName = 'StripMessages';

/** The glint that sweeps across the header now and then, so it reads as a card. */
const SHEEN_WIDTH = 64;
const SHEEN_TILT_DEG = 20;
const SHEEN_SWEEP_MS = 1100;
const SHEEN_PAUSE_MS = 3600;
const SHEEN_COLORS = [
  'rgba(255,255,255,0)',
  'rgba(255,255,255,0.65)',
  'rgba(255,255,255,0)',
];

/** A tilted band of light that crosses the header, then waits. The loop is a
 *  Reanimated animation declared in the style, so it runs on the UI thread and
 *  starts when the view mounts. */
const Sheen = memo(() => {
  const { width } = useWindowDimensions();
  const style = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: withRepeat(
            withSequence(
              withTiming(-SHEEN_WIDTH * 2, { duration: 0 }),
              withDelay(
                SHEEN_PAUSE_MS,
                withTiming(width, {
                  duration: SHEEN_SWEEP_MS,
                  easing: Easing.inOut(Easing.quad),
                }),
              ),
            ),
            -1,
          ),
        },
        { rotate: `${SHEEN_TILT_DEG}deg` },
      ],
    })
  );
  return (
    <Animated.View pointerEvents="none" style={[styles.sheen, style]}>
      <LinearGradient
        colors={SHEEN_COLORS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sheenBand}
      />
    </Animated.View>
  );
});
Sheen.displayName = 'Sheen';

type PressHandlers = { onPress?: () => void };

type FrameProps = {
  children: React.ReactNode;
  /** Messages in the coloured header on top of the card. */
  messages?: string[];
  /** Floats on the line between the header and the card (the member level). It
   *  opens the same place as the header. */
  floating?: (press: PressHandlers) => React.ReactNode;
  /** Colours; defaults to the neutral card with a brand-blue header. */
  tone?: LevelTone;
  /** Large, faint artwork behind the header content. */
  watermark?: React.ReactNode;
  /** Makes the header (the card behind the white one) pressable. */
  onPress?: () => void;
};

/** A white card laid over a gradient header, so the card's own rounded top
 *  corners cut into the gradient. The header is taller than what shows and its
 *  sides end exactly where the card's straight sides begin, and both use the
 *  same outline colour, so the two read as one outline round the whole shape. */
const Frame = memo(
  ({
    children,
    messages,
    floating,
    tone = NEUTRAL_TONE,
    watermark,
    onPress,
  }: FrameProps) => {
    const hasHeader = messages != null;

    const press: PressHandlers = { onPress };

    return (
      <View style={styles.frame}>
        {hasHeader && (
          // The header is one Pressable, so the component's own press feedback
          // (the small shrink) moves the whole thing, outline included. It clips
          // the gradient and the sheen to its rounded top.
          <Pressable
            onPress={onPress}
            direction="row"
            items="center"
            justify="flex-end"
            style={[styles.header, { borderColor: tone.border }]}
          >
            <LinearGradient
              colors={tone.stripColors}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <Sheen />
            {watermark != null && (
              <View pointerEvents="none" style={styles.watermark}>
                {watermark}
              </View>
            )}
            {/* Only the strip's height, so the messages centre in the part of the
                header that shows above the white card. */}
            <View style={styles.headerMessages}>
              <StripMessages messages={messages} color={tone.onStrip} />
            </View>
          </Pressable>
        )}
        <Box
          zIndex={1}
          margin={{ marginTop: hasHeader ? HEADER_HEIGHT : 0 }}
          borderRadius={CARD_RADIUS}
          borderWidth={1}
          borderColor={hasHeader ? tone.border : theme.pallate.neutral['03']}
          backgroundColor={theme.pallate.neutral['01']}
          padding={{
            paddingHorizontal: CONTENT_PADDING,
            paddingVertical: theme.spacing.medium,
          }}
        >
          {children}
        </Box>
        {floating != null && (
          <View pointerEvents="box-none" style={styles.floating}>
            {floating(press)}
          </View>
        )}
      </View>
    );
  },
);
Frame.displayName = 'Frame';

export const MemberCard = memo(
  ({
    isAuthenticated,
    summary,
    isLoading,
    isError,
    onRetry,
    onLoginPress,
    onPress,
  }: MemberCardProps) => {
    const { t } = useTranslation('home');

    if (!isAuthenticated) {
      return (
        <Frame>
          <HStack items="center" gap={theme.spacing.standard}>
            <VStack fill>
              <Text type="l1" weight="semibold">
                {t('memberCard.loginTitle')}
              </Text>
              <Text type="l2" color={theme.pallate.neutral['04']}>
                {t('memberCard.loginDescription')}
              </Text>
            </VStack>
            <Pressable
              onPress={onLoginPress}
              padding={{
                paddingHorizontal: theme.spacing.medium,
                paddingVertical: theme.spacing.small,
              }}
              borderRadius={999}
              backgroundColor={theme.pallate.primary['03']}
            >
              <Text
                type="l2"
                weight="semibold"
                color={theme.pallate.neutral['01']}
              >
                {t('memberCard.login')}
              </Text>
            </Pressable>
          </HStack>
        </Frame>
      );
    }

    if (isLoading) {
      return (
        <Frame>
          <VStack gap={theme.spacing.standard}>
            <Shimmer width={180} height={16} borderRadius={6} />
            <HStack gap={theme.spacing.standard}>
              <Shimmer width={80} height={32} borderRadius={6} />
              <Shimmer width={80} height={32} borderRadius={6} />
              <Shimmer width={100} height={32} borderRadius={6} />
            </HStack>
          </VStack>
        </Frame>
      );
    }

    if (isError || !summary) {
      return (
        <Frame>
          <HStack items="center" gap={theme.spacing.standard}>
            <VStack fill>
              <Text type="l1" weight="semibold">
                {t('memberCard.errorTitle')}
              </Text>
              <Text type="l2" color={theme.pallate.neutral['04']}>
                {t('memberCard.errorDescription')}
              </Text>
            </VStack>
            {onRetry != null && (
              <Pressable
                onPress={onRetry}
                padding={{
                  paddingHorizontal: theme.spacing.standard,
                  paddingVertical: theme.spacing.tiny,
                }}
                borderRadius={999}
                backgroundColor={theme.pallate.primary['01']}
              >
                <Text
                  type="l2"
                  weight="semibold"
                  color={theme.pallate.primary['03']}
                >
                  {t('memberCard.retry')}
                </Text>
              </Pressable>
            )}
          </HStack>
        </Frame>
      );
    }

    const { level } = summary;
    const toNext =
      level?.next_level != null && level.next_level_xp != null
        ? Math.max(level.next_level_xp - summary.xp, 0)
        : null;
    const WatermarkIcon =
      level != null ? LEVEL_ICONS[level.name.toLowerCase()] : undefined;
    // The strip greets, then (when there is a next level) says how far it is.
    const messages = [t('memberCard.greeting', { name: summary.name })];
    if (toNext != null && level?.next_level != null) {
      messages.push(
        t('memberCard.xpToNext', {
          xp: formatNumber(toNext),
          level: level.next_level,
        }),
      );
    }

    return (
      <Frame
        messages={messages}
        watermark={
          WatermarkIcon != null ? (
            <WatermarkIcon width={WATERMARK_SIZE} height={WATERMARK_SIZE} />
          ) : undefined
        }
        onPress={onPress}
        tone={levelTone(level?.name)}
        floating={
          level != null
            ? press => (
                <LevelPill
                  name={level.name}
                  tone={levelTone(level.name)}
                  {...press}
                />
              )
            : undefined
        }
      >
        <HStack items="center" gap={theme.spacing.large}>
          <Stat
            label={t('memberCard.voucher')}
            value={formatNumber(summary.voucher_count)}
            icon={
              <StatTile color={theme.pallate.danger['03']}>
                <Ticket
                  size={STAT_GLYPH_SIZE}
                  variant="Bold"
                  color={theme.pallate.neutral['01']}
                />
              </StatTile>
            }
          />
          <Stat
            label={t('memberCard.friends')}
            value={formatNumber(summary.friend_count)}
            icon={
              <StatTile color={theme.pallate.secondary['03']}>
                <People
                  size={STAT_GLYPH_SIZE}
                  variant="Bold"
                  color={theme.pallate.neutral['01']}
                />
              </StatTile>
            }
          />
          <Stat
            fill
            label={t('memberCard.balance')}
            value={formatRupiah(summary.wallet_balance)}
            icon={
              <StatTile color={theme.pallate.primary['03']}>
                <Wallet
                  size={STAT_GLYPH_SIZE}
                  variant="Bold"
                  color={theme.pallate.neutral['01']}
                />
              </StatTile>
            }
          />
        </HStack>
      </Frame>
    );
  },
);
MemberCard.displayName = 'MemberCard';

const styles = StyleSheet.create({
  // Behind the card and taller than what shows: its lower CARD_RADIUS px sit
  // behind the card's curved top corners, which is where the gradient shows
  // through. No bottom outline; the card draws the rest.
  frame: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.standard,
  },
  header: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + CARD_RADIUS,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    borderCurve: 'continuous',
  },
  // Straddles the join between header and card, over both.
  floating: {
    position: 'absolute',
    right: CONTENT_PADDING,
    top: HEADER_HEIGHT - LEVEL_PILL_HEIGHT / 2,
    zIndex: 4,
  },
  // Taller than the header so the tilted band always covers it end to end; the
  // header clips what spills out.
  sheen: {
    position: 'absolute',
    top: -HEADER_HEIGHT,
    left: 0,
    width: SHEEN_WIDTH,
    height: HEADER_HEIGHT * 3,
  },
  sheenBand: { flex: 1 },
  // The strip's own height, with the messages in it; the rest of the header sits
  // under the white card.
  headerMessages: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },
  watermark: {
    position: 'absolute',
    right: -15,
    bottom: -20,
    opacity: WATERMARK_OPACITY,
  },
  // Fills the header row except the room kept for the level, so a long name is
  // cut off before it reaches it. Absolute children ignore the row's padding, so
  // it is repeated here.
  message: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: CONTENT_PADDING,
    right: BADGE_RESERVE,
    justifyContent: 'center',
  },
});
