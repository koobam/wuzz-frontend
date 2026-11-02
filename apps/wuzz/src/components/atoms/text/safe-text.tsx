import React, { useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import { prepare } from '../../../core/text/prepare'
import { layoutWithLines } from '../../../core/text/layout'
import TextStyle, { createTextMarginStyle, createPaddingStyle } from './text.style'
import type { TextProps } from './text.types'
import { getResponsiveValue } from '@wuzz/native/components'
import { useWindowDimensions } from 'react-native'

const TYPE_SIZE: Record<string, number> = {
  h1: 36, h2: 32, h3: 28,
  s1: 24, s2: 20, s3: 18,
  b1: 16, b2: 14,
  l1: 12, l2: 10, l3: 9,
}

/**
 * Renders each line as its own <Text> node.
 * Fixes 23+ Android text rendering bugs (descender clipping, italic overshoot,
 * numberOfLines edge cases, cut-off CJK clusters).
 *
 * Requires `maxWidth` prop — pass the container width or useWindowDimensions().width.
 */
export const SafeText = React.memo(
  (props: TextProps & { maxWidth: number }) => {
    const {
      text,
      children,
      type = 'b1',
      weight = 'regular',
      fontFamily,
      color,
      align,
      margin,
      padding,
      italic,
      fill,
      textDecorationLine,
      style,
      maxWidth,
      inheritFromParent,
      ...rest
    } = props

    const { width } = useWindowDimensions()
    const resolvedType = useMemo(
      () =>
        typeof type === 'object'
          ? getResponsiveValue(type, width)
          : typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.type
          ? undefined
          : type,
      [type, width, inheritFromParent],
    )

    const fontSize = resolvedType ? (TYPE_SIZE[resolvedType] ?? 16) : 16
    const content: string | undefined =
      text ?? (typeof children === 'string' ? children : undefined)

    const lines = useMemo(() => {
      if (!content || maxWidth <= 0) return []
      try {
        return layoutWithLines(prepare(content, weight, fontSize, !!italic, fontFamily), maxWidth)
      } catch {
        return [{ text: content, width: maxWidth, segmentStart: 0, segmentEnd: 0 }]
      }
    }, [content, weight, fontSize, italic, fontFamily, maxWidth])

    const textWeight =
      typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.weight
        ? undefined
        : weight

    const baseStyle = TextStyle({
      type: resolvedType,
      weight: textWeight,
      fontFamily,
      color: typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.color
        ? undefined
        : color,
      fill,
      italic: typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.italic
        ? undefined
        : italic,
      textDecorationLine,
      align,
    }).text

    const marginStyle  = createTextMarginStyle(margin)?.margin
    const paddingStyle = createPaddingStyle(padding)?.padding

    return (
      <View style={[fill ? { flex: 1 } : undefined, marginStyle, paddingStyle]}>
        {lines.map((line, i) => (
          <RNText
            key={i}
            accessibilityRole={i === 0 ? 'text' : undefined}
            style={[baseStyle, style]}
            {...(i === 0 ? rest : {})}
          >
            {line.text}
          </RNText>
        ))}
        {/* Render non-string children normally */}
        {!content && children}
      </View>
    )
  },
)
