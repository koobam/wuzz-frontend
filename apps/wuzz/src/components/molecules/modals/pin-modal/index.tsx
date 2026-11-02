import React, { memo, useCallback, useState } from 'react';
import { type BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Scan } from 'iconsax-react-native';
import { FloatingSheet } from '@wuzz/native/sheet';
import { Button, Text, theme } from '@components/atoms';
import { SheetHeader } from '@components/molecules/sheet-header';
import { OTPBoxes } from '@features/(auth)/verification/components';
import { useHapticFeedback } from '@services/hooks/utils';
import { useLoginPinMutation } from '@services/mutations';
import { useAuthAction } from '@hooks/utils/useAuth';
import { ACCESS_TOKEN_STORAGE, REFRESH_TOKEN_STORAGE, storage } from '@core/http/storage';
import type { VerifyOtpDataResponse } from '@core/api/auth/verify-otp.types';
import { clearBiometricPin, hasBiometricPin, readBiometricPin } from '@services/biometric';

const PIN_LENGTH = 6;

export type PinModalProps = {
  /** Opens the sheet with `ref.current?.present()`. */
  ref?: React.Ref<BottomSheetModal>;
  /** The number signing in, as the server knows it (+62...). */
  phone?: string;
  /** Called once the PIN is accepted and the session is stored. */
  onSignedIn: (data: VerifyOtpDataResponse) => void;
  /** "Lupa PIN?": the caller sends an SMS code instead. */
  onForgot: () => void;
};

/**
 * Bottom sheet for signing in with the 6-digit PIN: six masked boxes, sent as soon as the sixth digit is typed. When this
 * device keeps the PIN behind Face ID, the face is asked for as the sheet opens, and a button asks again.
 */
export const PinModal = memo((props: PinModalProps) => {
  const { ref, phone, onSignedIn, onForgot } = props;
  const { t } = useTranslation('login');
  const { dismiss } = useBottomSheetModal();
  const { triggerHaptic } = useHapticFeedback();
  const { setUser } = useAuthAction();
  const login = useLoginPinMutation();
  const [pin, setPin] = useState('');
  const [failed, setFailed] = useState(false);
  const [canUseFace, setCanUseFace] = useState(false);

  const submit = useCallback(
    async (value: string, fromFace = false) => {
      if (!phone) return;
      setFailed(false);
      try {
        const response = await login.mutateAsync({ phone, pin: value });
        if (response.success && response.data) {
          storage.set(ACCESS_TOKEN_STORAGE, response.data.access_token);
          storage.set(REFRESH_TOKEN_STORAGE, response.data.refresh_token);
          setUser(response.data.user as never);
          triggerHaptic('light');
          onSignedIn(response.data);
        }
      } catch {
        triggerHaptic('medium');
        setFailed(true);
        setPin('');
        // A kept PIN that the server refuses is out of date (changed elsewhere): forget it.
        if (fromFace) {
          clearBiometricPin(phone);
          setCanUseFace(false);
        }
      }
    },
    [phone, login, setUser, triggerHaptic, onSignedIn],
  );

  const askFace = useCallback(async () => {
    if (!phone) return;
    const kept = await readBiometricPin(phone, t('pin.facePrompt'));
    if (kept) submit(kept, true);
  }, [phone, submit, t]);

  // Once open: show the Face ID button if a PIN is kept, and ask for the face straight away.
  const handleShow = useCallback(async () => {
    if (!phone) return;
    const kept = await hasBiometricPin(phone);
    setCanUseFace(kept);
    if (kept) askFace();
  }, [phone, askFace]);

  const handleForgot = useCallback(() => {
    dismiss();
    onForgot();
  }, [dismiss, onForgot]);

  return (
    <FloatingSheet
      ref={ref}
      header={
        <SheetHeader
          title={t('pin.title')}
          description={t('pin.description', { length: PIN_LENGTH, phone: phone ?? t('pin.yourAccount') })}
        />
      }
      backgroundColor={theme.pallate.neutral['01']}
      borderColor={theme.pallate.neutral['03']}
      handleColor={theme.pallate.neutral['03']}
      onShow={handleShow}
      onDismiss={() => {
        setPin('');
        setFailed(false);
      }}
    >
      <View style={styles.body}>
        <OTPBoxes
          value={pin}
          onChange={value => {
            setFailed(false);
            setPin(value);
          }}
          onComplete={value => submit(value)}
          error={failed}
          disabled={login.isPending}
          secure
          length={PIN_LENGTH}
        />
        {failed ? (
          <Text type="b2" color={theme.pallate.danger['03']} style={styles.center}>
            {t('pin.wrong')}
          </Text>
        ) : null}
        {canUseFace ? (
          <Button variant="secondary" size="lg" rounded onPress={askFace} disabled={login.isPending}>
            <Scan size={20} color={theme.pallate.neutral['05']} />
            <Text type="b1" weight="bold" color={theme.pallate.neutral['05']}>
              {t('pin.useFace')}
            </Text>
          </Button>
        ) : null}
        <Button variant="link" size="sm" onPress={handleForgot}>
          <Text type="b2" weight="bold" color={theme.pallate.primary['03']}>
            {t('pin.forgot')}
          </Text>
        </Button>
      </View>
    </FloatingSheet>
  );
});

PinModal.displayName = 'PinModal';

const styles = StyleSheet.create({
  body: { padding: theme.spacing.extraLarge, gap: theme.spacing.large },
  center: { textAlign: 'center' },
});

export default PinModal;
