import React, { memo, useCallback } from 'react';
import { type BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TickCircle } from 'iconsax-react-native';
import { FloatingSheet } from '@wuzz/native/sheet';
import { Pressable, Text, theme } from '@components/atoms';
import { LanguageFlag } from '@components/atoms/language-flag';
import { SheetHeader } from '@components/molecules/sheet-header';
import { changeLanguage } from '@core/i18n';
import type { LanguageCode } from '@core/i18n/config';
import { languages } from '@services/index';

export type ChangeLanguageModalProps = {
  /** Opens the sheet with `ref.current?.present()`. */
  ref?: React.Ref<BottomSheetModal>;
};

/**
 * Bottom sheet for choosing the app's language: a floating card with its title fixed on top (FloatingSheet). The choice is
 * saved, so the app opens in it next time.
 */
export const ChangeLanguageModal = memo((props: ChangeLanguageModalProps) => {
  const { ref } = props;
  const { i18n, t } = useTranslation();
  const { dismiss } = useBottomSheetModal();

  const handleSelect = useCallback(
    (code: string) => {
      changeLanguage(code as LanguageCode);
      dismiss();
    },
    [dismiss],
  );

  return (
    <FloatingSheet
      ref={ref}
      header={<SheetHeader title={t('changeLanguageTitle')} description={t('changeLanguageSubtitle')} />}
      backgroundColor={theme.pallate.neutral['01']}
      borderColor={theme.pallate.neutral['03']}
      handleColor={theme.pallate.neutral['03']}
    >
      {languages.map((item, index) => {
        const selected = item.value === i18n.language;
        return (
          <Pressable
            key={item.value}
            onPress={() => handleSelect(item.value)}
            style={[styles.option, index > 0 && styles.optionDivider]}
          >
            <LanguageFlag flag={item.flag} width={24} />
            <Text
              fill
              type="b2"
              weight={selected ? 'bold' : 'medium'}
              color={theme.pallate.neutral['05']}
            >
              {item.label}
            </Text>
            {selected ? (
              <TickCircle size={24} variant="Bold" color={theme.pallate.primary['03']} />
            ) : null}
          </Pressable>
        );
      })}
    </FloatingSheet>
  );
});

ChangeLanguageModal.displayName = 'ChangeLanguageModal';

const styles = StyleSheet.create({
  // A plain row: the flag, the name, the tick. No card of its own.
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.standard,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.extraLarge,
  },
  // A hairline between one row and the next.
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.pallate.neutral['03'],
  },
});

export default ChangeLanguageModal;
