import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../text';
import { Input, InputProps } from './index';
import theme from '../theme';
import { DateWheelPicker } from './DateWheelPicker';

const DEFAULT_DATE = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 20);
  return d;
})();

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export interface DateInputRef {
  close: () => void;
}

export interface DateInputProps extends Omit<InputProps, 'value' | 'onChangeText' | 'onChange' | 'type'> {
  value?: Date | null;
  onChange?: (date: Date) => void;
  placeholder?: string;
  /**
   * Opens on the wheel picker straight away, with no field to tap first. The date it shows counts as chosen: when there is
   * no value yet, it is reported through `onChange` so the form holds what the picker shows.
   */
  defaultOpen?: boolean;
}

export const DateInput = forwardRef<DateInputRef, DateInputProps>(({
  value,
  onChange,
  placeholder = 'Pilih tanggal lahir',
  label,
  error,
  disabled,
  defaultOpen = false,
  ...rest
}, ref) => {
  const [isEditing, setIsEditing] = useState(defaultOpen);
  const [internalDate, setInternalDate] = useState<Date>(value ?? DEFAULT_DATE);

  useEffect(() => {
    if (defaultOpen && !value) onChange?.(internalDate);
    // Once, on opening: after that the picker's own changes are reported.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    // With `defaultOpen` the picker is the only face this has: there is no field to fall back to.
    close: () => {
      if (!defaultOpen) setIsEditing(false);
    },
  }));

  const handlePress = useCallback(() => {
    if (!disabled) setIsEditing(true);
  }, [disabled]);

  const handleChange = useCallback((date: Date) => {
    setInternalDate(date);
    onChange?.(date);
  }, [onChange]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setInternalDate(value ?? DEFAULT_DATE);
  }, [value]);

  if (isEditing || defaultOpen) {
    return (
      <View>
        <DateWheelPicker
          value={internalDate}
          onChange={handleChange}
        />
        {defaultOpen && error ? (
          <Text type="l1" color={theme.pallate.danger['03']} style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable onPress={handlePress}>
      <View pointerEvents="none">
        <Input
          label={label}
          value={value ? formatDate(value) : ''}
          placeholder={placeholder}
          editable={false}
          error={error}
          disabled={disabled}
          {...rest}
        />
      </View>
    </Pressable>
  );
});

DateInput.displayName = 'DateInput';

const styles = StyleSheet.create({
  error: {
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.spacing.small,
    paddingBottom: theme.spacing.small,
  },
});

export default DateInput;
