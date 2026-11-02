import { Linking } from 'react-native';
import { navigationRef } from '@navigation/service';
import { storage } from '@wuzz/native/storage';
import { parseDeeplink, SCREEN_KEYS } from '../parse';
import {
  clearPendingDeeplink,
  destinationFor,
  getPendingDeeplink,
  openDeeplink,
  SCREEN_DESTINATIONS,
  setDeeplinkAuthenticated,
} from '../resolve';

jest.mock('react-native', () => ({ Linking: { openURL: jest.fn() } }), { virtual: true });
jest.mock('react-native-config', () => ({ __esModule: true, default: { APP_URL_SCHEME: 'wuzz' } }));
jest.mock('@wuzz/native/storage', () => ({
  ACCESS_TOKEN_STORAGE: 'user.accessToken',
  storage: { getString: jest.fn() },
}));
jest.mock('@navigation/service', () => ({
  navigationRef: { isReady: jest.fn(() => true), navigate: jest.fn() },
}));

const navigate = navigationRef.navigate as unknown as jest.Mock;
const getString = storage.getString as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  (navigationRef.isReady as unknown as jest.Mock).mockReturnValue(true);
  getString.mockReturnValue(undefined);
  clearPendingDeeplink();
  setDeeplinkAuthenticated(false);
  (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
});

describe('parseDeeplink', () => {
  it('reads service, outlet and screen links', () => {
    expect(parseDeeplink('wuzz://service/12')).toEqual({ kind: 'service', serviceId: '12' });
    expect(parseDeeplink('wuzz://outlet/3')).toEqual({ kind: 'outlet', outletId: '3' });
    expect(parseDeeplink('wuzz://screen/history')).toEqual({ kind: 'screen', screen: 'history' });
  });

  it('accepts a trailing slash, a query and surrounding spaces', () => {
    expect(parseDeeplink('wuzz://service/12/')).toEqual({ kind: 'service', serviceId: '12' });
    expect(parseDeeplink('wuzz://outlet/3?utm=banner')).toEqual({ kind: 'outlet', outletId: '3' });
    expect(parseDeeplink('  wuzz://screen/home  ')).toEqual({ kind: 'screen', screen: 'home' });
  });

  it('reads an https address as external', () => {
    expect(parseDeeplink('https://wuzz.care/promo?a=1')).toEqual({ kind: 'external', url: 'https://wuzz.care/promo?a=1' });
  });

  it.each([
    ['empty', ''],
    ['null', null],
    ['undefined', undefined],
    ['unknown type', 'wuzz://promo/1'],
    ['no id', 'wuzz://service/'],
    ['no value', 'wuzz://service'],
    ['non-numeric id', 'wuzz://service/abc'],
    ['negative id', 'wuzz://outlet/-1'],
    ['id too long', 'wuzz://outlet/1234567890123456789'],
    ['extra segment', 'wuzz://service/12/extra'],
    ['inner space', 'wuzz://service/1 2'],
    ['control character', 'wuzz://service/1\n2'],
    ['wrong scheme', 'other://service/12'],
  ])('reads %s as nothing', (_name, value) => {
    expect(parseDeeplink(value as string | null | undefined)).toBeNull();
  });

  it('refuses a screen that is not in the list', () => {
    expect(parseDeeplink('wuzz://screen/admin')).toBeNull();
    expect(parseDeeplink('wuzz://screen/History')).toBeNull();
  });

  it.each([
    ['http', 'http://wuzz.care/promo'],
    ['javascript', 'javascript:alert(1)'],
    ['credentials', 'https://user:pw@wuzz.care/'],
    ['no host', 'https:///path'],
    ['relative', '/promo'],
    ['file', 'file:///etc/passwd'],
  ])('refuses an external %s link', (_name, value) => {
    expect(parseDeeplink(value)).toBeNull();
  });
});

describe('screen destinations', () => {
  it('give every screen key a place', () => {
    for (const key of SCREEN_KEYS) {
      expect(SCREEN_DESTINATIONS[key]).toBeDefined();
      expect(destinationFor({ kind: 'screen', screen: key })).toEqual(SCREEN_DESTINATIONS[key]);
    }
  });

  it('opens a service on the laundry screen and an outlet on the outlet list', () => {
    expect(destinationFor({ kind: 'service', serviceId: '12' })).toEqual({ route: 'laundry', params: { serviceId: '12' } });
    expect(destinationFor({ kind: 'outlet', outletId: '3' })).toEqual({ route: 'outletlist', params: { outletId: '3' } });
  });

  it('has no screen for an external address', () => {
    expect(destinationFor({ kind: 'external', url: 'https://wuzz.care' })).toBeNull();
  });
});

describe('openDeeplink', () => {
  it('navigates to a service', () => {
    expect(openDeeplink('wuzz://service/12')).toBe(true);
    expect(navigate).toHaveBeenCalledWith('laundry', { serviceId: '12' });
  });

  it('navigates to a tab through the bottom navigator', () => {
    expect(openDeeplink('wuzz://screen/history')).toBe(true);
    expect(navigate).toHaveBeenCalledWith('bottom', { screen: 'history' });
  });

  it('opens an https address in the browser, not in the navigator', () => {
    expect(openDeeplink('https://wuzz.care/promo')).toBe(true);
    expect(Linking.openURL).toHaveBeenCalledWith('https://wuzz.care/promo');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does nothing for a non-https external link, an unknown screen or garbage', () => {
    for (const link of ['http://wuzz.care', 'wuzz://screen/admin', 'wuzz://service/x', '', 'not a link']) {
      expect(openDeeplink(link)).toBe(false);
    }
    expect(navigate).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('does nothing before the navigator is ready', () => {
    (navigationRef.isReady as unknown as jest.Mock).mockReturnValue(false);
    expect(openDeeplink('wuzz://screen/home')).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('never throws when navigation does', () => {
    navigate.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(openDeeplink('wuzz://screen/home')).toBe(false);
  });

  it('sends a visitor to login for the profile and holds the link', () => {
    expect(openDeeplink('wuzz://screen/profile')).toBe(true);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('login');
    expect(getPendingDeeplink()).toBe('wuzz://screen/profile');
  });

  it('carries on to the held link once someone is logged in', () => {
    jest.useFakeTimers();
    openDeeplink('wuzz://screen/profile');
    navigate.mockClear();
    setDeeplinkAuthenticated(true);
    jest.runAllTimers();
    expect(navigate).toHaveBeenCalledWith('bottom', { screen: 'profile' });
    expect(getPendingDeeplink()).toBeNull();
  });

  it('opens the profile straight away when a session is already on the device', () => {
    getString.mockReturnValue('token');
    expect(openDeeplink('wuzz://screen/profile')).toBe(true);
    expect(navigate).toHaveBeenCalledWith('bottom', { screen: 'profile' });
    expect(getPendingDeeplink()).toBeNull();
  });
});

describe('the scheme of the build', () => {
  const parseWith = (scheme: string | undefined, url: string) => {
    jest.resetModules();
    jest.doMock('react-native-config', () => ({ __esModule: true, default: { APP_URL_SCHEME: scheme } }));
    let result: unknown;
    jest.isolateModules(() => {
      result = require('../parse').parseDeeplink(url);
    });
    return result;
  };

  it('a staging build reads wuzz-stg:// and refuses the production scheme', () => {
    expect(parseWith('wuzz-stg', 'wuzz-stg://service/13')).toEqual({ kind: 'service', serviceId: '13' });
    expect(parseWith('wuzz-stg', 'wuzz://service/13')).toBeNull();
  });

  it('a production build reads wuzz:// and refuses the staging scheme', () => {
    expect(parseWith('wuzz', 'wuzz://service/13')).toEqual({ kind: 'service', serviceId: '13' });
    expect(parseWith('wuzz', 'wuzz-stg://service/13')).toBeNull();
  });

  it('a build without APP_URL_SCHEME answers to wuzz://, as the native defaults do', () => {
    expect(parseWith(undefined, 'wuzz://outlet/3')).toEqual({ kind: 'outlet', outletId: '3' });
  });
});
