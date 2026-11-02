import React, { useMemo } from 'react';
import { Dimensions, Pressable as RNPressable, PressableProps as RNPressableProps, View, ViewStyle } from 'react-native';
import Reanimated from 'react-native-reanimated';
import {
  StackProps,
  createPaddingStyle,
  createMarginStyle,
  createBorderRadiusStyle,
  createBorderWidthStyle,
  createBorderColorStyle,
  createPositionStyle,
  getResponsiveValue,
  PaddingType,
  MarginType,
  PositionType,
  BorderWidthType,
  BorderColorType,
  BorderRadiusType,
} from '@wuzz/native/components';

type PressableContainer = Omit<StackProps, 'as'> & RNPressableProps;

export interface PressableProps extends PressableContainer {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  androidRipple?: RNPressableProps['android_ripple'];
  shrink?: boolean;
  opacity?: number;
  /** Tilt in degrees, merged into the same transform as the press-scale. */
  rotation?: number;
  containerStyle?: ViewStyle;
}

export const Pressable: React.FC<PressableProps> = React.memo(({
  androidRipple,
  shrink = true,
  opacity: opacityProp = true as any,
  containerStyle,
  style,
  ref,
  fill,
  wrap,
  inline,
  direction,
  justify,
  self,
  items,
  content,
  zIndex,
  gap,
  height,
  width,
  padding,
  margin,
  position,
  backgroundColor,
  borderWidth,
  borderColor,
  borderRadius,
  rotation,
  children,
  ...rest
}) => {
  const pad    = typeof padding     === 'object' ? padding     as PaddingType      : undefined;
  const mar    = typeof margin      === 'object' ? margin      as MarginType       : undefined;
  const pos    = typeof position    === 'object' ? position    as PositionType     : undefined;
  const bw     = typeof borderWidth === 'object' ? borderWidth as BorderWidthType  : undefined;
  const bc     = typeof borderColor === 'object' ? borderColor as BorderColorType  : undefined;
  const br     = typeof borderRadius=== 'object' ? borderRadius as BorderRadiusType: undefined;
  const padNum = typeof padding     === 'number' ? padding     : undefined;
  const marNum = typeof margin      === 'number' ? margin      : undefined;
  const posStr = typeof position    === 'string' ? position    : undefined;
  const bwNum  = typeof borderWidth === 'number' ? borderWidth : undefined;
  const bcStr  = typeof borderColor === 'string' ? borderColor : undefined;
  const brNum  = typeof borderRadius=== 'number' ? borderRadius: undefined;

  const layoutStyle = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    return {
      flexDirection: inline ? 'row' : direction ?? 'row',
      flex: fill ? 1 : undefined,
      flexWrap: wrap ? 'wrap' : undefined,
      alignItems: items,
      justifyContent: justify,
      alignSelf: self,
      alignContent: content,
      zIndex,
      gap,
      width: (typeof width === 'object' ? getResponsiveValue(width, screenWidth) : width) as number | string | undefined,
      height: (typeof height === 'object' ? getResponsiveValue(height, screenWidth) : height) as number | string | undefined,
      backgroundColor,
      ...(padding != null ? createPaddingStyle(padding) : undefined),
      ...(margin != null ? createMarginStyle(margin) : undefined),
      ...(position != null ? createPositionStyle(position as any) : undefined),
      ...(borderWidth != null ? createBorderWidthStyle(borderWidth) : undefined),
      ...(borderColor != null ? createBorderColorStyle(borderColor as any) : undefined),
      ...(borderRadius != null ? createBorderRadiusStyle(borderRadius) : undefined),
    } as ViewStyle;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fill, wrap, inline, direction, items, justify, self, content, zIndex, gap,
    width, height, backgroundColor,
    padNum, pad?.paddingTop, pad?.paddingBottom, pad?.paddingLeft, pad?.paddingRight,
    pad?.paddingHorizontal, pad?.paddingVertical,
    marNum, mar?.marginTop, mar?.marginBottom, mar?.marginLeft, mar?.marginRight,
    mar?.marginHorizontal, mar?.marginVertical,
    posStr, pos?.top, pos?.bottom, pos?.left, pos?.right, pos?.set,
    bwNum, bw?.borderTopWidth, bw?.borderBottomWidth, bw?.borderLeftWidth, bw?.borderRightWidth,
    bcStr, bc?.borderTopColor, bc?.borderBottomColor, bc?.borderLeftColor, bc?.borderRightColor,
    brNum, br?.borderTopLeftRadius, br?.borderTopRightRadius,
    br?.borderBottomLeftRadius, br?.borderBottomRightRadius,
  ]);

  return (
    <RNPressable
      ref={ref}
      android_ripple={androidRipple}
      style={({ pressed }) => [
        layoutStyle,
        containerStyle,
        {
          opacity: pressed && opacityProp ? 0.6 : 1,
          transform: [
            { scale: pressed && shrink ? 0.98 : 1 },
            ...(rotation != null ? [{ rotate: `${rotation}deg` }] : []),
          ],
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </RNPressable>
  );
});

Pressable.displayName = 'Pressable';
export default Pressable;

export const PressableAnimated = Reanimated.createAnimatedComponent(Pressable);
