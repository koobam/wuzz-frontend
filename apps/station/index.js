/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { initSentry, wrap } from '@wuzz/native/sentry';
import { name as appName } from './app.json';

initSentry();

AppRegistry.registerComponent(appName, () => wrap(App));
