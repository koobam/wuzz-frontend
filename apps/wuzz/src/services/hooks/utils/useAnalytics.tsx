import { useCallback } from 'react';
import { getApps } from '@react-native-firebase/app';
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserProperty as firebaseSetUserProperty,
} from '@react-native-firebase/analytics';

/**
 * Firebase exists only in a build that carries a GoogleService-Info plist for its bundle id (see configureFirebase in the
 * AppDelegate); a build without one runs without Firebase. Analytics is then simply off: an event is skipped rather than
 * raising "No Firebase App '[DEFAULT]'" on every banner shown.
 */
const hasFirebase = () => getApps().length > 0;

// Custom hook for Firebase Analytics. Failures are logged and swallowed: analytics
// must never break a screen.
export const useAnalytics = () => {
  // Log an event
  const logEvent = useCallback(
    async (eventName: string, params?: { [key: string]: any }) => {
      try {
        if (!hasFirebase()) return;
        await firebaseLogEvent(getAnalytics(), eventName, params);
      } catch (error) {
        console.error(`Error logging event ${eventName}:`, error);
      }
    },
    [],
  );

  // Set user property
  const setUserProperty = useCallback(
    async (propertyName: string, value: string) => {
      try {
        if (!hasFirebase()) return;
        await firebaseSetUserProperty(getAnalytics(), propertyName, value);
      } catch (error) {
        console.error(`Error setting user property ${propertyName}:`, error);
      }
    },
    [],
  );

  // Log screen view
  const logScreenView = useCallback(
    async (screenName: string, className: string) => {
      try {
        if (!hasFirebase()) return;
        await firebaseLogEvent(getAnalytics(), 'screen_view', {
          screen_name: screenName,
          screen_class: className,
        });
      } catch (error) {
        console.error(`Error logging screen view: ${screenName}`, error);
      }
    },
    [],
  );

  // Log login event
  const logLogin = useCallback(async (method: string) => {
    try {
      if (!hasFirebase()) return;
      await firebaseLogEvent(getAnalytics(), 'login', { method });
    } catch (error) {
      console.error(`Error logging login event with method: ${method}`, error);
    }
  }, []);

  return {
    logEvent,
    logScreenView,
    setUserProperty,
    logLogin,
  };
};
