import { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHapticFeedback } from '@services/hooks/utils';
import { RootStackParamList } from '@navigation/root/root.types';
import { OTPStepFormData } from '@features/(auth)/register/schemas';
import { storage, VERIFICATION_COUNTDOWN_STORAGE, ACCESS_TOKEN_STORAGE, REFRESH_TOKEN_STORAGE } from '@core/http/storage';
import { useVerifyOtpMutation } from '@services/mutations';
import type { VerifyOtpDataResponse } from '@core/api/auth/verify-otp.types';
import { useAuthAction } from '@hooks/utils/useAuth';

interface VerificationRouteParams {
  phone?: string;
}

type VerificationLogicOptions = {
  /** The number the code was sent to. Without it, the screen's route params are used (the verification page). */
  phone?: string;
  /** What closes the screen holding the form. Without it, the navigation goes back (the verification page). */
  onClose?: () => void;
  /** What happens once the code is accepted, in place of going on to the app: the caller decides (ask for a PIN first). */
  onVerified?: (data: VerifyOtpDataResponse) => void;
};

export const useVerificationLogic = (options: VerificationLogicOptions = {}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { triggerHaptic } = useHapticFeedback();

  const params = route.params as VerificationRouteParams | undefined;
  const rawContact = options.phone ?? params?.phone;

  const getInitialCountdown = (): number => {
    const storedEndTime = storage.getNumber(VERIFICATION_COUNTDOWN_STORAGE);
    if (!storedEndTime) return 0;
    const now = Date.now();
    return Math.max(0, Math.floor((storedEndTime - now) / 1000));
  };

  const [canResend, setCanResend] = useState(() => getInitialCountdown() === 0);
  const [countdown, setCountdown] = useState(getInitialCountdown);

  const { setUser } = useAuthAction();
  const checkVerificationMutation = useVerifyOtpMutation();


  const isLoading = checkVerificationMutation.isPending;

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      storage.delete(VERIFICATION_COUNTDOWN_STORAGE);
      return;
    }

    const timer = setInterval(() => {
      const storedEndTime = storage.getNumber(VERIFICATION_COUNTDOWN_STORAGE);
      if (!storedEndTime) {
        setCountdown(0);
        setCanResend(true);
        return;
      }

      const now = Date.now();
      const remaining = Math.max(0, Math.floor((storedEndTime - now) / 1000));
      setCountdown(remaining);

      if (remaining === 0) {
        setCanResend(true);
        storage.delete(VERIFICATION_COUNTDOWN_STORAGE);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = useCallback(
    async (data: OTPStepFormData): Promise<boolean> => {
      triggerHaptic('light');
      try {
        const response = await checkVerificationMutation.mutateAsync({
          phone: rawContact || '',
          otp_code: data.otpCode,
        });

        if (response.success && response.data) {
          storage.delete(VERIFICATION_COUNTDOWN_STORAGE);
          storage.set(ACCESS_TOKEN_STORAGE, response.data.access_token);
          storage.set(REFRESH_TOKEN_STORAGE, response.data.refresh_token);
          triggerHaptic('light');
          setUser(response.data.user);
          if (options.onVerified) options.onVerified(response.data);
          else navigation.replace('bottom');
          return true;
        }
        return false;
      } catch {
        triggerHaptic('medium');
        return false;
      }
    },
    [triggerHaptic, checkVerificationMutation, rawContact, setUser, navigation, options]
  );

  const handleResendOTP = useCallback(async () => {
    if (!canResend || isLoading) return;
    triggerHaptic('light');

    // Resend OTP: re-trigger registration or a dedicated resend endpoint
    // For now, start a new countdown assuming the backend already resent via another mechanism
    const endTime = Date.now() + 60000;
    storage.set(VERIFICATION_COUNTDOWN_STORAGE, endTime);
    setCanResend(false);
    setCountdown(60);
    triggerHaptic('light');
  }, [canResend, isLoading, triggerHaptic]);

  const handleClose = useCallback(() => {
    triggerHaptic('light');
    if (options.onClose) options.onClose();
    else navigation.goBack();
  }, [navigation, triggerHaptic, options]);

  return {
    isLoading,
    canResend,
    countdown,
    handleVerify,
    handleResendOTP,
    handleClose,
  };
};
