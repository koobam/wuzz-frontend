import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { HStack, Text, theme, VStack } from '@components/atoms';
import { DocumentText, TickCircle } from 'iconsax-react-native';

export const TermsSection = memo(() => {
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
          {t('terms.title')}
        </Text>
        <Text type="l1" color={theme.pallate.neutral['04']}>
          {t('terms.description')}
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
              {t('terms.oneMachine.title')}
            </Text>
            <Text type="l2">{t('terms.oneMachine.description')}</Text>
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
          <TickCircle
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
              {t('terms.separate.title')}
            </Text>
            <Text type="l2">{t('terms.separate.description')}</Text>
          </VStack>
        </VStack>
      </HStack>
    </VStack>
  );
});

TermsSection.displayName = 'TermsSection';
