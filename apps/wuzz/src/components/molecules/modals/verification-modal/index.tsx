import React, { memo, useCallback, useState } from 'react';
import { type BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FloatingSheet } from '@wuzz/native/sheet';
import { Button, Text, theme } from '@components/atoms';
import { SheetHeader } from '@components/molecules/sheet-header';
import { OTPBoxes, OTP_LENGTH } from '@features/(auth)/verification/components';
import type { VerifyOtpDataResponse } from '@core/api/auth/verify-otp.types';
import { useVerificationLogic } from '@features/(auth)/verification/hooks';

export type VerificationModalProps = {
  /** Opens the sheet with `ref.current?.present()`. */
  ref?: React.Ref<BottomSheetModal>;
  /** The number the code was sent to, as the server knows it (+62...). */
  phone?: string;
  /** Called once the code is accepted; without it the app goes on to its home screen. */
  onVerified?: (data: VerifyOtpDataResponse) => void;
};

/**
 * Bottom sheet for typing the code sent to the phone: six boxes, one digit each, and the code is sent as soon as the sixth
 * is typed. Signing in goes on to the app; "Kirim ulang" waits out the countdown.
 */
export const VerificationModal = memo((props: VerificationModalProps) => {
  const { ref, phone, onVerified } = props;
  const { t } = useTranslation('login');
  const { dismiss } = useBottomSheetModal();
  const [code, setCode] = useState('');
  const [failed, setFailed] = useState(false);

  const { isLoading, canResend, countdown, handleVerify, handleResendOTP } = useVerificationLogic({
    phone,
    onClose: dismiss,
    onVerified,
  });

  const verify = useCallback(
    async (otpCode: string) => {
      setFailed(false);
      const ok = await handleVerify({ otpCode });
      if (!ok) {
        setFailed(true);
        setCode('');
      }
    },
    [handleVerify],
  );

  const handleChange = useCallback((value: string) => {
    setFailed(false);
    setCode(value);
  }, []);

  return (
    <FloatingSheet
      ref={ref}
      header={
        <SheetHeader
          title={t('verification.title')}
          description={
            phone
              ? t('verification.description', { length: OTP_LENGTH, phone })
              : t('verification.descriptionNoPhone', { length: OTP_LENGTH })
          }
        />
      }
      backgroundColor={theme.pallate.neutral['01']}
      borderColor={theme.pallate.neutral['03']}
      handleColor={theme.pallate.neutral['03']}
      onDismiss={() => {
        setCode('');
        setFailed(false);
      }}
    >
      <View style={styles.body}>
        <OTPBoxes
          value={code}
          onChange={handleChange}
          onComplete={verify}
          error={failed}
          disabled={isLoading}
        />
        {failed ? (
          <Text type="b2" color={theme.pallate.danger['03']} style={styles.center}>
            {t('verification.wrong')}
          </Text>
        ) : null}
        <Button
          variant="primary"
          size="lg"
          rounded
          onPress={() => verify(code)}
          disabled={isLoading || code.length < OTP_LENGTH}
        >
          <Text type="b1" weight="bold" color={theme.pallate.neutral['01']}>
            {isLoading ? t('verification.verifying') : t('verification.verify')}
          </Text>
        </Button>
        <Button variant="link" size="sm" onPress={handleResendOTP} disabled={!canResend}>
          <Text type="b2" color={theme.pallate.neutral['04']}>
            {t('verification.noCode')}
          </Text>
          <Text
            type="b2"
            weight="bold"
            color={canResend ? theme.pallate.primary['03'] : theme.pallate.neutral['05']}
          >
            {canResend ? t('verification.resend') : t('verification.resendIn', { seconds: countdown })}
          </Text>
        </Button>
      </View>
    </FloatingSheet>
  );
});

VerificationModal.displayName = 'VerificationModal';

const styles = StyleSheet.create({
  body: {
    padding: theme.spacing.extraLarge,
    gap: theme.spacing.large,
  },
  center: { textAlign: 'center' },
});

export default VerificationModal;
