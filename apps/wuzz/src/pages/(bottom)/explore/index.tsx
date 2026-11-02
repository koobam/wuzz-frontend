import {
  Box,
  HStack,
  navigationTheme,
  Text,
  theme,
  VStack,
} from '@components/atoms';
import { memo, useCallback, useMemo, useContext, createContext, useRef, useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/root/root.types';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  SharedValue,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Tab from '@components/molecules/tab';
import { Card } from '@components/molecules/card';
import { useScrollRef } from '@services/hooks/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { AnimatedFlashList } from '@components/atoms/animated-flash-list';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import Image from '@components/atoms/image';
import { Heart, Repeat, Send2 } from 'iconsax-react-native';
import { GesturePressable } from '@components/atoms';
import { IconDots } from 'tabler-icons-react-native';
import { useHapticFeedback } from '@services/hooks/utils';

const TabNavigator = createMaterialTopTabNavigator();

// Context to share scroll position between screens and tab bar
const ScrollContext = createContext<{
  scrollY: SharedValue<number>;
} | null>(null);

// Trending Screen Component
const TrendingScreen = memo(() => {
  const scrollContext = useContext(ScrollContext);
  const scrollRef = useRef<React.ComponentRef<typeof FlashList>>(null);
  const scrollRefContext = useScrollRef();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { triggerHaptic } = useHapticFeedback();
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Haptic Feedback
    triggerHaptic('light');
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [triggerHaptic]);

    // Register scroll ref and gesture handler
  useEffect(() => {
    scrollRefContext.registerScrollRef(scrollRef);
    return () => {
      scrollRefContext.unregisterScrollRef();
    };
  }, [scrollRefContext]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    switch (item.type) {
      case 'news':
      case 'post':
      case 'videos':
        return <Card {...item} onPress={() => {
          console.log('onPress');
          // Haptic Feedback
          navigation.pop();
        }} onDoubleTap={() => {
          console.log('double tap');
        }} onLongPress={() => {
          // Haptic Feedback
          triggerHaptic('medium');
          // React Navigation to Open News Popup Modal
          navigation.navigate('news-popup', { item });
        }} />;
      case 'title':
        return (
          <VStack gap={theme.spacing.small} padding={theme.spacing.large}>
            <Text type="s3" weight="bold" color={theme.pallate.neutral['01']}>{item.title}</Text>
          </VStack>
        );
      default:
        return <Text>Unknown item type</Text>;
    }
  }, [navigation, triggerHaptic]);

  // Runs on the UI thread: the header animation follows the scroll without a round trip through JS.
  const scrollYValue = scrollContext?.scrollY;
  const handleScroll = useAnimatedScrollHandler(
    (event) => {
      if (scrollYValue) {
        scrollYValue.value = event.contentOffset.y;
      }
    }
  );

  const ListHeaderComponent = useCallback(() => {
    return (
      <VStack justify="flex-end" height={300}>
        <Image
          uri="https://picsum.photos/seed/explore-header/400/300"
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <MaskedView
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
          maskElement={
            <LinearGradient
              colors={['transparent', theme.pallate.neutral['06']]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          }
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.pallate.neutral['06'] },
            ]}
          />
        </MaskedView>
        <VStack
          gap={theme.spacing.standard}
          padding={{ paddingHorizontal: theme.spacing.large, paddingBottom: theme.spacing.extraLarge }}
        >
          <HStack items="center" justify="center">
            <GesturePressable
              onPress={() => {}}
              fill
              items="center"
              gap={theme.spacing.standard}
              requireExternalGestureToFail
            >
              <Box
                width={40}
                height={40}
                borderRadius={999}
                borderWidth={1}
                borderColor={theme.pallate.neutral['05']}
                style={{
                  overflow: 'hidden',
                }}
              >
                <Image
                  uri={`https://picsum.photos/seed/avatar/200/300`}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              </Box>
              <Text weight="medium" color={navigationTheme.colors.text}>
                loremipsum
              </Text>
            </GesturePressable>
            <GesturePressable onPress={() => {}} requireExternalGestureToFail>
              <IconDots size={24} color={theme.pallate.neutral['01']} />
            </GesturePressable>
          </HStack>
          <Text type="l1" color={theme.pallate.neutral['01']}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos.
          </Text>
          <HStack items="center" gap={theme.spacing.medium}>
            <GesturePressable items="center" gap={theme.spacing.small} requireExternalGestureToFail>
              <Heart
                size={26}
                fill={theme.pallate.neutral['01']}
                color={navigationTheme.colors.text}
              />
              <Text type="b2" color={navigationTheme.colors.text}>
                12
              </Text>
            </GesturePressable>
            <GesturePressable items="center" gap={theme.spacing.small} requireExternalGestureToFail>
              <Repeat
                size={26}
                fill={theme.pallate.neutral['01']}
                color={navigationTheme.colors.text}
              />
              <Text type="b2" color={navigationTheme.colors.text}>
                12
              </Text>
            </GesturePressable>
            <GesturePressable items="center" gap={theme.spacing.small} requireExternalGestureToFail>
              <Send2
                size={26}
                fill={theme.pallate.neutral['01']}
                color={navigationTheme.colors.text}
              />
              <Text type="b2" color={navigationTheme.colors.text}>
                12
              </Text>
            </GesturePressable>
          </HStack>
        </VStack>
      </VStack>
    );
  }, []);

  return (
    <AnimatedFlashList
      ref={scrollRef}
      data={[
        {
          type: 'news',
          id: 1,
          title: 'Breaking: New Technology Breakthrough in Renewable Energy',
          description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.',
          category: 'News',
          location: 'Trending In Indonesia',
          repostedBy: [
            { id: 1, name: 'John Doe', avatar: 'https://picsum.photos/seed/avatar1/200/300' },
            { id: 2, name: 'Jane Smith', avatar: 'https://picsum.photos/seed/avatar2/200/300' },
            { id: 3, name: 'Bob Johnson', avatar: 'https://picsum.photos/seed/avatar3/200/300' },
          ],
        },
        {
          type: 'news',
          id: 2,
          title: 'Local Community Initiative Gains National Recognition',
          category: 'News',
          location: 'Trending In Indonesia',
          repostedBy: [
            { id: 4, name: 'Alice Williams', avatar: 'https://picsum.photos/seed/avatar4/200/300' },
          ],
        },
        {
          type: 'title',
          id: 0,
          title: 'Trending In Indonesia',
        },
        {
          type: 'post',
          id: 3,
          title: 'Check out this amazing sunset from my trip!',
          description: 'Had an incredible time exploring the mountains. The view was absolutely breathtaking.',
          image: 'https://picsum.photos/seed/post1/800/600',
          userName: 'Travel Enthusiast',
          userAvatar: 'https://picsum.photos/seed/user1/200/300',
          likes: 245,
          comments: 32,
          reposts: 18,
        },
        {
          type: 'post',
          id: 4,
          title: 'Just finished reading an amazing book',
          description: 'Highly recommend this to anyone interested in science fiction.',
          image: 'https://picsum.photos/seed/post2/800/600',
          userName: 'Book Lover',
          userAvatar: 'https://picsum.photos/seed/user2/200/300',
          likes: 189,
          comments: 45,
          reposts: 12,
        },
        {
          type: 'videos',
          id: 5,
          title: 'Tutorial: How to Build a React Native App',
          description: 'Learn the fundamentals of React Native development in this comprehensive tutorial.',
          thumbnail: 'https://picsum.photos/seed/video1/800/450',
          userName: 'Tech Teacher',
          userAvatar: 'https://picsum.photos/seed/user3/200/300',
          duration: 1245,
          views: 15234,
          likes: 892,
        },
        {
          type: 'videos',
          id: 6,
          title: 'Cooking Tips: Perfect Pasta Every Time',
          description: 'Master the art of cooking pasta with these professional tips.',
          thumbnail: 'https://picsum.photos/seed/video2/800/450',
          userName: 'Chef Master',
          userAvatar: 'https://picsum.photos/seed/user4/200/300',
          duration: 856,
          views: 8765,
          likes: 456,
        },
        {
          type: 'news',
          id: 7,
          title: 'Sports Update: Championship Finals This Weekend',
          category: 'Sports',
          location: 'Trending In Indonesia',
          repostedBy: [
            { id: 5, name: 'Mike Brown', avatar: 'https://picsum.photos/seed/avatar5/200/300' },
            { id: 6, name: 'Sarah Davis', avatar: 'https://picsum.photos/seed/avatar6/200/300' },
          ],
        },
      ]}
      getItemType={(item: any) => item.type}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          titleColor={theme.pallate.neutral['02']}
          title="Refreshing..."
          colors={[theme.pallate.neutral['02']]}
          tintColor={theme.pallate.neutral['02']}
          progressBackgroundColor={theme.pallate.neutral['02']}
        />
      }
      bounces={false}
      nestedScrollEnabled
      ItemSeparatorComponent={() => <Box height={1} backgroundColor={theme.pallate.neutral['05']} />}
      ListHeaderComponent={ListHeaderComponent}
      onScroll={handleScroll}
      removeClippedSubviews
      scrollEventThrottle={16}
    />
  );
});
TrendingScreen.displayName = 'TrendingScreen';

// Media Screen Component
const MediaScreen = memo(() => {
  return (
    <VStack backgroundColor={'red'} fill padding={theme.spacing.large}>
      {/* Media content */}
    </VStack>
  );
});
MediaScreen.displayName = 'MediaScreen';

// Custom TabBar using Tab.Line
const CustomTabBar = (props: MaterialTopTabBarProps) => {
  const activeIndex = useSharedValue(props.state.index);
  const scrollContext = useContext(ScrollContext);
  const tabBarVisibility = useSharedValue(1);
  const TAB_BAR_HEIGHT = 50;
  const SCROLL_THRESHOLD = 50;

  const tabNames = useMemo(
    () => props.state.routes.map(route => route.name),
    [props.state.routes],
  );

  const handleTabPress = useCallback(
    (name: string) => {
      const route = props.state.routes.find(r => r.name === name);
      if (route) {
        props.jumpTo(route.key);
        const index = props.state.routes.findIndex(r => r.name === name);
        activeIndex.value = index;
      }
    },
    [props, activeIndex],
  );

  // Update activeIndex when state changes
  activeIndex.value = props.state.index;

  // Track scroll and collapse tab bar
  useAnimatedReaction(
    () => {
      if (!scrollContext) return 0;
      return scrollContext.scrollY.value;
    },
    (currentScrollY: number, previousScrollY: number | null) => {
      if (previousScrollY === null) return;

      const isScrollingDown = currentScrollY > previousScrollY;
      const shouldHide = currentScrollY > SCROLL_THRESHOLD && isScrollingDown;
      const shouldShow = currentScrollY <= SCROLL_THRESHOLD || !isScrollingDown;

      if (shouldHide && tabBarVisibility.value > 0) {
        tabBarVisibility.value = withTiming(0, { duration: 200 });
      } else if (shouldShow && tabBarVisibility.value < 1) {
        tabBarVisibility.value = withTiming(1, { duration: 200 });
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: tabBarVisibility.value,
      height: TAB_BAR_HEIGHT * tabBarVisibility.value,
      transform: [
        {
          translateY: (1 - tabBarVisibility.value) * -TAB_BAR_HEIGHT,
        },
      ],
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Tab.Line
        tabNames={tabNames}
        onPress={handleTabPress}
        activeIndex={activeIndex}
      />
    </Animated.View>
  );
};

const Explore = memo(() => {
  const { top } = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const scrollY = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const scrollContextValue = useMemo(
    () => ({ scrollY, lastScrollY }),
    [scrollY, lastScrollY],
  );

  return (
    <ScrollContext.Provider value={scrollContextValue}>
      <VStack
        fill
        padding={{
          paddingTop: top + theme.spacing.large,
        }}
      >
        {/* absolute left 100 width to check gesture */}
        <Box
          position={{
            left: 0,
          }}
          zIndex={1}
          width={theme.spacing.large}
          height={screenHeight}
        />
        <Box
          position={{
            right: 0,
          }}
          zIndex={1}
          width={theme.spacing.large}
          height={screenHeight}
        />
        <TabNavigator.Navigator
          tabBar={CustomTabBar}
          tabBarPosition="top"
          screenOptions={{
            swipeEnabled: true,
            animationEnabled: true,
          }}
        >
          <TabNavigator.Screen name="Trending" component={TrendingScreen} />
          <TabNavigator.Screen name="Media" component={MediaScreen} />
        </TabNavigator.Navigator>
      </VStack>
    </ScrollContext.Provider>
  );
});

Explore.displayName = 'Explore';

export default Explore;
