import { View } from 'react-native';
import { FlexProps } from '../flex';

export interface StackProps extends FlexProps {
  ref?: React.Ref<React.ComponentRef<typeof View>>;
  inline?: boolean;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
}
