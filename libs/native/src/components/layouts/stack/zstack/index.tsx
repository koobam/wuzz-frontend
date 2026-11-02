import React from 'react';
import { memo } from 'react';
import { Box, BoxProps } from '../..';
import { getAbsoluteChildren } from '../../helper';

export interface InterfaceZStackProps extends BoxProps {
  /**
   * The direction to stack the elements.
   */
  reversed?: boolean;
}

export const ZStack = memo(({
  children,
  reversed,
  ...props
}: InterfaceZStackProps) => {
  return <Box {...props}>{getAbsoluteChildren(children, reversed)}</Box>;
});

ZStack.displayName = 'ZStack';
export default ZStack;
