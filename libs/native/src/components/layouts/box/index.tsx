import React, { useMemo } from 'react';

import { View, ViewProps, ViewStyle } from 'react-native';

import {
  BorderColorType,
  BorderRadiusType,
  BorderWidthType,
  MarginType,
  PaddingType,
  PositionType,
  createMarginStyle,
  createBorderColorStyle,
  createBorderRadiusStyle,
  createBorderWidthStyle,
  createPaddingStyle,
  createPositionStyle,
  getResponsiveValue,
  useResponsiveWidth,
  ResponsiveValue,
} from '../helper';

import Reanimated from 'react-native-reanimated';

export interface BoxProps extends ViewProps {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  as?: React.ReactElement;
  gap?: number;
  height?: number | string | ResponsiveValue<number | string>;
  width?: number | string | ResponsiveValue<number | string>;
  padding?: PaddingType | number;
  zIndex?: number;
  margin?: MarginType | number;
  position?: PositionType | string;
  backgroundColor?: ViewStyle['backgroundColor'];
  borderWidth?: BorderWidthType | number;
  borderColor?: BorderColorType | string;
  borderRadius?: BorderRadiusType | number;
  opacity?: number;
  // Flex used to be a component of its own that only turned these props into
  // a style and rendered Box. They live here now so Flex and the stacks can
  // call BoxBase directly instead of adding a component per layout node.
  fill?: boolean;
  wrap?: boolean;
  inline?: boolean;
  content?: ViewStyle['alignContent'];
  self?: ViewStyle['alignSelf'];
  items?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  direction?: ViewStyle['flexDirection'];
}

/**
 * Box is component serves as a wrapper component for most of the styling properties.
 * Also, for references check it out {@link https://github.com/yamankatby/react-native-flex-layout/blob/main/src/Box.tsx}
 *
 * BoxBase is the plain implementation, exported so Flex, Stack, VStack and
 * HStack can call it inline rather than rendering another component that
 * renders this one: a VStack used to be VStack → Stack → Flex → Box for a
 * single native view, now it is one component and one view.
 */
export const BoxBase = (props: BoxProps) => {
  const {
    as,
    style,
    fill,
    wrap,
    inline,
    content,
    self,
    items,
    justify,
    direction,
    position,
    width,
    height,
    padding,
    margin,
    borderWidth,
    borderColor,
    borderRadius,
    backgroundColor,
    zIndex,
    ref,
    gap,
    ...rest
  } = props;

  // Only subscribe to window size when width/height is actually responsive.
  const screenWidth = useResponsiveWidth(
    typeof width === 'object' || typeof height === 'object',
  );

  const resolvedWidth = useMemo(() => {
    if (typeof width === 'object') {
      return getResponsiveValue(width, screenWidth);
    }
    return width;
  }, [width, screenWidth]);

  const resolvedHeight = useMemo(() => {
    if (typeof height === 'object') {
      return getResponsiveValue(height, screenWidth);
    }
    return height;
  }, [height, screenWidth]);

  const boxStyle = useMemo(() => {
    let paddingStyle,
      marginStyle,
      positionStyle,
      borderWidthStyle,
      borderColorStyle,
      borderRadiusStyle;

    if (padding) {
      paddingStyle = createPaddingStyle(padding);
    }

    if (margin) {
      marginStyle = createMarginStyle(margin);
    }

    if (position) {
      positionStyle = createPositionStyle(position);
    }

    if (borderWidth) {
      borderWidthStyle = createBorderWidthStyle(borderWidth);
    }

    if (borderColor) {
      borderColorStyle = createBorderColorStyle(borderColor);
    }

    if (borderRadius) {
      borderRadiusStyle = createBorderRadiusStyle(borderRadius);
    }

    return {
      flex: fill ? 1 : undefined,
      flexWrap: wrap ? 'wrap' : undefined,
      flexDirection: inline ? 'row' : direction,
      alignContent: content,
      alignSelf: self,
      alignItems: items,
      justifyContent: justify,
      ...positionStyle,
      ...paddingStyle,
      ...marginStyle,
      ...borderWidthStyle,
      ...borderColorStyle,
      ...borderRadiusStyle,
      zIndex,
      width: resolvedWidth,
      height: resolvedHeight,
      gap,
      backgroundColor,
      borderCurve: borderRadius ? ('continuous' as const) : undefined,
    } as ViewStyle;
  }, [
    fill,
    wrap,
    inline,
    direction,
    content,
    self,
    items,
    justify,
    resolvedWidth,
    resolvedHeight,
    padding,
    margin,
    position,
    borderWidth,
    borderColor,
    borderRadius,
    zIndex,
    backgroundColor,
    gap,
  ]);

  if (as) {
    // `as` is possibly a React.ReactElement, but its type is unknown.
    // To safely access its props, we need to assert its type.
    if (!React.isValidElement(as)) {
      return null;
    }
    const element = as as React.ReactElement<any>;
    const asProps = (element.props || {}) as any;
    if (typeof asProps.style === 'function') {
      return React.cloneElement(element, {
        ref,
        style: (state: any) => {
          const functionStyleArray = [boxStyle, asProps.style(state)];
          if (style) {
            functionStyleArray.push(style);
          }
          return functionStyleArray;
        },
        ...rest,
      } as any);
    }

    const styleArray: ViewStyle[] = [boxStyle];
    if (style) {
      styleArray.push(style as ViewStyle);
    }
    if (asProps.style) {
      styleArray.push(asProps.style as ViewStyle);
    }

    return React.cloneElement(
      element,
      {
        ref,
        style: styleArray,
        ...rest,
      } as any
    );
  }
  return (
    <View
      ref={ref}
      style={[boxStyle as ViewStyle, style]}
      {...rest}
    />
  );
};

export const Box = React.memo(BoxBase);
Box.displayName = 'Box';

export const BoxAnimated = Reanimated.createAnimatedComponent(Box);
export default Box;
