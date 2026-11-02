import React from 'react';
import { theme, Text, Flex, Pressable } from '@components/atoms';
import { IconChevronDown } from 'tabler-icons-react-native';
import { FieldErrors } from 'react-hook-form';
import { RegisterFormData } from '../hooks';
import { VerificationMethod } from '../config';

// Module-level constants — created once, never re-allocated on re-render
const USERNAME_LEFT_ICON = (
  <Text type="b1" color={theme.pallate.neutral['05']} weight="medium">
    wuzz.app/
  </Text>
);

const PHONE_LEFT_ICON = (
  <Pressable items="center" justify="center" gap={theme.spacing.small}>
    <Flex borderRadius={10} width={20} height={20} backgroundColor={theme.pallate.neutral['05']} />
    <Text type="b2" color={theme.pallate.neutral['05']} weight="medium">+1</Text>
    <IconChevronDown size={14} color={theme.pallate.neutral['05']} />
  </Pressable>
);

interface GetFieldConfigParams {
  errors: FieldErrors<RegisterFormData>;
  verificationMethod: VerificationMethod;
}

export const getFieldConfig = ({
  errors,
  verificationMethod,
}: GetFieldConfigParams) => ({
  username: {
    placeholder: 'username',
    leftIcon: USERNAME_LEFT_ICON,
    // A step up from the other fields' 16: what the person types is their handle, the point of this step.
    inputStyle: { fontSize: 18 },
    autoCapitalize: 'none' as const,
    autoCorrect: false,
    error: errors.username?.message,
  },
  birthDate: {
    placeholder: 'Birth Date',
    type: 'date' as const,
    error: errors.birthDate?.message,
  },
  fullName: {
    placeholder: 'Full Name',
    autoCapitalize: 'words' as const,
    autoCorrect: false,
    error: errors.fullName?.message,
  },
  ...(verificationMethod === 'phone'
    ? {
        phone: {
          placeholder: 'e.g. 5551234567',
          autoCapitalize: 'none' as const,
          leftIcon: PHONE_LEFT_ICON,
          keyboardType: 'phone-pad' as const,
          error: errors.phone?.message,
        },
      }
    : {
        email: {
          placeholder: 'e.g. john@example.com',
          autoCapitalize: 'none' as const,
          autoCorrect: false,
          keyboardType: 'email-address' as const,
          error: errors.email?.message,
        },
      }),
});
