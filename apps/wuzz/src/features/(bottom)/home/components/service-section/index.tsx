import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Flex,
  HStack,
  Icon,
  Pressable,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import { Flash } from 'iconsax-react-native';
import { Dimensions } from 'react-native';
import type { ServiceSectionProps } from './service-section.types';

export const ServiceSection = memo(({ onServicePress }: ServiceSectionProps) => {
  const { t } = useTranslation('home');
  const screenWidth = Dimensions.get('screen').width;
  const cardWidth =
    (screenWidth - theme.spacing.large * 2 - theme.spacing.small / 2) / 2;

  return (
    <VStack
      gap={theme.spacing.standard}
      padding={{
        paddingHorizontal: theme.spacing.large,
        paddingBottom: theme.spacing.large,
      }}
    >
      <Text type="s2" weight="semibold">
        {t('service.title')}
      </Text>
      <HStack gap={theme.spacing.small}>
        <Pressable
          direction="column"
          width={cardWidth}
          gap={theme.spacing.small}
          onPress={onServicePress}
          borderRadius={30}
          height={220}
          justify="flex-end"
          padding={theme.spacing.large}
          backgroundColor={theme.pallate.neutral['02']}
        >
          <Flex
            width={60}
            height={60}
            items="center"
            justify="center"
            borderRadius={20}
            backgroundColor={theme.pallate.neutral['02']}
          >
            <Icon
              icon="reguler"
              size={60}
              color={theme.pallate.neutral['04']}
            />
          </Flex>
          <Text width="100%" weight="semibold" type="b2">
            {t('service.regular.title')}
          </Text>
          <Text width="100%" type="l2">
            {t('service.regular.description')}
          </Text>
        </Pressable>
        <VStack width={cardWidth} gap={theme.spacing.small}>
          <HStack items="center" gap={theme.spacing.tiny} width="100%">
            <Flash
              size={32}
              variant="Bold"
              color={theme.pallate.secondary['03']}
            />
            <VStack fill>
              <Text weight="semibold" type="b2">
                {t('service.expressOrder.title')}
              </Text>
              <Text width="100%" type="l2">
                {t('service.expressOrder.description')}
              </Text>
            </VStack>
          </HStack>
          <Pressable
            fill
            borderRadius={30}
            width="100%"
            items="center"
            padding={theme.spacing.medium}
            gap={theme.spacing.small}
            onPress={onServicePress}
            backgroundColor={theme.pallate.neutral['02']}
          >
            <Flex
              width={40}
              height={40}
              items="center"
              justify="center"
              borderRadius={20}
              backgroundColor={theme.pallate.neutral['02']}
            >
              <Icon
                icon="kilat"
                size={30}
                color={theme.pallate.neutral['04']}
              />
            </Flex>
            <VStack>
              <Text weight="semibold" type="b2">
                {t('service.kilat.title')}
              </Text>
              <Text type="l1">{t('service.kilat.duration')}</Text>
            </VStack>
          </Pressable>
          <Pressable
            fill
            borderRadius={30}
            width="100%"
            items="center"
            padding={theme.spacing.medium}
            gap={theme.spacing.small}
            onPress={onServicePress}
            backgroundColor={theme.pallate.neutral['02']}
          >
            <Flex
              width={40}
              height={40}
              items="center"
              justify="center"
              borderRadius={20}
              backgroundColor={theme.pallate.neutral['02']}
            >
              <Icon
                icon="express"
                size={34}
                color={theme.pallate.neutral['04']}
              />
            </Flex>
            <VStack>
              <Text weight="semibold" type="b2">
                {t('service.express.title')}
              </Text>
              <Text type="l1">{t('service.express.duration')}</Text>
            </VStack>
          </Pressable>
        </VStack>
      </HStack>
    </VStack>
  );
});

ServiceSection.displayName = 'ServiceSection';
