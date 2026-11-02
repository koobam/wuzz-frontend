/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { queryClient, queryPersister } from '@wuzz/native/query';
import Root from '@navigation/root';
import {
  AppState,
  BottomNavHeightProvider,
  OrderDraftProvider,
  SelectedOutletProvider,
} from '@services/contexts';
import { DeliveryAddressProvider } from '@features/(account)/delivery-address';
import { QuerySyncWithAppState } from '@services/contexts/app-state';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { HotUpdater } from '@hot-updater/react-native';
import '@core/i18n';
import Config from 'react-native-config';
import { Probe } from './src/__bisect/probe';
import { prefetchHomeData } from '@features/(bottom)/home/prefetch';

// Reactotron only in dev builds, and only when REACTOTRON=true in the env file: while the desktop app is not
// connected, reactotron-core-client keeps every message (network bodies, query cache dumps, logs) in an unbounded sendQueue.
if (__DEV__ && Config.REACTOTRON === 'true') {
  require('./ReactotronConfig');
}

prefetchHomeData();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <AppState.Provider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister }}
        >
          <QuerySyncWithAppState />
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AppContent />
        </PersistQueryClientProvider>
      </AppState.Provider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <BottomSheetModalProvider>
        <BottomNavHeightProvider>
          <SelectedOutletProvider>
            <DeliveryAddressProvider>
              <OrderDraftProvider>
                <Probe id="Root"><Root /></Probe>
              </OrderDraftProvider>
            </DeliveryAddressProvider>
          </SelectedOutletProvider>
        </BottomNavHeightProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default HotUpdater.wrap({
  baseURL:
    'https://ichexcegvboekweqmkmy.supabase.co/functions/v1/update-server',
  updateStrategy: 'appVersion',
  updateMode: 'auto',
})(App);

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});