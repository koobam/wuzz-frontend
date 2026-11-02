import React, { memo, useCallback } from 'react';
import { type BottomSheetModal, useBottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TickCircle } from 'iconsax-react-native';
import { FloatingSheet } from '@wuzz/native/sheet';
import { Pressable, Text, theme } from '@components/atoms';
import { LanguageFlag } from '@components/atoms/language-flag';
import { SheetHeader } from '@components/molecules/sheet-header';
import { countries, type Country } from '@services/consts';

export type CountryCodeModalProps = {
  /** Opens the sheet with `ref.current?.present()`. */
  ref?: React.Ref<BottomSheetModal>;
  /** The country in use. */
  value: Country;
  onSelect: (country: Country) => void;
};

/**
 * Bottom sheet for choosing the country whose calling code the phone number starts with: a floating card with its title
 * fixed on top, and the list scrolling under it (FloatingSheet).
 */
export const CountryCodeModal = memo((props: CountryCodeModalProps) => {
  const { ref, value, onSelect } = props;
  const { dismiss } = useBottomSheetModal();
  const { t } = useTranslation('login');

  const handleSelect = useCallback(
    (country: Country) => {
      onSelect(country);
      dismiss();
    },
    [onSelect, dismiss],
  );

  return (
    <FloatingSheet
      ref={ref}
      header={<SheetHeader title={t('country.title')} description={t('country.description')} />}
      backgroundColor={theme.pallate.neutral['01']}
      borderColor={theme.pallate.neutral['03']}
      handleColor={theme.pallate.neutral['03']}
    >
      {countries.map((country, index) => {
        const selected = country.code === value.code;
        return (
          <Pressable
            key={country.code}
            onPress={() => handleSelect(country)}
            style={[styles.option, index > 0 && styles.optionDivider]}
          >
            <LanguageFlag flag={country.flag} width={24} />
            <Text
              fill
              type="b2"
              weight={selected ? 'bold' : 'medium'}
              color={theme.pallate.neutral['05']}
            >
              {country.name}
            </Text>
            <Text type="b2" color={theme.pallate.neutral['04']}>
              +{country.dial}
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

CountryCodeModal.displayName = 'CountryCodeModal';

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.standard,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.extraLarge,
  },
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.pallate.neutral['03'],
  },
});

export default CountryCodeModal;
