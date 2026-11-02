/**
 * The countries the phone field can dial from. `dial` is the calling code without the plus; `flag` is the code the flag
 * image is named after (see LanguageFlag). Indonesia is first and is the default.
 */
export const countries = [
  { code: 'ID', name: 'Indonesia', dial: '62', flag: 'id' },
  { code: 'US', name: 'United States', dial: '1', flag: 'us' },
  { code: 'MY', name: 'Malaysia', dial: '60', flag: 'my' },
  { code: 'SG', name: 'Singapore', dial: '65', flag: 'sg' },
  { code: 'AU', name: 'Australia', dial: '61', flag: 'au' },
  { code: 'GB', name: 'United Kingdom', dial: '44', flag: 'gb' },
  { code: 'JP', name: 'Japan', dial: '81', flag: 'jp' },
  { code: 'KR', name: 'South Korea', dial: '82', flag: 'kr' },
  { code: 'CN', name: 'China', dial: '86', flag: 'cn' },
  { code: 'IN', name: 'India', dial: '91', flag: 'in' },
] as const;

export type Country = (typeof countries)[number];

export const DEFAULT_COUNTRY: Country = countries[0];
