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
 * "Pretty" layout: balanced + justified word spacing.
 * Each line (except the last) has letter-spacing adjusted so words span
 * the full container width, similar to CSS `text-wrap: pretty`.
 *
 * Requires `maxWidth` prop.
 */
export const PrettyText = React.memo(
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
        const prepared = prepare(content, weight, fontSize, !!italic, fontFamily)
        const all = layoutWithLines(prepared, maxWidth)
        return all.map((line, i) => {
          const isLast = i === all.length - 1
          if (isLast || line.width === 0) return { ...line, letterSpacing: 0 }

          // Distribute leftover space across characters via letterSpacing
          const gap = maxWidth - line.width
          const charCount = line.text.replace(/\s/g, '').length || 1
          return { ...line, letterSpacing: gap / charCount }
        })
      } catch {
        return [{ text: content, width: maxWidth, segmentStart: 0, segmentEnd: 0, letterSpacing: 0 }]
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
      <View style={[fill ? { flex: 1 } : undefined, marginStyle, paddingStyle]}>
        {lines.map((line, i) => (
          <RNText
            key={i}
            accessibilityRole={i === 0 ? 'text' : undefined}
            style={[baseStyle, { letterSpacing: line.letterSpacing }, style]}
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
