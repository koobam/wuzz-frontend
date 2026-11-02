import { Text, theme } from '@components/atoms';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { DARK_GRADIENT_COLORS, DARK_GRADIENT_END, DARK_GRADIENT_START } from '../dark-surface';

export interface BusinessCardProps {
  onContactPress: () => void;
}

/** Ajakan untuk pelanggan bisnis (kos, salon, usaha kecil): volume besar dilayani lewat kontak, bukan pesan biasa. */
export const BusinessCard = memo(function BusinessCard({
  onContactPress,
}: BusinessCardProps) {
  const { t } = useTranslation('home');

  return (
    // A plain View lays the content out and clips it; the gradient is only its background. Laying the text out inside the
    // gradient view itself is what ran it off the card's edge.
    <View style={styles.card}>
      <LinearGradient
        colors={[...DARK_GRADIENT_COLORS]}
        start={DARK_GRADIENT_START}
        end={DARK_GRADIENT_END}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Text type="b2" weight="semibold" color={theme.pallate.neutral['01']}>
        {t('business.description')}
      </Text>
      <Pressable onPress={onContactPress} style={styles.button}>
        <Text type="l1" weight="semibold" color={theme.pallate.neutral['05']}>
          {t('business.contact')}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  // The text above and the button under it, not side by side: two things competing for one row's width is what cut them off.
  card: {
    // Fills the row whatever the parent's alignment: left to its own size the card was only as wide as the text's single line,
    // so the text never wrapped and ran off its edge.
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    gap: theme.spacing.standard,
    marginHorizontal: theme.spacing.large,
    padding: theme.spacing.large,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  button: {
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.standard,
    borderRadius: 999,
    backgroundColor: theme.pallate.neutral['01'],
  },
});
