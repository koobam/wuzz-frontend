import { Ref } from "react";
import { StackProps } from "@wuzz/native/components";
import { ViewStyle } from "react-native";

type GesturePressableContainer = Omit<StackProps, 'as'>;

export interface GesturePressableProps
  extends Omit<GesturePressableContainer, 'opacity'> {
  ref?: Ref<any>;
  onPress?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  shrink?: boolean;
  opacity?: boolean;
  containerStyle?: ViewStyle;
  blocksExternalGesture?: boolean;
  requireExternalGestureToFail?: boolean;
  simultaneousWithExternalGesture?: boolean;
  sharedTransitionTag?: string;
}