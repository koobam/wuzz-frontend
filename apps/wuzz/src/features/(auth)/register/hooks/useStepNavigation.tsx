import React, { useCallback, useRef, useState, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSharedValue } from 'react-native-reanimated';
import { Text, theme } from '@components/atoms';
import { RootStackParamList } from '@navigation/root/root.types';
import { RegisterFormData } from './useRegisterForm';
import { RegisterConfig } from '../config';
import type { ReactNode } from 'react';
import type PagerView from 'react-native-pager-view';
import type {
  UseFormClearErrors,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormSetError,
} from 'react-hook-form';
import { useCheckUsernameAvailability } from '@services/hooks/apis/username';
import { useDebounce } from '@hooks/utils/useDebounce';

interface Step {
  id: string;
  title: string;
  subtitle: ReactNode;
}

const getSteps = (config: RegisterConfig): Step[] => {
  const baseSteps: Step[] = [
    {
      id: 'fullName',
      title: 'Siapa Namamu?',
      subtitle: 'Masukkan nama lengkapmu agar kita bisa saling kenal lebih dekat. Nama ini akan tampil di profilmu.',
    },
    {
      id: 'birthDate',
      title: 'Ulang Tahunmu?',
      subtitle: 'Biar kami bisa kirim voucher spesial di hari ulang tahunmu!',
    },
    {
      id: 'username',
      title: 'Pilih Username',
      subtitle: (
        <Text type="l1" color={theme.pallate.neutral['04']}>
          {'Username unik untuk akun Wuzz-mu. Akan dipakai di '}
          <Text type="l1" weight="bold" color={theme.pallate.neutral['04']}>
            wuzz.app/username
          </Text>
          {'.'}
        </Text>
      ),
    },
  ];

  if (config.requireVerification) {
    if (config.verificationMethod === 'phone') {
      baseSteps.push({
        id: 'phone',
        title: 'Nomor Telepon',
        subtitle:
          'Nomor aktifmu jadi kunci keamanan akun. Tenang, kami tidak akan spam kamu!',
      });
    } else {
      baseSteps.push({
        id: 'email',
        title: 'Alamat Email',
        subtitle: 'Untuk verifikasi akun dan notifikasi penting.',
      });
    }
  }

  return baseSteps;
};

export interface UseStepNavigationParams {
  trigger: (field: keyof RegisterFormData) => Promise<boolean>;
  username: string;
  getValues: UseFormGetValues<RegisterFormData>;
  setError: UseFormSetError<RegisterFormData>;
  clearErrors: UseFormClearErrors<RegisterFormData>;
  handleSubmit: UseFormHandleSubmit<RegisterFormData>;
  onSubmit: (data: RegisterFormData) => void | Promise<void>;
  config: RegisterConfig;
}

export const useStepNavigation = ({
  trigger,
  username,
  getValues,
  setError,
  clearErrors,
  handleSubmit,
  onSubmit,
  config,
}: UseStepNavigationParams) => {
  const steps = useMemo(() => getSteps(config), [config]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const pagerRef = useRef<Pick<PagerView, 'setPage'> | null>(null);
  const scrollX = useSharedValue(0);
  const [currentStep, setCurrentStep] = useState(0);
  const isUsernameStep = steps[currentStep]?.id === 'username';
  const debouncedUsername = useDebounce(username ?? '', 400);

  const {
    data: isUsernameAvailable,
    isFetching: isCheckingUsername,
    isError: isUsernameCheckFailed,
    refetch: recheckUsername,
  } = useCheckUsernameAvailability(debouncedUsername, isUsernameStep);

  const validateCurrentStep = useCallback(async () => {
    const fieldToValidate = steps[currentStep].id as keyof RegisterFormData;
    const isFieldValid = await trigger(fieldToValidate);

    if (!isFieldValid) return false;
    if (fieldToValidate !== 'username') return true;

    const usernameValue = (getValues('username') ?? '').trim();
    if (usernameValue.length < 3) return false;

    if (isCheckingUsername) return false;

    // The check itself failed (no connection, a server error): say so, and try it again, instead of doing nothing.
    if (isUsernameCheckFailed) {
      recheckUsername();
      return false;
    }

    if (isUsernameAvailable === false) {
      setError('username', {
        type: 'manual',
        message: 'Username tidak tersedia',
      });
      return false;
    }

    if (isUsernameAvailable === true) {
      clearErrors('username');
      return true;
    }

    return false;
  }, [clearErrors, currentStep, getValues, isCheckingUsername, isUsernameAvailable, isUsernameCheckFailed, recheckUsername, setError, steps, trigger]);

  const handleNext = useCallback(async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      pagerRef.current?.setPage(currentStep + 1);
    } else {
      handleSubmit(onSubmit, () => {})();
    }
  }, [
    currentStep,
    steps.length,
    validateCurrentStep,
    handleSubmit,
    onSubmit,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      pagerRef.current?.setPage(currentStep - 1);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    currentStep,
    scrollX,
    pagerRef,
    handleNext,
    handleBack,
    handleClose,
    steps,
    isUsernameAvailable,
    isCheckingUsername,
    isUsernameCheckFailed,
  };
};
