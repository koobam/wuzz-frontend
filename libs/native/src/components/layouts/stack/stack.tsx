import { memo } from 'react';
import { StackProps } from './stack.types';
import { BoxBase } from '../box';
import Animated from 'react-native-reanimated';

/**
 * The stack implementation, as a plain function.
 *
 * Called directly by Stack, VStack and HStack rather than rendered, so a
 * stack is one component and one native view instead of
 * VStack → Stack → Flex → Box.
 */
export const StackBase = (props: StackProps) =>
  BoxBase({
    ...props,
    direction: props.inline ? 'row' : props.direction || 'column',
  });

export const Stack = memo(StackBase);

const AnimatedStack = Animated.createAnimatedComponent(Stack);
// createAnimatedComponent's return type does not declare displayName.
(AnimatedStack as unknown as { displayName?: string }).displayName = 'AnimatedStack';
export { AnimatedStack };
Stack.displayName = 'Stack';
export default Stack;
