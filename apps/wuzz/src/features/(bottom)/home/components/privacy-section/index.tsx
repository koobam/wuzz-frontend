import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { HStack, Text, theme, VStack } from '@components/atoms';
import { Box1, Lock } from 'iconsax-react-native';

export const PrivacySection = memo(() => {
  const { t } = useTranslation('home');

  return (
    <VStack
      padding={{
        paddingHorizontal: theme.spacing.large,
        paddingBottom: theme.spacing.large,
      }}
      gap={theme.spacing.large}
    >
      <VStack>
        <Text type="s2" weight="semibold">
          {t('privacy.title')}
        </Text>
        <Text type="l1" color={theme.pallate.neutral['04']}>
          {t('privacy.description')}
        </Text>
      </VStack>
      <HStack gap={theme.spacing.small}>
        <VStack
          borderRadius={30}
          justify="space-between"
          padding={theme.spacing.large}
          backgroundColor={theme.pallate.neutral['02']}
          gap={theme.spacing.small}
          fill
        >
          <Box1 size={48} variant="Bulk" color={theme.pallate.neutral['04']} />
          <VStack
            padding={{
              paddingTop: theme.spacing.large,
            }}
          >
            <Text type="b2" weight="semibold">
              {t('privacy.separate.title')}
            </Text>
            <Text type="l2">{t('privacy.separate.description')}</Text>
          </VStack>
        </VStack>
        <VStack
          borderRadius={30}
          justify="space-between"
          padding={theme.spacing.large}
          backgroundColor={theme.pallate.neutral['02']}
          gap={theme.spacing.small}
          fill
        >
          <Lock size={48} variant="Bulk" color={theme.pallate.neutral['04']} />
          <VStack
            padding={{
              paddingTop: theme.spacing.large,
            }}
          >
            <Text type="b2" weight="semibold">
              {t('privacy.protected.title')}
            </Text>
            <Text type="l2">{t('privacy.protected.description')}</Text>
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
});

PrivacySection.displayName = 'PrivacySection';
