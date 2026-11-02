import React, { memo, useCallback, useState } from 'react';
import { type BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { FloatingSheet } from '@wuzz/native/sheet';
import { Button, Text, theme } from '@components/atoms';
import { SheetHeader } from '@components/molecules/sheet-header';
import { OTPBoxes } from '@features/(auth)/verification/components';
import { useHapticFeedback } from '@services/hooks/utils';
import { useSetPinMutation } from '@services/mutations';
import { saveBiometricPin } from '@services/biometric';

const PIN_LENGTH = 6;

export type CreatePinModalProps = {
  ref?: React.Ref<BottomSheetModal>;
  /** The number the PIN is for: Face ID keeps the PIN per number. */
  phone?: string;
  /** Called when the PIN is set, or when the customer chose to do it later. */
  onDone: () => void;
};

/**
 * Bottom sheet for making a PIN, right after a code signed the customer in: type it, type it again, done. The PIN is also
 * kept behind Face ID when the device has it. "Nanti saja" leaves the account without one, so the next sign-in sends a code.
 */
export const CreatePinModal = memo((props: CreatePinModalProps) => {
  const { ref, phone, onDone } = props;
  const { t } = useTranslation('login');
  const { dismiss } = useBottomSheetModal();
  const { triggerHaptic } = useHapticFeedback();
  const setPin = useSetPinMutation();
  const [first, setFirst] = useState<string>();
  const [value, setValue] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const confirming = first !== undefined;

  const reset = useCallback(() => {
    setFirst(undefined);
    setValue('');
    setMismatch(false);
  }, []);

  const finish = useCallback(() => {
    dismiss();
    onDone();
  }, [dismiss, onDone]);

  const handleComplete = useCallback(
    async (typed: string) => {
      if (!confirming) {
        setFirst(typed);
        setValue('');
        return;
      }
      if (typed !== first) {
        triggerHaptic('medium');
        setMismatch(true);
        setFirst(undefined);
        setValue('');
        return;
      }
      try {
        await setPin.mutateAsync({ pin: typed });
        if (phone) await saveBiometricPin(phone, typed);
        triggerHaptic('light');
        Toast.show({ type: 'success', text1: t('createPin.doneTitle'), text2: t('createPin.doneDescription') });
        reset();
        finish();
      } catch {
        // The failure is already toasted by the mutation; start over.
        setFirst(undefined);
        setValue('');
      }
    },
    [confirming, first, setPin, phone, triggerHaptic, reset, finish, t],
  );

  return (
    <FloatingSheet
      ref={ref}
      header={
        <SheetHeader
          title={confirming ? t('createPin.confirmTitle') : t('createPin.title')}
          description={
            confirming ? t('createPin.confirmDescription') : t('createPin.description', { length: PIN_LENGTH })
          }
        />
      }
      backgroundColor={theme.pallate.neutral['01']}
      borderColor={theme.pallate.neutral['03']}
      handleColor={theme.pallate.neutral['03']}
      onDismiss={reset}
    >
      <View style={styles.body}>
        <OTPBoxes
          // A new key per step, so the field empties and takes focus again.
          key={confirming ? 'confirm' : 'enter'}
          value={value}
          onChange={next => {
            setMismatch(false);
            setValue(next);
          }}
          onComplete={handleComplete}
          error={mismatch}
          disabled={setPin.isPending}
          secure
          length={PIN_LENGTH}
        />
        {mismatch ? (
          <Text type="b2" color={theme.pallate.danger['03']} style={styles.center}>
            {t('createPin.mismatch')}
          </Text>
        ) : null}
        <Button variant="link" size="sm" onPress={finish}>
          <Text type="b2" weight="bold" color={theme.pallate.neutral['04']}>
            {t('createPin.later')}
          </Text>
        </Button>
      </View>
    </FloatingSheet>
  );
});

CreatePinModal.displayName = 'CreatePinModal';

const styles = StyleSheet.create({
  body: { padding: theme.spacing.extraLarge, gap: theme.spacing.large },
  center: { textAlign: 'center' },
});

export default CreatePinModal;
