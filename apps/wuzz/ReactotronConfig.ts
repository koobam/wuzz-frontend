/**
 * Reactotron – hanya dijalankan saat __DEV__ (dipanggil dari index.js dengan guard).
 * Debug: network, AsyncStorage, React Query cache, log, dll.
 */
import { queryClient } from '@wuzz/native/query';
import Reactotron from 'reactotron-react-native';
import {
  QueryClientManager,
  reactotronReactQuery,
} from 'reactotron-react-query';
import { NativeModules } from 'react-native';
import Config from 'react-native-config';

const queryClientManager = new QueryClientManager({
  queryClient,
});

// Pakai host yang sama dengan Metro (dari scriptURL) supaya connect ke Reactotron desktop.
let scriptHostname = '127.0.0.1';
try {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  console.log('scriptURL:', scriptURL);

  if (scriptURL) {
    scriptHostname = scriptURL.split('://')[1].split(':')[0];
  }
} catch {
  // fallback
}
console.log('hostname resolved:', scriptHostname);

Reactotron.configure({
  name: Config?.APP_DISPLAY_NAME ?? Config?.APP_ENV ?? 'Wuzz',
  host: scriptHostname,
  // Pakai 9091 karena backend sudah pakai 9090. Di app Reactotron (desktop) set port ke 9091 juga.
  port: 9091,
  onDisconnect: () => {
    queryClientManager.unsubscribe();
  },
})
  .use(reactotronReactQuery(queryClientManager))
  .useReactNative({
    asyncStorage: false,
    networking: { ignoreUrls: /\/(logs|symbolicate)$/ },
    editor: false,
    errors: true,
    overlay: false,
  })
  .connect();

export default Reactotron;
