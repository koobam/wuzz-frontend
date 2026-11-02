import Config from 'react-native-config';

/**
 * The URL scheme this build answers to: `wuzz` in production, `wuzz-stg` in staging (APP_URL_SCHEME in the build's env
 * file). The native side reads the same value for Info.plist and AndroidManifest, so the links the OS hands to this app
 * and the ones the code accepts are the same set. The backend's banner links start with the scheme of their own
 * environment (APP_DEEPLINK_SCHEME), so a staging link never opens the production app, nor the other way round.
 */
export const APP_SCHEME = (Config as { APP_URL_SCHEME?: string }).APP_URL_SCHEME || 'wuzz';

export const SCHEME_PREFIX = `${APP_SCHEME}://`;
