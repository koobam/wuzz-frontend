import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MedalStar } from 'iconsax-react-native';
import { Text, theme, VStack } from '@components/atoms';
import { useBottomNavHeight } from '@services/contexts/bottom-nav-height';

/** The Mission tab. There are no missions to show yet, so it says so rather than listing made-up ones. */
const Mission = memo(() => {
  const { t } = useTranslation();
  const { top } = useSafeAreaInsets();
  const { navHeight } = useBottomNavHeight();

  return (
    <VStack
      fill
      backgroundColor={theme.pallate.neutral['01']}
      padding={{
        paddingTop: top + theme.spacing.large,
        paddingBottom: navHeight,
        paddingHorizontal: theme.spacing.large,
      }}
      gap={theme.spacing.large}
    >
      <Text type="h3" weight="bold" color={theme.pallate.neutral['05']}>
        {t('mission.title')}
      </Text>
      <VStack fill items="center" justify="center" gap={theme.spacing.standard} style={styles.empty}>
        <MedalStar size={48} variant="Bulk" color={theme.pallate.neutral['04']} />
        <Text type="s2" weight="bold" color={theme.pallate.neutral['05']}>
          {t('mission.emptyTitle')}
        </Text>
        <Text type="b2" color={theme.pallate.neutral['04']} style={styles.center}>
          {t('mission.emptyDescription')}
        </Text>
      </VStack>
    </VStack>
  );
});

Mission.displayName = 'Mission';

const styles = StyleSheet.create({
  empty: { paddingHorizontal: theme.spacing.large },
  center: { textAlign: 'center' },
});

export default Mission;
