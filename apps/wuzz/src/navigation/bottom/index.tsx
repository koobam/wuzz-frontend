/* eslint-disable react/no-unstable-nested-components */
import BottomNavigationBar from '@components/molecules/bottom-navigation-bar';
import { BottomNavigationParamList } from '@navigation/root/root.types';
import { Home, History, Mission, Support } from '@pages/(bottom)';
import Profile from '@pages/(bottom)/profile';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  NavigatorScreenParams,
  StaticScreenProps,
} from '@react-navigation/native';
import {
  Home as HomeIcon,
  Headphone,
  MedalStar,
  ProfileCircle,
  Receipt,
} from 'iconsax-react-native';
import React from 'react';
import { Probe } from '../../__bisect/probe';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator<BottomNavigationParamList>();

type BottomTabsProps = StaticScreenProps<
  NavigatorScreenParams<BottomNavigationParamList>
>;

export const Bottom = React.memo((_: BottomTabsProps) => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <Probe id="TabBar"><BottomNavigationBar {...props} /></Probe>}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="home"
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} variant="Bulk" />
          ),
        }}
        component={Home}
      />
      <Tab.Screen
        name="history"
        options={{
          tabBarLabel: t('tabs.history'),
          tabBarIcon: ({ color, size }) => (
            <Receipt color={color} size={size} variant="Bulk" />
          ),
        }}
        component={History}
      />
      <Tab.Screen
        name="support"
        options={{
          tabBarLabel: t('tabs.message'),
          tabBarIcon: ({ color, size }) => (
            <Headphone color={color} size={size} variant="Bulk" />
          ),
        }}
        component={Support}
      />
      <Tab.Screen
        name="mission"
        options={{
          tabBarLabel: t('tabs.mission'),
          tabBarIcon: ({ color, size }) => (
            <MedalStar color={color} size={size} variant="Bulk" />
          ),
        }}
        component={Mission}
      />
      <Tab.Screen
        name="profile"
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <ProfileCircle color={color} size={size} variant="Bulk" />
          ),
        }}
        component={Profile}
      />
    </Tab.Navigator>
  );
});

Bottom.displayName = 'BottomNavigation';
export default Bottom;
