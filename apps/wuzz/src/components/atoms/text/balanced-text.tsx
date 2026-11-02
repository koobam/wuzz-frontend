import React, { useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import { prepare } from '../../../core/text/prepare'
import { layout, layoutWithLines } from '../../../core/text/layout'
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
 * Balanced line-breaking — eliminates "lonely last word" syndrome.
 * Finds the narrowest maxWidth that produces the same line count as the full
 * container width, then renders at that narrower width for balanced wrapping.
 *
 * Requires `maxWidth` prop.
 */
export const BalancedText = React.memo(
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

    const { lines, balancedWidth } = useMemo(() => {
      if (!content || maxWidth <= 0) return { lines: [], balancedWidth: maxWidth }

      try {
        const prepared = prepare(content, weight, fontSize, !!italic, fontFamily)
        const targetCount = layout(prepared, maxWidth).lineCount
        if (targetCount <= 1) {
          return {
            lines: layoutWithLines(prepared, maxWidth),
            balancedWidth: maxWidth,
          }
        }

        // Binary search for narrowest width giving same line count
        let lo = Math.floor(maxWidth / targetCount)
        let hi = maxWidth
        while (lo < hi - 1) {
          const mid = Math.floor((lo + hi) / 2)
          layout(prepared, mid).lineCount <= targetCount ? (hi = mid) : (lo = mid)
        }

        return {
          lines: layoutWithLines(prepared, hi),
          balancedWidth: hi,
        }
      } catch {
        return { lines: [{ text: content, width: maxWidth, segmentStart: 0, segmentEnd: 0 }], balancedWidth: maxWidth }
      }
    }, [content, weight, fontSize, italic, fontFamily, maxWidth])

    const baseStyle = TextStyle({
      type: resolvedType,
      weight: typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.weight ? undefined : weight,
      fontFamily,
      color: typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.color ? undefined : color,
      fill,
      italic: typeof inheritFromParent === 'boolean' || (inheritFromParent as any)?.italic ? undefined : italic,
      textDecorationLine,
      align,
    }).text

    const marginStyle  = createTextMarginStyle(margin)?.margin
    const paddingStyle = createPaddingStyle(padding)?.padding

    return (
      <View style={[fill ? { flex: 1 } : undefined, { maxWidth: balancedWidth }, marginStyle, paddingStyle]}>
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
        {!content && children}
      </View>
    )
  },
)
