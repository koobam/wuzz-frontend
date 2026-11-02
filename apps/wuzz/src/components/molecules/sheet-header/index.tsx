import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Text, theme, VStack } from '@components/atoms';

export type SheetHeaderProps = {
  title: string;
  description?: string;
};

/**
 * The title and description at the top of a bottom sheet (`header` of FloatingSheet in @wuzz/native/sheet), where they stay
 * while the body scrolls.
 */
export const SheetHeader = memo(({ title, description }: SheetHeaderProps) => (
  <VStack style={styles.header}>
    <Text type="b1" weight="bold" color={theme.pallate.neutral['05']}>
      {title}
    </Text>
    {description ? (
      <Text type="l1" color={theme.pallate.neutral['04']}>
        {description}
      </Text>
    ) : null}
  </VStack>
));

SheetHeader.displayName = 'SheetHeader';

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.extraLarge,
    paddingTop: theme.spacing.standard,
    paddingBottom: theme.spacing.medium,
  },
});
