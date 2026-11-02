import React, { useCallback, useContext, useMemo } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedStack } from '@wuzz/native/components';
import { ScrollStateContext } from '@services/contexts/scroll/scroll.context';
import { GesturePressableProps } from './gesture-pressable.types';

export const GesturePressable: React.FC<GesturePressableProps> = React.memo(
  props => {
    const {
      shrink = true,
      opacity = true,
      containerStyle,
      style,
      ref,
      onPress,
      onLongPress,
      onDoubleTap,
      blocksExternalGesture = false,
      requireExternalGestureToFail = false,
      simultaneousWithExternalGesture = false,
      children,
      ...rest
    } = props;

    const scrollRefContext = useContext(ScrollStateContext);
    const scale = useSharedValue(1);
    const opacityValue = useSharedValue(1);

    const handlePress = useCallback(() => {
      if (onPress !== undefined) {
        onPress();
      }
    }, [onPress]);

    const handleLongPress = useCallback(() => {
      if (onLongPress !== undefined) {
        onLongPress();
      }
    }, [onLongPress]);

    const handleDoubleTap = useCallback(() => {
      if (onDoubleTap !== undefined) {
        onDoubleTap();
      }
    }, [onDoubleTap]);
    
    // Double tap gesture (created first so single tap can reference it)
    const doubleTapGesture = useMemo(() => {
      if (onDoubleTap === undefined) return null;

      let gesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
          'worklet';
          runOnJS(handleDoubleTap)();
        });

      // Configure gesture relationships with scroll gesture handler
      if (blocksExternalGesture) {
        gesture = gesture.blocksExternalGesture();
      }
      if (
        requireExternalGestureToFail &&
        scrollRefContext?.scrollGestureHandler
      ) {
        gesture = gesture.requireExternalGestureToFail(
          scrollRefContext.scrollGestureHandler,
        );
      }
      if (
        simultaneousWithExternalGesture &&
        scrollRefContext?.scrollGestureHandler
      ) {
        gesture = gesture.simultaneousWithExternalGesture(
          scrollRefContext.scrollGestureHandler,
        );
      }

      return gesture;
    }, [
      onDoubleTap,
      blocksExternalGesture,
      requireExternalGestureToFail,
      simultaneousWithExternalGesture,
      scrollRefContext?.scrollGestureHandler,
      handleDoubleTap,
    ]);

    // Single tap gesture (created after double tap so it can reference it)
    const singleTapGesture = useMemo(() => {
      // Capture shrink and opacity values as constants for worklet context
      const shouldShrink = shrink;
      const shouldOpacity = opacity;

      let gesture = Gesture.Tap()
        .numberOfTaps(1)
        .onBegin(() => {
          'worklet';
          if (shouldShrink) {
            scale.value = withTiming(0.98, { duration: 80 });
          }
          if (shouldOpacity) {
            opacityValue.value = withTiming(0.6, { duration: 80 });
          }
        })
        .onEnd(() => {
          'worklet';
          if (onPress !== undefined) {
            runOnJS(handlePress)();
          }
          if (shouldShrink) {
            scale.value = withTiming(1, { duration: 80 });
          }
          if (shouldOpacity) {
            opacityValue.value = withTiming(1, { duration: 80 });
          }
        })
        .onFinalize(() => {
          'worklet';
          if (shouldShrink) {
            scale.value = withTiming(1, { duration: 80 });
          }
          if (shouldOpacity) {
            opacityValue.value = withTiming(1, { duration: 80 });
          }
        })
        .onTouchesCancelled(() => {
          'worklet';
          if (shouldShrink) {
            scale.value = withTiming(1, { duration: 80 });
          }
          if (shouldOpacity) {
            opacityValue.value = withTiming(1, { duration: 80 });
          }
        });

      // Make single tap wait for double tap to fail (if double tap is defined)
      if (onDoubleTap !== undefined && doubleTapGesture) {
        gesture = gesture.requireExternalGestureToFail(doubleTapGesture);
      }

      // Configure gesture relationships with scroll gesture handler
      if (blocksExternalGesture) {
        gesture = gesture.blocksExternalGesture();
      }
      if (
        requireExternalGestureToFail &&
        scrollRefContext?.scrollGestureHandler
      ) {
        gesture = gesture.requireExternalGestureToFail(
          scrollRefContext.scrollGestureHandler,
        );
      }
      if (
        simultaneousWithExternalGesture &&
        scrollRefContext?.scrollGestureHandler
      ) {
        gesture = gesture.simultaneousWithExternalGesture(
          scrollRefContext.scrollGestureHandler,
        );
      }

      return gesture;
    }, [onPress, shrink, opacity, onDoubleTap, doubleTapGesture, blocksExternalGesture, requireExternalGestureToFail, scrollRefContext?.scrollGestureHandler, simultaneousWithExternalGesture, handlePress, scale, opacityValue]);

    // Long press gesture
    const longPressGesture = useMemo(() => {
      // Capture shrink and opacity values as constants for worklet context
      const shouldShrink = shrink;
      const shouldOpacity = opacity;

      let gesture = Gesture.LongPress()
        .minDuration(500)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          'worklet';
          if (shouldShrink) { scale.value = withTiming(0.98, { duration: 80 }); }
          if (shouldOpacity) { opacityValue.value = withTiming(0.6, { duration: 80 }); }
        })
        .onStart(() => {
          'worklet';
          if (onLongPress !== undefined) { runOnJS(handleLongPress)(); }
        })
        .onEnd(() => {
          'worklet';
          if (shouldShrink) { scale.value = withTiming(1, { duration: 80 }); }
          if (shouldOpacity) { opacityValue.value = withTiming(1, { duration: 80 }); }
        })
        .onTouchesCancelled(() => {
          'worklet';
          if (shouldShrink) { scale.value = withTiming(1, { duration: 80 }); }
          if (shouldOpacity) { opacityValue.value = withTiming(1, { duration: 80 }); }
        })
        .onFinalize(() => {
          'worklet';
          if (shouldShrink) { scale.value = withTiming(1, { duration: 80 }); }
          if (shouldOpacity) { opacityValue.value = withTiming(1, { duration: 80 }); }
        });

      // Configure gesture relationships with scroll gesture handler
      if (blocksExternalGesture) {
        gesture = gesture.blocksExternalGesture();
      }
      if (
        requireExternalGestureToFail &&
        scrollRefContext?.scrollGestureHandler
      ) {
        gesture = gesture.requireExternalGestureToFail(
          scrollRefContext.scrollGestureHandler,
        );
      }
      if (
        simultaneousWithExternalGesture &&
        scrollRefContext?.scrollGestureHandler
      ) {
        gesture = gesture.simultaneousWithExternalGesture(
          scrollRefContext.scrollGestureHandler,
        );
      }

      return gesture;
    }, [onLongPress, blocksExternalGesture, requireExternalGestureToFail, scrollRefContext?.scrollGestureHandler, simultaneousWithExternalGesture, shrink, opacity, scale, opacityValue, handleLongPress]);

    // Combine gestures - use Exclusive for proper gesture priority
    // Long press and double tap should prevent single tap from firing
    const combinedGesture = useMemo(() => {
      const gestures: any[] = [];

      // Order matters in Exclusive: first gesture that can handle the touch wins
      if (longPressGesture) gestures.push(longPressGesture);
      if (doubleTapGesture) gestures.push(doubleTapGesture);
      if (singleTapGesture) gestures.push(singleTapGesture);

      if (gestures.length === 0) return null;
      if (gestures.length === 1) return gestures[0];

      // Use Exclusive so gestures are evaluated in order and first one wins
      return Gesture.Exclusive(...gestures);
    }, [doubleTapGesture, longPressGesture, singleTapGesture]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacityValue.value,
        transform: [{ scale: scale.value }],
      };
    });

    if (!combinedGesture) {
      // If no gesture handlers are provided, just render the stack without gesture detection
      return (
        <AnimatedStack
          ref={ref}
          direction="row"
          style={[containerStyle, style]}
          {...rest}
        >
          {children}
        </AnimatedStack>
      );
    }

    return (
      <GestureDetector gesture={combinedGesture}>
        <AnimatedStack
          ref={ref}
          direction="row"
          style={[containerStyle, style, animatedStyle]}
          {...rest}
        >
          {children}
        </AnimatedStack>
      </GestureDetector>
    );
  },
);

GesturePressable.displayName = 'GesturePressable';

export default GesturePressable;
