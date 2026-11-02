import React, { memo, useRef, useEffect, useCallback, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { VStack, Text, theme, Input, DateInput, Button, Box, HStack } from '@components/atoms';
import { Dimensions, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { RegisterFormData } from '../../hooks';
import { getFieldConfig } from '../../helpers';
import type { StepFormProps } from './step-form.types';
import { Shimmer } from '@components/atoms/shimmer';
import { useUsernameSuggestions } from '@hooks/apis/username';
import { ActivityIndicator } from 'react-native';
import { useDebounce } from '@hooks/utils/useDebounce';
import { TickCircle, CloseCircle, Warning2 } from 'iconsax-react-native';
import { useTranslation } from 'react-i18next';

type UsernameInputProps = React.ComponentProps<typeof Input> & {
  value: string;
  isUsernameAvailable?: boolean;
  isUsernameChecking?: boolean;
  /** The availability request failed: no answer from the server, so neither a tick nor a cross can be shown. */
  isUsernameCheckFailed?: boolean;
};

const UsernameInput = memo(({
  value,
  isUsernameAvailable,
  isUsernameChecking,
  isUsernameCheckFailed,
  ...props
}: UsernameInputProps) => {
  const rightIcon = (() => {
    if (!value || value.length < 3) return undefined;
    if (isUsernameChecking) return <ActivityIndicator size="small" color={theme.pallate.neutral['04']} />;
    if (isUsernameAvailable === true) return <TickCircle size={20} variant="Bold" color={theme.pallate.success['03']} />;
    if (isUsernameAvailable === false) return <CloseCircle size={20} variant="Bold" color={theme.pallate.danger['03']} />;
    if (isUsernameCheckFailed) return <Warning2 size={20} variant="Bold" color={theme.pallate.warning['03']} />;
    return undefined;
  })();

  return <Input value={value} rightIcon={rightIcon} {...props} />;
});

UsernameInput.displayName = 'UsernameInput';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SuggestionSeparator = () => <View style={{ width: theme.spacing.tiny }} />;

// Separate component so hooks are called at top level
const UsernameSuggestions = memo(({
  control,
  onSelect,
}: {
  control: StepFormProps['control'];
  onSelect: (username: string) => void;
}) => {
  const fullName = (useWatch({ control, name: 'fullName' }) as string) ?? '';
  const username = (useWatch({ control, name: 'username' }) as string) ?? '';
  const birthDate = useWatch({ control, name: 'birthDate' }) as string | null;
  const debouncedUsername = useDebounce(username, 400);

  const { data: suggestions = [], isLoading } = useUsernameSuggestions({
    fullName,
    username: debouncedUsername,
    birthDate,
  });


  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Button
        variant="default"
        size="sm"
        rounded
        onPress={() => onSelect(item)}
        style={styles.chip}
      >
        <Text type="l1" color={theme.pallate.neutral['04']}>
          @{item}
        </Text>
      </Button>
    ),
    [onSelect],
  );

  if (isLoading) return (
    <HStack gap={theme.spacing.small} padding={{ paddingHorizontal: theme.spacing.large }}>
      <Shimmer width={80} height={36} borderRadius={999} />
      <Shimmer width={100} height={36} borderRadius={999} />
      <Shimmer width={70} height={36} borderRadius={999} />
    </HStack>
  );

  if (suggestions.length === 0) return null;

  return (
    <FlashList
      data={suggestions}
      extraData={suggestions}
      contentContainerStyle={styles.suggestionsContainer}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={SuggestionSeparator}
    />
  );
});

UsernameSuggestions.displayName = 'UsernameSuggestions';

export const StepForm = memo(
  ({
    item,
    control,
    errors,
    isLoading,
    isUsernameAvailable,
    isCheckingUsername,
    isUsernameCheckFailed,
    verificationMethod,
    isActive,
    dateInputRef,
    hideTitle,
  }: StepFormProps) => {
    const { t } = useTranslation('register');
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
      if (isActive && inputRef.current) {
        inputRef.current?.focus();
      }
    }, [isActive]);

    const fieldConfigs = useMemo(
      () => getFieldConfig({ errors, verificationMethod }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [errors.username?.message, errors.fullName?.message, errors.birthDate?.message, errors.phone?.message, errors.email?.message, verificationMethod],
    );
    const fieldConfig = fieldConfigs[item.id as keyof typeof fieldConfigs] as
      | Record<string, unknown>
      | undefined;

    if (!fieldConfig) return null;

    return (
      <VStack
        style={{
          width: SCREEN_WIDTH,
          paddingBottom: theme.spacing.large,
        }}
        gap={theme.spacing.large}
      >
        <VStack padding={{
          paddingHorizontal: theme.spacing.large,
        }} gap={theme.spacing.tiny}>
          {hideTitle ? null : (
            <Text type="s1" weight="medium" color={theme.pallate.neutral['05']}>
              {item.title}
            </Text>
          )}
          <Text type="l1" color={theme.pallate.neutral['04']}>
            {item.subtitle}
          </Text>
        </VStack>

        <Controller
          control={control}
          name={item.id as keyof RegisterFormData}
          defaultValue=""
          render={({ field: { onChange, onBlur, value }, fieldState }) => {
            const errorMessage: string | undefined = (() => {
              if (item.id === 'confirmPassword') {
                const errorFn = fieldConfig.error as
                  | ((value: string) => string | undefined)
                  | string
                  | undefined;
                const customError =
                  typeof errorFn === 'function'
                    ? errorFn((value ?? '') as string)
                    : errorFn;
                return fieldState.error?.message ?? customError;
              }
              // A username the server could not check says so, in place of nothing at all.
              if (item.id === 'username' && isUsernameCheckFailed && !isCheckingUsername) {
                return t('username.checkFailed');
              }
              if (item.id === 'username' && isUsernameAvailable === false && !isCheckingUsername) {
                return fieldState.error?.message ?? t('username.taken');
              }
              return fieldState.error?.message;
            })();

            const { ...restFieldConfig } = fieldConfig;

            if (item.id === 'birthDate') {
              const strValue = value as string | undefined;
              const dateValue =
                strValue && strValue.length === 10
                  ? new Date(strValue + 'T00:00:00')
                  : null;
              return (
                <DateInput
                  ref={dateInputRef}
                  defaultOpen
                  value={dateValue}
                  onChange={(date: Date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    onChange(`${y}-${m}-${d}`);
                  }}
                  error={errorMessage}
                  disabled={isLoading}
                  rounded
                  containerStyle={{
                    paddingHorizontal: 20
                  }}
                  spacing="none"
                  variant="filled"
                  size="md"
                />
              );
            }

            const InputComponent = item.id === 'username' ? UsernameInput : Input;
            const shouldShowUsernameSuggestions =
              item.id === 'username'
              && ((value ?? '') as string).length >= 2
              && !isCheckingUsername
              && isUsernameAvailable === false;

            return (
              <Box>
                  <InputComponent
                    ref={inputRef}
                    value={(value ?? '') as string}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    rounded
                    spacing="none"
                    editable={!isLoading}
                    variant="filled"
                    size="md"
                    containerStyle={{
                      paddingHorizontal: 20,
                      paddingBottom: 40,
                    }}
                    isUsernameAvailable={item.id === 'username' ? isUsernameAvailable : undefined}
                    isUsernameChecking={item.id === 'username' ? isCheckingUsername : undefined}
                    isUsernameCheckFailed={item.id === 'username' ? isUsernameCheckFailed : undefined}
                    {...(restFieldConfig as object)}
                    error={errorMessage}
                  />
                {shouldShowUsernameSuggestions && (
                  <Box position={{ bottom: -10 }}>
                    <UsernameSuggestions
                      control={control}
                      onSelect={onChange}
                    />
                  </Box>
                )}
              </Box>
            );
          }}
        />
      </VStack>
    );
  },
);

StepForm.displayName = 'StepForm';

const styles = StyleSheet.create({
  suggestionsContainer: {
    paddingHorizontal: theme.spacing.large,
  },
  chip: {
    flexShrink: 1,
  },
  separator: {
    width: theme.spacing.tiny,
  },
});
