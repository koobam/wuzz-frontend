import { Linking } from 'react-native';
import { ACCESS_TOKEN_STORAGE, storage } from '@wuzz/native/storage';
import type { BottomNavigationParamList, RootStackParamList } from '@navigation/root/root.types';
import { navigationRef } from '@navigation/service';
import { parseDeeplink } from './parse';
import type { DeeplinkTarget, ScreenKey } from './parse';

type RootRoute = keyof RootStackParamList;

type Destination = {
  route: RootRoute;
  params?: Record<string, unknown>;
  /** Not for a visitor: they are sent to log in and brought here afterwards. */
  requiresAuth?: boolean;
};

const tab = (screen: keyof BottomNavigationParamList): Destination['params'] => ({ screen });

/** Where each screen key goes. Typed as a Record over ScreenKey: a key without a place does not compile. */
export const SCREEN_DESTINATIONS: Record<ScreenKey, Destination> = {
  home: { route: 'bottom', params: tab('home') },
  menu: { route: 'bottom', params: tab('menu') },
  history: { route: 'bottom', params: tab('history') },
  support: { route: 'bottom', params: tab('support') },
  profile: { route: 'bottom', params: tab('profile'), requiresAuth: true },
  scan: { route: 'scan' },
  outlets: { route: 'outletlist' },
  streak: { route: 'streak' },
  leaderboard: { route: 'leaderboard' },
  help: { route: 'help' },
};

/** The screen a target opens, or null for an address that opens outside the app. */
export function destinationFor(target: DeeplinkTarget): Destination | null {
  switch (target.kind) {
    case 'service':
      return { route: 'laundry', params: { serviceId: target.serviceId } };
    case 'outlet':
      // There is no outlet page: the list opens with this outlet picked, once the list has it.
      return { route: 'outletlist', params: { outletId: target.outletId } };
    case 'screen':
      return SCREEN_DESTINATIONS[target.screen];
    case 'external':
      return null;
    default: {
      const unreachable: never = target;
      return unreachable;
    }
  }
}

let authenticated = false;
let pending: string | null = null;

/**
 * Logged in, as far as this moment can tell. On a cold start the profile has not been fetched yet, but the
 * session token is already on the device: without it a logged-in customer opening a link would be sent to login.
 */
const hasSession = () => authenticated || !!storage.getString(ACCESS_TOKEN_STORAGE);

/** Kept by <DeeplinkAuthSync/>; a link that needs a login reads it. */
export function setDeeplinkAuthenticated(value: boolean) {
  authenticated = value;
  if (value) flushPendingDeeplink();
}

/** The link that was held for a login, if any (for tests). */
export const getPendingDeeplink = () => pending;
export const clearPendingDeeplink = () => {
  pending = null;
};

function go(destination: Destination) {
  // The navigator's typing is per-route; the table above is what keeps these pairs right.
  (navigationRef.navigate as (route: string, params?: unknown) => void)(destination.route, destination.params);
}

/** After login: carries on to the link that was held. */
export function flushPendingDeeplink() {
  if (!pending) return;
  const url = pending;
  pending = null;
  // After the login screen has handed over to Home (it replaces itself in the same tick that sets the user).
  setTimeout(() => openDeeplink(url), 0);
}

/**
 * Opens a link. The one entry for banners, links from outside the app and notification taps.
 * Returns whether something was opened (or held for a login); an unreadable link, an unknown
 * screen or a non-https address returns false and does nothing. Never throws.
 */
export function openDeeplink(raw: string | null | undefined): boolean {
  try {
    const target = parseDeeplink(raw);
    if (!target) return false;

    if (target.kind === 'external') {
      Linking.openURL(target.url).catch(() => undefined);
      return true;
    }

    if (!navigationRef.isReady()) return false;
    const destination = destinationFor(target);
    if (!destination) return false;

    if (destination.requiresAuth && !hasSession()) {
      pending = raw as string;
      navigationRef.navigate('login');
      return true;
    }
    go(destination);
    return true;
  } catch {
    return false;
  }
}
