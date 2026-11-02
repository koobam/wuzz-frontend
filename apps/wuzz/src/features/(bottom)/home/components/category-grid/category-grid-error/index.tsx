import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyStatePlaceholder } from '@components/molecules';
import { Error500 } from '@assets/index';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/root/root.types';
import { ROOT_ROUTES } from '@navigation/root/_routes';
import type { CategoryGridErrorProps } from './category-grid-error.types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const CategoryGridError = memo(({ message, onRetry }: CategoryGridErrorProps) => {
  const { t } = useTranslation('home');
  const navigation = useNavigation<Nav>();

  const handleHelp = useCallback(() => {
    navigation.navigate(ROOT_ROUTES.HELP);
  }, [navigation]);

  return (
    <EmptyStatePlaceholder
      icon={<Error500 />}
      iconSize={150}
      title={message}
      description={t('category.error.loadFailedDescription')}
      primaryButton={onRetry ? { label: t('category.error.retry'), onPress: onRetry } : undefined}
      secondaryButton={{ label: t('category.error.help'), onPress: handleHelp }}
    />
  );
});

CategoryGridError.displayName = 'CategoryGridError';
