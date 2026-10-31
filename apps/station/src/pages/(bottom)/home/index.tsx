import React from 'react';
import { VStack } from '@wuzz/ui';
import { Text } from 'react-native';
import { useTranslation } from '@core/i18n';

export const HomeScreen = () => {
  const { t } = useTranslation();

  return (
    <VStack fill items="center" justify="center">
      <Text>{t('home.title')}</Text>
    </VStack>
  );
};

export default HomeScreen;
