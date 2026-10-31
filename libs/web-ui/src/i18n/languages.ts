import i18n from 'i18next';

/** The languages the web apps offer. The copy itself lives in each app's src/locales; this is only the list and the choice. */
export const LANGUAGES = [
  { code: 'en', label: 'English', country: 'US' },
  { code: 'id', label: 'Indonesia', country: 'ID' },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'lang';

/** The language a person picked, else the browser's, else English. */
export function initialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved as LanguageCode;
  } catch {
    // storage blocked: fall through to the browser language
  }
  return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en';
}

export function setLanguage(code: LanguageCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // the choice then lasts until the page is closed
  }
  document.documentElement.lang = code;
  void i18n.changeLanguage(code);
}
