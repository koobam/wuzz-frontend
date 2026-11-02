import React, {
  useMemo,
} from 'react';
import { useWindowDimensions, Text as RNText} from 'react-native';
import Reanimated from 'react-native-reanimated';
import {
  createPaddingStyle,
  createTextMarginStyle,
  TextStyleWeight,
  TextStyleType,
} from './text.style';
import { TextProps } from './text.types';
import { getResponsiveValue } from '@wuzz/native/components';

export const Text = React.memo((props: TextProps) => {
  const {
    style,
    text,
    fill,
    type = 'b1',
    weight = 'regular',
    fontFamily,
    color,
    align,
    margin,
    padding,
    textDecorationLine,
    children,
    inheritFromParent,
    italic,
    ...rest
  } = props;

  const { width } = useWindowDimensions();

  const textWeight =
    typeof inheritFromParent === 'boolean' || inheritFromParent?.weight
      ? undefined
      : weight;

  const textColor =
    typeof inheritFromParent === 'boolean' || inheritFromParent?.color
      ? undefined
      : color;

  const textItalic =
    typeof inheritFromParent === 'boolean' || inheritFromParent?.italic
      ? undefined
      : italic;

  const resolvedType = useMemo(() => {
    if (typeof type === 'object') {
      return getResponsiveValue(type, width);
    }
    if (typeof inheritFromParent === 'boolean' || inheritFromParent?.type) {
      return undefined;
    }
    return type;
  }, [type, width, inheritFromParent]);

  const typeStyle = resolvedType ? TextStyleType[resolvedType] : undefined;
  const weightStyle = textWeight ? TextStyleWeight[textWeight] : undefined;
  const italicStyle = textItalic && textWeight
    ? TextStyleWeight[`${textWeight}Italic` as keyof typeof TextStyleWeight]
    : undefined;

  // Dynamic overrides
  const dynamicStyle = useMemo(
    () =>
      fontFamily || fill || textColor || align || textDecorationLine
        ? {
            ...(fontFamily && { fontFamily }),
            ...(fill && { flex: 1 as const }),
            color: textColor,
            textAlign: align,
            textDecorationLine,
          }
        : undefined,
    [fontFamily, fill, textColor, align, textDecorationLine],
  );

  const textMarginStyle = useMemo(() => createTextMarginStyle(margin), [margin]);
  const textPaddingStyle = useMemo(() => createPaddingStyle(padding), [padding]);

  return (
    <RNText
      accessibilityRole="text"
      style={[typeStyle, weightStyle, italicStyle, dynamicStyle, textMarginStyle?.margin, textPaddingStyle?.padding, style]}
      {...rest}
    >
      {text || children}
    </RNText>
  );
});

export const ReanimatedText = Reanimated.createAnimatedComponent(Text);
export default Text;

// ── Nitro-powered text components ─────────────────────────────────────────
export { SafeText } from './safe-text'
export { TruncatedText } from './truncated-text'
export { InkSafeText } from './ink-safe-text'
export { BalancedText } from './balanced-text'
export { PrettyText } from './pretty-text'
