import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { HStack, Text, theme, VStack } from '@components/atoms';
import { DocumentText, Lock } from 'iconsax-react-native';

export const TermsAndPrivacySection = memo(() => {
  const { t } = useTranslation('home');

  return (
    <VStack
      padding={{ paddingHorizontal: theme.spacing.large }}
      gap={theme.spacing.large}
    >
      <VStack>
        <Text type="s2" weight="semibold">
          {t('termsAndPrivacy.title')}
        </Text>
        <Text type="l1" color={theme.pallate.neutral['04']}>
          {t('termsAndPrivacy.description')}
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
          <DocumentText
            size={48}
            variant="Bulk"
            color={theme.pallate.neutral['04']}
          />
          <VStack
            padding={{
              paddingTop: theme.spacing.large,
            }}
          >
            <Text type="b2" weight="semibold">
              {t('termsAndPrivacy.oneMachine.title')}
            </Text>
            <Text type="l2">{t('termsAndPrivacy.oneMachine.description')}</Text>
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
              {t('termsAndPrivacy.privacy.title')}
            </Text>
            <Text type="l2">{t('termsAndPrivacy.privacy.description')}</Text>
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
});

TermsAndPrivacySection.displayName = 'TermsAndPrivacySection';
