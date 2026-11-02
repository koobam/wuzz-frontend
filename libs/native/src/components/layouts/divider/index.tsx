import React, { useMemo } from 'react';
import Box, { BoxProps } from '../box';
import { ResponsiveValue, getResponsiveValue, useResponsiveWidth } from '../helper';

export interface DividerProps extends BoxProps {
  /**
   * The orientation of the divider.
   *
   * @default 'horizontal'
   */
  horizontal?: boolean;

  /**
   * The thickness of the divider.
   *
   * @default 1
   */
  thickness?: ResponsiveValue<number>;

  /**
   * The color of the divider.
   *
   * @default '#E0E0E0'
   */
  color?: string;
}

export const Divider: React.FC<DividerProps> = React.memo(
  ({ horizontal = true, thickness = 1, color, style, ...rest }) => {
    const screenWidth = useResponsiveWidth(typeof thickness === 'object');

    const resolvedThickness = useMemo(() => {
      if (typeof thickness === 'object') {
        return getResponsiveValue(thickness, screenWidth);
      }
      return thickness;
    }, [thickness, screenWidth]);

    return <Box width={horizontal ? resolvedThickness : thickness} height={!horizontal ? resolvedThickness : thickness} backgroundColor={color} {...rest} />;
  },
);

export default Divider;
