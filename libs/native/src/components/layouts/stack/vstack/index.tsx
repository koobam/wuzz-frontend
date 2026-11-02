import React from 'react';
import {StackProps} from '../stack.types';
import {StackBase} from '../stack';
import Reanimated from 'react-native-reanimated';

export interface VStackProps extends Omit<StackProps, 'inline' | 'direction'> {
  reverse?: boolean;
}

/** A column. Calls the stack implementation directly — see StackBase. */
export const VStack = React.memo((props: VStackProps) => {
  const {reverse, ...rest} = props;
  return StackBase({
    ...rest,
    direction: reverse ? 'column-reverse' : 'column',
  });
});

VStack.displayName = 'VStack';
export const VStackAnimated = Reanimated.createAnimatedComponent(VStack);
