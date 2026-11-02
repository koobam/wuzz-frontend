import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

/**
 * Starts error reporting when SENTRY_DSN is set in the app's env file; with no DSN it does nothing.
 * Only errors are sent: no performance traces, no session replay, no user data.
 */
export function initSentry() {
  if (!Config.SENTRY_DSN) return;
  Sentry.init({
    dsn: Config.SENTRY_DSN,
    environment: Config.APP_ENV,
    release: Config.APP_VERSION,
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

export const wrap = Sentry.wrap;
