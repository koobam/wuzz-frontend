/**
 * Reads a link of this app (`wuzz://` in production, `wuzz-stg://` in staging, see scheme.ts) or an https address into what it opens. Pure: no navigation, no React,
 * so the same reading serves banners, links from outside the app, and notification taps.
 *
 *   wuzz://service/{id}      a service        wuzz://outlet/{id}   an outlet
 *   wuzz://screen/{key}      a screen of the app, `key` from SCREEN_KEYS
 *   https://...              opened in the browser
 *
 * Anything else, malformed or not, reads as `null`, and the caller does nothing.
 */

import { SCHEME_PREFIX } from './scheme';

/**
 * The screens a link may name. Closed on purpose: the backend validates banners against the same list,
 * and SCREEN_DESTINATIONS (resolve.ts) must give each one a place, or this file stops compiling.
 */
export const SCREEN_KEYS = [
  'home',
  'menu',
  'history',
  'support',
  'profile',
  'scan',
  'outlets',
  'streak',
  'leaderboard',
  'help',
] as const;
export type ScreenKey = (typeof SCREEN_KEYS)[number];

export type DeeplinkTarget =
  | { kind: 'service'; serviceId: string }
  | { kind: 'outlet'; outletId: string }
  | { kind: 'screen'; screen: ScreenKey }
  | { kind: 'external'; url: string };

const MAX_URL_LENGTH = 2048;
/** Ids are numbers in the catalog; a long run of digits is refused rather than rounded. */
const ID = /^[0-9]{1,18}$/;
/** https://host[:port][/path][?query][#hash], host without credentials. */
const HTTPS_URL = /^https:\/\/[^\s/?#@]+(?:[/?#][^\s]*)?$/;

/** Any space, tab, newline or control character: such a link was not written by us. */
const hasWhitespaceOrControl = (value: string) =>
  [...value].some((ch) => {
    const code = ch.charCodeAt(0);
    return code <= 0x20 || code === 0x7f;
  });

const isScreenKey = (value: string): value is ScreenKey =>
  (SCREEN_KEYS as readonly string[]).includes(value);

const parseExternal = (url: string): DeeplinkTarget | null =>
  HTTPS_URL.test(url) ? { kind: 'external', url } : null;

/** `service/12`, `/outlet/3?x=1`, `screen/history/`: the part after the app's scheme (`wuzz://` in production), leading slash optional. */
export function parsePath(path: string): DeeplinkTarget | null {
  const [clean] = path.replace(/^\/+/, '').split(/[?#]/);
  const parts = clean.split('/');
  if (parts[parts.length - 1] === '') parts.pop();
  if (parts.length !== 2) return null;
  const [type, value] = parts;
  switch (type) {
    case 'service':
      return ID.test(value) ? { kind: 'service', serviceId: value } : null;
    case 'outlet':
      return ID.test(value) ? { kind: 'outlet', outletId: value } : null;
    case 'screen':
      return isScreenKey(value) ? { kind: 'screen', screen: value } : null;
    default:
      return null;
  }
}

export function parseDeeplink(raw: string | null | undefined): DeeplinkTarget | null {
  if (typeof raw !== 'string') return null;
  const url = raw.trim();
  if (url === '' || url.length > MAX_URL_LENGTH || hasWhitespaceOrControl(url)) return null;
  if (url.startsWith(SCHEME_PREFIX)) return parsePath(url.slice(SCHEME_PREFIX.length));
  return parseExternal(url);
}
