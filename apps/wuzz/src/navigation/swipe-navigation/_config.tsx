import SWIPE_ROUTES from "./_routes";
import { SwipeNavigatorConfigProps, SwipeScreenConfigProps } from "./swipe.types";
import { ClipList, Message, Profile } from "@pages/(bottom)";
import { VStack } from "@components/atoms";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import React, { useRef, useCallback, useEffect } from "react";
import { useDerivedValue, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { TabBar } from "@components/molecules/swipe-tab-bar";
import { deviceUtils } from "@wuzz/native/device";
import { useHapticFeedback } from "@services/hooks/utils";
import CameraPage from "@pages/(bottom)/camera";
import Explore from "@pages/(bottom)/explore";

const TabBarContainer = ({ descriptors, jumpTo, navigation, state }: MaterialTopTabBarProps) => {
    const descriptorsRef = useRef(descriptors);
    const stateRef = useRef(state);
  
    const focusedIndexRef = useRef<number | undefined>(state.index);
    const { triggerHaptic } = useHapticFeedback();
  
    const currentIndex = state.index;
    const activeIndex = useDerivedValue(() => currentIndex);
  
    // Animated value for tab bar visibility (1 = visible, 0 = hidden)
    const tabBarVisibility = useSharedValue(1);
  
    stateRef.current = state;
    descriptorsRef.current = descriptors;
  
    useEffect(() => {
      if (focusedIndexRef.current !== state.index) {
        focusedIndexRef.current = state.index;
        triggerHaptic('light');
      }
    }, [state.index, triggerHaptic]);

    // Update visibility based on current route
    useEffect(() => {
      const currentRoute = state.routes[state.index];
      const isCameraPage = currentRoute?.name === SWIPE_ROUTES.CAMERA;
      
      // Animate visibility: 0 for camera page, 1 for other pages
      tabBarVisibility.value = withTiming(isCameraPage ? 0 : 1, {
        duration: 300,
      });
    }, [state.index, state.routes, tabBarVisibility]);
  
    const getIsFocused = useCallback(
      (index: number) => {
        return focusedIndexRef.current === index;
      },
      [focusedIndexRef]
    );

    // Animated style for tab bar container
    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: tabBarVisibility.value,
        transform: [
          {
            translateY: (1 - tabBarVisibility.value) * 100, // Slide down when hidden
          },
        ],
      };
    });

    // Determine pointer events based on visibility
    const currentRoute = state.routes[state.index];
    const isCameraPage = currentRoute?.name === SWIPE_ROUTES.CAMERA;
  
    return (
      <Animated.View 
        style={animatedStyle}
        pointerEvents={isCameraPage ? 'none' : 'auto'}
      >
        <TabBar
          activeIndex={activeIndex}
          descriptorsRef={descriptorsRef}
          getIsFocused={getIsFocused}
          jumpTo={jumpTo}
          navigation={navigation}
          stateRef={stateRef}
        />
      </Animated.View>
    );
  };

const defaultConfig: Partial<SwipeNavigatorConfigProps> = {
    tabBar: TabBarContainer,
    tabBarPosition: 'bottom',
    removeClippedSubviews: true,
    initialLayout: deviceUtils.dimensions,
    initialRouteName: SWIPE_ROUTES.HOME,
    screenOptions: {
        lazy: true,
        animationEnabled: false,
        lazyPlaceholder: () => <VStack fill />,
    },
}

const cameraConfig: SwipeScreenConfigProps = {
    name: SWIPE_ROUTES.CAMERA,
    component: CameraPage,
}

const homeConfig: SwipeScreenConfigProps = {
    name: SWIPE_ROUTES.HOME,
    component: ClipList,
    options: {
        tabBarLabel: 'Home',
    },
}

// const mapsConfig: SwipeScreenConfigProps = {
//     name: SWIPE_ROUTES.MAPS,
//     component: Maps,
// }

const profileConfig: SwipeScreenConfigProps = {
    name: SWIPE_ROUTES.PROFILE,
    component: Profile
}

const messageConfig: SwipeScreenConfigProps = {
    name: SWIPE_ROUTES.MESSAGE,
    component: Message,
}

const explorerConfig: SwipeScreenConfigProps = {
    name: SWIPE_ROUTES.EXPLORER,
    component: Explore,
}

const swipeConfigs = {
    default: defaultConfig,
    [SWIPE_ROUTES.CAMERA]: cameraConfig,
    [SWIPE_ROUTES.HOME]: homeConfig,
    // [SWIPE_ROUTES.MAPS]: mapsConfig,
    [SWIPE_ROUTES.EXPLORER]: explorerConfig,
    [SWIPE_ROUTES.MESSAGE]: messageConfig,
    [SWIPE_ROUTES.PROFILE]: profileConfig,
}

export default swipeConfigs;