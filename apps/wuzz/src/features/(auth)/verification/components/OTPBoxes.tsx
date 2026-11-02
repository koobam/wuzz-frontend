import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text, theme } from '@components/atoms';

export const OTP_LENGTH = 6;

type OTPBoxesProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once the last digit is typed. */
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  /** Boxes show a dot instead of the digit, for a PIN. */
  secure?: boolean;
  /** Digits in the code. */
  length?: number;
};

/**
 * The code as a row of boxes, one digit each. One text field, invisible, takes the typing (so paste and the keyboard's own
 * one-time-code suggestion work); the boxes only show it, and a tap on any of them focuses the field.
 */
export const OTPBoxes = memo(({ value, onChange, onComplete, error, disabled, secure, length = OTP_LENGTH }: OTPBoxesProps) => {
  const input = useRef<{ focus: () => void }>(null);

  const handleChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, '').slice(0, length);
      onChange(digits);
      if (digits.length === length) onComplete?.(digits);
    },
    [onChange, onComplete, length],
  );

  // Focus when the sheet opens, once its animation is done.
  useEffect(() => {
    const timer = setTimeout(() => input.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const focused = Math.min(value.length, length - 1);

  return (
    <Pressable style={styles.row} onPress={() => input.current?.focus()} disabled={disabled}>
      {Array.from({ length }, (_, index) => {
        const digit = value[index];
        return (
          <View
            key={index}
            style={[
              styles.box,
              index === focused && styles.boxFocused,
              error && styles.boxError,
            ]}
          >
            <Text type="h2" weight="bold" color={theme.pallate.neutral['05']}>
              {digit ? (secure ? '•' : digit) : ''}
            </Text>
          </View>
        );
      })}
      <BottomSheetTextInput
        ref={input as never}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        editable={!disabled}
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
});

OTPBoxes.displayName = 'OTPBoxes';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing.small, justifyContent: 'center' },
  box: {
    flex: 1,
    maxWidth: 52,
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: theme.pallate.neutral['03'],
    backgroundColor: theme.pallate.neutral['02'],
  },
  boxFocused: { borderColor: theme.pallate.primary['03'], borderWidth: 2 },
  boxError: { borderColor: theme.pallate.danger['03'] },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
