import React, { Suspense, useCallback, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import theme, { navigationTheme } from '@components/atoms/theme';
import { toastConfig, TOAST_DURATION_MS } from '@components/atoms/toast';
import { AuthProvider } from '@services/contexts/auth/auth.context';
import { Routes } from '@navigation/navigation.types';
import { RootStackParamList } from './root.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from '@navigation/service';
import { rootNavigationConfigs, rootRoutes } from './_config';
import { linking, takeInitialDeeplink } from './linking';
import { DeeplinkAuthSync, openDeeplink } from '@navigation/deeplink';
import Toast from 'react-native-toast-message';
import RNBootSplash from 'react-native-bootsplash';
const Stack = createNativeStackNavigator<RootStackParamList>();

export const Root = React.memo(() => {
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback((val: Routes) => {
    if (Array.isArray(val.components)) {
      return (
        <Stack.Group key={val.name} screenOptions={val.options}>
          {val.components.map((child: Routes) => (
            <Stack.Screen
              key={child.name}
              name={child.name}
              options={child.options}
              component={child.components}
            />
          ))}
        </Stack.Group>
      );
    }

    return (
      <Stack.Screen
        key={val.name}
        name={val.name}
        options={val.options}
        component={val.components}
      />
    );
  }, []);

  const screens = useMemo(() => {
    return rootRoutes.map((route: Routes) => renderItem(route));
  }, [renderItem]);

  const onNavigationReady = useCallback(() => {
    RNBootSplash.hide();
    // The app was opened by a link: go there now that there is a navigator to go with.
    const url = takeInitialDeeplink();
    if (url) openDeeplink(url);
  }, []);

  return (
    <AuthProvider>
      <DeeplinkAuthSync />
      <NavigationContainer
        ref={navigationRef}
        onReady={onNavigationReady}
        theme={navigationTheme}
        linking={linking}
      >
        <Suspense
          fallback={
            <View style={{ flex: 1 }}>
              <ActivityIndicator style={{ flex: 1 }} />
            </View>
          }
        >
          <Stack.Navigator {...rootNavigationConfigs.default}>
            {screens}
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
      <Toast
        config={toastConfig}
        topOffset={top + theme.spacing.standard}
        visibilityTime={TOAST_DURATION_MS}
      />
    </AuthProvider>
  );
});

Root.displayName = 'RootNavigation';
export default Root;
