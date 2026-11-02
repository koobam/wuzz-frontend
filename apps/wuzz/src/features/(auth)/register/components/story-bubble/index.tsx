import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text, theme } from '@components/atoms';
// WebP at @2x/@3x of the drawn size: an illustration that never changes costs one bitmap, not a tree of SVG paths.
const PICTURES = {
  cat: require('../../../../../../assets/illustrations/kocheng.webp'),
  mouse: require('../../../../../../assets/illustrations/tikus.webp'),
} as const;

/** Each character's size on the page, by its drawing's own ratio (the cat 275:233, the mouse 167:180). */
const SIZES = {
  cat: { width: 72, height: Math.round((72 * 233) / 275) },
  mouse: { width: 62, height: Math.round((62 * 180) / 167) },
} as const;
const TAIL_SIZE = 14;

export type StoryCharacter = 'cat' | 'mouse';

type StoryBubbleProps = {
  /** Who is talking: the cat opens, and the mouse takes over from the second step on. */
  character?: StoryCharacter;
  /** What the character says. A new line fades in, so each step feels like the next thing in a conversation. */
  line: string;
  /** What the person answered on the step before, shown as their own bubble above the line: the conversation so far. */
  reply?: string;
};

/**
 * The register flow as a story: a character asks the question of the step in a speech bubble, and the field below is the
 * answer. Flat, like the rest of the app: a thin edge and no shadow.
 */
export const StoryBubble = memo(({ line, reply, character = 'cat' }: StoryBubbleProps) => {
  return (
  <View style={styles.wrap}>
    {reply ? (
      <Animated.View key={reply} entering={FadeIn.duration(250)} style={styles.replyRow}>
        <View style={styles.reply}>
          <Text type="l1" weight="medium" color={theme.pallate.neutral['01']} numberOfLines={1}>
            {reply}
          </Text>
        </View>
      </Animated.View>
    ) : null}
    <View style={styles.row}>
      <Animated.View key={character} entering={FadeIn.duration(300)}>
        <Image source={PICTURES[character]} style={SIZES[character]} resizeMode="contain" />
      </Animated.View>
      <Animated.View key={line} entering={FadeInDown.duration(350).delay(reply ? 250 : 0)} style={styles.bubble}>
        <View style={styles.tail} />
        <Text type="b2" weight="medium" color={theme.pallate.neutral['05']}>
          {line}
        </Text>
      </Animated.View>
    </View>
  </View>
  );
});

StoryBubble.displayName = 'StoryBubble';

const styles = StyleSheet.create({
  wrap: {
    // Between the person's bubble and the character's row: close, so the two read as one exchange.
    gap: theme.spacing.small,
    // Close under the dots (their own padding is already room), and a little more before the field.
    marginTop: 0,
    marginBottom: theme.spacing.extraLarge,
  },
  replyRow: {
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.large,
  },
  // The person's own words, on the other side: their answer so far, in the app's blue, flat.
  reply: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: 18,
    borderBottomRightRadius: 6,
    borderCurve: 'continuous',
    backgroundColor: theme.pallate.primary['03'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.standard,
    paddingHorizontal: theme.spacing.large,
  },
  bubble: {
    flex: 1,
    padding: theme.spacing.standard,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: theme.pallate.neutral['03'],
    backgroundColor: theme.pallate.neutral['02'],
  },
  // A square turned a quarter, half of it under the bubble's edge, pointing at the character.
  tail: {
    position: 'absolute',
    left: -TAIL_SIZE / 2,
    top: '50%',
    marginTop: -TAIL_SIZE / 2,
    width: TAIL_SIZE,
    height: TAIL_SIZE,
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.pallate.neutral['03'],
    backgroundColor: theme.pallate.neutral['02'],
  },
});
