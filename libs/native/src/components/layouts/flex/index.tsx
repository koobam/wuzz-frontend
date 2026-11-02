import React, {Ref} from 'react';
import {BoxBase, BoxProps} from '../box';
import {View} from 'react-native';
import Reanimated from 'react-native-reanimated';

export interface FlexProps extends BoxProps {
  ref?: Ref<React.ComponentRef<typeof View>>;
}

/**
 * A Box that lays out in a row unless told otherwise.
 *
 * The flex props are Box's now, so all that is left here is the row default;
 * this calls Box's implementation directly instead of rendering a Box.
 */
export const Flex = React.memo((props: FlexProps) =>
  BoxBase({...props, direction: props.direction ?? 'row'}),
);

Flex.displayName = 'Flex';
export const FlexAnimated = Reanimated.createAnimatedComponent(Flex);
export default Flex;
