import React from 'react';
import { StackBase } from '../stack';
import { StackProps } from '../stack.types';
import Reanimated from 'react-native-reanimated';

export interface HStackProps extends Omit<StackProps, 'inline' | 'direction'> {
  reverse?: boolean;
}

/** A row. Calls the stack implementation directly — see StackBase. */
export const HStack = React.memo((props: HStackProps) => {
  const { reverse, ...rest } = props;
  return StackBase({ ...rest, direction: reverse ? 'row-reverse' : 'row' });
});

HStack.displayName = 'HStack';
export const HStackAnimated = Reanimated.createAnimatedComponent(HStack);
