import {
  Box,
  FlexAnimated,
  HStack,
  Icon,
  Pressable,
  ReanimatedText,
  theme,
} from '@components/atoms';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Dimensions } from 'react-native';
import {
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

const DEFAULT_ACTIVE_COLOR = theme.pallate.neutral['01'];
const DEFAULT_INACTIVE_COLOR = theme.pallate.neutral['04'];

interface TabBarPropsType {
  tabNames: string[];
  onPress: (tab: string) => void;
  activeIndex: SharedValue<number>;
  /** Optional icon per tab. (color) => ReactNode so icon color follows active state. */
  tabIcons?: ((color: string) => ReactNode)[];
  /** Text/icon color when tab is active. Default: theme.pallate.neutral['01'] */
  activeColor?: string;
  /** Text/icon color when tab is inactive. Default: theme.pallate.neutral['04'] */
  inactiveColor?: string;
}

interface TabItemProps {
  name: string;
  onPress: (tab: string) => void;
  activeIndex: SharedValue<number>;
  currentIndex: number;
  iconRenderer?: (color: string) => ReactNode;
  activeColor: string;
  inactiveColor: string;
}

const TabItem = (props: TabItemProps) => {
  const {
    name,
    onPress,
    activeIndex,
    currentIndex,
    iconRenderer,
    activeColor,
    inactiveColor,
  } = props;

  const [isActive, setIsActive] = useState(
    () => Math.abs(activeIndex.value - currentIndex) < 0.5,
  );

  useAnimatedReaction(
    () => activeIndex.value,
    (value, previous) => {
      const active = Math.abs(value - currentIndex) < 0.5;
      // activeIndex moves every frame of a swipe; JS only needs to hear when this tab flips.
      if (previous === null || active !== Math.abs(previous - currentIndex) < 0.5) {
        runOnJS(setIsActive)(active);
      }
    }
  );

  const textAnimatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(activeIndex.value - currentIndex) < 0.5 ? 1 : 0;
    const textColor = interpolateColor(
      progress,
      [0, 1],
      [inactiveColor, activeColor],
    );
    return { color: textColor };
  });

  const iconColor = isActive ? activeColor : inactiveColor;
  const iconContent = iconRenderer ? (
    iconRenderer(iconColor)
  ) : (
    <Icon size={18} icon="Box" />
  );

  return (
    <Pressable
      key={name}
      onPress={() => onPress(name)}
      accessibilityRole="tab"
      borderRadius={999}
      padding={{
        paddingVertical: theme.spacing.standard,
        paddingHorizontal: theme.spacing.large,
      }}
      fill
      height={55}
      items="center"
      justify="center"
      gap={8}
    >
      {iconContent}
      <ReanimatedText
        weight="semibold"
        text={name}
        type="b2"
        style={textAnimatedStyle}
      />
    </Pressable>
  );
};

export const TabBar = (props: TabBarPropsType) => {
  const screenWidth =
    Dimensions.get('screen').width -
    theme.spacing.large * 2 -
    theme.spacing.small * 2;
  const widthIndicator = screenWidth / props.tabNames.length;
  const activeColor = props.activeColor ?? DEFAULT_ACTIVE_COLOR;
  const inactiveColor = props.inactiveColor ?? DEFAULT_INACTIVE_COLOR;

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      props.activeIndex.value,
      props.tabNames.map((_, index: number) => index),
      props.tabNames.map((_, index: number) => index * widthIndicator),
      'clamp',
    );

    return {
      width: widthIndicator,
      transform: [{ translateX }],
    };
  });

  return (
    <Box
      margin={{
        marginHorizontal: theme.spacing.large,
      }}
      borderWidth={1}
      padding={theme.spacing.small}
      borderRadius={999}
      borderColor={theme.pallate.neutral['02']}
    >
      <HStack borderRadius={999} borderColor={theme.pallate.neutral['04']}>
        <FlexAnimated
          height={55}
          position="absolute"
          borderRadius={999}
          backgroundColor={theme.pallate.primary['03']}
          style={animatedIndicatorStyle}
        />
        {props.tabNames.map((name: string, idx) => {
          return (
            <TabItem
              key={name}
              name={name}
              onPress={props.onPress}
              activeIndex={props.activeIndex}
              currentIndex={idx}
              iconRenderer={props.tabIcons?.[idx]}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
            />
          );
        })}
      </HStack>
    </Box>
  );
};

export default TabBar;
