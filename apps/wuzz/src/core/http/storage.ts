// Re-exports the shared MMKV instance and token keys from @wuzz/native (also
// used by libs/api's request/refresh flow — must stay the same instance) and
// adds the keys that are specific to wuzz's own onboarding/verification
// screens, which @wuzz/native has no business knowing about.
export { storage, ACCESS_TOKEN_STORAGE, REFRESH_TOKEN_STORAGE } from '@wuzz/native/storage';

export const ONBOARDING_STORAGE = 'apps.onboarding';
export const VERIFICATION_COUNTDOWN_STORAGE = 'verification.countdown.endTime';
