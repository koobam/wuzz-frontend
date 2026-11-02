import React, { useMemo } from 'react'
import { Text as RNText } from 'react-native'
import { truncateText } from '../../../core/text/truncate'
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

type TruncateMode = 'tail' | 'head' | 'middle'

interface TruncatedTextProps extends Omit<TextProps, 'numberOfLines'> {
  maxWidth: number
  numberOfLines?: number
  truncateMode?: TruncateMode
  ellipsis?: string
}

/**
 * Avoids React Native's `numberOfLines` edge cases on Android.
 * Uses binary-search JS truncation against the Nitro native measurer.
 */
export const TruncatedText = React.memo((props: TruncatedTextProps) => {
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
    numberOfLines = 1,
    truncateMode = 'tail',
    ellipsis = '…',
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
  const rawText: string | undefined =
    text ?? (typeof children === 'string' ? children : undefined)

  const truncated = useMemo(() => {
    if (!rawText || maxWidth <= 0) return rawText ?? ''
    try {
      return truncateText(rawText, weight, fontSize, maxWidth, numberOfLines, truncateMode, ellipsis, !!italic, fontFamily)
    } catch {
      return rawText
    }
  }, [rawText, weight, fontSize, maxWidth, numberOfLines, truncateMode, ellipsis, italic, fontFamily])

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
    <RNText
      accessibilityRole="text"
      style={[baseStyle, marginStyle, paddingStyle, style]}
      {...rest}
    >
      {truncated}
      {!rawText && children}
    </RNText>
  )
})
