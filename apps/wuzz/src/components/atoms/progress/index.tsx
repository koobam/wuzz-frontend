import React, { memo } from 'react';
import { Box, HStack, VStack } from '@wuzz/native/components';
import theme from '../theme';
import Text from '../text';
import { StyleSheet } from 'react-native';
import useOnLayout from '@hooks/utils/useOnLayout';

interface ProgressProps {
  type: 'primary' | 'danger' | 'warning' | 'info';
  max: number;
  value: number;
  label: string;
  height?: number;
  width?: number;
}

const DEFAULT_HEIGHT = 26;
export const Progress = memo((props: ProgressProps) => {
  const { type, value, max, label, height, width } = props;

  const [layout, onLayout] = useOnLayout();
  const progressValue = (value / max) * 100;

  // ✅ Set a fixed width with min & max bounds to avoid too-thin or too-wide bars
  const barWidth = Math.max(5, Math.min(layout.width * 0.05, 15));

  // ✅ Ensure a whole number to avoid fractional looping issues
  const loopingBar = Math.floor(layout.width / barWidth);

  return (
    <VStack
      fill
      height={height || DEFAULT_HEIGHT}
      width={width}
      style={styles.hidden}
      borderRadius={5}
      onLayout={onLayout}
      borderWidth={1}
      borderColor={theme.pallate[type]['01']}
      backgroundColor={theme.pallate.neutral['02']}>
      <HStack
        fill
        justify="space-evenly"
        items="center"
        style={styles.hidden}
        width={`${progressValue}%`}
        borderRadius={1}
        backgroundColor={theme.pallate[type]['03']}>
        {Array.from({ length: loopingBar }).map((_, index) => (
          <Box
            key={index}
            style={{ transform: [{ rotateZ: '10deg' }] }}
            position={{
              left: index * barWidth * 2, // ✅ Improved positioning
            }}
            height={height ? height * 2 : DEFAULT_HEIGHT * 2}
            width={barWidth}
            backgroundColor={theme.pallate[type]['04']}
          />
        ))}
      </HStack>
      <Box
        position={{
          left: 5,
          bottom: 4,
        }}>
        <Text type="l1" weight="bold" color={theme.pallate.neutral['01']} text={label} />
      </Box>
    </VStack>
  );
});

const styles = StyleSheet.create({
  hidden: {
    overflow: 'hidden',
  },
});

Progress.displayName = 'Progress';

export default Progress;
