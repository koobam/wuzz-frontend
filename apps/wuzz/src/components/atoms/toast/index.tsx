import React, { memo, useEffect, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Rect } from 'react-native-svg';
import { CloseCircle, InfoCircle, TickCircle } from 'iconsax-react-native';
import type { ToastConfig, ToastConfigParams } from 'react-native-toast-message';
import { Pressable } from '../pressable';
import { Text } from '../text';
import { theme } from '../theme';

/** How long a toast stays; the host (`<Toast visibilityTime>`) uses the same, so the border runs out as it leaves. */
export const TOAST_DURATION_MS = 4000;

const PILL_HEIGHT = 64;
const BORDER_WIDTH = 3;
const ICON_SIZE = 40;

type ToastKind = 'success' | 'error' | 'info';

/** Extra fields a caller may pass: `Toast.show({ type, text1, text2, props: { actionLabel, onAction } })`. */
type ToastExtra = { actionLabel?: string; onAction?: () => void };

const KINDS = {
  success: { color: theme.pallate.success['03'], Icon: TickCircle },
  error: { color: theme.pallate.danger['03'], Icon: CloseCircle },
  info: { color: theme.pallate.secondary['03'], Icon: InfoCircle },
} as const;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * A toast as a dark pill, like an iPhone's live activity: a round icon, the title and a line under it, an optional button on
 * the right, and a thin coloured border that runs out over the time the toast stays. Flat: no shadow.
 */
const ToastPill = memo(({ kind, text1, text2, props, hide }: ToastConfigParams<ToastExtra> & { kind: ToastKind }) => {
  const { color, Icon } = KINDS[kind];
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  // The border's length is the pill's outline: two straight sides and two half circles.
  const radius = PILL_HEIGHT / 2 - BORDER_WIDTH / 2;
  const perimeter = 2 * (width - PILL_HEIGHT) + Math.PI * (PILL_HEIGHT - BORDER_WIDTH);

  useEffect(() => {
    if (!width) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: TOAST_DURATION_MS, easing: Easing.linear });
  }, [width, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: perimeter * progress.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View style={styles.pill} onLayout={handleLayout}>
      {width ? (
        <Svg width={width} height={PILL_HEIGHT} style={StyleSheet.absoluteFill} pointerEvents="none">
          <AnimatedRect
            x={BORDER_WIDTH / 2}
            y={BORDER_WIDTH / 2}
            width={width - BORDER_WIDTH}
            height={PILL_HEIGHT - BORDER_WIDTH}
            rx={radius}
            ry={radius}
            fill="none"
            stroke={color}
            strokeWidth={BORDER_WIDTH}
            strokeLinecap="round"
            strokeDasharray={perimeter}
            animatedProps={animatedProps}
          />
        </Svg>
      ) : null}
      <View style={styles.icon}>
        <Icon size={ICON_SIZE - 8} variant="Bold" color={color} />
      </View>
      <View style={styles.texts}>
        <Text type="b2" weight="bold" color={theme.pallate.neutral['01']} numberOfLines={1}>
          {text1}
        </Text>
        {text2 ? (
          <Text type="l1" color={theme.pallate.neutral['04']} numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>
      {props?.actionLabel ? (
        <Pressable
          style={styles.action}
          onPress={() => {
            props.onAction?.();
            hide();
          }}
        >
          <Text type="l1" weight="bold" color={theme.pallate.neutral['01']}>
            {props.actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
});
ToastPill.displayName = 'ToastPill';

/** Pass to `<Toast config={toastConfig} />`. */
export const toastConfig: ToastConfig = {
  success: params => <ToastPill kind="success" {...params} />,
  error: params => <ToastPill kind="error" {...params} />,
  info: params => <ToastPill kind="info" {...params} />,
};

const styles = StyleSheet.create({
  pill: {
    minHeight: PILL_HEIGHT,
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.standard,
    paddingVertical: theme.spacing.small,
    paddingLeft: theme.spacing.small + BORDER_WIDTH,
    paddingRight: theme.spacing.large,
    borderRadius: PILL_HEIGHT / 2,
    borderCurve: 'continuous',
    backgroundColor: theme.pallate.neutral['05'],
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.pallate.neutral['01'],
  },
  texts: { flex: 1 },
  action: {
    paddingHorizontal: theme.spacing.standard,
    paddingVertical: theme.spacing.small,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
